'use strict';
// Upgrade the existing cafe. Old production batches and their vouchers stay collectable.
function cafeGuests(b){return b.cafeGuests||[];}
function cafeGuestPhase(g){return now()<g.arrives?'arriving':!g.served?'waiting':now()<g.mealStart?'preparing':now()<g.mealEnd?'eating':now()<g.leaveEnd?'leaving':'finished';}
function welcomeCafeGuests(id){
 const b=readyBuilding(+id);if(b?.type!=='cafe'||b.lifeEnd||cafeGuests(b).length)return false;
 b.cafeGuests=Array.from({length:2},(_,seat)=>({id:S.nextId++,seat,arrives:now()+8000+seat*2000,served:false}));change();return true;
}
function serveCafeGuest(value){
 const [id,guestId]=String(value).split(',').map(Number),b=readyBuilding(id),g=b&&cafeGuests(b).find(g=>g.id===guestId);
 if(b?.type!=='cafe'||!g||cafeGuestPhase(g)!=='waiting'||b.lifeEnd||S.cats.some(c=>c.job?.target===b.id&&c.job.end>now())||!has(LIFE_BUILDINGS.cafe.input))return false;
 const c=assign('Preparing café table '+(g.seat+1),b,now()+45000,'produce');if(!c)return false;
 take(LIFE_BUILDINGS.cafe.input);g.served=true;g.mealStart=c.job.end;g.mealEnd=g.mealStart+20000;g.leaveEnd=g.mealEnd+8000;g.vouchers=1+(b.upgrade||0);change();return true;
}
function collectCafeGuests(id){
 const b=readyBuilding(+id);if(b?.type!=='cafe')return false;
 const ready=cafeGuests(b).filter(g=>cafeGuestPhase(g)==='finished');if(!ready.length)return false;
 const ids=new Set(ready.map(g=>g.id)),count=ready.reduce((n,g)=>n+g.vouchers,0);
 b.cafeGuests=cafeGuests(b).filter(g=>!ids.has(g.id));queueCargo('cafeticket',count,b);gainXP(ready.length*5);change();return true;
}
const cafePreviousStart=startLifeProduction;
startLifeProduction=function(id){const b=S.buildings.find(b=>b.id===+id);return b?.type==='cafe'?welcomeCafeGuests(id):cafePreviousStart(id);};actions.lifeStart=startLifeProduction;
const cafePreviousCollect=collectLifeProduction;
collectLifeProduction=function(id){const b=S.buildings.find(b=>b.id===+id);return b?.type==='cafe'&&!b.lifeEnd?collectCafeGuests(id):cafePreviousCollect(id);};actions.lifeCollect=collectLifeProduction;
const cafePreviousBusy=objectBusy;
objectBusy=function(b){return !!cafeGuests(b).length||cafePreviousBusy(b);};
const cafePreviousUpgrade=upgradeWorkshop;
upgradeWorkshop=function(id){const b=S.buildings.find(b=>b.id===+id);return b&&cafeGuests(b).length?false:cafePreviousUpgrade(id);};actions.workshopUpgrade=upgradeWorkshop;
Object.assign(actions,{cafeWelcome:welcomeCafeGuests,cafeServe:serveCafeGuest,cafeCollect:collectCafeGuests});
const cafePreviousReady=readyGoods;
readyGoods=function(){return cafePreviousReady()+S.buildings.reduce((n,b)=>n+cafeGuests(b).filter(g=>cafeGuestPhase(g)==='finished').length,0);};
const cafePreviousCollectAll=collectAll;
collectAll=function(){let extra=false;for(const b of S.buildings)if(cafeGuests(b).length)extra=collectCafeGuests(b.id)||extra;return cafePreviousCollectAll()||extra;};actions.collectAll=collectAll;
const cafePreviousPanel=lifePanel;
lifePanel=function(kind,id){const b=S.buildings.find(b=>b.id===id);if(kind!=='lifeBuilding'||b?.type!=='cafe'||b.ready>now()||b.lifeEnd)return cafePreviousPanel(kind,id);
 const guests=cafeGuests(b);return '<h2>Cat café · Table service</h2><p>Guests walk to their tables. Serve either table when its order is ready. A free cat prepares the meal; guests eat and leave before earnings can be collected.</p><p>Each meal: '+needs(LIFE_BUILDINGS.cafe.input)+' → '+(1+(b.upgrade||0))+' café earnings voucher(s). Collect vouchers here, then sell them or fulfil market orders.</p>'+guests.map(g=>{const phase=cafeGuestPhase(g),end=phase==='arriving'?g.arrives:phase==='preparing'?g.mealStart:phase==='eating'?g.mealEnd:phase==='leaving'?g.leaveEnd:null;return '<div class="card"><h3>Table '+(g.seat+1)+' · '+['Poppy','Boba','Maple','Kuma'][g.id%4]+'</h3><p>'+phase+(end?' · <span data-time="'+end+'">'+remaining(end)+'</span>':'')+'</p>'+btn('Serve bread & milk','cafeServe',b.id+','+g.id,phase!=='waiting'||!has(LIFE_BUILDINGS.cafe.input)||S.cats.some(c=>c.job?.target===b.id&&c.job.end>now()))+'</div>';}).join('')+btn('Welcome two guests','cafeWelcome',b.id,!!guests.length)+btn('Collect earnings','cafeCollect',b.id,!guests.some(g=>cafeGuestPhase(g)==='finished'))+(!guests.length?'<div class="card"><h3>Upgrade '+(b.upgrade||0)+'/2</h3>'+btn('Upgrade · 🪙 '+300*((b.upgrade||0)+1),'workshopUpgrade',b.id,(b.upgrade||0)>=2||S.coins<300*((b.upgrade||0)+1)||!has({plank:4,brick:3})&&!availableQuantity('workshop_upgrade_kit'))+'</div>'+btn('Move','move',b.id,false,true):'');
};
function drawCafeGuests(ctx,b,p,api){
 const {sprite,images,clock}=api;
 for(const g of cafeGuests(b)){const phase=cafeGuestPhase(g);if(phase==='finished')continue;
  const end={x:p.x-32+g.seat*68,y:p.y+28},walking=phase==='arriving'||phase==='leaving';let t=1;
  if(phase==='arriving')t=Math.max(0,Math.min(1,1-(g.arrives-now())/8000));if(phase==='leaving')t=Math.max(0,1-(now()-g.mealEnd)/8000);
  const pos={x:end.x+(1-t)*105,y:end.y+(1-t)*45};
  ctx.save();ctx.fillStyle='#92704a';ctx.fillRect(end.x-17,end.y-5,34,5);ctx.fillRect(end.x-14,end.y,3,13);ctx.fillRect(end.x+11,end.y,3,13);ctx.restore();
  if(phase==='eating'&&typeof drawWorkingCat==='function'&&images['biped-'+g.id%4])drawWorkingCat(ctx,images['biped-'+g.id%4],{id:g.id},pos,38,'meal',S.interface?.reduced?0:clock,false);
  else sprite('biped-'+((walking?4:0)+g.id%4),pos.x,pos.y,38,38,walking&&phase==='arriving');
 }
}
