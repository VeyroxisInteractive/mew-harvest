 'use strict';
 const World=(()=>{
  const canvas=$('island'),ctx=canvas.getContext('2d'),images={},customers=new Map(),actors=new Map(),pointers=new Map(),effects=[];
  const camera={x:730,y:490,z:.9};let width=1,height=1,scale=1,last=0,clock=0,start=null,gesture=null,seen=new Set(),lastPoint=null,pinch=null,placement=null,ghost=null,movingMode=false,dragged=false,focus=0,frameId=0,holdTimer=null,holdMove=false,holdOffset={x:0,y:0},farmCamera=null,riverFlow=null,highlandRiverFlow=null,oceanFlow=null,waterfallFlow=null,roadPattern=null,oceanGradient=null,mainIslandArt=null;
const iso=(x,y)=>({x:768+(x-y)*48,y:180+(x+y)*24});
const grid=(x,y)=>({x:(x-768)/96+(y-180)/48,y:(y-180)/48-(x-768)/96});
  let terrain=null,terrainState=null,landscape=null,stoneBridge=null;
 const dryRiverMask=new Path2D();dryRiverMask.rect(-12000,-12000,30000,30000);SUNRISE_RIVER.polygon.map(p=>iso(...p)).forEach((p,i)=>i?dryRiverMask.lineTo(p.x,p.y):dryRiverMask.moveTo(p.x,p.y));dryRiverMask.closePath();
 const headwater=iso(...SUNRISE_RIVER.source);[[headwater.x-44,headwater.y-211],[headwater.x-4,headwater.y-211],[headwater.x+34,headwater.y-6],[headwater.x-34,headwater.y-6]].forEach(([x,y],i)=>i?dryRiverMask.lineTo(x,y):dryRiverMask.moveTo(x,y));dryRiverMask.closePath();
  const riverSceneryHidden=o=>S.eastValley&&inValley(o.x,o.y)&&(o.kind==='resource'||o.kind==='tree'||['riverstones','fieldborder'].includes(o.type))&&(sunriseRiverTile(o.x,o.y)||o.kind==='resource'&&(sunriseApproachTile(o.x,o.y)||landscape?.coversGround(iso(o.x+.5,o.y+.5)))||sunriseMountainTile(o.x,o.y)&&!o.type.includes('rock'));
  let connectedMainIslandArt=null,oceanPattern=null,followingTractor=false;
function terrainRegion(){const r=CosmeticTerrain.farmRegion(S,{owned:ownedTile,roadRow:shopRoadRow(),decorSize:k=>DECOR_SHOP[k]?.size||1});r.layoutKey=[S.size,!!S.eastValley,S.valleyMapRevision,(S.parcels||[]).join(';')];return r;}
function terrainSurfaces(){
   const main={x:-1280,y:-520,w:4096,h:2730,key:!!S.eastValley};if(!S.eastValley)return [main];
  return [main,landscape.surface()];
}
 function drawTerrain(){if(!terrain)return;if(terrainState!==S){terrainState=S;terrain.invalidate();}const a=toWorld({x:0,y:0}),b=toWorld({x:width,y:height});terrain.draw(ctx,{x:a.x,y:a.y,right:b.x,bottom:b.y});}
 function farmLandAt(x,y,size=1){
   if(S.eastValley&&Array.from({length:size},(_,dx)=>Array.from({length:size},(_,dy)=>inValley(x+dx,y+dy)).every(Boolean)).every(Boolean))return true;
   if(!terrain||!Number.isInteger(x)||!Number.isInteger(y))return false;
   for(let dx=0;dx<size;dx++)for(let dy=0;dy<size;dy++){
     const land=terrain.landAt(iso(x+dx+.5,y+dy+.5),0);
     if(!land.amount||land.amount<.28)return false;
   }
   return true;
 }
   function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*d);canvas.height=Math.round(height*d);ctx.setTransform(d,0,0,d,0,0);oceanGradient=null;scale=Math.max(width/1536,height/1024);}
function toWorld(p){return{x:camera.x+(p.x-width/2)/(scale*camera.z),y:camera.y+(p.y-height/2)/(scale*camera.z)};}
function pointer(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
  function limits(){camera.z=Math.max(S.eastValley?.06:.7,Math.min(2.3,camera.z));camera.x=Math.max(-950,Math.min(S.eastValley?5200:2500,camera.x));camera.y=Math.max(-260,Math.min(S.eastValley?3500:1850,camera.y));}
function diamond(x,y,w,h,fill,stroke){ctx.beginPath();ctx.moveTo(x,y-h/2);ctx.lineTo(x+w/2,y);ctx.lineTo(x,y+h/2);ctx.lineTo(x-w/2,y);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.3;ctx.stroke();}}
function sprite(key,x,y,w,h=w,flip=false){let im=images[key];if(!im)return;ctx.save();ctx.translate(x,y);if(flip)ctx.scale(-1,1);const index=key.startsWith('biped-')?+key.slice(6):-1;if(index>=4){im=images['biped-'+index%4];const iw=im.width,ih=im.height,split=.54,hip=.76,step=Math.sin(clock*11+index%4);for(let leg=0;leg<2;leg++){const left=leg?split:0,part=leg?1-split:split,phase=leg?-step:step;ctx.drawImage(im,iw*left,ih*hip,iw*part,ih*(1-hip),-w/2+w*left+phase*w*.024,-h*(1-hip)-Math.max(0,phase)*h*.025,w*part,h*(1-hip));}ctx.drawImage(im,0,0,iw,ih*(hip+.025),-w/2,-h,w,h*(hip+.025));}else ctx.drawImage(im,-w/2,-h,w,h);ctx.restore();}
function text(t,x,y,size=16,color='#53412c'){ctx.font='bold '+size+'px Trebuchet MS, sans-serif';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(t,x,y);}
function bubble(t,x,y,color='#fff9df'){ctx.font='bold 16px Trebuchet MS, sans-serif';let w=ctx.measureText(t).width+20;ctx.fillStyle='#59371f22';ctx.beginPath();ctx.roundRect(x-w/2,y-24,w,30,12);ctx.fill();ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x-w/2,y-27,w,29,11);ctx.fill();text(t,x,y-7);}
function shadow(x,y,w){ctx.fillStyle='#37561e22';ctx.beginPath();ctx.ellipse(x,y,w,w*.28,0,0,Math.PI*2);ctx.fill();}
function worldObjects(){if(activeZone)return S.life.zones[activeZone].map(n=>({...n,kind:'zoneNode',size:1}));return [...(S.village?[{id:-20,kind:'village',type:'fishing',...DOCK_SITE},{id:-21,kind:'village',type:'merchant',...BOAT_SITE},{id:-50,kind:'village',type:'mountain',x:-7,y:1,size:4},{id:-30,kind:'village',type:'exploration',...S.village.camp,size:2}]:[]),...S.resources.filter(o=>!o.cleared).map(o=>({...o,kind:'resource',size:1})),...S.decor.map(o=>({...o,kind:'decor',size:DECOR_SHOP[o.type]?.size||1})),...S.fields.map(o=>({...o,kind:'field',size:1})),...S.trees.map(o=>({...o,kind:'tree',size:1})),...S.buildings.map(o=>({...o,kind:'building',size:2}))].filter(o=>!riverSceneryHidden(o));}
function footprint(o){return iso(o.x+o.size/2,o.y+o.size/2);}
 function hit(p){
  if(!activeZone&&!placement&&!movingMode){
   if(typeof CargoTransport!=='undefined'){const q=CargoTransport.active(),a=q?CargoTransport.position(q):S.village.tractor;if(a){const t=iso(a.x,a.y);if(Math.abs(p.x-t.x)<65&&p.y>t.y-74&&p.y<t.y+15)return {kind:'tractor'};}}

   const waiting=S.orders.filter(o=>o.arrives<=now());
   for(let i=0;i<waiting.length;i++){const spot=customers.get(waiting[i].id)||customerSpot(i),q=iso(spot.x,spot.y);if(Math.abs(p.x-q.x)<17&&p.y>q.y-45&&p.y<q.y+5)return {kind:'customer',id:waiting[i].id};}
   const animal=COAST_SITES.find(d=>Math.hypot(p.x-d.x,p.y-d.y)<55);if(animal)return {kind:'coast',id:animal.id};
  }
   const g=grid(p.x,p.y),objects=worldObjects(),inside=o=>g.x>=o.x&&g.x<o.x+o.size&&g.y>=o.y&&g.y<o.y+o.size;
   if(!activeZone&&S.eastValley&&sunriseBridgeTile(g.x,g.y,S))return {kind:'project'};
 const base=objects.find(o=>o.type!=='mountain'&&inside(o))||objects.find(o=>o.type==='mountain'&&inside(o));if(base)return base;
 if(activeZone)return {kind:'zoneWalk',x:Math.floor(g.x),y:Math.floor(g.y)};
 const locked=!ownedTile(Math.floor(g.x),Math.floor(g.y))&&parcelInfo(parcelKey(g.x,g.y)).valid;if(locked)return {kind:'parcel',key:parcelKey(g.x,g.y)};
 return objects.filter(o=>o.kind==='building'||o.kind==='resource'||o.type==='mountain').sort((a,b)=>b.x+b.y-a.x-a.y).find(o=>{const q=footprint(o);return Math.abs(p.x-q.x)<76&&p.y>q.y-150&&p.y<q.y+30;});
}
function pop(t,o){const p=footprint({...o,size:o.size||1});if(effects.length>=40)effects.shift();effects.push({text:t,x:p.x,y:p.y-40,end:clock+1.5});}
function use(o){if(!o)return;if(o.kind==='tractor'){openPanel('logistics');return;}if(o.kind==='project'){openPanel('valley');return;}if(o.kind==='customer'){openPanel('orders',o.id);return;}if(o.kind==='coast'){greetCoast(o.id);return;}if(o.kind==='zoneNode'){if(!gatherZone(o.id))notice('Wait until this task finishes or the resource returns.');return;}if(o.kind==='zoneWalk'){walkZone(o.x,o.y);return;}if(o.kind==='village'){openPanel(o.type);return;}if(o.kind==='parcel'){openPanel('parcel',o.key);return;}if(o.kind==='field'){const f=S.fields.find(f=>f.id===o.id),harvesting=!!f.crop;if(fieldAction(o.id)){if(!harvesting||typeof feedbackEvent!=='function')pop(harvesting?'+2 '+ITEMS[o.crop].icon:'💧',o);if(!harvesting&&typeof playTone==='function')playTone()};}else if(o.kind==='tree'){if(treeAction(o.id)){pop(o.end?'+3 fruit':'💧',o);if(typeof playTone==='function')playTone(o.end?'harvest':'tap');}}else if(o.kind==='resource'){if(!ownedTile(o.x,o.y)&&!(S.eastValley&&inValley(o.x,o.y)))openPanel('parcel',parcelKey(o.x,o.y));else openPanel('resource',o.id);}else if(o.kind==='decor')openPanel('decoration',o.id);else openPanel('building',o.id);}
 function walkRoute(a,tx,ty){if(riverBlocked(tx,ty))return [];const startCell={x:Math.floor(a.x),y:Math.floor(a.y)},goal={x:Math.floor(tx),y:Math.floor(ty)};const key=(x,y)=>x+','+y,queue=[startCell],prev=new Map([[key(startCell.x,startCell.y),null]]);let found=null,read=0;while(read<queue.length){const p=queue[read++];if(p.x===goal.x&&p.y===goal.y){found=p;break;}for(const [dx,dy]of[[1,0],[0,1],[-1,0],[0,-1]]){const x=p.x+dx,y=p.y+dy,k=key(x,y);if(x<FARM_GREEN_BOUNDS.x1||y<FARM_GREEN_BOUNDS.y1||x>=(S.eastValley?SUNRISE_MAP.x+SUNRISE_MAP.size+8:FARM_GREEN_BOUNDS.x2)||y>=(S.eastValley?Math.max(40,SUNRISE_MAP.y+SUNRISE_MAP.size+8):FARM_GREEN_BOUNDS.y2)||prev.has(k))continue;const blocked=riverBlocked(x,y)||S.decor.some(d=>!['path','gate','arch'].includes(d.type)&&x>=d.x&&x<d.x+(DECOR_SHOP[d.type]?.size||1)&&y>=d.y&&y<d.y+(DECOR_SHOP[d.type]?.size||1))||S.buildings.some(b=>x>=b.x&&x<b.x+2&&y>=b.y&&y<b.y+2);if(blocked)continue;prev.set(k,p);queue.push({x,y});}}if(!found)return[];const path=[];let p=found;while(p&&!(p.x===startCell.x&&p.y===startCell.y)){path.unshift({x:p.x+.5,y:p.y+.5});p=prev.get(key(p.x,p.y));}path.push({x:tx,y:ty});return path;}
 function moveRoute(a,tx,ty){
  if(riverBlocked(tx,ty))return [];
   if(!S.eastValley)return walkRoute(a,tx,ty);
   const crossing=walkRoute(a,tx,ty);if(crossing.length)return crossing;
  const toIsland=inValley(Math.floor(tx),Math.floor(ty)),fromIsland=inValley(Math.floor(a.x),Math.floor(a.y));
   // Retain ferry recovery for existing boats or unreachable shore approaches.
  if(channelTile(a.x,S,a.y)){const port=toIsland?SUNRISE_FERRY.island:SUNRISE_FERRY.farm,end=walkRoute(port,tx,ty);return end.length?[{...port,transport:'boat'},...end]:[];}
  if(toIsland!==fromIsland){const from=fromIsland?SUNRISE_FERRY.island:SUNRISE_FERRY.farm,to=toIsland?SUNRISE_FERRY.island:SUNRISE_FERRY.farm,start=walkRoute(a,from.x,from.y),end=walkRoute(to,tx,ty);return start.length&&end.length?[...start,{...to,transport:'boat'},...end]:[];}
  return walkRoute(a,tx,ty);
 }
