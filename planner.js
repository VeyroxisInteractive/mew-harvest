'use strict';
// Calculation stays read-only. Optional pins/reservations are explicit saved actions.
let plannerSelection=null;
function plannerOrders(){return S.orders.filter(o=>plannerSelection===null?o.arrives<=now():plannerSelection.includes(o.id));}
function productionStock(){
 const stock={};
 const add=(k,n,kind)=>{if(!k||!n)return;stock[k] ||= {barn:0,ready:0,cargo:0,pending:0};stock[k][kind]+=n;};
 const timed=(k,n,end)=>add(k,n,end<=now()?'ready':'pending');
 for(const [k,n]of Object.entries(S.inventory))add(k,n,'barn');
 for(const q of S.village?.cargo||[])if(!q.done)add(q.item,q.count,'cargo');
 for(const f of S.fields)if(f.crop)timed(f.crop,2,f.end);
 for(const t of S.trees)if(t.end)timed(t.type,3,t.end);
 for(const b of S.buildings){
  for(const j of b.queue)timed(j.item,1,Math.max(j.end,b.ready));
  const d=BUILDINGS[b.type],life=LIFE_BUILDINGS[b.type];
   if(b.fed)timed(d.product,b.animals+(b.happiness>=60?1:0)+(b.penLevel||0)+(b.premiumFeed?2:0),Math.max(b.fed,b.ready));
  if(b.lifeEnd)timed(life?.output,(life?.count||0)+(b.upgrade||0),Math.max(b.lifeEnd,b.ready));
 }
 for(const d of S.decor||[])if(d.end&&['planter','flowercorner'].includes(d.type))timed('flower',d.type==='planter'?2:4,d.end);
 for(const j of S.life?.crafting||[]){const r=CRAFTS[j.key];timed(r.give,r.count,j.end);}
 const f=S.village?.fishing;if(f)timed(f.item,1,f.end); // Reel bonuses are not guaranteed.
 for(const t of S.village?.trips||[])if(!t.claimed)for(const [k,n]of Object.entries(EXPEDITIONS[t.where].reward))timed(k,n,t.end);
  for(const r of S.resources||[])if(!r.cleared&&r.end&&r.hits+1>=RESOURCES[r.type].need)for(const [k,n]of Object.entries(resourceYield(r)))timed(k,n,r.end);
 return stock;
}
function productionSource(k){
 const r=RECIPES[k],craft=Object.entries(CRAFTS).find(([,r])=>r.give===k),life=Object.entries(LIFE_BUILDINGS).find(([,d])=>d.output===k),animal=Object.entries(BUILDINGS).find(([,d])=>d.product===k);
 const at=r?.at||life?.[0]||animal?.[0],b=S.buildings.find(b=>b.type===at),d=BUILDINGS[at],notes=[];
 if(at){
  if(r&&!recipeUnlocked(k))notes.push('Recipe unlocks at level '+Math.max(r.level,d.level)+'.');
  if(r?.festival&&!S.journey?.learned.includes(k))notes.push('Learn this permanent recipe in the Seasonal market.');
  if(!b)notes.push('Build '+d.name+(level()<d.level?' at level '+d.level:'')+'.');
  else if(b.ready>now())notes.push('Building work is still in progress.');
  if(r&&b&&b.queue.length>=3+(b.upgrade||0))notes.push('Queue full: collect finished goods to free a slot.');
 }
 const base={need:{},count:1,seconds:0,unit:'batches',notes,at,building:b?.id};
 if(r)return {...base,kind:'recipe',name:d.name,need:r.need,seconds:r.time};
 if(craft)return {...base,kind:'craft',name:'Cat crafting bench',need:craft[1].need,count:craft[1].count,seconds:CRAFT_DURATIONS[craft[0]]};
 if(life)return {...base,kind:'life',name:d.name,need:life[1].input,count:life[1].count+(b?.upgrade||0),seconds:life[1].time};
 if(animal){
  const animals=b?.animals||1;
  if(b&&!b.animals)notes.push('Welcome at least one animal first.');
  return {...base,kind:'animal',name:d.name,need:{[d.feed]:animals},count:animals+(b?.happiness>=60?1:0)+(b?.penLevel||0),seconds:d.cycle,unit:'feeding cycles'};
 }
  if(CROPS[k]){
   if(CROPS[k].level>level())notes.push('Crop unlocks at level '+CROPS[k].level+'.');
   if(typeof cropAccess==='function'&&!cropAccess(k).ok)notes.push(cropAccess(k).reason);
  return {...base,kind:'crop',name:'Growing fields',count:2,seconds:CROPS[k].seconds,unit:'plantings'};
 }
 if(TREES[k]){
  const t=S.trees.find(t=>t.type===k);if(!t)notes.push('Plant '+TREES[k].name+(level()<TREES[k].level?' at level '+TREES[k].level:'')+'.');
  return {...base,kind:'tree',name:TREES[k].name,count:3,seconds:TREES[k].time,unit:'waterings',object:t?.id};
 }
 if(k==='flower'){
  const garden=S.decor.find(d=>d.type==='flowercorner')||S.decor.find(d=>d.type==='planter');
  if(!garden)notes.push('Place a flower planter from Shop → Garden, or buy flowers in Supplies.');
  return {...base,kind:'garden',name:garden?DECOR_SHOP[garden.type].name:'Flower planter',count:garden?.type==='flowercorner'?4:2,seconds:90,unit:'waterings',object:garden?.id};
 }
 if(['perch','carp','pearl'].includes(k))return {...base,kind:'fishing',name:'River fishing',unit:'goods',notes:['Use bait at the pier. Catches vary; the exact number of casts is unknown.']};
 return {...base,kind:'gather',name:k==='gem'?'Exploration':'Materials & Flowers',unit:'goods',notes:[k==='gem'?'Gather crystals in the cave.':'Gather from meadow resources or buy available supplies.']};
}
function productionPlan(ids=plannerOrders().map(o=>o.id)){
  const orders=S.orders.filter(o=>ids.includes(o.id)),goals={},demand={},sources={},sorted=[],seen=new Set(),stock=productionStock(),protectedElsewhere={};
  if(typeof orderReservations==='function')Object.assign(protectedElsewhere,orderReservations(ids));
  for(const [k,n]of Object.entries(protectedElsewhere))if(stock[k])stock[k].barn=Math.max(0,stock[k].barn-n);
 for(const o of orders)for(const [k,n]of Object.entries(o.need))goals[k]=(goals[k]||0)+n;
 // Parents are resolved before their ingredients, so shared stock and rounded batches
 // are allocated once, even when a requested good is also another recipe's ingredient.
 function visit(k){if(seen.has(k))return;seen.add(k);sources[k]=productionSource(k);for(const input of Object.keys(sources[k].need))visit(input);sorted.push(k);}
 Object.keys(goals).sort().forEach(visit);Object.assign(demand,goals);
 const rows=[];
 for(const k of sorted.reverse()){
  const need=demand[k]||0;if(!need)continue;
  const source=sources[k],used={};let missing=need;
  for(const kind of ['barn','ready','cargo','pending']){used[kind]=Math.min(missing,stock[k]?.[kind]||0);missing-=used[kind];}
  const batches=Math.ceil(missing/source.count),produced=batches*source.count;
  if(batches)for(const [input,n]of Object.entries(source.need))demand[input]=(demand[input]||0)+n*batches;
  rows.push({key:k,need,used,missing,batches,produced,surplus:produced-missing,source});
 }
  return {orders,goals,rows:rows.reverse(),barnReady:Object.entries(goals).every(([k,n])=>Math.max(0,quantity(k)-(protectedElsewhere[k]||0))>=n)};
}
function plannerPanel(){
 const p=productionPlan(),selected=new Set(p.orders.map(o=>o.id)),steps=p.rows.filter(r=>r.missing),covered=p.rows.filter(r=>Object.values(r.used).some(n=>n));
 let html='<p class="intro">Combine customer orders into one ingredient plan. Barn stock, ready goods, deliveries and growing or queued goods are each counted once. Estimates update as you farm.</p>'+
  '<div class="tabs">'+btn('All waiting','planAll','',false,true)+btn('Clear selection','planClear','',false,true)+'<button data-open="orders">Back to Orders</button></div>'+
  '<h2>Choose customers</h2><div class="planner-orders">'+S.orders.map(o=>'<button class="action '+(selected.has(o.id)?'':'secondary')+'" data-action="planToggle" data-args="'+o.id+'" aria-pressed="'+selected.has(o.id)+'">'+(selected.has(o.id)?'✓ ':'')+safe(o.name)+'<small>'+Object.entries(o.need).map(([k,n])=>ITEMS[k].name+' ×'+n).join(' · ')+(o.arrives>now()?' · On the way':'')+'</small></button>').join('')+'</div>';
  if(S.journey)html+=plannerExtras(p);
  if(!p.orders.length)return html+'<p class="intro">Choose at least one customer to plan. Served or dismissed orders drop out of your selection.</p>';
  html+='<div class="card"><h2>'+p.orders.length+' selected · '+(p.barnReady?'Goods are in your barn':steps.length?'Production needed':'Collect and deliver existing goods')+'</h2><p>Use each step to open its normal controls. Stock stays shared unless you protect these orders above. Customers on the way must arrive before delivery.</p></div>';
 if(covered.length)html+='<h2>Already accounted for</h2>'+covered.map(r=>'<div class="card"><h2>'+ITEMS[r.key].icon+' '+ITEMS[r.key].name+'</h2><p>'+Object.entries(r.used).filter(([,n])=>n).map(([kind,n])=>({barn:'In barn',ready:'Ready to collect',cargo:'Awaiting delivery',pending:'Growing / queued'}[kind])+': '+n).join(' · ')+'</p></div>').join('');
 if(steps.length)html+='<h2>Production steps · ingredients first</h2>'+steps.map((r,i)=>{
  const s=r.source,inputs=Object.entries(s.need).map(([k,n])=>ITEMS[k].name+' ×'+n*r.batches).join(' · ');
   return '<div class="card"><h2>'+(i+1)+'. '+ITEMS[r.key].icon+' '+ITEMS[r.key].name+' · need '+r.missing+' more</h2><p>'+s.name+' · '+r.batches+' '+s.unit+' → '+r.produced+' goods'+(r.surplus?' ('+r.surplus+' extra)':'')+'</p>'+(inputs?'<p>Uses '+inputs+'</p>':'')+(s.seconds?'<p class="muted">Base time per batch: '+remaining(now()+s.seconds*1000)+'. Travel, available cats, queue space and bonuses affect timing.</p>':'')+s.notes.map(n=>'<p>'+n+'</p>').join('')+btn('Open '+s.name,'planSource',r.key,false,true)+(S.journey?btn(S.journey.pins.includes(r.key)?'★ Pinned':'Pin ingredient','planPin',r.key,false,true):'')+'</div>';
 }).join('');
 return html+'<div class="menu-grid"><button data-open="logistics">Track deliveries</button><button data-open="supplies">Buy supplies</button><button data-open="overview">Collect ready goods</button></div>';
}
function togglePlanOrder(id){id=+id;if(!S.orders.some(o=>o.id===id))return false;const ids=plannerOrders().map(o=>o.id);plannerSelection=ids.includes(id)?ids.filter(n=>n!==id):[...ids,id];renderPanel();}
function planOrder(id){id=+id;if(!S.orders.some(o=>o.id===id))return false;plannerSelection=[id];openPanel('planner');}
function openProductionSource(k){
 if(!ITEMS[k])return false;const s=productionSource(k);
 if(s.building!==undefined)return openPanel('building',s.building);
 if(s.at){buildTab=s.kind==='animal'?'animals':'kitchens';return openPanel(s.kind==='life'?'villagebuild':'build');}
 if(s.kind==='craft')return openPanel('craft');
 if(s.kind==='crop'){
  if(CROPS[k].level>level())return openPanel('unlocks');
    if(typeof cropAccess==='function'&&!cropAccess(k).ok)return openPanel('unlocks');
    closePanel();S.seed=k;change();renderSeeds();$('seeds').hidden=false;const main=S.fields.filter(f=>!inValley(f.x,f.y)),candidates=main.length?main:S.fields,f=candidates.find(f=>!f.crop)||candidates[0];if(f)World.focusObject(f.id);else World.center();return;
 }
 if(s.kind==='tree'){if(s.object!==undefined){closePanel();World.focusObject(s.object);return;}buildTab='trees';return openPanel('build');}
 if(s.kind==='garden'){if(s.object!==undefined)return openPanel('decoration',s.object);shopTab='garden';return openPanel('boutique');}
 return openPanel(s.kind==='fishing'?'fishing':k==='gem'?'exploration':'materials');
}
