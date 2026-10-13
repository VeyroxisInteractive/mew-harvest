'use strict';
// Sunrise expansion scenery.  This module owns only cached, non-interactive
// art; ownership, routes and placement remain in data.js/engine.js.
const SunriseLandscape=(()=>{
 const outline=SUNRISE_MAP.outline;
 const iso=(x,y)=>({x:768+(x-y)*48,y:180+(x+y)*24});
 const random=(a,b=0,c=0)=>CosmeticTerrain.random(a,b,c,97241);
 function pointIn(x,y){return mapPointInPolygon(x,y,outline);}
 function path(g,pts){g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();}
 function polygon(g,pts,fill,stroke,width=1){path(g,pts);g.fillStyle=fill;g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke();}}
 function line(g,pts,color,width=1){g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.strokeStyle=color;g.lineWidth=width;g.stroke();}
 function gradient(g,a,b,colors){const v=g.createLinearGradient(a.x,a.y,b.x,b.y);colors.forEach((c,i)=>v.addColorStop(i/(colors.length-1),c));return v;}
 function haze(g,p,rx,ry,color,opacity=1){g.save();g.translate(p.x,p.y);g.scale(rx,ry);const v=g.createRadialGradient(0,0,0,0,0,1);v.addColorStop(0,color);v.addColorStop(1,'#c6e5df00');g.globalAlpha=opacity;g.fillStyle=v;g.fillRect(-1,-1,2,2);g.restore();}
 function image(g,images,key,p,w,h=w){const im=images[key];if(im)g.drawImage(im,p.x-w/2,p.y-h,w,h);}
 function bake(bounds,draw,ratio=.62){const c=document.createElement('canvas');c.width=Math.ceil(bounds.w*ratio);c.height=Math.ceil(bounds.h*ratio);const g=c.getContext('2d');g.scale(ratio,ratio);g.translate(-bounds.x,-bounds.y);draw(g);return {canvas:c,bounds};}
 function cached(g,layer){const b=layer.bounds;g.drawImage(layer.canvas,b.x,b.y,b.w,b.h);}
  function shapeAround(points,scale,seed,center){return points.map((p,i)=>{const n=1+(random(seed,i,1)-.5)*.075;return {x:center.x+(p.x-center.x)*scale*n+(random(seed,i,2)-.5)*13,y:center.y+(p.y-center.y)*scale*n+(random(seed,i,3)-.5)*9};});}
  function naturalShore(points){const out=[],n=points.length,curve=(a,b,c,d,t)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);for(let i=0;i<n;i++){const a=points[(i+n-1)%n],b=points[i],c=points[(i+1)%n],d=points[(i+2)%n],dx=c.x-b.x,dy=c.y-b.y,len=Math.hypot(dx,dy)||1;for(let j=0;j<12;j++){const t=j/12,r=Math.sin(t*Math.PI)*(Math.sin(j*1.7+i*2)*3+Math.sin(j*.8+i)*2);out.push({x:curve(a.x,b.x,c.x,d.x,t)-dy/len*r,y:curve(a.y,b.y,c.y,d.y,t)+dx/len*r});}}return out;}
 function rockFace(g,a,b,depth,seed,images){const c={x:b.x+7,y:b.y+depth},d={x:a.x+7,y:a.y+depth};polygon(g,[a,b,c,d],gradient(g,a,d,['#d7bf82','#a98258','#6d6955']),'#66584388',1.4);g.save();path(g,[a,b,c,d]);g.clip();g.globalAlpha=.28;image(g,images,'mountain',{x:(a.x+b.x)/2,y:(a.y+b.y)/2+depth*.56},Math.abs(b.x-a.x)+45,depth+24);g.globalAlpha=1;for(let k=0;k<4;k++){const t=(k+.25+random(seed,k,4)*.35)/4,u={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};line(g,[u,{x:u.x-8,y:u.y+depth*.38},{x:u.x+10,y:u.y+depth*.86}],k%2?'#f1dfa76b':'#584c4572',1.2+random(seed,k,5)*1.3);}g.restore();line(g,[a,b],'#f3dda47d',2.2);}
  function drawTree(g,images,x,y,w,kind){const p=iso(x,y),key=images['highland-resource-'+kind]?'highland-resource-'+kind:kind===1?'resource-1':'resource-0';g.save();g.fillStyle='#365c3838';g.beginPath();g.ellipse(p.x+10,p.y+5,w*.34,w*.10,-.12,0,Math.PI*2);g.fill();g.globalAlpha=.82;g.filter='saturate(1.04) brightness(.98)';image(g,images,key,p,w,w*1.12);g.restore();}
  function drawRuin(g,x,y,scale){const p=iso(x,y),stone='#c49a61',shade='#856544',light='#e5c47f';g.save();g.translate(p.x,p.y);g.globalAlpha=.9;polygon(g,[{x:-30*scale,y:0},{x:-19*scale,y:-5*scale},{x:-19*scale,y:-70*scale},{x:-30*scale,y:-65*scale}],shade,'#694f3c',1);polygon(g,[{x:-19*scale,y:-5*scale},{x:4*scale,y:4*scale},{x:4*scale,y:-65*scale},{x:-19*scale,y:-70*scale}],stone,'#694f3c',1);polygon(g,[{x:-31*scale,y:-66*scale},{x:-18*scale,y:-74*scale},{x:6*scale,y:-67*scale},{x:-4*scale,y:-59*scale}],light,'#72583e',1);polygon(g,[{x:13*scale,y:0},{x:25*scale,y:-3*scale},{x:25*scale,y:-57*scale},{x:13*scale,y:-53*scale}],shade,'#694f3c',1);polygon(g,[{x:25*scale,y:-3*scale},{x:46*scale,y:4*scale},{x:46*scale,y:-55*scale},{x:25*scale,y:-57*scale}],stone,'#694f3c',1);line(g,[{x:6*scale,y:-47*scale},{x:13*scale,y:-48*scale}],light,4*scale);g.restore();}
  function terraceShelf(g,x,y,w,h,seed){
    const p=iso(x,y),j=(random(seed,77)-.5)*8,top=[{x:p.x-w*.55,y:p.y+j},{x:p.x+w*.10,y:p.y-h*.30+j},{x:p.x+w*.58,y:p.y+3+j},{x:p.x+w*.20,y:p.y+h*.12+j},{x:p.x-w*.42,y:p.y+h*.08+j}];
    polygon(g,top,gradient(g,{x:p.x-w*.5,y:p.y-h*.3},{x:p.x+w*.45,y:p.y+h*.1},['#decf926e','#a8a87548','#657c5d38']),'#e8dca06b',1.2);
    const lower=top.map(q=>({x:q.x+5,y:q.y+12}));polygon(g,[top[3],top[2],lower[2],lower[3]],'#526b5b45','#425d5666',.9);
    for(let i=0;i<3;i++){const t=(i+1)/4;line(g,[{x:top[0].x+(top[1].x-top[0].x)*t,y:top[0].y+(top[1].y-top[0].y)*t+3},{x:top[3].x+(top[2].x-top[3].x)*t,y:top[3].y+(top[2].y-top[3].y)*t+4}],i%2?'#f3df9a45':'#446b5548',.9);}
  }
  function grassDetail(g,x,y,seed){
    const p=iso(x,y),lean=(random(seed,92)-.5)*12;g.strokeStyle=seed%3?'#4e804d75':'#e7d7838c';g.lineWidth=.8+random(seed,93)*.8;g.lineCap='round';
    for(let i=0;i<3;i++){const dx=(i-1)*3;g.beginPath();g.moveTo(p.x+dx,p.y+3);g.quadraticCurveTo(p.x+dx+lean*.45,p.y-5,p.x+dx+lean,p.y-11-random(seed,i+94)*7);g.stroke();}
    if(seed%7===0){g.fillStyle='#e4ad6db5';g.beginPath();g.arc(p.x+lean,p.y-14,1.8,0,Math.PI*2);g.arc(p.x+lean+3,p.y-12,1.4,0,Math.PI*2);g.fill();}
  }
  function grassClump(g,images,x,y,w,seed){
    const p=iso(x,y),im=images['resource-8'];if(!im)return;g.save();g.globalAlpha=.42+random(seed,205)*.22;g.translate(p.x,p.y);if(seed%2)g.scale(-1,1);image(g,images,'resource-8',{x:0,y:0},w,w*1.05);g.restore();
  }
   function buildPlateau(g,images,points,bounds,volcano){
   const center=points.reduce((p,q)=>({x:p.x+q.x,y:p.y+q.y}),{x:0,y:0});center.x/=points.length;center.y/=points.length;
    const beachWidth=p=>{const x=(p.x-768)/96+(p.y-180)/48,y=(p.y-180)/48-(p.x-768)/96;return Math.min(1,Math.max(0,(Math.hypot(x-56,y-7)-2.2)/2))*Math.min(1,Math.max(.12,(y-9)/5))*(48+12*Math.sin(x*.7+y*.8));};
    const extend=(p,w)=>{const dx=p.x-center.x,dy=p.y-center.y,n=Math.hypot(dx,dy)||1;return {x:p.x+dx/n*w,y:p.y+dy/n*w};};
    const sand=points.map(p=>extend(p,beachWidth(p))),wetSand=points.map(p=>extend(p,beachWidth(p)*1.22)),outer=points.map(p=>extend(p,beachWidth(p)*1.65));
    polygon(g,outer,'#7bceca40');polygon(g,wetSand,'#bcbf94');polygon(g,sand,gradient(g,{x:center.x,y:bounds.y},{x:center.x,y:bounds.y+bounds.h},['#e8d6a0','#efdeb0','#d7c38e']));
     // Match Farm Land's bright, painted grass base. The valley keeps its
     // cliffs, volcano and river, but the playable ground now belongs to the
     // same green world instead of reading as a separate yellow island.
     const land=gradient(g,{x:bounds.x,y:bounds.y},{x:bounds.x+bounds.w,y:bounds.y+bounds.h},['#579548','#73aa4d','#83b75a','#5c9c48']);polygon(g,points,land);
    for(const [x,y,rx,ry,color]of [[64,10,250,92,'#5f9f4d68'],[84,25,280,105,'#c5d86b42'],[68,30,220,82,'#65a95270']])haze(g,iso(x,y),rx,ry,color,.9);
   g.save();path(g,points);g.clip();
   // Reuse the first island's painted meadow, clipped to this coastline.
   if(images.island){g.save();g.globalAlpha=.27;g.drawImage(images.island,400,260,620,360,bounds.x,bounds.y,bounds.w,bounds.h);g.restore();}

     for(let i=0;i<38;i++){const p=iso(57+random(i,1)*35,1+random(i,2)*35);haze(g,p,42+random(i,3)*110,15+random(i,4)*42,i%3?'#bbd98d30':'#4d914d30',.8);}
      // Only the volcanic half receives contour bands; extending them through
      // the meadow made the buildable ground look like a hidden tile grid.
      for(let band=0;band<4;band++){const ridge=[];for(let x=56;x<=95;x+=.52)ridge.push(iso(x,4+band*3.15+Math.sin(x*.38+band)*.45+Math.sin(x*.11+band*1.7)*.28));line(g,ridge,band%3?'#f0dc8d20':'#4a76532b',band%3===0?1.35:.8);}
     for(let i=0;i<185;i++){const x=56+random(i,8)*39,y=-1+random(i,9)*38;if(!pointIn(x,y)||sunriseRiverTile(x,y)||sunriseMountainTile(x,y))continue;const p=iso(x,y);g.fillStyle=i%4?'#f2df9640':'#3f704d38';g.fillRect(p.x,p.y,1+random(i,10)*2.4,.8+random(i,11)*1.4);if(i%3===0)grassDetail(g,x,y,i);}
      for(let i=0;i<48;i++){const x=56+random(i,180)*39,y=-1+random(i,181)*38;if(pointIn(x,y)&&!sunriseRiverTile(x,y)&&!sunriseMountainTile(x,y))grassDetail(g,x,y,i+200);}
      // Reuse the Farm Land's painted grass clusters so open valley ground
      // has the same illustration quality instead of large flat green gaps.
      for(let i=0;i<42;i++){const x=56+random(i,240)*39,y=1+random(i,241)*36;if(pointIn(x,y)&&!sunriseRiverTile(x,y)&&!sunriseMountainTile(x,y))grassClump(g,images,x,y,34+random(i,242)*23,i+300);}
    volcano.terrain(g);g.restore();
    line(g,points.concat([points[0]]),'#78945488',2);
    for(let i=0;i<points.length;i+=5){if(beachWidth(points[i])<8)continue;const surf=points.slice(i,i+4).map(p=>extend(p,beachWidth(p)*1.30));if(surf.length>2)line(g,surf,'#e9fff0a0',1.8);}
     // Cut the real coastline open at the estuary, including its sandstone
     // face. Translucent river shallows must not reveal an unbroken land edge.
     g.save();g.globalCompositeOperation='destination-out';const left=SUNRISE_RIVER.left.slice(16*18),right=SUNRISE_RIVER.right.slice(16*18).reverse();polygon(g,left.concat(right).map(p=>iso(...p)),'#000');g.restore();
 }
 function streamPolygon(points,width){const sides=[[],[]];for(let i=0;i<points.length;i++){const p=points[i],a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b.x-a.x,dy=b.y-a.y,len=Math.max(1,Math.hypot(dx,dy)),nx=-dy/len,ny=dx/len,w=width*(.75+i/(points.length-1)*.25)+(random(i,700,3)-.5)*4;sides[0].push({x:p.x+nx*w,y:p.y+ny*w});sides[1].push({x:p.x-nx*w,y:p.y-ny*w});}return sides[0].concat(sides[1].slice().reverse());}
  function waterRibbon(g,points,width,time,seed,fall=false){const shape=streamPolygon(points,width);polygon(g,shape,gradient(g,points[0],points[points.length-1],fall?['#a8ded9','#4b9caf','#c8ede0']:['#64c8ca','#3f9eb1','#8ad6cd']),'#326f7b99',1.5);g.save();g.lineCap='round';g.lineJoin='round';line(g,points,'#58b9bd99',width*1.35);path(g,shape);g.clip();g.globalAlpha=.38;g.strokeStyle='#d9f6e8';g.lineWidth=1.5;for(let i=0;i<12;i++){const t=(i/12+time*(fall?.55:.16)+seed*.03)%1,a=points[Math.min(points.length-2,Math.floor(t*(points.length-1)))],b=points[Math.min(points.length-1,Math.floor(t*(points.length-1))+1)],x=a.x+(b.x-a.x)*((t*(points.length-1))%1),y=a.y+(b.y-a.y)*((t*(points.length-1))%1);g.beginPath();g.moveTo(x-12,y-2);g.quadraticCurveTo(x+5,y-7,x+20,y-1);g.stroke();}g.restore();const end=points[points.length-1];haze(g,end,width*1.15,width*.42,'#dff5e7b8',.72);if(fall){for(let i=0;i<10;i++){const p={x:end.x+(random(i,seed,8)-.5)*width*1.3,y:end.y+random(i,seed,9)*18};g.fillStyle='#e5f9efb5';g.beginPath();g.ellipse(p.x,p.y,1.3+random(i,seed,10)*2,2+random(i,seed,11)*2,0,0,Math.PI*2);g.fill();}}}
 function create({images,iso:projectIso,riverFlow}){
     const pts=outline.map(([x,y])=>iso(x,y)),shore=naturalShore(pts),xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),bounds={x:Math.min(...xs)-220,y:Math.min(...ys)-180,w:Math.max(...xs)-Math.min(...xs)+440,h:Math.max(...ys)-Math.min(...ys)+520},volcano=VolcanicLandArt.create({images});
      const surface={...bounds,x:bounds.x,y:bounds.y,key:'sunrise-shared-green-ground-65',solid:true,tint:'#79af5216',clip:shore,accept:p=>{const q=CosmeticTerrain.grid(p.x,p.y);return pointIn(q.x,q.y);},bounds:{x1:54,y1:-2,x2:95,y2:39}};
     const dryRiverMask=new Path2D();dryRiverMask.rect(-12000,-12000,30000,30000);SUNRISE_RIVER.polygon.map(p=>iso(...p)).forEach((p,i)=>i?dryRiverMask.lineTo(p.x,p.y):dryRiverMask.moveTo(p.x,p.y));dryRiverMask.closePath();
    let plateau=null,ambientSignature='',ambientTrees=[],ambientGround=[],ambientFrame=0,shoreKey=null,gorge=null,waterLayer=null,mouthLayer=null,riverArt=null;
   function drawNaturalSurroundings(g){if(plateau)return;}
      function drawPlateau(g){plateau ||= bake(bounds,q=>buildPlateau(q,images,shore,bounds,volcano),1);cached(g,plateau);}
    function drawMysticBackdrop(){}
    function drawNaturalRiver(g,time=0){riverArt ||= SunriseRiverArt.create({images});riverArt.draw(g,time);}
    function occupied(x,y){if(sunriseMountainTile(x,y))return true;const lists=[S.fields,S.buildings,S.trees,S.decor,S.resources];return lists.some(list=>list?.some(o=>{if(o.cleared)return false;const n=BUILDINGS[o.type]?.size||DECOR_SHOP[o.type]?.size||o.size||1;return x>=o.x-.75&&x<o.x+n+.75&&y>=o.y-.75&&y<o.y+n+.75;}));}
    function drawAmbientVegetation(g){if(!S.eastValley)return;let sig=ambientSignature;if(!ambientSignature||++ambientFrame%20===0)sig=[...(S.fields||[]),...(S.buildings||[]),...(S.trees||[]),...(S.decor||[]),...(S.resources||[])].map(o=>[o.id,o.x,o.y,o.size||1,o.cleared?1:0].join(':')).join('|');if(sig!==ambientSignature){ambientSignature=sig;ambientTrees=[];ambientGround=[];for(const [cx,cy,rx,ry,n]of [[59,6,3,3,6],[63,30,3,2,5],[86,4,3,3,6],[88,28,3,3,7]])for(let i=0;i<n;i++){const x=cx+(random(i,121,cx)-.5)*rx*2,y=cy+(random(i,122,cy)-.5)*ry*2;if(sunriseRiverTile(x,y)||!pointIn(x,y)||occupied(x,y))continue;ambientTrees.push({x,y,key:random(i,123,cx)>.48?'highland-resource-1':'highland-resource-0',w:66+random(i,124,cy)*48});}for(let i=0;i<34;i++){const x=57+random(i,130)*38,y=1+random(i,131)*37;if(sunriseRiverTile(x,y)||!pointIn(x,y)||occupied(x,y))continue;const p=iso(x,y);ambientGround.push({x:p.x,y:p.y,s:2+random(i,132)*4,flower:i%4===0});}}
     g.save();g.clip(dryRiverMask,'evenodd');for(const t of ambientTrees){const p=iso(t.x,t.y);g.save();g.globalAlpha=1;image(g,images,t.key,p,t.w,t.w*1.08);g.restore();}for(const d of ambientGround){g.fillStyle=d.flower?'#e4b65fa8':'#d1bd6e99';g.beginPath();g.ellipse(d.x,d.y-2,d.s*1.5,d.s*.6,-.2,0,Math.PI*2);g.fill();if(d.flower){g.fillStyle='#e49a62cc';g.beginPath();g.arc(d.x-2,d.y-7,2,0,Math.PI*2);g.arc(d.x+2,d.y-6,2,0,Math.PI*2);g.fill();}}g.restore();}
     function drawRiverBanks(g){riverArt?.foreground(g);}
     function drawMysticEffects(){}
    function channelPoints(shore){const landX=SUNRISE_MAP.x;return [iso(shore-.6,4.1),iso(shore+2.2,2.8),iso(landX-2.2,3.4),iso(landX+.5,5.8),iso(landX-.4,9.7),iso(landX+.5,12.7),iso(landX-2.8,13.6),iso(shore+1.2,12.1),iso(shore-.8,10.5)];}
    function buildGorge(g,shore){const q=channelPoints(shore),center=q.reduce((p,n)=>({x:p.x+n.x,y:p.y+n.y}),{x:0,y:0});center.x/=q.length;center.y/=q.length;haze(g,center,660,220,'#205f7355');for(let i=0;i<30;i++){const p={x:center.x+(random(i,602)-.5)*760,y:center.y+(random(i,603)-.5)*390};g.strokeStyle=i%3?'#d7f0dc35':'#1d687833';g.lineWidth=1.1;g.beginPath();g.ellipse(p.x,p.y,12+random(i,604)*28,2+random(i,605)*3,-.2,0,Math.PI);g.stroke();}}
   function ensureChannel(shore){if(shore===shoreKey)return;shoreKey=shore;const q=channelPoints(shore),xs=q.map(p=>p.x),ys=q.map(p=>p.y),b={x:Math.min(...xs)-120,y:Math.min(...ys)-120,w:Math.max(...xs)-Math.min(...xs)+240,h:Math.max(...ys)-Math.min(...ys)+270};gorge=bake(b,g=>buildGorge(g,shore),.68);waterLayer=bake(b,()=>{},.62);mouthLayer=bake(b,()=>{},.62);}
   function drawGorge(g,shore){ensureChannel(shore);cached(g,gorge);}
   function redraw(layer,draw){const b=layer.bounds,c=layer.canvas,q=c.getContext('2d');q.setTransform(1,0,0,1,0,0);q.clearRect(0,0,c.width,c.height);q.setTransform(c.width/b.w,0,0,c.height/b.h,-b.x*c.width/b.w,-b.y*c.height/b.h);draw(q);}
    function drawWater(g,shore,time){ensureChannel(shore);const frame=Math.floor(time*15);if(frame!==waterLayer.frame){waterLayer.frame=frame;redraw(waterLayer,q=>{const pts=channelPoints(shore);q.save();path(q,pts);q.clip();for(let i=0;i<24;i++){const a=iso(shore+2+random(i,610)*(SUNRISE_MAP.x-shore-4),3+random(i,611)*11),t=(time*.12+random(i,612))%1;q.globalAlpha=Math.sin(t*Math.PI)*.35;q.strokeStyle='#d7f4df';q.lineWidth=1.1;q.beginPath();q.ellipse(a.x+t*20,a.y+t*4,11+i%5*5,2+i%3,-.2,0,Math.PI);q.stroke();}q.restore();});}cached(g,waterLayer);}
    function drawRiverMouths(){}
    function drawDam(){}
    function drawVolcano(g,time){g.save();g.clip(dryRiverMask,'evenodd');volcano.draw(g,time);g.restore();}
     return {surface:()=>surface,drawNaturalSurroundings,drawPlateau,drawMysticBackdrop,drawNaturalRiver,drawRiverBanks,drawVolcano,drawAmbientVegetation,drawMysticEffects,drawGorge,drawWater,drawRiverMouths,drawDam,coversGround:p=>volcano.covers(p)||!!riverArt?.covers?.(p),depth:()=>235,inspect:()=>({style:'volcanic-meadow',ground:'shared-farm-green',biome:'shared-green-ground-volcanic-half-open-half',newBridges:1,embeddedDock:false,shoreline:'sandy-beach-open-bridge',approachRoad:SUNRISE_APPROACH,volcano:volcano.inspect(),waterfalls:3,river:riverArt?.inspect(),playableBounds:{x:SUNRISE_MAP.x,y:SUNRISE_MAP.y,width:SUNRISE_MAP.size,height:SUNRISE_MAP.size},cacheBytes:(plateau?plateau.canvas.width*plateau.canvas.height*4:0)+(riverArt?.inspect().cacheBytes||0)+volcano.inspect().cacheBytes})};
 }
 return {create,contains:pointIn,gradeRiver:art=>art};
})();