function workApproach(c,target,kind){
 const a=actors.get(c.id)||c;
 for(const p of workPositions(target,kind)){const path=moveRoute(a,p.x,p.y);if(!path.length)continue;let distance=0,previous=a;for(const next of path){distance+=Math.hypot(next.x-previous.x,next.y-previous.y);previous=next;}return {...p,travel:Math.ceil(distance/3.6*1000),path};}return null;
}
function deliveryPlan(q,c){
 const a=actors.get(c.id)||c,store=S.buildings.find(b=>b.type==='store');if(!store)return null;
 const vehicle=q.vehicle==='tractor',route=vehicle?walkRoute:moveRoute,park=vehicle?S.village.tractor:a;
 const board=vehicle?walkRoute(a,park.x,park.y):[];if(vehicle&&!board.length)return null;
 const source=[...S.buildings,...S.decor].find(b=>b.x===q.x&&b.y===q.y),candidates=source?workPositions(source,'haul'):[{x:q.x+.5,y:q.y+.8}];
 const pick=candidates.map(p=>({p,path:route(park,p.x,p.y)})).find(d=>d.path.length);if(!pick)return null;
 const destination=(vehicle&&!inValley(store.x,store.y)?[CargoTransport.parking(),...workPositions(store,'haul')]:workPositions(store,'haul')).map(p=>({p,path:route(pick.p,p.x,p.y)})).find(d=>d.path.length);if(!destination)return null;
 if(vehicle){pick.path=CargoTransport.smooth(park,pick.path);destination.path=CargoTransport.smooth(pick.p,destination.path);}
 const points=[{x:a.x,y:a.y},...board,...pick.path,...destination.path];let distance=0,pickup=0,boardDistance=0;
 for(let i=1;i<points.length;i++){distance+=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);if(i===board.length)boardDistance=distance;if(i===board.length+pick.path.length)pickup=distance;}
 return {points,distance,pickup,board:boardDistance};
}
function deliveryPosition(q){if(typeof CargoTransport!=='undefined')return CargoTransport.position(q);const route=q.route;if(!route?.points?.length)return null;let left=route.distance*Math.max(0,Math.min(1,(now()-q.start)/(q.end-q.start)));for(let i=1;i<route.points.length;i++){const a=route.points[i-1],b=route.points[i],d=Math.hypot(b.x-a.x,b.y-a.y);if(left<=d)return {x:a.x+(b.x-a.x)*(d?left/d:1),y:a.y+(b.y-a.y)*(d?left/d:1),flip:b.x-b.y<a.x-a.y};left-=d;}return route.points.at(-1);}
function pickedUp(q){return typeof CargoTransport!=='undefined'?!!q.end&&CargoTransport.progress(q).loaded:q.end&&now()>q.start+(q.end-q.start)*(q.route?.distance?q.route.pickup/q.route.distance:.45);}
function sync(reset=false){if(reset)actors.clear();for(const c of S.cats)if(!actors.has(c.id))actors.set(c.id,{x:c.x,y:c.y,path:[],signature:'',wait:clock+2,flip:false});for(const id of actors.keys())if(!S.cats.some(c=>c.id===id))actors.delete(id);}
function animateCats(dt){
 sync();for(const c of S.cats){
  const a=actors.get(c.id),j=c.job&&c.job.end>now()?c.job:null;a.atWork=false;
  if(j?.kind==='haul'){
   const q=S.village.cargo.find(q=>q.id===j.cargo),b=S.buildings.find(b=>b.type==='store');
   if(q?.route){const pos=deliveryPosition(q);if(pos){a.x=pos.x;a.y=pos.y;a.flip=pos.flip;a.walking=pos.phase?['boarding','toPickup','delivering'].includes(pos.phase):true;a.path=[];a.routine=j.label;a.pose=1;continue;}}
   if(q){const returning=pickedUp(q);j.x=returning?b.x+2.1:q.x+.5;j.y=returning?b.y+.5:q.y+.8;}
  }
  if(j)a.routine=j.label;
   if(j?.crop&&j.fields?.length){
     const fields=j.fields.map(id=>S.fields.find(f=>f.id===id&&f.crop===j.crop&&f.end>now())).filter(Boolean);let f=fields.find(f=>f.id===j.target)||fields.find(f=>f.id===a.cropTarget)||fields[0];
    if(f){
     if(a.cropTarget!==f.id){a.cropTarget=f.id;a.cropArrived=false;}
     const arrived=Math.hypot(a.x-f.x-.5,a.y-f.y-.9)<.16;
     if(arrived&&!a.cropArrived){a.cropArrived=true;a.cropWait=clock+8;}
     // Finish the crossing and tend the field before choosing the next one.
     // Switching every eight seconds mid-walk strands a worker between islands.
     if(arrived&&a.cropArrived&&clock>=a.cropWait&&fields.length>1){f=fields[(fields.indexOf(f)+1)%fields.length];a.cropTarget=f.id;a.cropArrived=false;}
     j.target=f.id;j.x=f.x+.5;j.y=f.y+.9;
    }
   }else{a.cropTarget=null;a.cropArrived=false;}
  const target=j&&[...S.buildings,...S.decor,...S.resources].find(b=>b.id===j.target);
  if(j&&target&&['cook','produce','feed','water','chop','mine','build'].includes(j.kind)&&!j.stationRevision){const approach=workApproach(c,target,j.kind);if(approach){j.x=approach.x;j.y=approach.y;j.stationRevision=31;}}
  const sig=j?j.target+':'+j.kind+':'+j.x+':'+j.y:'';
  if(sig!==a.signature){a.signature=sig;a.path=j?moveRoute(a,j.x,j.y):[];a.wait=clock+2;}
  if(!j&&!a.path.length&&clock>a.wait){const home=S.buildings.find(b=>b.type==='house'),rest=S.life&&timeOfDay()==='Night';a.routine=rest?'Resting':Math.floor(clock/9+c.id)%3===0?'Chatting':'Exploring';const x=rest?home.x+2.2+c.id%2*.5:3+Math.random()*6,y=rest?home.y+1.5:3+Math.random()*6;if(!S.buildings.some(b=>x>=b.x&&x<b.x+2&&y>=b.y&&y<b.y+2))a.path=moveRoute(a,x,y);a.wait=clock+4+Math.random()*5;}
  let travel=dt*3.6;while(a.path.length&&travel>0){const t=a.path[0],dx=t.x-a.x,dy=t.y-a.y,d=Math.hypot(dx,dy),step=Math.min(d,travel);if(d<.001){a.path.shift();continue;}a.x+=dx/d*step;a.y+=dy/d*step;a.flip=dx-dy<0;travel-=step;if(step===d)a.path.shift();}
  a.walking=!!a.path.length;a.atWork=!!j&&!a.walking&&Math.hypot(a.x-j.x,a.y-j.y)<.16;
  if(a.atWork&&target){const p=footprint({...target,size:BUILDINGS[target.type]?.size||1}),q=iso(a.x,a.y);a.flip=p.x<q.x;}
  a.pose=a.walking?1:a.atWork?j.kind==='water'?4:j.kind==='cook'?6:['carry','haul'].includes(j.kind)?7:5:0;
 }
}
function drawField(f){const p=footprint(f);sprite('soil',p.x,p.y+25,98,50);if(f.crop){const ready=f.end<=now(),total=CROPS[f.crop].seconds*1000,t=Math.max(0,Math.min(1,1-(f.end-now())/total)),idx=CROPS[f.crop].sprite??Object.keys(CROPS).indexOf(f.crop)%16;ctx.save();ctx.translate(p.x,p.y+8);ctx.rotate(Math.sin(clock*2+f.id)*.025);sprite('crop-'+(t>.35||ready?idx:11),0,0,ready?87:46+t*38);ctx.restore();if(ready){ctx.fillStyle='#fff5ae';ctx.beginPath();ctx.arc(p.x+24,p.y-27,3+Math.sin(clock*3)*.6,0,Math.PI*2);ctx.fill();}}}
function drawPenAnimals(b,p){const w=(['hen','cow'].includes(b.type)?235:205)+(b.penLevel||0)*10,im=images[BUILDINGS[b.type].art||'building-'+BUILDINGS[b.type].sprite];const top=p.y+37-w,left=p.x-w/2;ctx.save();ctx.translate(left,top);ctx.scale(w/320,w/320);
// Each animal's feet sit in the yard; the front fence is composited over them.
const spots=b.type==='goat'?[[130,207],[172,219],[202,201],[105,186]]:b.type==='rabbit'?[[140,220],[185,240],[205,212],[145,252]]:b.type==='cow'?[[125,204],[168,216],[91,189],[205,207]]:b.type==='sheep'||b.type==='pig'||b.type==='rabbit'?[[142,181],[181,165],[98,162],[217,184]]:[[138,215],[182,210],[98,202],[216,200]];for(let i=0;i<b.animals;i++){const q=spots[i],routine=S.life?animalRoutine(b,i):'Walking',phase=(clock*.13+i*.73)%1,walk=routine==='Walking',x=q[0]+(walk?Math.sin(phase*Math.PI*2)*11:0),y=q[1]+(walk?Math.cos(phase*Math.PI*2)*5:0);shadow(x,y,12);ctx.save();ctx.translate(x,y);if(routine==='Eating'||routine==='Drinking')ctx.rotate(Math.sin(clock*2+i)*.07);const key=b.type==='goat'?'new-2':b.type==='rabbit'?'coast-2':'crop-'+({hen:12,cow:13,sheep:14,pig:15}[b.type]),size=(b.type==='hen'?34:b.type==='cow'?50:43)*(b.animalBorn?.[i]?Math.min(1,.58+(now()-b.animalBorn[i])/86400000*.42):1);sprite(key,0,0,size,routine==='Sleeping'?size*.83:size,walk&&Math.cos(phase*Math.PI*2)<0);ctx.restore();if(routine==='Sleeping')text('z',x+8,y-32,12);if(routine==='Drinking')text('💧',x+13,y-24,10);if(routine==='Eating')text('🌾',x+13,y-24,10);}

if(im){ctx.save();ctx.beginPath();const edge=['rabbit','goat'].includes(b.type)?[[15,202],[152,295],[300,220]]:b.type==='sheep'||b.type==='pig'?[[12,159],[170,235],[306,171]]:[[30,199],[156,266],[301,211]];ctx.moveTo(...edge[0]);ctx.lineTo(...edge[1]);ctx.lineTo(...edge[2]);ctx.lineTo(320,320);ctx.lineTo(0,320);ctx.closePath();ctx.clip();ctx.drawImage(im,0,0,320,320);ctx.restore();}ctx.restore();}
function drawBuilding(b){const p=footprint(b),d=BUILDINGS[b.type];shadow(p.x,p.y+22,64);if(b.ready>now())ctx.globalAlpha=.65;const upgraded=['bakery','dairy','fryer','mixer','cakeoven','pot'].indexOf(b.type);const buildingKey=d.art?d.art:b.upgrade&&upgraded>=0?'upgrade-'+upgraded:d.life?'life-'+LIFE_BUILDINGS[b.type].sprite:b.type==='house'&&S.village?(S.village.restoration===0?'village-2':S.village.restoration>=2||S.houseLevel>0?'village-3':'building-'+d.sprite):'building-'+d.sprite;if(b.penLevel){sprite('shop-'+(b.penLevel===2?1:0),p.x-65,p.y+40,80);sprite('shop-'+(b.penLevel===2?1:0),p.x+65,p.y+40,80);}if(b.upgrade){sprite('shop-0',p.x-58,p.y+40,90);sprite('shop-0',p.x+58,p.y+40,90);}sprite(buildingKey,p.x,p.y+37,b.type==='house'?235+(S.houseLevel||0)*12:d.animal?(['hen','cow'].includes(b.type)?235:205)+(b.penLevel||0)*10:205+(b.upgrade||0)*12);ctx.globalAlpha=1;if(S.details&&b.ready<=now()) {ctx.save();ctx.font='bold 13px Trebuchet MS, sans-serif';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#fff9d8';ctx.strokeText(d.name,p.x,p.y+50);ctx.fillStyle='#4b5130';ctx.fillText(d.name,p.x,p.y+50);ctx.restore();}if(b.ready>now())bubble('🔨 '+remaining(b.ready),p.x,p.y-190);if(d.project){const stage=S.farmLife?.projects?.[d.project]||0;bubble(stage===3?'✓ '+d.name:'🔨 '+stage+'/3',p.x,p.y-180);if(stage<3){ctx.strokeStyle='#a57648';ctx.lineWidth=3;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(p.x-65+i*40,p.y);ctx.lineTo(p.x-65+i*40,p.y-100);ctx.stroke();}ctx.beginPath();ctx.moveTo(p.x-75,p.y-80);ctx.lineTo(p.x+75,p.y-80);ctx.stroke();}}if(d.animal){drawPenAnimals(b,p);if(S.details&&b.fed>now())bubble(remaining(b.fed),p.x,p.y-190);if(b.fed&&b.fed<=now())bubble(ITEMS[d.product].icon,p.x,p.y-190);else if(b.animals&&!b.fed)bubble(ITEMS[d.feed].icon,p.x,p.y-190);}if(b.queue.some(j=>j.end<=now()))bubble('✓',p.x,p.y-190);else if(b.queue.length){if(S.details)bubble(remaining(b.queue[0].end),p.x,p.y-190);ctx.fillStyle='#fff9d9aa';for(let i=0;i<3;i++){let y=(clock*16+i*15)%46;ctx.beginPath();ctx.arc(p.x+25+Math.sin(clock+i)*4,p.y-90-y,4+y/9,0,Math.PI*2);ctx.fill();}}if(b.type==='cafe'&&b.lifeEnd){for(let i=0;i<2;i++)sprite('biped-'+i,p.x-25+i*45,p.y+18,35);}if(b.type==='bees'&&b.lifeEnd)text('🐝',p.x+Math.sin(clock)*25,p.y-50,13);if(b.greenBatch)bubble(b.greenBatch.end<=now()?'✓ Seed bed':remaining(b.greenBatch.end),p.x,p.y-160);if(b.lifeEnd)bubble(b.lifeEnd<=now()?'Ready':remaining(b.lifeEnd),p.x,p.y-170);if(b.upgrade)bubble('Workshop '+(b.upgrade+1),p.x,p.y-205);if(b.penLevel)bubble('Home '+(b.penLevel+1),p.x,p.y-205);if(b.type==='store'&&S.storeLevel)bubble('Market '+(S.storeLevel+1),p.x,p.y-190);if(b.type==='house'&&S.houseLevel)bubble('Cottage '+(S.houseLevel+1),p.x,p.y-185);}
function drawResource(r){const p=footprint(r),covered=r.type==='grass'&&[...S.buildings,...S.fields,...S.trees,...(S.decor||[])].some(o=>{const n=BUILDINGS[o.type]?.size||DECOR_SHOP[o.type]?.size||1;return r.x<o.x+n&&r.x+1>o.x&&r.y<o.y+n&&r.y+1>o.y;});if(covered)return;if(r.respawn>now()){if(r.type!=='grass'&&!r.type.includes('rock'))sprite('resource-6',p.x,p.y+10,65);return;}const valley=S.eastValley&&inValley(r.x,r.y),basalt=valley&&sunriseMountainTile(r.x,r.y)&&r.type.includes('rock');sprite((basalt?'basalt-resource-':valley?'highland-resource-':'resource-')+RESOURCES[r.type].sprite,p.x,p.y+10,r.type==='grass'?valley?65:75:basalt?32:r.type.includes('rock')?valley?66:87:valley?112:155);if(!basalt&&!ownedTile(r.x,r.y)&&r.type.includes('rock'))sprite('resource-8',p.x+12,p.y+20,valley?70:83);if(r.end)bubble(remaining(r.end),p.x,p.y-110);}
function drawDecor(d){const p=footprint(d);if(DECOR_SHOP[d.type]){const w=d.type==='guesthouse'?205:DECOR_SHOP[d.type].size===2?165:['gate','arch'].includes(d.type)?125:105;const adjacent=S.decor.some(o=>o.id!==d.id&&o.type===d.type&&o.x===d.x&&Math.abs(o.y-d.y)===1);const open=d.type==='gate'&&[...actors.values()].some(a=>Math.hypot(a.x-d.x-.5,a.y-d.y-.5)<1.6);ctx.save();ctx.translate(p.x,p.y+20);if(open)ctx.scale(.3,1);sprite(DECOR_SHOP[d.type].art||'shop-'+DECOR_SHOP[d.type].sprite,0,0,w,w,d.flip||adjacent);ctx.restore();if(['planter','flowercorner'].includes(d.type)&&d.end)bubble(d.end<=now()?'🌸':remaining(d.end),p.x,p.y-90);if(d.type==='lamp'&&!d.off&&timeOfDay()!=='Day'){ctx.save();const glow=ctx.createRadialGradient(p.x,p.y-60,0,p.x,p.y-60,55);glow.addColorStop(0,'#ffdc7a66');glow.addColorStop(1,'#ffdc7a00');ctx.fillStyle=glow;ctx.fillRect(p.x-55,p.y-115,110,110);ctx.restore();}return;}sprite(d.type==='bench'?'resource-7':'ground-1',p.x,p.y+25,d.type==='bench'?100:98,d.type==='bench'?100:52);}
function drawTree(t){const p=footprint(t);text('🌳',p.x,p.y+5,65);if(t.end&&t.end<=now())text(ITEMS[t.type].icon,p.x,p.y-29,24);else if(t.end){const duration=TREES[t.type].time*1000,growth=1-Math.max(0,t.end-now())/duration;text(growth<.35?'🌼':ITEMS[t.type].icon,p.x,p.y-29,growth<.35?13:14+growth*7);}else if(!t.end)bubble('💧',p.x,p.y-64);}
 function drawGrid(){
    const resource=!!RESOURCES[placement?.type],minX=FARM_GREEN_BOUNDS.x1,minY=FARM_GREEN_BOUNDS.y1,maxX=S.eastValley?SUNRISE_MAP.x+SUNRISE_MAP.size:FARM_GREEN_BOUNDS.x2,maxY=S.eastValley?SUNRISE_MAP.y+SUNRISE_MAP.size:FARM_GREEN_BOUNDS.y2;
  for(let x=minX;x<maxX;x++)for(let y=minY;y<maxY;y++){
  if(channelTile(x,S,y)||!resource&&!ownedTile(x,y))continue;
  const p=iso(x+.5,y+.5);diamond(p.x,p.y,96,48,'#fff8a60a','#e6f7a862');
 }
 if(!ghost)return;
 const size=placement?.kind==='buy'?(BUILDINGS[placement.type]?.size||DECOR_SHOP[placement.type]?.size||1):worldObjects().find(o=>o.id===placement?.id)?.size||1,p=iso(ghost.x+size/2,ghost.y+size/2),ok=(RESOURCES[placement?.type]||S.resources.some(r=>r.id===placement?.id))?forestSpot(ghost.x,ghost.y,placement?.id):!occupied(ghost.x,ghost.y,size,placement?.id);
 diamond(p.x,p.y,96*size,48*size,ok?'#a4e26288':'#f4866a88',ok?'#ffffff':'#bd3c22');
 const type=placement?.type||worldObjects().find(o=>o.id===placement?.id)?.type;
 if(BUILDINGS[type]){ctx.globalAlpha=.55;sprite(BUILDINGS[type].art||(LIFE_BUILDINGS[type]?'life-'+LIFE_BUILDINGS[type].sprite:'building-'+BUILDINGS[type].sprite),p.x,p.y+37,['house','hen','cow'].includes(type)?235:205);ctx.globalAlpha=1;}
 else{ctx.globalAlpha=.6;const item=worldObjects().find(o=>o.id===placement?.id);if(item?.kind==='field'||type==='field')sprite('soil',p.x,p.y+25,98,50);else if(RESOURCES[type])sprite('resource-'+RESOURCES[type].sprite,p.x,p.y+10,155);else if(DECOR_SHOP[type])sprite(DECOR_SHOP[type].art||'shop-'+DECOR_SHOP[type].sprite,p.x,p.y+20,DECOR_SHOP[type].size?205:105);else if(type==='bench')sprite('resource-7',p.x,p.y+25,100);ctx.globalAlpha=1;}
}
function catSprite(c,a){return 'biped-'+((a.walking?1:0)*4+c.id%4);}
function customerSpot(i){const b=S.buildings.find(b=>b.type==='store');return {x:b.x+2.5+i*.72,y:shopRoadRow()+.5};}
function roadCells(){const b=S.buildings.find(b=>b.type==='store');if(!b)return [];const y=shopRoadRow(),a=[],end=S.eastValley&&inValley(b.x,b.y)?SUNRISE_MAP.x+SUNRISE_MAP.size+6:S.eastValley?mainShore(S):S.size+8;for(let x=b.x+2;x<end;x++)a.push({x,y});return a;}
 function drawMeadow(){if(S.eastValley)return;const view=toWorld({x:0,y:0}),view2=toWorld({x:width,y:height});
    for(const d of availableParcels()){const p=iso(d.x+2,d.y+2);if(p.x<view.x-80||p.x>view2.x+80||p.y<view.y-80||p.y>view2.y+80)continue;if(d.y+4<=8||d.y>=14)diamond(p.x,p.y,384,192,'#284c140a','#e6e8a26a');if(d.y<8||d.y>=12)bubble('🔒 '+d.price,p.x,p.y);}}
function equippedPiece(c,slot){return c.outfit?.[slot]||({head:c.hat,body:c.vest}[slot]||null);}
function wearableColor(c,slot,d){return c.outfitColors?.[slot]||d?.color||'blue';}
function drawWearable(c,slot,p,size,flip){if(slot==='head'&&typeof CatHatArt!=='undefined'&&typeof HatShop!=='undefined'){const hat=HatShop.equipped(c);if(hat)CatHatArt.draw(ctx,p,size,flip,hat);}} // Fitted woven straw hats; no clothing/glasses overlays.
function dressedCat(c,key,p,size,flip){
  const haul=S.village?.cargo.find(q=>q.cat===c.id&&q.vehicle==='tractor'&&q.end>now());
  if(haul&&typeof TractorArt!=='undefined'){const progress=CargoTransport.position(haul);if(progress&&progress.phase!=='boarding'){TractorArt.draw(ctx,p,images['biped-'+c.id%4],{...progress,hat:HatShop.equipped(c)},clock,S.life?.effects!==false);return;}}

    const a=actors.get(c.id);if(S.eastValley&&a?.walking&&(channelTile(a.x,S,a.y)&&!sunriseBridgeTile(a.x,a.y,S)||SUNRISE_RIVER.waterAt(a.x,a.y))){ctx.strokeStyle='#d5f1e688';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x+10,p.y+11,44,12,-.2,0,Math.PI);ctx.stroke();sprite('village-1',p.x,p.y+24,105,105,flip);sprite('biped-'+c.id%4,p.x-22,p.y+5,39,39,flip);return;}
  if(!key.startsWith('biped-'))key='biped-'+c.id%4;
  const working=c.job?.end>now()&&actors.get(c.id)?.atWork&&['crop','water','feed','cook','produce','chop','mine','build','craft','fish'].includes(c.job.kind);
  drawWearable(c,'back',p,size,flip,true);
  if(working)drawWorkingCat(ctx,images['biped-'+c.id%4],c,p,size,workerMode(c),(S.interface?.reduced||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)?0:clock,flip);
  else sprite(key,p.x,p.y+1,size,size,flip);
  drawWearable(c,'body',p,size,flip);drawWearable(c,'neck',p,size,flip);drawWearable(c,'accessory',p,size,flip);drawWearable(c,'head',p,size,flip);
  const reaction=typeof catReaction==='function'?catReaction(c):'';if(reaction)text(reaction,p.x,p.y-size-8,18,'#d47891');
  if(c.job?.kind==='haul'&&S.village.cargo.some(q=>q.id===c.job.cargo&&pickedUp(q)))sprite('village-4',p.x+(flip?-10:10),p.y-13,29);

}
function aInvisible(c){return !c.job||c.job.end<=now();}
function drawCustomers(){S.orders.filter(o=>o.arrives<=now()).forEach((o,i)=>{const target=customerSpot(i);let q=customers.get(o.id);if(!q){q={...target};customers.set(o.id,q);}const walking=Math.hypot(q.x-target.x,q.y-target.y)>.02;q.x+=(target.x-q.x)*.08;q.y+=(target.y-q.y)*.08;const p=iso(q.x,q.y);shadow(p.x,p.y,8);sprite('biped-'+((walking?1:0)*4+o.id%4),p.x,p.y+1,43,43,true);if(has(o.need,o.id))bubble('✓',p.x,p.y-42,'#ecf5be');});for(const id of customers.keys())if(!S.orders.some(o=>o.id===id))customers.delete(id);}
function drawMountains(){drawTerrain();for(const [x,y,w,h] of [[-14,-4,1200,750],[-12,6,1120,720],[-11,-6,1120,710],[-10,0,1080,680],[-9,6,970,610],[-7,-5,930,600]]){const p=iso(x,y);sprite('mountain',p.x-70,p.y+165,w,h);}}
function drawWaterfall(){sprite('source-mountain',-340,440,860,688);if(waterfallFlow&&S.life?.waterMotion!==false&&!(S.interface?.reduced||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches))waterfallFlow.draw(ctx,-770,-248,860,688,clock);}
function dirtTrack(points,width=40){
 if(points.length<2)return;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 const path=new Path2D();path.moveTo(points[0].x,points[0].y);
 for(let i=1;i<points.length-1;i++){const p=points[i],n=points[i+1];path.quadraticCurveTo(p.x+Math.sin(p.y*.07)*2,p.y,(p.x+n.x)/2,(p.y+n.y)/2);}path.lineTo(points.at(-1).x,points.at(-1).y);
 for(const [extra,color]of [[26,'#8b956b0b'],[20,'#9b946420'],[14,'#a49b6d36'],[8,'#b09c7255'],[3,'#b99f7599'],[-3,roadPattern||'#baa07a']]){ctx.strokeStyle=color;ctx.lineWidth=width+extra;ctx.stroke(path);}
 // Small soil flecks follow the track, with scattered grass at the shoulders.
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],length=Math.hypot(b.x-a.x,b.y-a.y),nx=-(b.y-a.y)/length,ny=(b.x-a.x)/length;
  for(let j=0;j<length;j+=7){const t=j/length,seed=Math.sin(a.x*12.7+a.y*3.1+j*1.9),side=seed*width*.57,x=a.x+(b.x-a.x)*t+nx*side,y=a.y+(b.y-a.y)*t+ny*side;ctx.fillStyle=Math.abs(side)>width*.45?'#7d984f75':seed>0?'#e3cc9b70':'#7d674b40';ctx.beginPath();ctx.ellipse(x,y,1.5+Math.abs(seed)*2,.7,0,0,Math.PI*2);ctx.fill();}
 }ctx.restore();
}
function drawBridgePaths(){const store=S.buildings.find(b=>b.type==='store');if(!store)return;dirtTrack([iso(store.x+2.5,shopRoadRow()+.5),iso(8.5,8.6),iso(8.5,10.1)]);dirtTrack([iso(8.5,11.7),iso(8.5,13.6),iso(12,14.3)]);}
function mapClip(x1,x2){ctx.beginPath();[iso(x1,-60),iso(x2,-60),iso(x2,80),iso(x1,80)].forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.clip();}
function drawValley(){if(S.eastValley&&landscape){landscape.drawNaturalSurroundings(ctx);landscape.drawPlateau(ctx);landscape.drawMysticBackdrop(ctx);}}
  function drawRiver(){if(images.river){const p=iso(8,11),art=images.river,flow=riverFlow;ctx.save();if(S.eastValley){ctx.beginPath();[iso(-45,-55),iso(mainShore(S)-2,-55),iso(mainShore(S)-1.5,7),iso(mainShore(S)+1,9.5),iso(mainShore(S)-.8,11.6),iso(mainShore(S)+1.2,14.2),iso(mainShore(S)-1.5,18),iso(-45,80)].forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.closePath();ctx.clip();}ctx.drawImage(art,p.x-840,p.y-440,1680,880);if(flow&&S.life?.waterMotion!==false&&!(S.interface?.reduced||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches))flow.draw(ctx,p.x-840,p.y-440,1680,880,clock);ctx.restore();}}
