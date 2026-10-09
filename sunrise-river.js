'use strict';
// Read-only scenery. The river mesh is shared with gameplay in data.js.
// Banks, depth, substrate and reflections are baked once; only water/foam
// advances at 15 Hz. No new interactive vegetation, saves or worker timers.
const SunriseRiverArt=(()=>{
 const project=(x,y)=>({x:768+(x-y)*48,y:180+(x+y)*24});
 const rand=(a,b=0)=>CosmeticTerrain.random(a,b,91,61837);
 function path(g,points){g.beginPath();points.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();}
 function fill(g,points,color){path(g,points);g.fillStyle=color;g.fill();}
 function stroke(g,points,color,width){g.beginPath();points.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.strokeStyle=color;g.lineWidth=width;g.stroke();}
 function ellipse(g,x,y,rx,ry,color,rotation=0){g.beginPath();g.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);g.fillStyle=color;g.fill();}
 function glow(g,p,rx,ry,color){g.save();g.translate(p.x,p.y);g.scale(rx,ry);const v=g.createRadialGradient(0,0,.05,0,0,1);v.addColorStop(0,color);v.addColorStop(1,'#90d9ca00');g.fillStyle=v;g.fillRect(-1,-1,2,2);g.restore();}
 function image(g,im,p,w,h=w){if(im)g.drawImage(im,p.x-w/2,p.y-h,w,h);}
 function canvas(bounds,ratio){const c=document.createElement('canvas');c.width=Math.ceil(bounds.w*ratio);c.height=Math.ceil(bounds.h*ratio);return c;}
 function paint(c,bounds,draw){const g=c.getContext('2d'),sx=c.width/bounds.w,sy=c.height/bounds.h;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);g.setTransform(sx,0,0,sy,-bounds.x*sx,-bounds.y*sy);draw(g);}
 function create({images}){
  const river=SUNRISE_RIVER,samples=river.samples,points=samples.map(p=>project(p.x,p.y));
  const bank=(p,side,pad=0)=>{const sign=side==='left'?1:-1,margin=pad*(1+.30*Math.sin(p.distance*3.2+sign)+.13*Math.sin(p.distance*9.7));return project(p.x+p.nx*(p[side]+margin)*sign,p.y+p.ny*(p[side]+margin)*sign);};
  const polygon=(pad=0)=>samples.map(p=>bank(p,'left',pad)).concat(samples.map(p=>bank(p,'right',pad)).reverse());
  const wet=polygon(),outline=SUNRISE_MAP.outline.map(p=>project(...p));
   const xs=wet.map(p=>p.x),ys=wet.map(p=>p.y),bounds={x:Math.min(...xs)-470,y:Math.min(...ys)-490,w:Math.max(...xs)-Math.min(...xs)+730,h:Math.max(...ys)-Math.min(...ys)+680};
   const base=canvas(bounds,.96),front=canvas(bounds,.82),motion=canvas(bounds,.60);
   const fallPoints=river.falls.map(f=>({a:points[f.from*18],b:points[f.to*18],width:f.width,from:f.from,to:f.to})),relief=VolcanicLandArt.createRockPainter(images);
  const rocks=[],plants=[],trees=[];let signature=null,frame=-1,frames=0,lastMs=0,peakMs=0;
  // Small painted cutouts from the Farm river keep moss, leaves, flowers and
  // rounded stones in the same illustration style. Feathering avoids stamps.
   function cut(sx,sy,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.filter='saturate(.95) brightness(1.02)';if(images['resource-8'])g.drawImage(images['resource-8'],sx,sy,w,h,0,0,w,h);g.filter='none';g.globalCompositeOperation='destination-in';const v=g.createRadialGradient(w/2,h/2,Math.min(w,h)*.09,w/2,h/2,Math.max(w,h)*.46);v.addColorStop(0,'#fff');v.addColorStop(.5,'#fffd');v.addColorStop(1,'#fff0');g.fillStyle=v;g.fillRect(0,0,w,h);return c;}
   const tufts=[cut(88,82,117,204),cut(154,128,104,139),cut(26,180,96,103)];
   const texture=document.createElement('canvas');texture.width=texture.height=192;const tg=texture.getContext('2d'),tp=tg.createImageData(192,192);for(let y=0;y<192;y++)for(let x=0;x<192;x++){const u=x/192*Math.PI*2,v=y/192*Math.PI*2,n=Math.sin(u*6+Math.sin(v*4)*1.1)+Math.sin(u*7+v*3)*.45,k=(y*192+x)*4;tp.data[k]=183;tp.data[k+1]=230;tp.data[k+2]=212;tp.data[k+3]=Math.max(0,n-.6)*19;}tg.putImageData(tp,0,0);
   const source=project(...river.source),mouth=project(93.5,26.7),sourceFall={a:{x:source.x-24,y:source.y-211},b:{x:source.x,y:source.y+3},width:23};
  function rock(g,p,w,seed,submerged=false){ellipse(g,p.x+5,p.y+3,w*.52,w*.18,submerged?'#285e6933':'#3d4e3a48',-.15);g.save();g.globalAlpha=submerged?.28:1;image(g,images['resource-4'],p,w,w*.75);g.restore();if(!submerged){stroke(g,[{x:p.x-w*.4,y:p.y+1},{x:p.x,y:p.y+4},{x:p.x+w*.35,y:p.y}],'#f4fbdd66',1);}}
   function section(g,a,b,pad,color){fill(g,[bank(a,'left',pad),bank(b,'left',pad),bank(b,'right',pad),bank(a,'right',pad)],color);g.strokeStyle=color;g.lineWidth=1.3;g.stroke();}
  // Scattering is prepared once, not rebuilt or randomized every frame.
   for(let i=5;i<samples.length-23;i+=7){const p=samples[i];for(const side of ['left','right']){
    const sign=side==='left'?1:-1,offset=p[side]+.44+rand(i,side==='left'?1:2)*.25,x=p.x+p.nx*offset*sign,y=p.y+p.ny*offset*sign;
   if(!mapPointInPolygon(x,y,SUNRISE_MAP.outline))continue;
    if(rand(i,sign+5)>.70)rocks.push({x,y,p:project(x,y),w:10+rand(i,sign+8)*21,seed:i});
    if(rand(i,12)<.24&&p.u>3){const distance=p[side]+.82+rand(i,14)*.65,px=p.x+p.nx*distance*sign,py=p.y+p.ny*distance*sign;if(mapPointInPolygon(px,py,SUNRISE_MAP.outline)&&!sunriseApproachTile(px,py))plants.push({x:px,y:py,p:project(px,py),w:34+rand(i,13)*26,art:tufts[(i+sign+4)%tufts.length],seed:i,flip:rand(i,15)>.5});}
  }}
   for(const [u,side]of [[4.9,-1],[10.7,1],[16.1,1]]){const p=samples[Math.round(u*18)],n=p.w+1.8,x=p.x+p.nx*n*side,y=p.y+p.ny*n*side;if(mapPointInPolygon(x,y,SUNRISE_MAP.outline)&&!sunriseApproachTile(x,y))trees.push({x,y,p:project(x,y),w:72+rand(u*10,8)*21,art:images['resource-'+(side>0?0:2)]});}
   function paintedFall(g,f){
    const im=images['natural-waterfall'];if(!im)return false;
    const h=(f.b.y-f.a.y)/.60,w=Math.max(h*im.width/im.height,f.width*5),k=(f.b.x-f.a.x)/(f.b.y-f.a.y),y=f.a.y-h*.25,x=f.a.x-w*.5-k*h*.25;
    g.save();g.transform(1,0,k,1,x,y);g.drawImage(im,0,0,w,h);g.restore();return true;
   }
   function drawHeadwater(g){
    if(images['natural-waterfall']){
     relief.ridge(g,source.x-142,source.y-48,380,315,417);
     relief.ridge(g,source.x+110,source.y-26,280,260,530);
     paintedFall(g,sourceFall);return;
    }

    glow(g,{x:source.x-45,y:source.y-12},295,89,'#345e524d');relief.ridge(g,source.x-157,source.y-56,420,365,417);relief.ridge(g,source.x+99,source.y-34,290,290,530);
    const a=sourceFall.a,b=sourceFall.b;
    for(const side of [-1,1]){const inner=[],outer=[];for(let j=0;j<=8;j++){const t=j/8,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;inner.push({x:x+side*(25+t*12+Math.sin(j*1.9)*3),y:y-8});outer.unshift({x:x+side*(57+Math.sin(t*Math.PI)*42+rand(j,side+130)*14),y:y-20+rand(j,side+132)*22});}relief.stone(g,inner.concat(outer),side+701,side>0?-1:0);}
    // The spring is cut into a supported rock shoulder, not floating above it.
    relief.stone(g,[{x:a.x-105,y:a.y-39},{x:a.x-92,y:a.y-74},{x:a.x-68,y:a.y-82},{x:a.x-39,y:a.y-63},{x:a.x+14,y:a.y-28},{x:a.x+37,y:a.y+17},{x:a.x-42,y:a.y+29},{x:a.x-85,y:a.y-7}],916);
    const feed=[{x:a.x-76,y:a.y-45},{x:a.x-57,y:a.y-33},{x:a.x-27,y:a.y-25},{x:a.x-17,y:a.y-14},a];g.lineCap=g.lineJoin='round';stroke(g,feed,'#617e72',18);stroke(g,feed,'#86b6ad',10);stroke(g,feed,'#d1eadb75',1.5);ellipse(g,a.x-28,a.y-24,23,7,'#486d70');ellipse(g,a.x-28,a.y-26,20,5,'#86b6ad');ellipse(g,feed[0].x,feed[0].y-1,8,4,'#3c5759');
    const shape=[];for(const side of [1,-1])for(let j=0;j<=18;j++){const t=side===1?j/18:1-j/18,w=sourceFall.width*(.72+t*.45)+Math.sin(j*2.1)*2;shape.push({x:a.x+(b.x-a.x)*t+w*side,y:a.y+(b.y-a.y)*t});}
    const water=g.createLinearGradient(a.x,a.y,b.x,b.y);water.addColorStop(0,'#7fbfb9');water.addColorStop(.18,'#dbf4e6');water.addColorStop(.5,'#539dad');water.addColorStop(.83,'#8bd1d0');water.addColorStop(1,'#e0fff0');fill(g,shape,water);
    g.save();path(g,shape);g.clip();for(let i=0;i<17;i++){const offset=(rand(i,110)-.5)*43,ps=[];for(let j=0;j<9;j++){const t=j/8;ps.push({x:a.x+(b.x-a.x)*t+offset+Math.sin(j*.8+i)*2,y:a.y+(b.y-a.y)*t});}stroke(g,ps,i%4?'#edfff1a8':'#316f8580',.9+rand(i,111)*2.4);}g.restore();
    glow(g,b,76,24,'#e3fff0b8');glow(g,{x:b.x+8,y:b.y-28},63,50,'#e0f7e657');for(let i=0;i<22;i++)ellipse(g,b.x+(rand(i,112)-.5)*85,b.y+(rand(i,113)-.5)*20,2+rand(i,114)*5,.8+rand(i,115)*2,'#eefff0a0');
   }
   function drawCascade(g,f,index){
    // Low riffles share the river bed: no miniature mountain or isolated pool.
    g.save();path(g,wet);g.clip();g.lineCap='round';
    for(let j=0;j<4;j++){const p=samples[f.from*18+j*5],ps=[];for(let k=0;k<=12;k++){const side=(k/12-.5)*p.w*1.55;ps.push(project(p.x+p.nx*side+.035*Math.sin(k*1.8+j),p.y+p.ny*side));}stroke(g,ps,j%3?'#d7eee43c':'#f0fff17a',j%3?1:1.8);}
    g.restore();
   }
   function drawBed(g){
   // Feathered moist grass → eroded ochre soil → gravel → shallow water.
   // Each contour follows independent irregular banks, not parallel strokes.
   g.save();path(g,outline);g.clip();
    g.save();g.shadowColor='#426b5680';g.shadowBlur=12;fill(g,polygon(.19),'#6d9164a0');fill(g,polygon(.09),'#b3b38b');g.restore();
   g.restore();
   // The sand shoal is underwater at the estuary, with no hard coastal seam.
   glow(g,mouth,176,70,'#91cbbb5c');glow(g,{x:mouth.x+70,y:mouth.y+30},180,65,'#52b8be66');
    const depth=g.createLinearGradient(source.x-180,source.y,mouth.x+200,mouth.y);depth.addColorStop(0,'#48bac4');depth.addColorStop(.5,'#36a8b9');depth.addColorStop(1,'#7dcdc4');fill(g,wet,depth);
   g.save();path(g,wet);g.clip();
   // Per-section depth follows the bend: bright shallows at both banks,
   // a deeper blue thread off-centre, and quiet pools below each drop.
    // Continuous blurred depth, without visible mesh-quad seams across water.
    g.save();g.lineCap=g.lineJoin='round';g.filter='blur(13px)';stroke(g,points,'#247e9982',35);g.filter='none';g.restore();
    g.globalAlpha=.25;g.fillStyle=g.createPattern(texture,'repeat');g.fillRect(bounds.x,bounds.y,bounds.w,bounds.h);g.globalAlpha=1;
    for(let i=0;i<700;i++){const p=samples[Math.floor(rand(i,202)*(samples.length-28))],side=(rand(i,203)-.5)*p.w*1.8,q=project(p.x+p.nx*side,p.y+p.ny*side),r=2+rand(i,204)*5;ellipse(g,q.x+1,q.y+1,r,r*.52,'#246f8230',.3);ellipse(g,q.x,q.y,r*.82,r*.4,i%3?'#c2ca9860':'#6aaba477',.3);ellipse(g,q.x-1,q.y-1,r*.43,r*.17,'#e1e5b844',.3);}
   g.lineWidth=.9;for(let i=0;i<240;i++){const n=Math.floor(rand(i,32)*(samples.length-30)),p=samples[n],side=(rand(i,33)-.5)*p.w*1.85,q=project(p.x+p.nx*side,p.y+p.ny*side),w=7+rand(i,34)*15;stroke(g,[{x:q.x-w,y:q.y},{x:q.x-w*.35,y:q.y-4},{x:q.x+w*.35,y:q.y-2},{x:q.x+w,y:q.y+2}],'#d4f5dc60',.7);}
   // Irregular bank shade/reflections are strongest on the uphill shoulder.
   stroke(g,samples.slice(0,-27).map(p=>bank(p,'left',-.10)),'#254e5428',2);stroke(g,samples.slice(0,-27).map(p=>bank(p,'right',-.10)),'#eff4d530',.8);
   for(const t of trees)glow(g,{x:t.p.x+18,y:t.p.y+12},t.w*.48,t.w*.14,'#294e5344');
    g.restore();
    fallPoints.forEach((f,i)=>drawCascade(g,f,i));
    drawHeadwater(g);
    // Source/pool glints and estuary currents merge with the ocean's palette.
   glow(g,source,25,11,'#bdece57a');
    const tip=points.at(-1);g.save();g.globalCompositeOperation='destination-out';const fade=g.createLinearGradient(mouth.x-35,mouth.y-25,tip.x,tip.y);fade.addColorStop(0,'#0000');fade.addColorStop(.25,'#0002');fade.addColorStop(.68,'#000b');fade.addColorStop(1,'#000');g.fillStyle=fade;path(g,wet);g.fill();for(const side of ['left','right'])for(const [width,alpha]of [[45,.08],[28,.14],[14,.25],[5,.55]])stroke(g,samples.slice(17*18).map(p=>bank(p,side)),`rgba(0,0,0,${alpha})`,width);
    // A shallow estuary pool hides the hard cut where the river meets the sea.
    g.globalCompositeOperation='source-over';glow(g,tip,118,38,'#b9eee08c');for(let i=0;i<6;i++){g.globalAlpha=.34-i*.035;g.strokeStyle=i%2?'#e2fff0':'#2e8798';g.lineWidth=1.2;g.beginPath();g.ellipse(tip.x+12+i*7,tip.y+3+i*2,28+i*13,4+i*2,-.18,0,Math.PI);g.stroke();}g.globalAlpha=1;g.restore();
  }
  function occupied(x,y,pad=.3){return [...S.fields,...S.buildings,...S.trees,...(S.decor||[]),...(S.resources||[]).filter(r=>!r.cleared&&r.type!=='grass')].some(o=>{const n=BUILDINGS[o.type]?.size||DECOR_SHOP[o.type]?.size||1;return x>=o.x-pad&&x<o.x+n+pad&&y>=o.y-pad&&y<o.y+n+pad;});}
  function drawFront(g){g.save();path(g,outline);g.clip();
   for(const r of rocks)if(!occupied(r.x,r.y))rock(g,r.p,r.w,r.seed);
    for(const p of plants)if(!occupied(p.x,p.y)){ellipse(g,p.p.x+5,p.p.y+3,p.w*.4,p.w*.12,'#3c5c5029');g.save();g.translate(p.p.x,p.p.y);if(p.flip)g.scale(-1,1);image(g,p.art,{x:0,y:0},p.w,p.w*(p.seed%3===0?1:.79));g.restore();}
    for(const t of trees)if(!occupied(t.x,t.y,.6)){ellipse(g,t.p.x+12,t.p.y+5,t.w*.35,t.w*.10,'#3c613944');image(g,t.art,t.p,t.w,t.w*1.08);}
    // Erase overhanging bank art as well as objects centred inside the water.
    g.save();g.globalCompositeOperation='destination-out';fill(g,wet,'#000');g.restore();
    // Retain foundations only for legacy fields/buildings, never trees/rocks.
    for(const o of [...S.fields,...S.buildings,...(S.decor||[]).filter(o=>!['riverstones','fieldborder'].includes(o.type))]){const n=BUILDINGS[o.type]?.size||DECOR_SHOP[o.type]?.size||1;if(!inValley(o.x,o.y))continue;let overlaps=false;for(let x=0;x<n;x++)for(let y=0;y<n;y++)overlaps ||= sunriseRiverTile(o.x+x,o.y+y);if(!overlaps)continue;const corners=[[o.x-.12,o.y-.12],[o.x+n+.12,o.y-.12],[o.x+n+.12,o.y+n+.12],[o.x-.12,o.y+n+.12]].map(p=>project(...p));fill(g,corners,'#98a76c');stroke(g,corners.concat([corners[0]]),'#d3c59a',3);}
   g.restore();
  }
  const riffles=[2.5,6.1,10.3,12.5,15.5].map(u=>{const p=samples[Math.round(u*18)];return {p:points[Math.round(u*18)],nx:p.nx,ny:p.ny,w:p.w};});
  function drawMotion(g,time){g.save();path(g,wet);g.clip();g.lineCap='round';
   // Advection uses arc length, so currents follow each bend downstream.
   for(let i=0;i<65;i++){const distance=(rand(i,70)*river.length+time*(.9+rand(i,71)*.4))%river.length;let idx=0;while(idx<samples.length-2&&samples[idx+1].distance<distance)idx++;const a=samples[idx],b=samples[idx+1],t=(distance-a.distance)/(b.distance-a.distance||1),side=(rand(i,72)-.5)*a.w*1.45,x=a.x+(b.x-a.x)*t+a.nx*side,y=a.y+(b.y-a.y)*t+a.ny*side,p=project(x,y),q=project(x+(b.x-a.x)*3,y+(b.y-a.y)*3),fade=Math.min(1,a.u/1.5,(18-a.u)/2);g.globalAlpha=Math.max(0,fade)*(.15+rand(i,73)*.23);g.beginPath();g.moveTo(p.x,p.y);g.quadraticCurveTo((p.x+q.x)/2+2,(p.y+q.y)/2-2,q.x,q.y);g.strokeStyle=i%4?'#ddfff3':'#267c9a';g.lineWidth=i%3?1.3:2;g.stroke();}
   g.globalAlpha=1;
    g.restore();g.save();path(g,wet);g.clip();for(const r of riffles)for(let k=0;k<7;k++){const t=(time*.55+k/7)%1;g.globalAlpha=(1-t)*.42;const p=r.p;g.strokeStyle='#e3ffed';g.lineWidth=1.4;g.beginPath();g.ellipse(p.x+t*26+k*3,p.y+t*12,5+t*9,2+t*2,.35,0,Math.PI);g.stroke();}
    g.restore();
    // Headwater strands are above the map's wet mask, on the vertical cliff.
    g.save();g.lineCap='round';const a=sourceFall.a,b=sourceFall.b;
    // Full-height moving ribbons, with a broad lower fan and continuous spray.
    for(let i=0;i<64;i++){const t=(time*(.68+rand(i,128)*.3)+rand(i,121))%1,lateral=(rand(i,122)-.5),spread=35+t*24,x=a.x+(b.x-a.x)*t+lateral*spread,y=a.y+(b.y-a.y)*t,len=Math.min(15+rand(i,123)*33,(1-t)*(b.y-a.y));g.globalAlpha=Math.sin(t*Math.PI)*(.24+rand(i,129)*.4);stroke(g,[{x,y},{x:x+lateral*3,y:y+len}],'#f2fff8',.8+rand(i,124)*2.8);}
    for(let i=0;i<22;i++){const t=(time*.9+i/22)%1,x=b.x+(rand(i,140)-.5)*(40+t*80),y=b.y-5-Math.sin(t*Math.PI)*(8+rand(i,141)*18);g.globalAlpha=(1-t)*.24;glow(g,{x,y},8+t*18,5+t*9,'#eafff2aa');}
    for(let i=0;i<12;i++){const t=(time*.48+i/12)%1;g.globalAlpha=(1-t)*.48;g.strokeStyle='#eafff1';g.lineWidth=1.4;g.beginPath();g.ellipse(b.x+(rand(i,125)-.5)*55,b.y+t*10,8+t*28,2+t*7,-.15,0,Math.PI*1.8);g.stroke();ellipse(g,b.x+(rand(i,126)-.5)*73,b.y-Math.sin(t*Math.PI)*23,1.5,2,'#f1fff0');}g.restore();
  }
  paint(base,bounds,drawBed);
  function visible(g){const t=g.getTransform(),x=bounds.x*t.a+t.e,y=bounds.y*t.d+t.f;return x<g.canvas.width&&y<g.canvas.height&&x+bounds.w*t.a>0&&y+bounds.h*t.d>0;}
  function draw(g,time=0){if(!visible(g))return;const begin=performance.now();if(S.life?.waterMotion===false||(S.interface?.reduced||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches))time=0;g.drawImage(base,bounds.x,bounds.y,bounds.w,bounds.h);const next=Math.floor(time*15);if(next!==frame){frame=next;frames++;paint(motion,bounds,q=>drawMotion(q,time));}g.drawImage(motion,bounds.x,bounds.y,bounds.w,bounds.h);lastMs=performance.now()-begin;peakMs=Math.max(peakMs,lastMs);}
  function foreground(g){if(!visible(g))return;const next=[...S.fields,...S.buildings,...S.trees,...(S.decor||[]),...(S.resources||[])].filter(o=>inValley(o.x,o.y)).map(o=>[o.id,o.x,o.y,o.type,o.cleared?1:0].join(':')).join('|');if(next!==signature){signature=next;paint(front,bounds,drawFront);}g.drawImage(front,bounds.x,bounds.y,bounds.w,bounds.h);}
   const cliffBounds=[{x1:source.x-130,x2:source.x+122,y1:source.y-310,y2:source.y+8},...fallPoints.map(f=>({x1:Math.min(f.a.x,f.b.x)-f.width-69,x2:Math.max(f.a.x,f.b.x)+f.width+69,y1:f.a.y-35,y2:f.b.y+8}))];
   return {draw,foreground,covers:p=>cliffBounds.some(b=>p.x>b.x1&&p.x<b.x2&&p.y>b.y1&&p.y<b.y2),inspect:()=>({source:river.source.slice(0,2),mouth:river.mouth.slice(0,2),waterfalls:fallPoints.length+1,headwater:{from:{...sourceFall.a},to:{...sourceFall.b},height:sourceFall.b.y-sourceFall.a.y,catchment:true},cascadeHeights:fallPoints.map(f=>f.b.y-f.a.y),bankPlants:plants.length,channelObstacles:0,samples:samples.length,waterTiles:river.wet.size,animationHz:15,frames,lastDrawMs:lastMs,peakDrawMs:peakMs,cacheBytes:[base,front,motion].reduce((n,c)=>n+c.width*c.height*4,0)+relief.textureBytes})};
 }
 return {create};
})();
