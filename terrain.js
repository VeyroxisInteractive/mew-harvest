'use strict';
// Cosmetic only: no S writes, save objects, hit targets, resource jobs or timers.
// Region adapters describe geography; the seeded sampler and chunk renderer are shared.
const CosmeticTerrain=(()=>{
 const profiles={
  farm:{density:.24,grass:[40,62],flowers:.18,plants:.10,stones:.006,soil:.025,tone:'#86a85c'},
  open:{density:.32,grass:[42,67],flowers:.22,plants:.12,stones:.008,soil:.03,tone:'#91ad66'},
  forest:{density:2,grass:[75,80],flowers:.12,stones:.035,soil:.15,tone:'#6e9642'},
  forestEdge:{density:1.75,grass:[48,80],flowers:.18,plants:.08,stones:.02,soil:.07,tone:'#7e9f53'},
  river:{density:.5,grass:[44,66],flowers:.20,plants:.10,stones:.018,soil:.06,tone:'#7fa466'},
  beach:{density:.09,grass:[36,50],flowers:.12,plants:.08,stones:.012,soil:.03,tone:'#a0b773'},
   mountain:{density:.7,grass:[24,45],flowers:.04,stones:.12,soil:.19,tone:'#849652'},
      highland:{density:.18,grass:[32,56],flowers:.14,plants:.10,stones:.08,soil:.08,tone:'#668f61'},
      highlandMeadow:{density:.16,grass:[30,54],flowers:.20,plants:.14,stones:.045,soil:.06,tone:'#789d68'},
      highlandForest:{density:.72,grass:[52,78],flowers:.14,plants:.09,stones:.06,soil:.11,tone:'#4f7956'},
       highlandRock:{density:.10,grass:[25,42],flowers:.04,plants:.05,stones:.16,soil:.18,tone:'#687962'},
       highlandRiver:{density:.30,grass:[34,56],flowers:.15,plants:.11,stones:.11,soil:.09,tone:'#4f8f83'},
        sunstone:{density:.28,grass:[40,62],flowers:.20,plants:.12,stones:.055,soil:.07,tone:'#86a85c'},
        sunstoneMeadow:{density:.22,grass:[40,64],flowers:.18,plants:.12,stones:.012,soil:.05,tone:'#91ad66'},
        sunstoneForest:{density:.58,grass:[52,78],flowers:.13,plants:.10,stones:.018,soil:.08,tone:'#6e9642'},
        sunstoneRock:{density:.11,grass:[25,44],flowers:.04,plants:.05,stones:.18,soil:.16,tone:'#849652'},
        sunstoneRiver:{density:.30,grass:[34,56],flowers:.18,plants:.12,stones:.10,soil:.08,tone:'#4f8f83'},
  building:{density:.035,grass:[36,46],flowers:.08,stones:0,soil:.16,tone:'#9eac70'},
  field:{density:.07,grass:[36,50],flowers:.12,stones:0,soil:.10,tone:'#91a962'},
  path:{density:.06,grass:[36,50],flowers:.10,stones:.003,soil:.13,tone:'#97ac6b'}
 };
 for(const p of Object.values(profiles))Object.freeze(p);Object.freeze(profiles);
 const iso=(x,y)=>({x:768+(x-y)*48,y:180+(x+y)*24});
 const grid=(x,y)=>({x:(x-768)/96+(y-180)/48,y:(y-180)/48-(x-768)/96});
  function random(x,y,salt=0,seed=48131){let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^Math.imul(salt+seed,1442695041);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;}
  const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  // Smooth seeded pockets, shared by neighbouring tiles rather than isolated dots.
  function meadowPocket(x,y,seed){const a=Math.floor(x/3.4),b=Math.floor(y/3.4),u=smooth(x/3.4-a),v=smooth(y/3.4-b),r=(x,y)=>random(x,y,210,seed);return smooth(((r(a,b)*(1-u)+r(a+1,b)*u)*(1-v)+(r(a,b+1)*(1-u)+r(a+1,b+1)*u)*v-.40)/.24);}
  const forestOffsets=[];for(let x=-4;x<=4;x++)for(let y=-4;y<=4;y++){const d=Math.hypot(Math.max(0,Math.abs(x)-.5),Math.max(0,Math.abs(y)-.5));if(d<3.7)forestOffsets.push({x,y,d});}forestOffsets.sort((a,b)=>a.d-b.d);
 function distance(x,y,o){return Math.hypot(Math.max(o.x-x,0,x-o.x-o.size),Math.max(o.y-y,0,y-o.y-o.size));}
 function segmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
 function createRegion({seed=48131,biomeAt=()=>({type:'open',buildable:false}),footprints=[],roads=[],palette=profiles}={}){
  const cells=new Map();for(const o of footprints)for(let x=Math.floor(o.x)-1;x<=Math.ceil(o.x+o.size)+1;x++)for(let y=Math.floor(o.y)-1;y<=Math.ceil(o.y+o.size)+1;y++){const key=x+','+y;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(o);}
  function classify(x,y){
   const base=biomeAt(x,y);if(base.type==='water'||base.type==='other')return base;
   let nearest=Infinity,edge=null;
   for(const o of cells.get(Math.floor(x)+','+Math.floor(y))||[]){const d=distance(x,y,o);if(d===0)return {...base,type:o.kind,occupied:true,buildable:false};if(d<nearest){nearest=d;edge=o.kind==='field'?'field':o.kind==='path'?'path':'building';}}
   const p=iso(x,y);let road=Infinity;for(const r of roads)for(let i=1;i<r.points.length;i++)road=Math.min(road,segmentDistance(p,r.points[i-1],r.points[i])-r.width/2);
   if(road<9)return {...base,type:'path',occupied:true,buildable:base.buildable};
   if(road<38&&nearest>.45)return {...base,type:'path'};
   if(nearest<.8)return {...base,type:edge};return base;
  }
  function sample(x,y,override){
   const area=classify(x+.5,y+.5),type=override||area.type,p=palette[type]||palette.open;
   if(area.occupied||['water','other'].includes(area.type))return [];
   const out=[],r=n=>random(x,y,n,seed);
   // Retain the two original woodland clumps and their sizes/offsets.
    if(type==='forest'||type==='highlandForest'){
    if(r(10)<p.density/2)out.push({x:x+.5-17/96+15/48,y:y+.5+17/96+15/48,w:p.grass[1],h:p.grass[1],art:'grass'});
    if(r(11)<p.density/2)out.push({x:x+.5+21/96+25/48,y:y+.5-21/96+25/48,w:p.grass[0],h:p.grass[0],art:'grass'});
   }else{
    const pocket=meadowPocket(x+.5,y+.5,seed),edge=type==='forestEdge'?area.forestBlend??1:0,base=palette[area.meadowType]||palette.open;
    const density=edge?base.density+(p.density-base.density)*edge**1.5:p.density,weight=edge?edge*.65+(1-edge*.65)*pocket:pocket;
    // At most two well-sized accents in an occasional pocket; large gaps have none.
    for(let i=0;i<2;i++){
     if(r(10+i)>density*weight/2)continue;
     let w=p.grass[0]+r(20+i)*(p.grass[1]-p.grass[0]);
     const flower=r(60+i)<p.flowers,art=edge>.6&&r(75+i)<edge*.8?'grass':flower?'flowers':r(76+i)<(p.plants||0)?'plant':'meadowTuft';
     if(edge)w=base.grass[0]+(w-base.grass[0])*edge;
     if(art==='grass')w=Math.max(68,w);
     out.push({x:x+.12+r(30+i)*.76,y:y+.12+r(40+i)*.76,w,h:w*(art==='meadowTuft'?1.5:art==='grass'?1:.85),art,flip:r(70+i)>.5});
    }
   }
   if(r(81)<p.stones&&(type==='forest'||meadowPocket(x+.5,y+.5,seed)>.4))out.push({x:x+r(82),y:y+r(83),w:type==='forest'?13+r(84)*10:16+r(84)*9,h:type==='forest'?9+r(84)*7:11+r(84)*6,art:'stone'});
   if(type==='forestEdge'&&r(90)<.008)out.push({x:x+.3,y:y+.6,w:32,h:28,art:'stump'});
     if(area.style==='highland')for(const d of out)if(['grass','meadowTuft','plant','flowers'].includes(d.art))d.art='highland-'+d.art;
     if(area.style==='sunstone')for(const d of out)if(['grass','meadowTuft','plant','flowers'].includes(d.art))d.art='sunstone-'+d.art;
    return out.filter(d=>!classify(d.x,d.y).occupied);
  }
  return {seed,palette,footprints,roads,classify,sample};
 }
 // Current island geography only. Future maps supply their own biomeAt/bounds/seed.
 function farmRegion(s,{owned,roadRow,decorSize}){
  const footprints=[...s.buildings.map(o=>({...o,size:2,kind:'building'})),...s.fields.map(o=>({...o,size:1,kind:'field'})),
   ...s.trees.map(o=>({...o,size:1,kind:'tree'})),...(s.decor||[]).map(o=>({...o,size:decorSize(o.type),kind:o.type==='path'?'path':'building'}))];
  if(s.village?.camp)footprints.push({...s.village.camp,size:2,kind:'building',id:'camp'});
  footprints.push({x:2,y:9,size:1,kind:'building',id:'dock'},{x:12,y:10.6,size:1,kind:'building',id:'boat'});
  const store=s.buildings.find(b=>b.type==='store'),roads=[];
  if(store){
   // Follow the renderer's interrupted customer road, including fields/buildings.
   let segment=[];const flush=()=>{if(segment.length>1)roads.push({points:segment,width:40});segment=[];};
    const end=s.eastValley&&inValley(store.x,store.y)?SUNRISE_MAP.x+SUNRISE_MAP.size+6:s.eastValley?mainShore(s):s.size+8;
    for(let x=store.x+2;x<end;x++){
    if(roadRow>=10&&roadRow<12||footprints.some(o=>['field','building'].includes(o.kind)&&distance(x+.5,roadRow+.5,o)===0))flush();else segment.push(iso(x+.5,roadRow+.5));
   }flush();
    roads.push({points:[iso(store.x+2.5,roadRow+.5),iso(8.5,8.6),iso(8.5,10.1)],width:40},
     {points:[iso(8.5,11.7),iso(8.5,13.6),iso(12,14.3)],width:40});
  }
    const woodlandTiles=new Map(),edgeDistances=new Map();
   function woodland(a,b){a=Math.floor(a);b=Math.floor(b);const key=a+','+b;if(woodlandTiles.has(key))return woodlandTiles.get(key);const forest=a>=-8&&b>=-8&&a<s.size+8&&b<s.size+8&&!owned(a,b)&&!(b>=8&&b<14)&&!(a>=7&&a<10&&b>=12&&b<17);woodlandTiles.set(key,forest);return forest;}
   function forestDistance(x,y){const key=x+','+y;if(edgeDistances.has(key))return edgeDistances.get(key);let nearest=4;
    for(const o of forestOffsets)if(woodland(x+o.x,y+o.y)){nearest=o.d;break;}
    edgeDistances.set(key,nearest);return nearest;
   }
   if(s.eastValley)roads.push({points:SUNRISE_APPROACH.map(p=>iso(...p)),width:43});
   return createRegion({footprints,roads,biomeAt(x,y){
   const tileX=Math.floor(x),tileY=Math.floor(y),buildable=owned(tileX,tileY),locked=!buildable;
      if(channelTile(x,s,y)||!(s.eastValley&&inValley(tileX,tileY))&&x<SUNRISE_MAP.x&&y>=10&&y<12)return {type:'water',buildable:false,locked};
        if(s.eastValley&&(x>=SUNRISE_MAP.x||inValley(tileX,tileY))){
         if(!inValley(tileX,tileY))return {type:'water',buildable:false,locked:true};
         if(SUNRISE_RIVER.waterAt(x,y))return {type:'water',style:'sunstone',buildable:false,locked};
         if(SUNRISE_VOLCANIC.contains(x,y))return {type:'other',buildable:false,locked:true};
        if((x>=83&&y<10)||(x<=60&&y>=28)||(x>=86&&y>=27))return {type:'sunstoneRock',style:'sunstone',buildable,locked};
        if((x<64&&y<8)||(x>84&&y>22)||(x<62&&y>24))return {type:'sunstoneForest',style:'sunstone',buildable,locked};
        return {type:(y>16&&x<74)||(x>71&&y>20)?'sunstoneMeadow':'sunstone',style:'sunstone',buildable,locked};
      }
   if(woodland(x,y))return {type:'forest',buildable,locked};
   if(y>=8&&y<15)return {type:'river',buildable,locked};
    const reach=2.6+meadowPocket(x,y,48131)*1.1,d=forestDistance(tileX,tileY);
    if(d<reach)return {type:'forestEdge',forestBlend:smooth(1-d/reach),meadowType:buildable?'farm':'open',buildable,locked};
   return {type:buildable?'farm':'open',buildable,locked};
  }});
 }
 function canvas(w,h=w){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
 function createRenderer({images,region,surfaces,chunkSize=256,maxChunks=96}){
  // One low-resolution, feathered open-grass mask derived from EXISTING island
  // colours. Sand, ocean, cliffs and painted palms are never repainted.
  const mask=canvas(768,512),m=mask.getContext('2d',{willReadFrequently:true});
  if(images.island)m.drawImage(images.island,0,0,768,512);
  const pixels=m.getImageData(0,0,768,512),alpha=new Uint8Array(768*512);
  for(let i=0;i<alpha.length;i++){const k=i*4,r=pixels.data[k],g=pixels.data[k+1],b=pixels.data[k+2];alpha[i]=Math.round(255*Math.max(0,Math.min(1,(g-r-18)/19,(g-145)/32,(r-105)/35,(g-b-65)/35)));}
  for(let y=0;y<512;y++)for(let x=0;x<768;x++){const i=y*768+x,k=i*4;let a=alpha[i];for(const [dx,dy]of [[-2,0],[2,0],[0,-2],[0,2]])a=Math.min(a,alpha[(y+dy)*768+x+dx]||0);pixels.data[k]=pixels.data[k+1]=pixels.data[k+2]=255;pixels.data[k+3]=a;}
  m.putImageData(pixels,0,0);
   const tint=canvas(768,512),tg=tint.getContext('2d');tg.drawImage(mask,0,0);tg.globalCompositeOperation='source-in';tg.fillStyle='#779f7080';tg.fillRect(0,0,768,512);
  const coverage=pixels.data;
  const atlas={grass:images['resource-8'],stump:images['resource-6']};
  // Small cutouts reuse the same painted leaves/pebble. Feather crop boundaries,
  // rather than pasting rectangular pieces or introducing a different art style.
  function cut(key,sx,sy,w,h){const c=canvas(w,h),g=c.getContext('2d');if(images[key])g.drawImage(images[key],sx,sy,w,h,0,0,w,h);g.globalCompositeOperation='destination-in';g.scale(w,h);const fade=g.createRadialGradient(.5,.5,.1,.5,.5,.5);fade.addColorStop(0,'#fff');fade.addColorStop(.5,'#fff');fade.addColorStop(1,'#fff0');g.fillStyle=fade;g.fillRect(0,0,1,1);return c;}
   // Open land no longer uses the tiny dark left-hand leaf crop. Keep the full
   // woodland artwork intact; taller blades and 2–5 painted flowers are accents.
    atlas.meadowTuft=cut('resource-8',88,82,117,204);atlas.flowers=cut('resource-8',154,128,104,139);atlas.plant=cut('resource-8',26,180,96,103);
        for(const key of ['grass','meadowTuft','plant','flowers']){const im=atlas[key];if(!im)continue;const c=canvas(im.width,im.height),g=c.getContext('2d');g.filter='saturate(.78) brightness(.92)';g.drawImage(im,0,0);atlas['highland-'+key]=c;const green=canvas(im.width,im.height),w=green.getContext('2d');w.filter='saturate(.96) brightness(1.01)';w.drawImage(im,0,0);atlas['sunstone-'+key]=green;}
   atlas.stone=cut('resource-4',43,257,83,60);atlas.soil=cut('ground-0',180,95,130,66);
   const chunks=new Map(),landChunks=new Map();let span=chunkSize,generated=0,drawn=0,pendingVisible=0,ms=0,peakMs=0,dirty=true,signature='',geometry='',current=region();
   function landAt(p,margin=0,landSurfaces=surfaces()){for(const s of landSurfaces){
    if(s.accept&&!s.accept(p))continue;
    if(s.solid){const q=grid(p.x,p.y),b=s.bounds;return {amount:1,coastal:!!b&&Math.min(q.x-b.x1,b.x2-q.x,q.y-b.y1,b.y2-q.y)<margin/48};}
   const x=Math.floor((p.x-s.x)/s.w*768),y=Math.floor((p.y-s.y)/s.h*512);if(x<0||x>=768||y<0||y>=512)continue;
   const a=(x,y)=>x>=0&&x<768&&y>=0&&y<512?coverage[(y*768+x)*4+3]/255:0;
   if(a(x,y)>.5){const step=Math.ceil(margin/s.w*768);return {amount:a(x,y),coastal:Math.min(a(x-step,y),a(x+step,y),a(x,y-step),a(x,y+step))<.3};}
  }return {amount:0,coastal:false};}
  function sync(){
   if(!dirty)return;dirty=false;const next=region(),geo=JSON.stringify(surfaces().map(s=>[s.x,s.y,s.w,s.h,s.key]));
   const sig=JSON.stringify([next.seed,next.footprints.map(o=>[o.id,o.x,o.y,o.size,o.kind]),next.roads,next.layoutKey]);
    if(sig!==signature||geo!==geometry){
     if(geo!==geometry)landChunks.clear();
    const all=geo!==geometry||JSON.stringify(next.layoutKey)!==JSON.stringify(current.layoutKey)||JSON.stringify(next.roads)!==JSON.stringify(current.roads)||next.seed!==current.seed;
    const old=new Map(current.footprints.map(o=>[o.id,o])),changed=[];
    for(const o of next.footprints){const prev=old.get(o.id);if(!prev||o.x!==prev.x||o.y!==prev.y||o.size!==prev.size||o.kind!==prev.kind){changed.push(o);if(prev)changed.push(prev);}old.delete(o.id);}changed.push(...old.values());
     for(const [key,c]of chunks){const [x,y]=key.split(',').map(Number);c.dirty ||= all||changed.some(o=>{const p=iso(o.x+o.size/2,o.y+o.size/2),w=o.size*48+180,h=o.size*24+180;return p.x+w>x*span&&p.x-w<(x+1)*span&&p.y+h>y*span&&p.y-h<(y+1)*span;});
      if(c.dirty){const g=c.canvas.getContext('2d');g.save();g.scale(chunkSize/span,chunkSize/span);g.translate(-x*span,-y*span);clearOccupancy(g,next);g.restore();}
    }
    current=next;signature=sig;geometry=geo;
   }
  }
  function patch(g,x,y,rx,ry,color,opacity){g.save();g.translate(x,y);g.scale(rx,ry);const fade=g.createRadialGradient(0,0,.12,0,0,1);fade.addColorStop(0,color);fade.addColorStop(1,color+'00');g.globalAlpha=opacity;g.fillStyle=fade;g.fillRect(-1,-1,2,2);g.restore();}
  function footprintPath(g,o,pad=0){const points=[iso(o.x-pad,o.y-pad),iso(o.x+o.size+pad,o.y-pad),iso(o.x+o.size+pad,o.y+o.size+pad),iso(o.x-pad,o.y+o.size+pad)];g.beginPath();points.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();}
  function clearOccupancy(g,r){g.globalCompositeOperation='destination-out';g.fillStyle=g.strokeStyle='#000';for(const o of r.footprints){footprintPath(g,o,o.kind==='building'?.20:.045);g.fill();}g.lineJoin=g.lineCap='round';for(const road of r.roads){g.lineWidth=road.width+16;g.beginPath();road.points.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke();}}
  function bake(cx,cy){
   const c=canvas(chunkSize),g=c.getContext('2d'),left=cx*span,top=cy*span,landSurfaces=surfaces();
   const overlaps=(x,y,w,h)=>x+w>left&&x<left+span&&y+h>top&&y<top+span;
   g.scale(chunkSize/span,chunkSize/span);g.translate(-left,-top);
   const corners=[[left-80,top-40],[left+span+80,top-40],[left-80,top+span+130],[left+span+80,top+span+130]].map(p=>grid(...p));
   const minX=Math.floor(Math.min(...corners.map(p=>p.x))),maxX=Math.ceil(Math.max(...corners.map(p=>p.x))),minY=Math.floor(Math.min(...corners.map(p=>p.y))),maxY=Math.ceil(Math.max(...corners.map(p=>p.y)));
   for(let x=minX;x<=maxX;x++)for(let y=minY;y<=maxY;y++){
    const p=iso(x+.5,y+.5),land=landAt(p,65,landSurfaces);if(!land.amount)continue;
    const area=current.classify(x+.5,y+.5),type=land.coastal?'beach':area.type,profile=current.palette[type]||profiles.open,r=n=>random(x,y,n,current.seed);
    if(['water','other'].includes(area.type))continue;
    const forest=area.type==='forest'||area.type==='highlandForest';
     if(r(100)<(forest?.32:.09)){const px=p.x+r(101)*50,rx=forest?80+r(102)*80:120+r(102)*110,ry=forest?30+r(103)*35:40+r(103)*40,color=forest||area.style==='highland'?profile.tone:r(104)>.5?'#bbce85':profile.tone;if(overlaps(px-rx,p.y-ry,rx*2,ry*2))patch(g,px,p.y,rx,ry,color,forest?.19:.12);}
    if(r(105)<profile.soil){const w=64+r(106)*25;if(overlaps(p.x-32,p.y-13,w,27)){g.globalAlpha=forest?.12:.08;g.drawImage(atlas.soil,p.x-32,p.y-13,w,27);g.globalAlpha=1;}}
    for(const d of current.sample(x,y,land.coastal?'beach':undefined)){
     const q=iso(d.x,d.y),im=atlas[d.art];if(!im||!overlaps(q.x-d.w/2,q.y-d.h,d.w,d.h))continue;
     g.save();g.translate(q.x,q.y);if(d.flip)g.scale(-1,1);if(['meadowTuft','plant'].includes(d.art))g.globalAlpha=.88;g.drawImage(im,-d.w/2,-d.h,d.w,d.h);g.restore();
    }
    // The old meadow's occasional cosmetic trees stay part of its woodland.
    if(area.type==='forest'&&!land.coastal&&Math.abs(x*73+y*31)%47===0&&overlaps(p.x-57.5,p.y-115,115,115)){const im=images['resource-'+(Math.abs(x*73+y*31)%2)];if(im)g.drawImage(im,p.x-57.5,p.y-115,115,115);}
   }
   // Worn, feathered approaches; sparse edge profiles leave the nearby land open.
   for(const o of current.footprints){const p=iso(o.x+o.size/2,o.y+o.size/2);if(p.x<left-180||p.x>left+span+180||p.y<top-100||p.y>top+span+100)continue;
    if(o.kind==='building'){patch(g,p.x+o.size*14,p.y+o.size*17,65,24,'#b49e72',.20);}
   }
   // Erase the full projected footprint AFTER drawing sprites, also removing
   // neighbouring blades that overhang it. Overlapping holes use alpha union.
   clearOccupancy(g,current);
   // Mask in a separate canvas so two adjacent island surfaces form a UNION.
   const clip=canvas(chunkSize),cg=clip.getContext('2d');cg.scale(chunkSize/span,chunkSize/span);cg.translate(-left,-top);
    for(const s of landSurfaces){cg.save();if(s.clip){cg.beginPath();s.clip.forEach((p,i)=>i?cg.lineTo(p.x,p.y):cg.moveTo(p.x,p.y));cg.closePath();cg.clip();}if(s.solid){cg.fillStyle='#fff';cg.fillRect(s.x,s.y,s.w,s.h);}else cg.drawImage(mask,s.x,s.y,s.w,s.h);cg.restore();}
   g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='destination-in';g.drawImage(clip,0,0);g.globalCompositeOperation='source-over';
   clip.width=clip.height=0;generated++;return {canvas:c,dirty:false};
  }
   function hasLandChunk(x,y,landSurfaces){
    const key=x+','+y;if(landChunks.has(key))return landChunks.get(key);
    // Sea between separate islands needs no vegetation canvas. Include a margin
    // for grass overhangs; this keeps wide two-island views inside the same cache.
    let land=false;for(const dx of [-60,span*.25,span*.75,span+60])for(const dy of [-60,span*.25,span*.75,span+60])if(landAt({x:x*span+dx,y:y*span+dy},0,landSurfaces).amount){land=true;break;}
    if(landChunks.size>=512)landChunks.delete(landChunks.keys().next().value);landChunks.set(key,land);return land;
   }
   function draw(ctx,view){const begin=performance.now();
    // Wider gorge/landscape views cover more land. Increase world coverage per
    // 256px buffer instead of endlessly evicting visible chunks from the cap.
     const valleySurface=surfaces().length>1;
     const nextSpan=valleySurface?chunkSize*4:chunkSize*2**Math.ceil(Math.log2(Math.max(1,(view.right-view.x)/2800,(view.bottom-view.y)/3200)));
    if(nextSpan!==span){for(const c of chunks.values())c.canvas.width=c.canvas.height=0;chunks.clear();landChunks.clear();span=nextSpan;}
    sync();drawn=0;const landSurfaces=surfaces();
   // Continuous colour pass prevents chunk boundaries during first-time panning.
    for(const s of surfaces()){ctx.save();if(s.clip){ctx.beginPath();s.clip.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.clip();}if(s.solid){ctx.fillStyle=s.tint||'#779f7020';ctx.fillRect(s.x,s.y,s.w,s.h);}else ctx.drawImage(tint,s.x,s.y,s.w,s.h);ctx.restore();}
    const visible=[];for(let x=Math.floor(view.x/span);x<=Math.floor(view.right/span);x++)for(let y=Math.floor(view.y/span);y<=Math.floor(view.bottom/span);y++)if(hasLandChunk(x,y,landSurfaces))visible.push({x,y,key:x+','+y});
   let fresh=0;const keep=new Set(visible.map(v=>v.key));
   visible.sort((a,b)=>Math.hypot((a.x+.5)*span-(view.x+view.right)/2,(a.y+.5)*span-(view.y+view.bottom)/2)-Math.hypot((b.x+.5)*span-(view.x+view.right)/2,(b.y+.5)*span-(view.y+view.bottom)/2));
   // Rebuild at most one chunk per frame, including edits. The existing layer
   // already has new footprints erased; surrounding vegetation stays visible.
   for(const v of visible){let c=chunks.get(v.key);if((c?.dirty||!c)&&fresh<1){fresh++;if(c)c.canvas.width=c.canvas.height=0;c=bake(v.x,v.y);chunks.set(v.key,c);}if(c){ctx.drawImage(c.canvas,v.x*span,v.y*span,span,span);drawn++;}}
   for(const [key,c]of chunks)if(chunks.size>maxChunks&&!keep.has(key)){c.canvas.width=c.canvas.height=0;chunks.delete(key);}
   while(chunks.size>maxChunks){const [key,c]=chunks.entries().next().value;c.canvas.width=c.canvas.height=0;chunks.delete(key);}
   pendingVisible=visible.filter(v=>!chunks.has(v.key)||chunks.get(v.key).dirty).length;
   ms=performance.now()-begin;peakMs=Math.max(peakMs,ms);
  }
  return {draw,invalidate:()=>{dirty=true;},inspect:()=>{sync();return {chunks:chunks.size,maxChunks,chunkWorldSize:span,bytes:chunks.size*chunkSize*chunkSize*4+mask.width*mask.height*8,generated,drawn,pendingVisible,lastDrawMs:ms,peakDrawMs:peakMs,seed:current.seed};},
   region:()=>{sync();return current;},landAt,
   pixelAt(x,y){const p=iso(x,y),cx=Math.floor(p.x/span),cy=Math.floor(p.y/span),c=chunks.get(cx+','+cy);return c&&!c.dirty?Array.from(c.canvas.getContext('2d').getImageData(Math.floor((p.x-cx*span)*chunkSize/span),Math.floor((p.y-cy*span)*chunkSize/span),1,1).data):null;}};
 }
 return {profiles,random,iso,grid,createRegion,farmRegion,createRenderer};
})();