function polygon(points,fill,stroke,width=1){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function drawChannel(){
   if(S.eastValley&&landscape)landscape.drawGorge(ctx,mainShore(S));
}
  function drawChannelShores(){
     if(!S.eastValley||!landscape)return;const phase=S.life?.waterMotion===false||(S.interface?.reduced||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)?0:clock;
     landscape.drawRiverMouths(ctx,mainShore(S),phase);landscape.drawWater(ctx,mainShore(S),phase);
 }
 function drawRoad(){
 const cells=roadCells().filter(c=>!riverBlocked(c.x,c.y));let segment=[];
 for(const c of cells){if(S.buildings.some(b=>c.x>=b.x&&c.x<b.x+2&&c.y>=b.y&&c.y<b.y+2)||S.fields.some(f=>f.x===c.x&&f.y===c.y)){dirtTrack(segment);segment=[];}else segment.push(iso(c.x+.5,c.y+.5));}dirtTrack(segment);
 const route=roadCells();if(route.length<2)return;const travel=[];
 for(const o of S.orders){const delta=o.arrives-now();if(delta>0&&delta<=10000)travel.push({id:o.id,t:delta/10000,out:false,slot:0});}
 for(const o of S.departures||[])if(o.end>now())travel.push({id:o.id,t:Math.max(0,1-(o.end-now())/10000),out:true,slot:o.slot||0,serving:now()<(o.serviceEnd||o.start)});
 for(const c of travel){const start=Math.min(route.length-1,c.slot*.72),idx=Math.max(0,Math.min(route.length-1,start+(route.length-1-start)*c.t)),a=route[Math.floor(idx)],b=route[Math.min(route.length-1,Math.floor(idx)+1)],f=idx%1,p=iso(a.x+(b.x-a.x)*f+.5,a.y+(b.y-a.y)*f+.5);shadow(p.x,p.y,8);sprite('biped-'+((c.serving?0:1)*4+c.id%4),p.x,p.y+1,43,43,!c.out);if(c.serving)text('…',p.x,p.y-45,16);if(c.out&&!c.serving)sprite('village-4',p.x-7,p.y-8,20);}
  }
   function drawGrandBridge(){
     if(!S.eastValley)return;
      stoneBridge ||= StoneBridgeArt.create();stoneBridge.draw(ctx,mainShore(S));
      dirtTrack([iso(mainShore(S)-5,7),iso(mainShore(S)-.65,7)],50);ctx.save();ctx.clip(dryRiverMask,'evenodd');const land=new Path2D();SUNRISE_MAP.outline.map(p=>iso(...p)).forEach((p,i)=>i?land.lineTo(p.x,p.y):land.moveTo(p.x,p.y));land.closePath();ctx.clip(land);dirtTrack(SUNRISE_APPROACH.map(p=>iso(...p)),43);dirtTrack([iso(68,23.8),iso(71.5,25.2),iso(76,27),iso(83,28)],29);ctx.restore();
  }

 // Lightweight world dressing lives outside gameplay objects. It is a small,
 // deterministic set of cached-looking shapes so zooming out reveals an ocean
 // world rather than a hard canvas edge or a field of empty blue.
 function worldBlob(x,y,rx,ry,fill,stroke,seed=0){const p=iso(x,y),pts=[];for(let i=0;i<14;i++){const a=i/14*Math.PI*2,r=.86+Math.sin(seed+i*2.7)*.07;pts.push({x:p.x+Math.cos(a)*rx*r,y:p.y+Math.sin(a)*ry*r});}polygon(pts,fill,stroke,1.2);}
  function drawWorldSurroundings(){
   if(oceanPattern){const a=toWorld({x:0,y:0}),b=toWorld({x:width,y:height});ctx.save();ctx.globalAlpha=.45;ctx.fillStyle=oceanPattern;ctx.fillRect(a.x,a.y,b.x-a.x,b.y-a.y);ctx.restore();}
  const distant=[[-9,7,170,52,1],[17,-8,220,58,2],[33,28,155,48,3],[80,7,215,62,4],[84,34,180,52,5],[53,46,230,65,6],[5,33,145,45,7],[27,42,120,42,8],[43,36,110,34,9],[74,42,130,40,10],[15,-7,115,35,11],[4,24,95,30,12]];
  for(const [x,y,rx,ry,seed]of distant){worldBlob(x,y,rx*1.5,ry*1.55,'#2b829c26','#8bd0c04d',seed);worldBlob(x,y,rx,ry,'#3e9fae80','#b6d8b574',seed+20);worldBlob(x,y,rx*.68,ry*.48,seed%2?'#8daa6688':'#b5aa6e7c','#d9cf8e88',seed+30);if(seed%2===0){const p=iso(x,y);for(let i=0;i<3;i++){ctx.fillStyle='#385e507d';ctx.beginPath();ctx.ellipse(p.x-rx*.22+i*rx*.2,p.y-ry*.42,7+i*2,3,0,0,Math.PI*2);ctx.fill();}if(images['resource-3']){ctx.globalAlpha=.62;sprite('resource-3',p.x-rx*.18,p.y-ry*.35,55);ctx.globalAlpha=1;}}}
  // Reefs and underwater shelves give the deep water a natural depth rhythm.
  for(const [x,y,rx,ry]of [[-5,18,80,24],[28,3,74,20],[36,39,88,25],[78,25,100,28],[13,27,62,18],[87,14,70,20]]){const p=iso(x,y);ctx.strokeStyle='#b4e3ba5c';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y,rx,ry,-.16,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#1e748b54';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(p.x+10,p.y+5,rx*.72,ry*.45,-.16,0,Math.PI*2);ctx.stroke();}
  // Far cliffs are deliberately simple and low contrast; they dissolve into
  // haze toward the outer camera limits.
  for(const [x,y,w,h]of [[-13,-3,330,96],[28,-13,420,115],[78,-8,360,105],[4,45,390,90],[77,43,470,110]]){const p=iso(x,y);polygon([{x:p.x-w,y:p.y+18},{x:p.x-w*.62,y:p.y-h},{x:p.x-w*.17,y:p.y-h*.45},{x:p.x+w*.18,y:p.y-h*1.15},{x:p.x+w*.62,y:p.y-h*.35},{x:p.x+w,y:p.y+18}], '#315b6814','#84a89218',1.2);}
  for(const [x,y,rx,ry]of [[-5,-7,260,80],[34,-10,330,95],[82,-8,280,88],[5,43,300,80],[84,43,330,90]]){const p=iso(x,y),v=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,rx);v.addColorStop(0,'#e7f0d43d');v.addColorStop(1,'#e7f0d400');ctx.fillStyle=v;ctx.fillRect(p.x-rx,p.y-ry,rx*2,ry*2);}
  for(let i=0;i<26;i++){const x=-16+(i*17)%105,y=-15+((i*29)%76),p=iso(x,y);ctx.strokeStyle=i%3?'#d4f1dc38':'#f5edb85e';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(p.x,p.y,12+(i%5)*5,2+(i%3),-.18,0,Math.PI);ctx.stroke();}
 }

function frame(t){
 const fps=({low:30,medium:45,high:60})[S.interface?.quality]||60;if(t-last<1000/fps-1){frameId=requestAnimationFrame(frame);return;}
   const dt=Math.min(.05,(t-last)/1000||.016);last=t;clock+=dt;animateCats(dt);if(followingTractor&&typeof CargoTransport!=='undefined'){const q=CargoTransport.active(),p=q?CargoTransport.position(q):S.village.tractor;if(p){const at=iso(p.x,p.y);camera.x=at.x;camera.y=at.y;}}ctx.clearRect(0,0,width,height);if(!oceanGradient){oceanGradient=ctx.createLinearGradient(0,0,width,height);oceanGradient.addColorStop(0,'#3c9fb5');oceanGradient.addColorStop(.45,'#65c9ca');oceanGradient.addColorStop(1,'#2d8fa8');}ctx.fillStyle=oceanGradient;ctx.fillRect(0,0,width,height);ctx.save();ctx.translate(width/2,height/2);ctx.scale(scale*camera.z,scale*camera.z);ctx.translate(-camera.x,-camera.y);
  if(activeZone){drawZone();ctx.restore();drawWeather();frameId=requestAnimationFrame(frame);return;}
      drawWorldSurroundings();drawChannel();drawValley();
    if(mainIslandArt)ctx.drawImage(S.eastValley?connectedMainIslandArt||mainIslandArt:mainIslandArt,-1280,-520,4096,2730);
       drawMountains();drawBridgePaths();drawRiver();drawWaterfall();drawChannelShores();drawMeadow();if(S.eastValley&&landscape){landscape.drawNaturalRiver(ctx,clock);landscape.drawRiverBanks(ctx,clock);landscape.drawAmbientVegetation(ctx);landscape.drawMysticEffects(ctx,clock);landscape.drawVolcano(ctx,clock);}if(placement||movingMode)drawGrid();drawRoad();drawGrandBridge();
 for(const d of S.decor.filter(d=>d.type==='path'))drawDecor(d);
 if(S.village?.pier&&typeof FarmLife!=='undefined'){const q=S.farmLife?.shipment,t=q?.end?Math.max(0,Math.min(1,1-(q.end-now())/180000)):0,trip=q?.end&&q.end>now()?Math.sin(t*Math.PI)*12:0,p=iso(11+trip,13.2+trip*.35);sprite('village-1',p.x,p.y+18+Math.sin(clock)*2,125,125,t>.5);if(q&&!q.end){const n=Object.keys(q.loaded).length;for(let i=0;i<n;i++)sprite('village-4',p.x-24+i*17,p.y-5,24);}if(q?.end&&q.end<=now())bubble('✓ Ship returned',p.x,p.y-65);}
 for(const b of S.buildings){const p=footprint({...b,size:2});const n=b.type==='house'?0:b.type==='store'?1:BUILDINGS[b.type].animal?2:1;sprite('ground-'+n,p.x,p.y+67,260,138);}
 const scene=worldObjects().filter(o=>o.type!=='path').map(o=>({y:footprint(o).y,draw:()=>{ctx.save();if(S.eastValley&&inValley(o.x,o.y)&&['tree','resource'].includes(o.kind))ctx.clip(dryRiverMask,'evenodd');if(o.kind==='village')drawVillageSite(o);else if(o.kind==='field')drawField(o);else if(o.kind==='tree')drawTree(o);else if(o.kind==='resource')drawResource(o);else if(o.kind==='decor')drawDecor(o);else drawBuilding(o);ctx.restore();}}));
    if(S.eastValley)scene.push({y:iso(SUNRISE_MAP.x+.25,SUNRISE_MAP.bridgeY+SUNRISE_MAP.bridgeWidth+.2).y+1,draw:()=>stoneBridge?.foreground(ctx)});
 for(const c of S.cats){const a=actors.get(c.id),p=iso(a.x,a.y);scene.push({y:p.y+26,draw:()=>{shadow(p.x,p.y,10);if(c.job?.kind==='visit'||c.job?.kind==='home'&&!a.walking)return;dressedCat(c,catSprite(c,a),p,65,a.flip);if(!a.walking&&!c.job&&a.routine==='Resting')text('z',p.x+15,p.y-55,14);if(!a.walking&&!c.job&&a.routine==='Chatting'&&Math.floor(clock)%12<3)text('♥',p.x,p.y-62,14,'#dd836e');}});}
 if(S.village?.tractor&&typeof CargoTransport!=='undefined'&&typeof TractorArt!=='undefined'){const q=CargoTransport.active();if(!q||CargoTransport.progress(q).phase==='boarding'){const t=S.village.tractor,p=iso(t.x,t.y);scene.push({y:p.y+26,draw:()=>TractorArt.draw(ctx,p,null,{phase:'parked',loaded:false,driving:false,dx:1,dy:0},clock,false)});}}
 scene.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());drawCustomers();drawCargo();
 for(const d of COAST_SITES){if(!coastReady(d.id))continue;const sway=Math.sin(clock*.7+d.id)*4;sprite(d.art,d.x+sway,d.y,65);if(S.details)bubble('Tap',d.x,d.y-65);}
 if(S.details){const groups=new Map();for(const f of S.fields)if(f.crop&&f.end>now()){const old=groups.get(f.crop);if(!old||f.end>old.end)groups.set(f.crop,f);}for(const[k,f]of groups){const p=iso(f.x+.5,f.y+.5);bubble(CROPS[k].name+' · '+remaining(f.end),p.x,p.y-60);}}
 for(const e of effects)if(e.end>clock){ctx.globalAlpha=Math.min(1,e.end-clock);bubble(e.text,e.x,e.y-(1.5-e.end+clock)*24);}
 ctx.globalAlpha=1;while(effects[0]&&effects[0].end<clock)effects.shift();ctx.restore();drawWeather();frameId=requestAnimationFrame(frame);
}
canvas.addEventListener('pointerdown',e=>{followingTractor=false;canvas.setPointerCapture(e.pointerId);clearTimeout(holdTimer);holdMove=false;const p=pointer(e);pointers.set(e.pointerId,p);if(pointers.size===2){const [a,b]=[...pointers.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:camera.z};gesture=null;dragged=true;return;}start={...p,cx:camera.x,cy:camera.y};dragged=false;seen.clear();lastPoint=p;const o=hit(toWorld(p));gesture=!placement&&!movingMode&&o?.kind==='field'?(o.crop?'harvest':'plant'):null;if(o&&!activeZone&&['field','tree','building','decor','resource'].includes(o.kind)&&!placement&&!movingMode)holdTimer=setTimeout(()=>{if(dragged||pointers.size!==1)return;moving(o.id);holdMove=true;gesture=null;const g=grid(toWorld(p).x,toWorld(p).y);holdOffset={x:Math.floor(g.x)-o.x,y:Math.floor(g.y)-o.y};ghost={x:o.x,y:o.y};notice('Drag to a clear spot, then release');},500);});
canvas.addEventListener('pointermove',e=>{const p=pointer(e),w=toWorld(p),g=grid(w.x,w.y);if(placement)ghost={x:Math.floor(g.x)-(holdMove?holdOffset.x:0),y:Math.floor(g.y)-(holdMove?holdOffset.y:0)};if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,p);if(pointers.size>1&&pinch){const[a,b]=[...pointers.values()];camera.z=pinch.z*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,pinch.d);limits();return;}if(!start)return;if(Math.hypot(p.x-start.x,p.y-start.y)>6){dragged=true;clearTimeout(holdTimer);}if(gesture&&dragged){const n=Math.max(1,Math.ceil(Math.hypot(p.x-lastPoint.x,p.y-lastPoint.y)/7));for(let i=0;i<=n;i++){const q={x:lastPoint.x+(p.x-lastPoint.x)*i/n,y:lastPoint.y+(p.y-lastPoint.y)*i/n},o=hit(toWorld(q));if(o?.kind==='field'&&!seen.has(o.id)){seen.add(o.id);if(gesture==='harvest'&&o.crop&&o.end<=now()||gesture==='plant'&&!o.crop)use(o);}}}else if(dragged&&!placement){camera.x=start.cx-(p.x-start.x)/(scale*camera.z);camera.y=start.cy-(p.y-start.y)/(scale*camera.z);limits();}lastPoint=p;});
function end(e){clearTimeout(holdTimer);if(holdMove){if(e.type==='pointerup'&&ghost&&moveObject(placement.id,ghost.x,ghost.y)){notice('Position saved');cancel();}else{notice('Cannot place here. Choose a clear spot.');}holdMove=false;dragged=true;}const p=pointer(e);pointers.delete(e.pointerId);if(!dragged&&e.type==='pointerup'){const w=toWorld(p),g=grid(w.x,w.y);if(placement){const x=Math.floor(g.x),y=Math.floor(g.y);let ok=placement.kind==='buy'?place(placement.type,x,y):moveObject(placement.id,x,y);if(ok){notice(placement.kind==='buy'?'Placed on your island.':'New position saved.');cancel();}else notice('Choose a clear tile. Check coins, unlocks and free cats.');}else{const o=hit(w);if(movingMode){if(o&&o.kind!=='resource'&&o.kind!=='village')moving(o.id);else if(o)notice('Trees and rocks stay here. Tap them outside move mode to collect materials.');}else use(o);}}if(!pointers.size){start=null;gesture=null;pinch=null;}else{dragged=true;start=null;}}
canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY>0?.93:1.07)},{passive:false});canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();focus=(focus+(e.key==='ArrowLeft'?-1:e.key==='ArrowUp'?-3:e.key==='ArrowDown'?3:1)+S.fields.length)%S.fields.length;const p=footprint({...S.fields[focus],size:1});camera.x=p.x;camera.y=p.y;limits();}if(e.key==='Enter'||e.key===' '){e.preventDefault();use({...S.fields[focus],size:1,kind:'field'});}});
 function zoom(n){camera.z*=n;limits();}function center(){if(activeZone){camera.x=768;camera.y=430;camera.z=.85;return;}camera.x=730;camera.y=490;camera.z=.9;}
