'use strict';
let layoutUndo=null;
const catReactions=new Map();
function initJourney(){
 S.journey ||= {revision:1,cats:{},customers:{},projects:[],learned:[],pins:[],reserved:[],goal:null,layouts:[],nextLayout:1,audio:{music:.25,ambience:.25,effects:.6},market:{day:'',base:{harvest:0,served:0,cooked:0,fishCaught:0},claimed:[],tokens:0}};
 for(const c of S.cats)S.journey.cats[c.id] ||= {memories:[],giftDay:null};
 for(const name of Object.keys(CUSTOMER_STORIES))S.journey.customers[name] ||= {visits:0,chapter:0};
 if(S.journey.market.base.decorate===undefined)S.journey.market.base.decorate=seasonalDecorationCount();
 resetMarketDay();return S.journey;
}
function seasonalDecorationCount(){return (S.decor||[]).filter(d=>DECOR_SHOP[d.type]?.category==='seasonal').length;}
function resetMarketDay(){
 const m=S.journey.market;if(m.day===day())return;
 m.day=day();m.base={harvest:S.stats.harvest,served:S.stats.served,cooked:S.stats.cooked,fishCaught:S.village?.fishCaught||0,decorate:seasonalDecorationCount()};m.claimed=[];
}
function journeyTick(){if(!S.journey)return;if(S.journey.market.day!==day()){resetMarketDay();change();}if(typeof productionNotifications==='function')productionNotifications();}
function catProfile(c){const p=CAT_PROFILES[c.id%CAT_PROFILES.length];return {food:p[0],personality:p[1],work:p[2],memories:p.slice(3)};}
function reactCat(c,text='♥'){if(!c)return;catReactions.set(c.id,{text,end:now()+3500});if(typeof World!=='undefined'&&World.feedback)World.feedback(text,c);}
function catReaction(c){const r=catReactions.get(c.id);if(!r)return '';if(r.end<=now()){catReactions.delete(c.id);return '';}return r.text;}
function favoriteGift(id){
 const c=S.cats.find(c=>c.id===+id);if(!c)return false;const j=initJourney().cats[c.id],p=catProfile(c);
 if(j.giftDay===day()||!has({[p.food]:1}))return false;
 take({[p.food]:1});j.giftDay=day();c.affection=Math.min(100,(c.affection||0)+8);c.friendship=Math.min(100,(c.friendship||0)+8);
 reactCat(c,'♥');if(typeof feedbackEvent==='function')feedbackEvent('gift');change();gameNotice(c.name+': My favourite! +8 affection and friendship.');return true;
}
function claimMemory(args){
 const [id,tier]=String(args).split(',').map(Number),c=S.cats.find(c=>c.id===id);if(!c||![1,2,3].includes(tier))return false;
 const j=initJourney().cats[id];if(bondRank(c)<tier||j.memories.includes(tier))return false;
 j.memories.push(tier);c.wardrobe ||= [];const outfit=tier===1?'friend_ribbon':tier===2?'flower_crown':'friend_crown';if(!c.wardrobe.includes(outfit))c.wardrobe.push(outfit);
 S.coins+=tier*80;reactCat(c,'♥');if(typeof feedbackEvent==='function')feedbackEvent('story');change();gameNotice(c.name+': '+catProfile(c).memories[tier-1]);return true;
}
function customerVisit(o){if(!CUSTOMER_STORIES[o.name])return;const c=initJourney().customers[o.name];c.visits++;}
function customerBonus(o){const n=S.journey?.customers[o.name]?.visits||0;return n<3?0:Math.min(8,Math.floor(n/3));}
function finishCustomerStory(name){
 const d=CUSTOMER_STORIES[name],c=S.journey?.customers[name];if(!d||!c||c.chapter>=3)return false;
 const i=c.chapter;if(c.visits<[3,8,15][i]||level()<d.levels[i]||!has(d.needs[i]))return false;
 take(d.needs[i]);c.chapter++;S.coins+=[120,280,650][i];give(i===2?d.decor:'compost',i===2?1:3);if(typeof feedbackEvent==='function')feedbackEvent('story',S.buildings.find(b=>b.type==='store'),'💛');change();gameNotice(name+': '+d.lines[i]);return true;
}
function seasonInfo(){const days=Math.floor(now()/86400000),week=Math.floor(days/7);return {...SEASONS[(week%4+4)%4],ends:(week+1)*7*86400000};}
function marketProgress(t){if(t.id==='decorate')return Math.max(0,seasonalDecorationCount()-(S.journey.market.base.decorate||0));return Math.max(0,(t.id==='fishCaught'?S.village.fishCaught:S.stats[t.id])-S.journey.market.base[t.id]);}
function claimMarketTask(id){
 initJourney();const t=MARKET_TASKS.find(t=>t.id===id),m=S.journey.market;if(!t||m.claimed.includes(id)||marketProgress(t)<t.target)return false;
 m.claimed.push(id);m.tokens+=t.tokens;change();gameNotice('Festival challenge complete! +'+t.tokens+' market tickets.');return true;
}
function buyMarketPrize(key){const p=MARKET_PRIZES[key],m=S.journey?.market;if(!p||!m||m.tokens<p.cost)return false;m.tokens-=p.cost;give(key,p.count);change();return true;}
function learnFestivalRecipe(key){const r=RECIPES[key],j=S.journey;if(!r?.festival||!j||j.learned.includes(key)||level()<r.level||j.market.tokens<5)return false;j.market.tokens-=5;j.learned.push(key);change();gameNotice(ITEMS[key].name+' learned permanently.');return true;}
function cropAccess(key,object){
 const d=CROPS[key]||TREES[key];if(!d)return {ok:false,reason:'Unknown crop.'};
 if(level()<d.level)return {ok:false,reason:'Unlocks at level '+d.level+'.'};
 return {ok:true,reason:''};
}
function valleyExtraYield(r){if(level()<50&&!(S.eastValley&&inValley(r.x,r.y)))return {};return r.type.includes('rock')?{sunstone:2}:r.type==='grass'?{}:{valleywood:3};}
function projectClearingProgress(){return S.resources.filter(r=>r.cleared).length;}
function projectStatus(key){
 const p=VALLEY_PROJECTS[key];if(!p)return {ok:false,reason:'Unknown project.'};
 if(S.journey?.projects.includes(key))return {ok:false,reason:'Restored'};
 if(level()<p.level)return {ok:false,reason:'Requires level '+p.level+'.'};
 if(p.requires&&!S.journey.projects.includes(p.requires))return {ok:false,reason:'Restore '+VALLEY_PROJECTS[p.requires].name+' first.'};
  if(projectClearingProgress()<p.clear)return {ok:false,reason:'Clear '+p.clear+' resources on either land ('+projectClearingProgress()+'/'+p.clear+').'};
 if(S.coins<p.coins)return {ok:false,reason:'Need '+p.coins+' coins.'};
 if(!has(p.need))return {ok:false,reason:'Bring the required materials to your barn.'};
 return {ok:true,reason:'Ready to restore'};
}
function restoreValleyProject(key){
 const p=VALLEY_PROJECTS[key];if(!p||!projectStatus(key).ok)return false;
 take(p.need);S.coins-=p.coins;S.journey.projects.push(key);for(const [k,n]of Object.entries(p.reward))give(k,n);
 if(key==='sanctuary')for(const c of S.cats){c.wardrobe ||= [];if(!c.wardrobe.includes('friend_crown'))c.wardrobe.push('friend_crown');}
  if(typeof feedbackEvent==='function')feedbackEvent('build');change();gameNotice(p.name+' restored! Your farm research has progressed.');return true;
}
function orderReservations(exclude=null){
 const stock={},remaining={...S.inventory},excluded=new Set(Array.isArray(exclude)?exclude:[exclude]);
 // Allocate in customer order: a partially stocked plan can still serve its first
 // ready customer instead of locking every customer behind the same scarce item.
 for(const o of S.orders)if(S.journey?.reserved.includes(o.id))for(const [k,n]of Object.entries(o.need)){
  const allocated=Math.min(n,remaining[k]||0);remaining[k]=(remaining[k]||0)-allocated;if(!excluded.has(o.id))stock[k]=(stock[k]||0)+allocated;
 }
 return stock;
}
function usableQuantity(k,owner=null){return Math.max(0,quantity(k)-(orderReservations(owner)[k]||0));}
function retireOrderReservation(id){if(S.journey)S.journey.reserved=S.journey.reserved.filter(n=>n!==id);}
function reservePlan(){const ids=plannerOrders().map(o=>o.id);if(!ids.length)return false;S.journey.reserved=[...new Set([...S.journey.reserved.filter(id=>S.orders.some(o=>o.id===id)),...ids])];change();gameNotice('Selected orders protected. Other goods stay available.');return true;}
function releaseReservations(){S.journey.reserved=[];change();return true;}
function toggleIngredientPin(k){if(!ITEMS[k])return false;const list=S.journey.pins;if(list.includes(k))S.journey.pins=list.filter(x=>x!==k);else{if(list.length>=12){gameNotice('Pin up to 12 ingredients.');return false;}list.push(k);}change();return true;}
function plannerBottlenecks(p=productionPlan()){
 const rows=[];
 for(const r of p.rows){
  const s=r.source,b=S.buildings.find(b=>b.id===s.building);
  if(r.missing){for(const text of s.notes)rows.push({text,key:r.key});
    if(s.kind==='crop'&&!S.fields.some(f=>!f.crop))rows.push({text:'No empty fields for '+ITEMS[r.key].name+'.',key:r.key});
   if(b?.lifeEnd>now())rows.push({text:s.name+' is already producing. Wait for its current batch.',key:r.key});
   if(Object.entries(s.need).some(([k,n])=>usableQuantity(k)<n))rows.push({text:ITEMS[r.key].name+' needs ingredients first.',key:r.key});
  }else if(r.used.ready)rows.push({text:ITEMS[r.key].name+' is ready to collect.',key:r.key});
  else if(r.used.cargo)rows.push({text:ITEMS[r.key].name+' is waiting for delivery.',key:r.key});
 }
 if(S.village.cargo.some(q=>q.blocked))rows.unshift({text:'A delivery route is blocked. Clear access to the barn.',panel:'logistics'});
 if(!freeCat()&&p.rows.some(r=>r.missing))rows.unshift({text:'All cats are busy. Let a job finish or recruit a helper.',panel:'crew'});
 return rows.filter((r,i,a)=>a.findIndex(x=>x.text===r.text)===i).slice(0,6);
}
function nextGoals(){
 const list=[],add=(id,text,n,total,target)=>list.push({id,text,n:Math.min(n,total),total,...target});
 const chapter=(S.life.chapters||[]).length,ch=CHAPTERS[chapter];
 if(ch){if(ch.goals.every(([k,t])=>chapterCount(k)>=t))add('chapter:'+chapter,'Claim “'+ch.name+'”',1,1,{panel:'chapters'});
 else for(const [k,t,label]of ch.goals)if(chapterCount(k)<t)add('chapter:'+chapter+':'+k,label,chapterCount(k),t,{panel:{restoration:'restoration',served:'orders',animals:'build',harvest:'overview',cooked:'workshops',deliveries:'logistics',fishCaught:'fishing',explored:'exploration',pier:'fishing',cats:'crew',decor:'boutique',bonds:'friends',parcels:'island',store:'orders',discoveries:'collection'}[k]||'build',building:BUILDINGS[k]?k:null});}
 const n=nextVillageStep();add('village:'+n.panel,n.text,0,1,{panel:n.panel});
  for(const [k,p]of Object.entries(VALLEY_PROJECTS))if(level()>=50&&!S.journey.projects.includes(k)){add('valley:'+k,'Restore '+p.name,Math.min(level(),p.level),p.level,{panel:'valley'});break;}
 for(const [name,c]of Object.entries(S.journey.customers))if(c.chapter<3&&c.visits>0)add('customer:'+name,CUSTOMER_STORIES[name].titles[c.chapter],c.visits,[3,8,15][c.chapter],{panel:'customers'});
 const c=S.cats.find(c=>bondRank(c)>S.journey.cats[c.id]?.memories.length);if(c)add('memory:'+c.id,'Read '+c.name+'’s friendship memory',1,1,{panel:'memories'});
 if(!list.length)add('discoveries','Complete your discovery book',S.village.discovered.length,Object.keys(ITEMS).length,{panel:'collection'});
 const pinned=list.find(g=>g.id===S.journey.goal);return (pinned?[pinned,...list.filter(g=>g!==pinned)]:list).slice(0,3);
}
function goGoal(id){const g=nextGoals().find(g=>g.id===id);if(!g)return false;if(id.endsWith(':harvest'))return openProductionSource('wheat');if(g.building){const b=S.buildings.find(b=>b.type===g.building);if(b)return openPanel('building',b.id);buildTab=BUILDINGS[g.building].animal?'animals':'kitchens';if(BUILDINGS[g.building].life)return openPanel('villagebuild');}return openPanel(g.panel);}
function pinGoal(id){if(!nextGoals().some(g=>g.id===id))return false;S.journey.goal=S.journey.goal===id?null:id;change();return true;}
function layoutEntries(){return ['buildings','fields','trees','decor'].flatMap(kind=>S[kind].map(o=>({id:o.id,kind,type:o.type||'field',x:o.x,y:o.y,flip:!!o.flip})));}
function saveFarmLayout(name){
 const j=initJourney(),clean=String(name||'My farm').trim().slice(0,32)||'My farm';if(j.layouts.length>=3){gameNotice('Three layouts saved. Delete a preset to make room.');return false;}
 j.layouts.push({id:j.nextLayout++,name:clean,created:now(),entries:layoutEntries()});change();gameNotice('Layout “'+clean+'” saved.');return true;
}
function deleteFarmLayout(id){const list=S.journey.layouts;if(!list.some(l=>l.id===+id))return false;S.journey.layouts=list.filter(l=>l.id!==+id);change();return true;}
function layoutCheck(entries){
 const current=layoutEntries(),map=new Map(current.map(e=>[e.id,e])),changed=[];
 for(const e of entries){const o=map.get(e.id);if(!o||o.kind!==e.kind||o.type!==e.type)return {ok:false,reason:'An object from this preset was removed. Save a new layout.'};if(o.x!==e.x||o.y!==e.y||o.flip!==e.flip)changed.push({...e,oldX:o.x,oldY:o.y});}
 const proposed=new Map(entries.map(e=>[e.id,e]));const all=current.map(o=>proposed.get(o.id)||o);
 const size=e=>BUILDINGS[e.type]?.size||DECOR_SHOP[e.type]?.size||1,overlap=(a,b)=>a.x<b.x+size(b)&&a.x+size(a)>b.x&&a.y<b.y+size(b)&&a.y+size(a)>b.y;
 const resources=S.resources.filter(r=>!r.cleared).map(r=>({...r,type:'resource'})),camp={...S.village.camp,type:'camp'};
 for(const o of all){
    if(changed.some(e=>e.id===o.id))for(let dx=0;dx<size(o);dx++)for(let dy=0;dy<size(o);dy++)if(!ownedTile(o.x+dx,o.y+dy)||riverBlocked(o.x+dx,o.y+dy))return {ok:false,reason:'A preset crosses water, volcanic cliffs or land you do not own.'};
  if(o.x<camp.x+2&&o.x+size(o)>camp.x&&o.y<camp.y+2&&o.y+size(o)>camp.y)return {ok:false,reason:'A preset overlaps the expedition camp.'};
  if(resources.some(r=>overlap(o,r)))return {ok:false,reason:'Clear trees or rocks under the saved positions first.'};
 }
 for(let i=0;i<all.length;i++)for(let k=i+1;k<all.length;k++){
  const a=all[i],b=all[k];if(a.kind==='decor'&&b.kind==='decor'&&a.x===b.x&&a.y===b.y||a.type!=='path'&&b.type!=='path'&&overlap(a,b))return {ok:false,reason:'Saved positions overlap another farm object.'};
 }
 for(const e of changed){
  const o=S[e.kind].find(o=>o.id===e.id);
   if(objectBusy(o))return {ok:false,reason:'A moved object is busy. Let its work finish first.'};
  if(S.village.cargo.some(q=>q.end>now()&&(e.type==='store'||q.x===e.oldX&&q.y===e.oldY)))return {ok:false,reason:'Let active deliveries finish before moving their source or barn.'};
 }
 return {ok:true,reason:changed.length?'Ready to move '+changed.length+' object'+(changed.length===1?'':'s')+'.':'This layout is already in place.',changed};
}
function applyLayoutEntries(entries,undo=false){
 const check=layoutCheck(entries);if(!check.ok){gameNotice(check.reason);return false;}if(!check.changed.length){gameNotice(check.reason);return false;}
 const before=layoutEntries(),moves=new Map(check.changed.filter(e=>e.type!=='path').map(e=>[e.oldX+','+e.oldY,e]));
 for(const e of check.changed){const o=S[e.kind].find(o=>o.id===e.id);o.x=e.x;o.y=e.y;if(e.kind==='decor')o.flip=e.flip;}
 for(const q of S.village.cargo)if(!q.end){const e=moves.get(q.x+','+q.y);if(e){q.x=e.x;q.y=e.y;q.blocked=false;}}
 // Idle cats displaced by solid objects are moved to a clear, reachable tile.
 for(const c of S.cats)if(!c.job&&S.buildings.some(b=>c.x>=b.x&&c.x<b.x+2&&c.y>=b.y&&c.y<b.y+2)){
  outer:for(let y=0;y<S.size;y++)for(let x=0;x<S.size;x++)if(!occupied(x,y)){c.x=x+.5;c.y=y+.5;break outer;}
 }
 layoutUndo=undo?null:before;if(typeof World!=='undefined'&&World.sync)World.sync(true);change();gameNotice(undo?'Last layout change undone.':'Layout applied · '+check.changed.length+' objects moved.');return true;
}
function applyFarmLayout(id){const l=S.journey.layouts.find(l=>l.id===+id);return l?applyLayoutEntries(l.entries):false;}
function rememberMove(o,x,y){layoutUndo=layoutEntries().map(e=>e.id===o.id?{...e,x,y}:e);}
function undoFarmMove(){return layoutUndo?applyLayoutEntries(layoutUndo,true):false;}
initJourney();saveGame();
