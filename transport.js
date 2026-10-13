'use strict';
// One shared tractor, with explicit boarding/loading/unloading and saved cargo.
const CargoTransport=(()=>{
 const LOAD=1800,UNLOAD=1800,WALK=650,DRIVE=270;
 function parking(){
  const b=S.buildings.find(b=>b.type==='store'&&!inValley(b.x,b.y))||S.buildings.find(b=>b.type==='house')||{x:8,y:7};
  const spots=[];for(let dy=-5;dy<=5;dy++)for(let dx=-5;dx<=5;dx++){const x=Math.floor(b.x+dx),y=Math.floor(b.y+dy);if(x<0||x>=mainShore(S)-4||sunriseBridgeTile(x,y,S)||occupied(x,y,2))continue;spots.push({x:x+1,y:y+1,score:Math.hypot(dx-3,dy+2)});}
  spots.sort((a,b)=>a.score-b.score);return spots[0]||{x:b.x+2.5,y:b.y+.5};
 }
 function init(){const v=S.village;if(!v)return;
  // Retain cargo IDs, goods and delivery deadlines from older saves.
  for(const q of v.cargo||[]){if(q.vehicle!=='tractor')continue;delete q.vehicle;const c=S.cats.find(c=>c.id===q.cat);if(c?.job?.kind==='haul')c.job.label='Carrying goods · '+ITEMS[q.item].name;}
  delete v.tractor;
 }
 function active(){return undefined;}
 function reserve(q){init();delete q.vehicle;}
 function configure(q,c){}
 function progress(q,time=now()){
  const r=q.route;if(!r)return {distance:0,phase:'waiting',loaded:false,driving:false};
  if(q.vehicle!=='tractor'){const distance=r.distance*Math.max(0,Math.min(1,(time-q.start)/(q.end-q.start||1)));return {distance,phase:distance<r.pickup?'toPickup':'delivering',loaded:distance>=r.pickup,driving:false};}
  const board=r.board||0,toPickup=Math.max(0,r.pickup-board),toBarn=Math.max(0,r.distance-r.pickup);let t=Math.max(0,time-q.start);
  if(t<board*WALK)return {distance:t/WALK,phase:'boarding',loaded:false,driving:false};t-=board*WALK;
  if(t<toPickup*DRIVE)return {distance:board+t/DRIVE,phase:'toPickup',loaded:false,driving:true};t-=toPickup*DRIVE;
  if(t<LOAD)return {distance:r.pickup,phase:'loading',loaded:false,driving:false,phaseProgress:t/LOAD};t-=LOAD;
  if(t<toBarn*DRIVE)return {distance:r.pickup+t/DRIVE,phase:'delivering',loaded:true,driving:true};t-=toBarn*DRIVE;
  return {distance:r.distance,phase:t<UNLOAD?'unloading':'complete',loaded:t<UNLOAD,driving:false,phaseProgress:Math.min(1,t/UNLOAD)};
 }
 function position(q,time=now()){const r=q.route;if(!r?.points?.length)return null;const state=progress(q,time);let left=state.distance;for(let i=1;i<r.points.length;i++){const a=r.points[i-1],b=r.points[i],d=Math.hypot(b.x-a.x,b.y-a.y);if(d>0&&left<=d)return {...state,x:a.x+(b.x-a.x)*left/d,y:a.y+(b.y-a.y)*left/d,dx:b.x-a.x,dy:b.y-a.y,flip:b.x-b.y<a.x-a.y};left-=d;}const p=r.points.at(-1),a=r.points.at(-2)||p;return {...state,...p,dx:p.x-a.x,dy:p.y-a.y,flip:p.x-p.y<a.x-a.y};}
 function smooth(start,path){const pts=[start,...path],out=[];for(let i=1;i<pts.length-1;i++){const a=pts[i-1],p=pts[i],b=pts[i+1],u=Math.hypot(p.x-a.x,p.y-a.y),v=Math.hypot(b.x-p.x,b.y-p.y);
 if(u<.01||v<.01||Math.abs(p.x%1-.5)>.001||Math.abs(p.y%1-.5)>.001||Math.abs((p.x-a.x)*(b.y-p.y)-(p.y-a.y)*(b.x-p.x))<.001){out.push(p);continue;}
 const r=Math.min(.22,u*.25,v*.25),entry={x:p.x+(a.x-p.x)*r/u,y:p.y+(a.y-p.y)*r/u},exit={x:p.x+(b.x-p.x)*r/v,y:p.y+(b.y-p.y)*r/v};out.push(entry);for(let k=1;k<=8;k++){const t=k/8,z=1-t;out.push({x:z*z*entry.x+2*z*t*p.x+t*t*exit.x,y:z*z*entry.y+2*z*t*p.y+t*t*exit.y});}}if(path.length)out.push(path.at(-1));return out;}
 function finish(q){}
 function toggle(){return false;}
 function label(q){return 'Cat carrying goods';}
 function panel(){return '';}
 return {init,parking,active,reserve,configure,progress,position,smooth,finish,toggle,label,panel};
})();