function cancel(){clearTimeout(holdTimer);holdMove=false;placement=null;ghost=null;movingMode=false;$('placement').hidden=true;}
function placing(type){if((BUILDINGS[type]?.level||TREES[type]?.level||0)>=50)center();placement={kind:'buy',type};movingMode=false;$('seeds').hidden=true;$('placement').hidden=false;$('placementText').textContent=(RESOURCES[type]?'Plant outside your farm · ':'Place ')+(BUILDINGS[type]?.name||TREES[type]?.name||RESOURCES[type]?.name||CRAFTS[type]?.name||'field');}
function moving(id){placement={kind:'move',id};movingMode=false;$('placement').hidden=false;$('placementText').textContent='Choose a new position';}
 function moveMode(){placement=null;movingMode=true;$('placement').hidden=false;$('placementText').textContent='Tap a field, tree, building or decoration to move it';}
 function drawVillageSite(o){const p=footprint(o),v=S.village;if(o.type==='fishing'){if(v.pier)sprite('village-0',p.x+20,p.y+55,130);else bubble('BUILD PIER',p.x,p.y);}else if(o.type==='merchant'){if(v.merchant.arrives<=now())sprite('village-1',p.x,p.y+35+Math.sin(clock)*2,135);}else if(o.type==='mountain'){bubble('WILLOW MOUNTAIN',p.x,p.y-15);}else {sprite('village-5',p.x,p.y+35,165);if(S.life?.crafting?.some(j=>j.end<=now()))bubble('CRAFTS READY',p.x,p.y-115);}}
