'use strict';
// Extend the original producers and inventory. Pending actions are locks, not a second economy.
const WorkerFlow=(()=>{
 const state=()=>S.workerFlow ||= {version:1,auto:true,jobs:[]};let settling=false,running=false;
 const original={field:fieldAction,animal:feedAnimal,kitchen:collectKitchen,serve,fish:collectFish,dismiss,assign};
 const pending=(type,id)=>state().jobs.find(j=>j.type===type&&j.target===+id);
 function ready(type,id){if(type==='harvest'){const f=S.fields.find(f=>f.id===id);return !!f?.crop&&f.end<=now()&&!f.pests;}if(type==='animal'){const b=readyBuilding(id);return !!b?.fed&&b.fed<=now()&&!b.careTask;}if(type==='kitchen')return !!readyBuilding(id)?.queue?.some(q=>q.end<=now());if(type==='handover')return S.orders.some(o=>o.id===id&&o.arrives<=now());return !!S.village.fishing&&S.village.fishing.end<=now();}
 function request(type,id,manual=true,bonus=false){id=+id;if(pending(type,id)||!ready(type,id)||state().jobs.length>=250)return false;
  const j={type,target:id,created:now(),manual,end:0,cat:null};
  if(type==='handover'){const o=S.orders.find(o=>o.id===id);if(!has(o.need,id))return false;const b=S.buildings.find(b=>b.type==='store');j.slot=S.orders.filter(o=>o.arrives<=now()).findIndex(o=>o.id===id);j.x=b.x+2.5+j.slot*.72;j.y=shopRoadRow()+.5;j.goods={...o.need};take(j.goods);}
  if(type==='reel')j.bonus=bonus;
  state().jobs.push(j);dispatch();change();return true;
 }
 function target(j){if(j.type==='harvest')return S.fields.find(f=>f.id===j.target);if(j.type==='animal'||j.type==='kitchen')return S.buildings.find(b=>b.id===j.target);if(j.type==='handover'){const b=S.buildings.find(b=>b.type==='store');return {...b,workPoints:[{x:j.x,y:j.y-.42}]};}const p=typeof fishingPoint==='function'?fishingPoint():{x:6,y:9.1};return {id:-20,...p,workPoints:[p]};}
 function choose(target,kind){const role=['crop','harvest','water','feed','care','animal'].includes(kind)?'farm':['cook','produce','kitchen'].includes(kind)?'cook':['haul','handover','carry'].includes(kind)?'haul':'all';
  return S.cats.filter(c=>(!c.job||c.job.end<=now())&&!state().jobs.some(j=>j.cat===c.id&&j.end)).map(c=>{const a=World.workApproach(c,target,kind);return {c,a,score:a?(a.travel||0)/1000-(c.role===role?6:0)-Math.min(5,(c.skills?.[role]||c.experience||0)/20):Infinity};}).filter(q=>q.a).sort((a,b)=>a.score-b.score||a.c.id-b.c.id)[0]?.c||null;
 }
 function dispatch(){for(const j of [...state().jobs].sort((a,b)=>Number(b.manual)-Number(a.manual)||a.created-b.created)){
   if(j.end||!ready(j.type,j.target))continue;const t=target(j);if(!t)continue;
   const kind=j.type==='animal'?(BUILDINGS[t.type]?.product==='milk'?'milk':'eggs'):j.type;
   const c=choose(t,j.type);if(!c)continue;
   const worker=original.assign({harvest:'Harvesting & packing',animal:'Collecting animal produce',kitchen:'Packing cooked dishes',handover:'Taking an order to the customer',reel:'Reeling in the catch'}[j.type],t,now()+({harvest:6500,animal:6500,kitchen:4000,handover:3000,reel:4000}[j.type]),kind,c.id);if(!worker)continue;
   j.cat=worker.id;j.end=worker.job.end;worker.job.flow=j.type;worker.job.stationRevision=114;
   if(j.type==='handover')worker.job.goods=j.goods;
  }
 }
 function finish(j){const c=S.cats.find(c=>c.id===j.cat);state().jobs=state().jobs.filter(q=>q!==j);if(c?.job?.flow===j.type){c.x=c.job.x;c.y=c.job.y;c.job=null;if(World.arriveDelivery)World.arriveDelivery(c);}
  settling=true;try{
   if(j.type==='harvest')original.field(j.target);
   else if(j.type==='animal')original.animal(j.target);
   else if(j.type==='kitchen')original.kitchen(j.target);
   else if(j.type==='handover'){for(const[k,n]of Object.entries(j.goods))give(k,n);if(original.serve(j.target)){const departure=S.departures.find(o=>o.id===j.target);if(departure){departure.slot=j.slot;departure.serviceEnd=now()+500;}FarmNavigation.log('Order handed to customer. Payment received.');}}
   else {const item=S.village.fishing?.item;if(original.fish()&&j.bonus&&item)queueCargo(item,1,target(j));}
   if(c){const role=['harvest','animal'].includes(j.type)?'farm':j.type==='kitchen'?'cook':null;if(role){c.skills ||= {farm:0,cook:0,haul:0};c.skills[role]++;}}
  }finally{settling=false;}if(c&&typeof IslandWonders!=='undefined')IslandWonders.record(j.type,c.id,({harvest:'I harvested and packed our crops.',animal:'I collected produce from our animals.',kitchen:'I packed a freshly cooked dish.',handover:'I carried an order to a happy customer.',reel:'I reeled in a catch.'})[j.type]||'I finished my work.');change();
 }
 function flowTick(){if(running)return;running=true;try{
  for(const j of [...state().jobs])if(j.end&&j.end<=now())finish(j);
  // Harvesting tasks are free collections only. Planting, feeding and cooking always need the player's choice.
  if(state().auto){for(const b of S.buildings){if(ready('animal',b.id)&&!pending('animal',b.id))request('animal',b.id,false);if(ready('kitchen',b.id)&&!pending('kitchen',b.id))request('kitchen',b.id,false);}}
  dispatch();
 }finally{running=false;}}
 // A tap cuts ripe crops immediately; the original producer queues physical cargo.
 // No free cat or harvesting animation is needed before cutting.
 fieldAction=function(id){return original.field(+id);};
 feedAnimal=function(id){if(settling)return original.animal(+id);if(pending('animal',id))return false;if(ready('animal',+id))return request('animal',id);return original.animal(+id);};
 collectKitchen=function(id){return settling?original.kitchen(+id):request('kitchen',id);};
 serve=function(id){return settling?original.serve(+id):request('handover',id);};actions.serve=id=>serve(+id);
 dismiss=function(id){return pending('handover',id)?false:original.dismiss(+id);};
 collectFish=function(){return settling?original.fish():request('reel',-20);};
 actions.fishCollect=()=>{const f=S.village.fishing;if(!f||f.end>now())return false;const n=((now()-f.end)%2800)/1400,p=n<=1?n:2-n;return request('reel',-20,true,p>=.35&&p<=.65);};
 const oldTick=tick;tick=function(){flowTick();oldTick();};
 const oldBusy=objectBusy;objectBusy=function(o){return state().jobs.some(j=>j.target===o.id)||oldBusy(o);};
 actions.workerAuto=()=>{state().auto=!state().auto;change();return true;};
 actions.workerFocus=id=>{const c=S.cats.find(c=>c.id===+id);if(!c)return false;closePanel();World.focusCat(c.id);return true;};
 function panelHTML(){return '<section class="card"><h2>Smart workers · live tasks</h2><p>Choose workers by reachable distance, preferred role and experience. Tap ripe fields to cut instantly. Cats only pick up the cut crops and carry them to the store. Auto collection collects animal produce and packs ready food. It does not buy, plant, feed animals or start recipes.</p>'+btn('Auto collection: '+(state().auto?'ON':'OFF'),'workerAuto')+S.cats.map(c=>'<p><b>'+safe(c.name)+'</b> · '+safe(c.job?.end>now()?c.job.label:'Free')+'</p>'+btn('Watch '+safe(c.name),'workerFocus',c.id)).join('')+'<p>'+state().jobs.filter(j=>!j.end).length+' queued collection / handover tasks.</p></section>';}
 const oldRender=renderPanel;renderPanel=function(){oldRender();if(['workboard','logistics'].includes(panel))$('sheetBody').insertAdjacentHTML('afterbegin',panelHTML());if(panel==='orders')$('sheetBody').insertAdjacentHTML('afterbegin','<p class="intro">Serving reserves the goods. A cat carries the parcel to your customer; payment arrives after handover.</p>');};
 function mode(c){const j=c.job;if(!j)return null;const elapsed=Math.max(0,now()-(j.fieldPhaseStart||j.workStart||now()));
  if(j.flow==='harvest')return elapsed<3300?'harvest':'pack';if(j.flow==='animal')return BUILDINGS[S.buildings.find(b=>b.id===j.target)?.type]?.product==='milk'?'milk':'eggs';if(j.flow==='kitchen')return 'plate';if(j.flow==='handover')return 'handover';if(j.flow==='reel')return elapsed<2600?'reel':'catch';
  if(j.kind==='crop')return elapsed<2300?'dig':elapsed<4600?'plant':'water';
  if(j.kind==='cook'){const b=S.buildings.find(b=>b.id===j.target),q=b?.queue.find(q=>q.end>now()&&q.start<=now());if(q){const f=(now()-q.start)/(q.end-q.start||1);if(f<.15)return 'ingredients';if(f>.88)return 'plate';}}
  if(j.kind==='fish'){const age=now()-(j.workStart||now());return age<1800?'bait':age<3600?'cast':'fish';}return null;
 }
 function carry(c){const j=c.job;if(j?.flow==='handover')return {item:Object.keys(j.goods||{})[0]||'wheat',count:Object.values(j.goods||{}).reduce((a,b)=>a+b,0)};
  if(['cook','feed'].includes(j?.kind)&&j.pickupAt&&now()>=j.pickupAt&&now()<j.workStart)return {item:j.kind==='feed'?'wheat':'bread',count:3};return null;}
 function ambient(ctx,iso,clock){if(!S.life?.effects||S.interface?.reduced)return;ctx.save();const night=timeOfDay()==='Night',rain=weather()==='Rain';for(let i=0;i<(night?9:rain?0:12);i++){const p=iso(3+(i*3.7)%14,2+(i*5.3)%12),x=p.x+Math.sin(clock*.5+i)*40,y=p.y-25+Math.cos(clock*.7+i)*17;ctx.fillStyle=night?'#eff7a480':['#e6ba77','#b98ac6','#d5e4aa'][i%3];if(night){ctx.globalAlpha=.3+Math.sin(clock*2+i)**2*.7;ctx.beginPath();ctx.arc(x,y,2,0,7);ctx.fill();}else{ctx.beginPath();ctx.ellipse(x-3,y,3,1+Math.abs(Math.sin(clock*8+i))*4,-.5,0,7);ctx.ellipse(x+3,y,3,1+Math.abs(Math.sin(clock*8+i))*4,.5,0,7);ctx.fill();}}
 if(!night&&!rain){ctx.strokeStyle='#485f62';ctx.lineWidth=2;for(let i=0;i<4;i++){const p=iso(1+(clock*.5+i*4)%18,1+i*2),y=p.y-180;ctx.beginPath();ctx.moveTo(p.x-8,y-Math.sin(clock*5+i)*5);ctx.quadraticCurveTo(p.x-3,y-5,p.x,y);ctx.quadraticCurveTo(p.x+3,y-5,p.x+8,y-Math.sin(clock*5+i)*5);ctx.stroke();}}ctx.restore();}
 // Retire saved cutting jobs without harvesting, duplicating goods or moving cats.
 // The ripe field remains available for the player's next tap.
 const oldHarvest=state().jobs.filter(j=>j.type==='harvest');
 state().jobs=state().jobs.filter(j=>j.type!=='harvest');
 for(const c of S.cats)if(c.job?.flow==='harvest'){c.job=null;}
 if(oldHarvest.length)saveGame();
 return {state,pending,choose,flowTick,mode,carry,ambient,get settling(){return settling;}};
})();
