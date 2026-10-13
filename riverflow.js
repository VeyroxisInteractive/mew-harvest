'use strict';
// Cache a common blue-green grade once, preserving painted rocks, banks and foam.
function prepareWaterArt(art,waterfall=false){
 const canvas=document.createElement('canvas');canvas.width=art.width;canvas.height=art.height;
 const ctx=canvas.getContext('2d');ctx.drawImage(art,0,0);
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),d=pixels.data;
 for(let i=0;i<d.length;i+=4){
  const r=d[i],g=d[i+1],b=d[i+2],strength=Math.min(1,Math.max(0,Math.min(g-r-6,b-r-5)/30));
  const light=(r*.21+g*.56+b*.23),white=Math.max(0,(Math.min(r,g,b)-165)/90),mix=strength*(1-white)*.8;
  d[i]=r*(1-mix)+(18+light*.47)*mix;d[i+1]=g*(1-mix)+(87+light*.58)*mix;d[i+2]=b*(1-mix)+(103+light*.55)*mix;
  if(waterfall){
   const x=(i/4)%canvas.width,y=Math.floor(i/4/canvas.width);
   // The lower stream overlaps the river; irregular feathering removes the cut edge.
   if(y>canvas.height*.69){const edge=canvas.width*(.84+.015*Math.sin(y*.035));const t=Math.max(0,Math.min(1,(canvas.width-x)/(canvas.width-edge)));d[i+3]*=t*t*(3-2*t);}
  }
 }
 ctx.putImageData(pixels,0,0);return canvas;
}
// Animate the existing river artwork; the water-only mask keeps banks and bridge still.
function createRiverFlow(art,{direction=1}={}){
 const width=840,height=440;
 const make=()=>{const c=document.createElement('canvas');c.width=width;c.height=height;return c;};
 const texture=make(),mask=make(),surface=make(),t=texture.getContext('2d'),m=mask.getContext('2d'),s=surface.getContext('2d');
 t.drawImage(art,0,0,width,height);const pixels=t.getImageData(0,0,width,height),water=m.createImageData(width,height);
 for(let i=0;i<pixels.data.length;i+=4){const r=pixels.data[i],g=pixels.data[i+1],b=pixels.data[i+2],a=pixels.data[i+3];const amount=Math.min(1,Math.max(0,Math.min(g-r-7,b-r-10)/24));water.data[i]=water.data[i+1]=water.data[i+2]=255;water.data[i+3]=a*amount;}
 m.putImageData(water,0,0);t.globalCompositeOperation='destination-in';t.drawImage(mask,0,0);t.globalCompositeOperation='source-over';
 let previous=-1;
 return {draw(ctx,x,y,w,h,time){const frame=Math.floor(time*20);if(frame!==previous){previous=frame;s.clearRect(0,0,width,height);s.globalCompositeOperation='source-over';
   for(let layer=0;layer<2;layer++){const phase=((time*.28*direction+layer*.5)%1+1)%1;s.globalAlpha=Math.sin(phase*Math.PI)*.72;s.drawImage(texture,phase*24-12,phase*12-6);}
  s.globalAlpha=1;s.lineCap='round';
   for(let i=0;i<82;i++){const progress=((i*.6180339+time*.025*direction)%1+1)%1,px=55+progress*740,py=px*.46+18+Math.sin(i*7.3)*18;const fade=Math.sin(progress*Math.PI);s.strokeStyle='rgba(210,255,255,'+(.16+fade*.27)+')';s.lineWidth=i%3===0?1.6:.8;s.beginPath();s.moveTo(px,py);s.quadraticCurveTo(px+5,py+4,px+10+i%7,py+6);s.stroke();}
  // Short foam ripples drift downstream from the waterfall and bridge exit.
   for(const [cx,cy]of [[100,82],[443,249],[761,380]])for(let j=0;j<5;j++){const phase=(time*.6+j*.2)%1;s.strokeStyle='rgba(238,255,255,'+(.5*(1-phase))+')';s.lineWidth=1.4;s.beginPath();s.ellipse(cx+phase*24*direction,cy+phase*11*direction,4+phase*10,1+phase*3,.45,0,Math.PI*1.5);s.stroke();}
  s.globalCompositeOperation='destination-in';s.drawImage(mask,0,0);s.globalCompositeOperation='source-over';}
  ctx.drawImage(surface,x,y,w,h);
 }};
}

// Water-only vertical motion: leave mountain, trees and rocks fixed.
function createWaterfallFlow(art){
 const w=700,h=560,make=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;},tex=make(),mask=make(),out=make(),t=tex.getContext('2d'),m=mask.getContext('2d'),o=out.getContext('2d');
 t.drawImage(art,0,0,w,h);const a=t.getImageData(0,0,w,h),b=m.createImageData(w,h);
 for(let i=0;i<a.data.length;i+=4){const r=a.data[i],g=a.data[i+1],blue=a.data[i+2];b.data[i+3]=a.data[i+3]*Math.min(1,Math.max(0,Math.min(g-r-8,blue-r-5)/28));}m.putImageData(b,0,0);
 let last=-1;return {draw(ctx,x,y,width,height,time){const frame=Math.floor(time*20);if(frame!==last){last=frame;o.clearRect(0,0,w,h);for(let n=0;n<2;n++){const phase=(time*.65+n*.5)%1;o.globalAlpha=Math.sin(phase*Math.PI)*.8;o.drawImage(tex,0,phase*20-10);}o.globalAlpha=1;o.strokeStyle='#eeffffb0';o.lineWidth=1.5;for(let i=0;i<110;i++){const px=(i*53)%w,py=(i*97+time*70)%h;o.beginPath();o.moveTo(px,py);o.lineTo(px+1,py+8);o.stroke();}o.globalCompositeOperation='destination-in';o.drawImage(mask,0,0);o.globalCompositeOperation='source-over';}ctx.drawImage(out,x,y,width,height);}};
}