function drawCargo(){for(const q of S.village?.cargo||[]){if(pickedUp(q))continue;const p=iso(q.x+.5,q.y+.5);sprite('village-4',p.x,p.y+10,36);}}
function enterZone(){farmCamera={...camera};cancel();center();$('leaveZone').hidden=false;}
function leaveZone(){activeZone=null;if(farmCamera)Object.assign(camera,farmCamera);farmCamera=null;$('leaveZone').hidden=true;}
function drawZone(){const v=S.life.visit;if(!v)return;const cave=activeZone==='cave';if(!cave&&images.island)ctx.drawImage(images.island,-1280,-520,4096,2730);if(cave){ctx.fillStyle='#273238';ctx.fillRect(-2000,-2000,5000,5000);for(let x=0;x<11;x++)for(let y=0;y<11;y++){const p=iso(x+.5,y+.5);ctx.save();ctx.filter='grayscale(.9) brightness(.65)';sprite('ground-1',p.x,p.y+25,100,54);ctx.restore();}}const objects=[];for(const n of S.life.zones[activeZone]){const p=iso(n.x+.5,n.y+.5),d=zoneResource(activeZone,n.id);objects.push({y:p.y,draw:()=>{if(n.ready>now()){sprite('resource-6',p.x,p.y+10,40);return;}sprite(d.sprite,p.x,p.y+15,d.sprite.includes('resource-4')||d.sprite.includes('resource-5')?100:145);}});}for(let i=0;i<11;i++){for(const y of [0,10]){const p=iso(i+.5,y+.5);sprite(cave?'resource-4':activeZone==='woods'?'resource-1':'resource-3',p.x,p.y+10,cave?120:145);}}let x=v.x,y=v.y,walking=false;if(v.work){const n=v.work.walk?{x:v.work.x,y:v.work.y}:S.life.zones[activeZone].find(n=>n.id===v.work.id),t=Math.min(1,(now()-v.work.start)/Math.max(1,v.work.walkEnd-v.work.start));x=v.work.fromX+(n.x+.5-v.work.fromX)*t;y=v.work.fromY+(n.y+1-v.work.fromY)*t;walking=t<1;}const c=S.cats.find(c=>c.id===v.cat),p=iso(x,y);objects.push({y:p.y,draw:()=>{shadow(p.x,p.y,10);dressedCat(c,walking?'biped-'+((1)*4+c.id%4):v.work?'cat-5':'biped-'+c.id%4,p,65,false);if(v.work&&!walking)bubble('Gathering',p.x,p.y-72);}});objects.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());const heading=iso(5,-1);bubble(EXPEDITIONS[activeZone].name,heading.x,heading.y);}
function drawWeather(){
 if(!S.life?.effects)return;const tod=timeOfDay();if(tod!=='Day'){ctx.fillStyle=tod==='Night'?'#13244966':'#eb943519';ctx.fillRect(0,0,width,height);}
 const reduced=(S.interface?.reduced||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
 if(S.journey){const season=seasonInfo();ctx.fillStyle={spring:'#efb7d109',summer:'#fbe6930c',autumn:'#dca66b12',winter:'#d9eef219'}[season.id];ctx.fillRect(0,0,width,height);
  if(!reduced){ctx.fillStyle=season.id==='winter'?'#f5fbff9c':season.id==='spring'?'#f9c4d299':season.id==='autumn'?'#c9965488':'#fff2bb88';
    for(let i=0;i<10;i++){const x=(i*113+clock*12)%width,y=(i*79+clock*(season.id==='winter'?18:9))%height;ctx.beginPath();ctx.ellipse(x+Math.sin(clock*.5+i)*12,y,season.id==='summer'?1.5:3,season.id==='winter'?2:1.6,clock*.2+i,0,Math.PI*2);ctx.fill();}
  }
 }
  if(weather()==='Rain'&&!reduced){ctx.strokeStyle='#d9f4ff77';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<20;i++){const x=(i*97+clock*24)%width,y=(i*73+clock*220)%height;ctx.moveTo(x,y);ctx.lineTo(x-4,y+13);}ctx.stroke();}
}
// Optional loading presentation cannot own or interrupt world startup.
let worldReady=false;
function loadingUI(method,...args){try{if(window.MewLoading)window.MewLoading[method](...args);else if(method==='finish')$('loading').hidden=true;}catch{if(method==='finish')$('loading').hidden=true;}}
 function startFrames(){
 if(!worldReady||document.hidden||frameId)return;
  // RAF's first timestamp can predate startup work in an installed PWA. Start
  // from zero so the capped first delta never drives water phases backwards.
    last=0;
   frameId=requestAnimationFrame(frame);
 }
  function prepareMainIslandArt(im,withoutDock=false){
    const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d'),d=im.width*im.height;g.drawImage(im,0,0);
    const px=g.getImageData(0,0,im.width,im.height),original=withoutDock?new Uint8ClampedArray(px.data):null,dock=[[1134,740],[1288,671],[1338,665],[1380,729],[1536,820],[1536,999],[1430,999],[1245,917],[1128,857]];
    const water=(r,green,b)=>b>r+42&&green>r+42&&b>green*.70;
    function shoreColor(x,y){
     const sum=[0,0,0];let count=0;
     for(const radius of [8,16,24,36,52]){for(let j=0;j<16;j++){const a=j/16*Math.PI*2,sx=x+Math.cos(a)*radius,sy=y+Math.sin(a)*radius;if(sx<0||sx>=1536||sy<0||sy>=1024||sy>815-(sx-1140)*.52||mapPointInPolygon(sx,sy,dock))continue;const k=(Math.floor(sy/1024*im.height)*im.width+Math.floor(sx/1536*im.width))*4,r=original[k],green=original[k+1],b=original[k+2];if(original[k+3]<128||water(r,green,b))continue;sum[0]+=r;sum[1]+=green;sum[2]+=b;count++;if(count===4)return sum.map(v=>v/count);}}
     return count?sum.map(v=>v/count):[236,219,170];
    }
    for(let i=0;i<d;i++){
     const k=i*4,r=px.data[k],green=px.data[k+1],b=px.data[k+2],x=i%im.width*1536/im.width,y=Math.floor(i/im.width)*1024/im.height;
     if(water(r,green,b))px.data[k+3]=0;
     if(withoutDock&&x>1128&&y>665&&mapPointInPolygon(x,y,dock)){
      const timber=r>green*1.16&&green>b*1.10,shoreY=815-(x-1140)*.52+Math.sin(x*.043)*7+Math.sin(x*.119)*2.5,beyondShore=y>shoreY;
      if(beyondShore)px.data[k+3]=0;
      else {
       // Rebuild the removed dock as a feathered sandy cove. Sampling single
       // nearby pixels caused the stretched bands visible on the old coast.
       const depth=shoreY-y,blend=timber?1:Math.min(1,Math.max(0,(x-1128)/9))*Math.min(1,Math.max(0,(y-665)/12))*Math.min(1,Math.max(0,(90-depth)/15));
       const grain=((Math.sin(Math.floor(x)*127.1+Math.floor(y)*311.7)*43758.5453)%1)*2;
       const color=depth<4?[219+grain,236+grain,205+grain]:depth<8?[199+grain,190+grain,148+grain]:[229+grain,215+grain,160+grain];
       for(let c=0;c<3;c++)px.data[k+c]=original[k+c]*(1-blend)+color[c]*blend;
       if(blend>.9)px.data[k+3]=255;
       if(depth<3)px.data[k+3]*=Math.max(0,depth/3);
      }
     }
    }
    g.putImageData(px,0,0);return c;
  }
 async function load(){
  const list={'natural-ridge':'art/natural-ridge.png','natural-waterfall':'art/natural-waterfall.png','volcano-painted':'art/volcano-painted.png','source-mountain':'art/source-mountain.webp',island:'art/island.webp','dirt-road':'art/dirt-road.webp',soil:'art/soil.webp',mountain:'art/mountain.webp',river:'art/river.webp'};
 for(const [prefix,count]of Object.entries({new:6,coast:6,upgrade:6,market:6,life:6,village:6,shop:6,biped:12,resource:9,coat:8,ground:4,cat:8,building:12,crop:16}))for(let i=0;i<count;i++)list[prefix+'-'+i]='art/'+prefix+'-'+i+'.webp';
 for(const key of Object.keys(TOWN_PROJECTS))list['town-'+key]='art/town-'+key+'.webp';
 for(const key of Object.keys(NEW_WORKSHOPS))list['workshop-'+key]='art/workshop-'+key+'.webp';
 const entries=Object.entries(list),pending=new Set();let checked=0;
 loadingUI('progress',0,entries.length);
 // One bounded watchdog for the existing batch, not a timer per asset. Late
 // artwork can still join images, but each result/progress callback settles once.
 const watchdog=setTimeout(()=>{for(const settle of pending)settle(false);},20000);
 const results=await Promise.all(entries.map(([key,url])=>new Promise(resolve=>{
  const im=new Image();let settled=false;
  const settle=ok=>{if(settled)return;settled=true;pending.delete(settle);loadingUI('progress',++checked,entries.length);resolve(ok);};
   pending.add(settle);im.onload=()=>{images[key]=im;settle(true)};im.onerror=()=>settle(false);im.src=url+'?v=83';
 })));
 clearTimeout(watchdog);
 const grain=document.createElement('canvas');grain.width=grain.height=512;const g=grain.getContext('2d');g.fillStyle='#bba17c';g.fillRect(0,0,512,512);
 let seed=481;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<16000;i++){const x=random()*512,y=random()*512;g.fillStyle=i%2?'#f8e6b52b':'#71583d26';g.beginPath();g.ellipse(x,y,1+random()*2,.5+random(),0,0,Math.PI*2);g.fill();}roadPattern=ctx.createPattern(grain,'repeat');
   if(images.island){mainIslandArt=prepareMainIslandArt(images.island);connectedMainIslandArt=prepareMainIslandArt(images.island,true);oceanFlow=createOceanFlow(images.island);}
   const sea=document.createElement('canvas');sea.width=512;sea.height=384;const sg=sea.getContext('2d');for(let i=0;i<115;i++){const x=CosmeticTerrain.random(i,1,8,9941)*512,y=CosmeticTerrain.random(i,2,8,9941)*384,w=7+CosmeticTerrain.random(i,3,8,9941)*31;sg.strokeStyle=i%4?'#c9ece231':'#2d718628';sg.lineWidth=i%3?.8:1.4;sg.beginPath();sg.moveTo(x-w,y);sg.quadraticCurveTo(x,y-3,x+w,y+1);sg.stroke();}oceanPattern=ctx.createPattern(sea,'repeat');
 if(images['source-mountain']){images['source-mountain']=prepareWaterArt(images['source-mountain'],true);waterfallFlow=createWaterfallFlow(images['source-mountain']);}
    if(images.river){images.river=prepareWaterArt(images.river);riverFlow=createRiverFlow(images.river);images['highland-river']=SunriseLandscape.gradeRiver(images.river);highlandRiverFlow=createRiverFlow(images['highland-river'],{direction:-1});}
    landscape=SunriseLandscape.create({images,iso,riverFlow:highlandRiverFlow||riverFlow});
    for(let i=0;i<9;i++)if(images['resource-'+i])images['highland-resource-'+i]=SunriseLandscape.gradeRiver(images['resource-'+i]);
    for(const i of [4,5])if(images['resource-'+i]){const im=images['resource-'+i],c=document.createElement('canvas');c.width=c.height=96;const q=c.getContext('2d');q.filter='saturate(.14) brightness(.64)';q.drawImage(im,0,0,96,96);images['basalt-resource-'+i]=c;}
   terrain=CosmeticTerrain.createRenderer({images,region:terrainRegion,surfaces:terrainSurfaces});
   if(results.some(v=>!v))notice('Some artwork did not load. Refresh with a connection.');resize();sync();worldReady=true;
 startFrames();loadingUI('finish');window.dispatchEvent(new Event('mew-world-ready'));
}
function screenPoint(x,y){const p=iso(x,y);return {x:width/2+(p.x-camera.x)*scale*camera.z,y:height/2+(p.y-camera.y)*scale*camera.z};}
const previousChange=onChange;onChange=()=>{terrain?.invalidate();previousChange();};
new ResizeObserver(resize).observe(canvas);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frameId);frameId=0;}else if(worldReady){tick();startFrames();}});load();
  return {coast:()=>{camera.x=800;camera.y=1600;camera.z=.85;},route:moveRoute,workApproach,screenPoint,
  feedback:(message,o)=>pop(message,{...o,size:BUILDINGS[o.type]?.size||DECOR_SHOP[o.type]?.size||1}),
  picture:()=>{canvas.toBlob(blob=>{if(!blob)return;const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download='MEW-HARVEST-Farm.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},'image/png');notice('Saving your farm picture.');return true;},
      valley:()=>{const p=iso(SUNRISE_MAP.x+SUNRISE_MAP.size*.40,SUNRISE_MAP.y+SUNRISE_MAP.size*.42);camera.x=p.x;camera.y=p.y;camera.z=Math.min(.5,(width-40)/(scale*3400),(height-180)/(scale*2300));limits();},
      volcano:()=>{const p=iso(SUNRISE_VOLCANIC.cone.x,SUNRISE_VOLCANIC.cone.y);camera.x=p.x+230;camera.y=p.y-300;camera.z=width<600?.34:.56;limits();},
      bridge:()=>{if(!S.eastValley)return;const p=iso((mainShore(S)+SUNRISE_MAP.x)/2,7);camera.x=p.x;camera.y=p.y+20;camera.z=Math.min(.9,(width-50)/(scale*1200),(height-190)/(scale*650));limits();},
      river:(part='all')=>{if(!S.eastValley)return;const target={source:[60.4,3.2],crossing:[74,19],falls:[81.8,20.9],mouth:[93,26.4]}[part];if(target){const p=iso(...target);camera.x=p.x;camera.y=p.y-(part==='source'?135:0);camera.z=width<600?.55:.95;}else{const p=iso(75,17);camera.x=p.x+90;camera.y=p.y-90;camera.z=Math.min(.66,(width-40)/(scale*1650),(height-160)/(scale*2150));}limits();},
     islands:()=>{if(!S.eastValley)return center();
      // Isometric extrema lie on different corners, not one diagonal.
      const points=[[-12,-12],[40,-12],[40,40],[-12,40],...SUNRISE_MAP.outline].map(p=>iso(...p));
      const cone=iso(SUNRISE_VOLCANIC.cone.x,SUNRISE_VOLCANIC.cone.y);
      points.push({x:cone.x+SUNRISE_VOLCANIC.cone.width/2,y:cone.y-SUNRISE_VOLCANIC.cone.height-240});
      const left=Math.min(...points.map(p=>p.x))-100,right=Math.max(...points.map(p=>p.x))+100,top=Math.min(...points.map(p=>p.y))-100,bottom=Math.max(...points.map(p=>p.y))+100;
      camera.z=Math.min(.7,(width-36)/(scale*(right-left)),Math.max(80,height-190)/(scale*(bottom-top)));
      camera.x=(left+right)/2;camera.y=(top+bottom)/2;limits();},mountain:()=>{camera.x=-160;camera.y=180;camera.z=.7;},
 focus:(x,y)=>{followingTractor=false;const p=iso(x,y);camera.x=p.x;camera.y=p.y;camera.z=Math.max(.65,camera.z);limits();},arriveDelivery:c=>{const a=actors.get(c.id);if(a){a.x=c.x;a.y=c.y;a.path=[];a.signature='';}},deliveryPlan,followTractor:()=>{followingTractor=true;const q=CargoTransport.active(),p=q?CargoTransport.position(q):S.village.tractor;if(p){const at=iso(p.x,p.y);camera.x=at.x;camera.y=at.y;camera.z=Math.max(.4,camera.z);limits();}},enterZone,leaveZone,
  pier:()=>{const point=fishingPoint(),p=iso(point.x,point.y);camera.x=p.x;camera.y=p.y;camera.z=1;},
  parcel:k=>{const d=parcelInfo(k),p=iso(d.x+2,d.y+2);camera.x=p.x;camera.y=p.y;camera.z=.9;},
  forest:()=>{const r=S.resources[0];if(r){const p=iso(r.x+1,r.y+3);camera.x=p.x;camera.y=p.y;camera.z=.9;}},
   placing,moving,moveMode,cancel,center,zoom,sync,farmLandAt,
   terrainInspect:()=>terrain?.inspect(),terrainAt:(x,y)=>{if(!terrain)return null;terrain.invalidate();const r=terrain.region();return {...r.classify(x,y),land:terrain.landAt(iso(x,y),65),decoration:r.sample(Math.floor(x),Math.floor(y))};},
  terrainPixel:(x,y)=>terrain?.pixelAt(x,y),
 focusObject:id=>{const o=worldObjects().find(o=>o.id===+id);if(o){const p=footprint(o);camera.x=p.x;camera.y=p.y-35;camera.z=1.35;}},
     inspect:()=>({camera:{...camera},bridge:S.eastValley?{x1:mainShore(S),x2:SUNRISE_MAP.x,y:SUNRISE_MAP.bridgeY,width:SUNRISE_MAP.bridgeWidth,art:stoneBridge?.inspect()}:null,originalFarmBridge:{x:8,y:10,width:1,height:2},ferry:S.eastValley?SUNRISE_FERRY:null,landscape:S.eastValley?landscape?.inspect():null,fields:S.fields.map(f=>({...f,screen:iso(f.x+.5,f.y+.5)})),
  actors:[...actors.entries()].map(([id,a])=>({id,x:a.x,y:a.y,pose:a.pose,walking:a.walking,transport:S.eastValley&&a.walking&&(channelTile(a.x,S,a.y)&&!sunriseBridgeTile(a.x,a.y,S)||SUNRISE_RIVER.waterAt(a.x,a.y))?'boat':'walk',atWork:a.atWork,mode:a.atWork?workerMode(S.cats.find(c=>c.id===id)):null})),
  customers:S.orders.filter(o=>o.arrives<=now()).map((o,i)=>({id:o.id,...screenPoint(customerSpot(i).x,customerSpot(i).y)})),placement})};
})();
