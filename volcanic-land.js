'use strict';
// Cached relief scenery. A shaded radial height field shapes the volcano;
// the same bare-rock palette/light direction also supplies river cliffs.
const VolcanicLandArt=(()=>{
 const iso=(x,y)=>({x:768+(x-y)*48,y:180+(x+y)*24});
 const random=(a,b=0)=>CosmeticTerrain.random(a,b,71,77419),textures=new WeakMap(),peakTextures=new WeakMap(),stoneTextures=new WeakMap();
 function path(g,ps){g.beginPath();ps.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();}
 function fill(g,ps,c){path(g,ps);g.fillStyle=c;g.fill();}
 function line(g,ps,c,w){g.beginPath();ps.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.strokeStyle=c;g.lineWidth=w;g.stroke();}
 function ellipse(g,x,y,rx,ry,c){g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fillStyle=c;g.fill();}
 function gradient(g,a,b,colors){const v=g.createLinearGradient(a.x,a.y,b.x,b.y);colors.forEach((c,i)=>v.addColorStop(i/(colors.length-1),c));return v;}
 function haze(g,x,y,rx,ry,color){g.save();g.translate(x,y);g.scale(rx,ry);const v=g.createRadialGradient(0,0,.04,0,0,1);v.addColorStop(0,color);v.addColorStop(1,'#72726900');g.fillStyle=v;g.fillRect(-1,-1,2,2);g.restore();}
 function createRockPainter(images){
  let texture=images.mountain&&textures.get(images.mountain);
  if(!texture){texture=document.createElement('canvas');texture.width=texture.height=256;const g=texture.getContext('2d'),px=g.createImageData(256,256),smooth=t=>t*t*(3-2*t);function noise(x,y,n,salt){const a=Math.floor(x),b=Math.floor(y),u=smooth(x-a),v=smooth(y-b),r=(dx,dy)=>random(((a+dx)%n+n)%n,(((b+dy)%n+n)%n)+salt);return (r(0,0)*(1-u)+r(1,0)*u)*(1-v)+(r(0,1)*(1-u)+r(1,1)*u)*v;}for(let y=0;y<256;y++)for(let x=0;x<256;x++){let n=0;for(const [cells,weight]of [[4,.5],[8,.25],[16,.125],[32,.07],[64,.04]])n+=noise(x/256*cells,y/256*cells,cells,cells*73)*weight;const k=(y*256+x)*4,t=142+(n-.49)*75+(random(x,y)-.5)*14;px.data[k]=t+3;px.data[k+1]=t+2;px.data[k+2]=t-4;px.data[k+3]=255;}g.putImageData(px,0,0);if(images.mountain)textures.set(images.mountain,texture);}
  let bare=images.mountain&&stoneTextures.get(images.mountain);if(!bare){bare=document.createElement('canvas');bare.width=128;bare.height=240;const q=bare.getContext('2d');if(images.mountain){q.drawImage(images.mountain,585,90,72,190,0,0,128,240);const px=q.getImageData(0,0,128,240);for(let i=0;i<px.data.length;i+=4){const r=px.data[i],g=px.data[i+1],b=px.data[i+2];if(g>r+4&&g>b+15)px.data[i+3]=0;else{const l=r*.28+g*.55+b*.17;px.data[i]=l*1.035;px.data[i+1]=l*1.018;px.data[i+2]=l*.955;}}q.putImageData(px,0,0);q.globalCompositeOperation='destination-in';const fade=q.createRadialGradient(64,120,20,64,120,126);fade.addColorStop(0,'#fff');fade.addColorStop(.52,'#fffd');fade.addColorStop(1,'#fff0');q.fillStyle=fade;q.fillRect(0,0,128,240);stoneTextures.set(images.mountain,bare);}}
  function stone(g,ps,seed=0,shade=0){
   const xs=ps.map(p=>p.x),ys=ps.map(p=>p.y),x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;
   fill(g,ps,gradient(g,{x,y},{x:x+w,y:y+h},shade<0?['#86918a','#596f70','#354f57']:['#c3b99d','#899481','#556e69']));
   g.save();path(g,ps);g.clip();g.globalAlpha=.23;g.fillStyle=g.createPattern(texture,'repeat');g.fillRect(x,y,w,h);g.globalAlpha=1;
   g.globalAlpha=.55;g.drawImage(bare,x-w*.04,y-h*.04,w*1.08,h*1.08);g.globalAlpha=1;
   for(let i=0;i<12;i++){const px=x+random(i,seed+84)*w,py=y+random(i,seed+85)*h,d=12+random(i,seed+86)*Math.min(65,h*.40),joint=[];for(let j=0;j<5;j++)joint.push({x:px+(random(j,seed+i*7+87)-.5)*d*.55,y:py+j*d/4});line(g,joint,'#2b474959',.8+random(i,seed+88)*1.2);if(i%3===0)line(g,joint.map(p=>({x:p.x-1.3,y:p.y-1})),'#e1d4b74a',.8);}
   g.restore();
  }
  function ridgeShape(x,y,w,h,seed){
   const shape=[[-.53,.03],[-.46,-.17],[-.36,-.35],[-.28,-.39],[-.21,-.70],[-.14,-.91],[-.07,-1],[.01,-.83],[.07,-.56],[.17,-.67],[.23,-.52],[.30,-.28],[.42,-.19],[.53,.04],[.34,.11],[.06,.12],[-.27,.10]];
   return shape.map(([a,b],i)=>({x:x+(a+(random(i,seed)-.5)*.065)*w,y:y+(b+(random(i,seed+1)-.5)*.045)*h}));
  }
  function ridge(g,x,y,w,h,seed){
   const ps=ridgeShape(x,y,w,h,seed);
   if(images['natural-ridge']){g.save();g.translate(x,y);if(seed%2===0)g.scale(-1,1);g.drawImage(images['natural-ridge'],-w*.55,-h,w*1.1,h+30);g.restore();return ps;}
haze(g,x+35,y+15,w*.65,43,'#28474b66');
   if(images.mountain){let cuts=peakTextures.get(images.mountain);if(!cuts){cuts=[[170,135,350,480,.51,.13],[440,8,335,507,.48,.055],[765,130,390,455,.42,.035]].map(([sx,sy,sw,sh,px,py])=>{const c=document.createElement('canvas');c.width=sw;c.height=sh;const q=c.getContext('2d');q.filter='saturate(1.02) brightness(1.02)';q.drawImage(images.mountain,sx,sy,sw,sh,0,0,sw,sh);q.filter='none';q.globalCompositeOperation='destination-in';const silhouette=[[.14,1],[.06,.87],[.11,.70],[.21,.52],[px-.20,py+.25],[px-.10,py+.12],[px-.045,py-.025],[px+.045,py-.025],[px+.15,py+.15],[.79,.52],[.89,.70],[.94,.87],[.86,1]].map(([x,y])=>({x:x*sw,y:y*sh}));fill(q,silhouette,'#fff');const bottom=q.createLinearGradient(0,sh*.62,0,sh);bottom.addColorStop(0,'#fff');bottom.addColorStop(.38,'#fffe');bottom.addColorStop(1,'#fff0');q.fillStyle=bottom;q.fillRect(0,0,sw,sh);return c;});peakTextures.set(images.mountain,cuts);}g.save();g.translate(x,y);if(seed%2===0)g.scale(-1,1);g.drawImage(cuts[seed%3],-w*.52,-h,w,h+23);g.restore();haze(g,x,y+13,w*.42,22,'#7e8d785e');return ps;}
   stone(g,ps,seed);
   g.save();path(g,ps);g.clip();const peak=ps[6];
   for(let i=0;i<9;i++){const end={x:x-w*.48+i*w*.12,y:y+10+random(i,seed+8)*16},mid={x:peak.x+(end.x-peak.x)*.46+(random(i,seed+9)-.5)*w*.10,y:y-h*.42};const face=[peak,{x:mid.x-7,y:mid.y-14},mid,end,{x:end.x+w*.075,y:end.y+8},{x:mid.x+w*.05,y:mid.y+13}];fill(g,face,gradient(g,peak,end,i<4?['#eadbb759','#b1b3973d','#798f7810']:['#354f5975','#3b626667','#385b5815']));line(g,[peak,mid,end],i<4?'#d6cdb261':'#29485173',1.1);}
   g.restore();haze(g,x,y+15,w*.44,24,'#73826973');
   // Grounded talus, rather than mountain sprites fading into open ocean.
   for(let i=0;i<16;i++){const px=x+(random(i,seed+10)-.5)*w*.95,py=y+random(i,seed+11)*17,s=3+random(i,seed+12)*9;fill(g,[{x:px-s,y:py},{x:px,y:py-s*.8},{x:px+s,y:py+2},{x:px+2,y:py+s*.3}],i%3?'#7d8b78':'#566e66');line(g,[{x:px-s,y:py},{x:px,y:py-s*.8}],'#d2c7a75c',.8);}
   return ps;
  }
  return {stone,ridge,ridgeShape,texture,bare,get textureBytes(){return texture.width*texture.height*4+bare.width*bare.height*4+(images.mountain?peakTextures.get(images.mountain)||[]:[]).reduce((n,c)=>n+c.width*c.height*4,0);}};
 }
 function create({images}){
   const map=SUNRISE_VOLCANIC,base=iso(map.cone.x,map.cone.y),crater={x:base.x+36,y:base.y-460},relief=createRockPainter(images);
   const bounds={x:base.x-1010,y:base.y-1050,w:2020,h:1470},ranges=[[68,5,500,340,210],[73,2,430,365,325],[86,3,470,350,482],[89,8,380,305,633]].map(([x,y,w,h,seed])=>({...iso(x,y),w,h,seed}));
   const radiusMin=.245;
   // An irregular height field keeps the volcano broad and impressive without
   // turning it into a symmetrical pyramid. The east and west shoulders use
   // different slopes so the surrounding ridges read as one landform.
   function height(r,a){const t=(r-radiusMin)/(1-radiusMin),shoulder=1+.20*Math.sin(a*2.15-.65)+.085*Math.sin(a*5.2+1.1)+.055*Math.sin(a*8.7-.3)+.06*Math.cos(a-.35);return Math.pow(Math.max(0,1-t),1.10)*392*shoulder+(Math.sin(a*8.5+r*5.4)*22+Math.sin(a*16-r*8)*13+Math.sin(a*29+r*17)*6)*Math.sin(t*Math.PI);}
   function surface(r,a){const radius=r*(1+.22*Math.sin(a*1.7+.45)+.075*Math.sin(a*4.6-1.1)+.045*Math.sin(a*6.8-r*7));return {x:base.x+48*(1-r)+Math.cos(a)*565*radius+Math.sin(a*2.35)*42*(1-r)+Math.sin(a*3.1)*18*(1-r),y:base.y+Math.sin(a)*174*radius+Math.cos(a*3.2)*9*(1-r)+Math.sin(a*1.8+.8)*11*(1-r)-height(r,a),ground:Math.sin(a)*174*radius,r,a};}
  // Screen-space silhouette is also used to occlude old saved resource sprites.
  const left=[],right=[];for(let j=0;j<=40;j++){const r=1-(1-radiusMin)*j/40;let l=null,q=null;for(let i=0;i<96;i++){const p=surface(r,i/96*Math.PI*2);if(!l||p.x<l.x)l=p;if(!q||p.x>q.x)q=p;}left.push(l);right.unshift(q);}
  const rear=[];for(let i=0;i<=32;i++)rear.push(surface(radiusMin,Math.PI+i/32*Math.PI));
  const foot=[];for(let i=0;i<=32;i++)foot.push(surface(1,i/32*Math.PI));
  const shell=left.concat(rear,right,foot),occlusion=[shell,...ranges.map(p=>relief.ridgeShape(p.x,p.y,p.w,p.h,p.seed))].map(ps=>ps.map(p=>[p.x,p.y]));
  // Union silhouettes in a mask canvas avoids even-odd overlap holes.
  let cone=null;const smoke=[];
  let silhouette=null;
  function covers(p){
   if(images['volcano-painted']){
    if(!silhouette){const c=document.createElement('canvas');c.width=192;c.height=128;const q=c.getContext('2d');q.drawImage(images['volcano-painted'],0,0,192,128);silhouette=q.getImageData(0,0,192,128).data;}
    const x=Math.floor((p.x-(base.x-600))/1200*192),y=Math.floor((p.y-(base.y-620))/800*128);
    if(x>=0&&x<192&&y>=0&&y<128&&silhouette[(y*192+x)*4+3]>100)return true;
    return occlusion.slice(1).some(ps=>mapPointInPolygon(p.x,p.y,ps));
   }
   return occlusion.some(ps=>mapPointInPolygon(p.x,p.y,ps));
  }
   function terrain(g){
    // A restrained foothill gradient: meadow green, dry grass, ash and then
    // dark volcanic scree. It stops close to the mapped mountain boundary so
    // the open half remains genuinely clear and buildable.
    for(let x=56;x<=94;x+=1.4){const edge=map.boundary(x);for(const [band,rx,ry,color]of [[0,145,42,'#739b4b38'],[.55,128,34,'#8b95533d'],[1.05,105,28,'#766f4b4b'],[1.55,82,22,'#4d5b4c4d']]){const p=iso(x,edge+band);haze(g,p.x,p.y,rx,ry,color);}}
    for(let i=0;i<110;i++){const x=55+random(i,1)*39,y=-1+random(i,2)*18;if(!map.contains(x,y))continue;const p=iso(x,y);haze(g,p.x,p.y,65+random(i,3)*95,22+random(i,4)*34,i%3?'#8c98533a':'#3c595d29');}
    for(let i=0;i<340;i++){const x=56+random(i,5)*37,y=map.boundary(x)-2+random(i,6)*5,p=iso(x,y),s=1+random(i,7)*3.8;ellipse(g,p.x,p.y,s,.5+random(i,8),i%3?'#9d9b6558':'#465a4b55');if(i%9===0){g.strokeStyle='#394d4058';g.lineWidth=1;g.beginPath();g.moveTo(p.x-4,p.y+2);g.lineTo(p.x+5,p.y-4);g.stroke();}}
   }
  function molten(g,ps,widths,seed){
   function ribbon(scale){const sides=[[],[]];ps.forEach((p,i)=>{const a=ps[Math.max(0,i-1)],b=ps[Math.min(ps.length-1,i+1)],n=Math.hypot(b.x-a.x,b.y-a.y)||1,dx=-(b.y-a.y)/n,dy=(b.x-a.x)/n,w=widths[i]*scale;for(const side of [-1,1])sides[side>0?0:1].push({x:p.x+dx*w*side,y:p.y+dy*w*side});});return sides[0].concat(sides[1].reverse());}
   for(let i=1;i<ps.length;i+=4){const p=ps[i],w=widths[i];haze(g,p.x,p.y,23+w*3,20+w*2,'#422e293d');haze(g,p.x-4,p.y-2,30+w*2,22+w*2,'#eb77302b');}
    g.save();g.shadowColor='#d96a2b60';g.shadowBlur=10;fill(g,ribbon(1.55),'#342e2dc8');fill(g,ribbon(1.18),gradient(g,ps[0],ps.at(-1),['#73352a','#b94d27','#6f3028']));fill(g,ribbon(.64),gradient(g,ps[0],ps.at(-1),['#ffd36b','#f17b2f','#c94c26']));g.restore();
    for(let i=1;i<ps.length;i++){const p=ps[i],w=widths[i],s=randCrust(i,seed);if(s>.42){const d=(s-.5)*w*1.6;fill(g,[{x:p.x-w*.62+d,y:p.y-5},{x:p.x+d,y:p.y-8},{x:p.x+w*.58+d,y:p.y-2},{x:p.x+w*.32+d,y:p.y+6},{x:p.x-w*.34+d,y:p.y+4}],'#3c3633d8');}if(s<.62)line(g,[{x:p.x-w*.28,y:p.y-2},{x:p.x+w*.08,y:p.y+3},{x:p.x+w*.28,y:p.y+7}],'#ffd577a8',1.4+random(i,seed+78)*2);}
   const end=ps.at(-1);haze(g,end.x,end.y,25,18,'#ec8c3b32');ellipse(g,end.x,end.y,Math.max(5,widths.at(-1)*1.3),4,'#a54f2c80');
  }
  function randCrust(i,seed){return random(i,seed+75);}
   function caldera(g){
    const outer=[],inner=[];for(let i=0;i<64;i++){const a=i/64*Math.PI*2,r=1+.075*Math.sin(i*1.71)+.035*Math.sin(i*3.2);outer.push({x:crater.x+Math.cos(a)*145*r,y:crater.y+Math.sin(a)*45*r+Math.sin(i*.9)*6});inner.push({x:crater.x+Math.cos(a)*106*r,y:crater.y+Math.sin(a)*30*r+16});}
    // Rim, recessed bowl and a smaller hot pool create actual crater depth.
    fill(g,outer,'#2b3c3d');for(let i=0;i<64;i++){const j=(i+1)%64;relief.stone(g,[outer[i],outer[j],inner[j],inner[i]],i+315,i<34?-1:0);if(i%3===0)line(g,[outer[i],inner[i]],'#d0c4a358',1);}
    fill(g,inner,gradient(g,{x:crater.x,y:crater.y-24},{x:crater.x,y:crater.y+48},['#152b31','#3c3e3b','#70412e']));
    const bowl=[];for(let i=0;i<48;i++){const a=i/48*Math.PI*2,r=.9+random(i,41)*.12;bowl.push({x:crater.x+Math.cos(a)*73*r,y:crater.y+27+Math.sin(a)*18*r});}fill(g,bowl,'#6d3929');haze(g,crater.x-9,crater.y+31,88,26,'#e8752d55');
    const pool=[];for(let i=0;i<34;i++){const a=i/34*Math.PI*2,r=.88+random(i,42)*.13;pool.push({x:crater.x+Math.cos(a)*54*r,y:crater.y+34+Math.sin(a)*11*r});}fill(g,pool,gradient(g,{x:crater.x,y:crater.y+23},{x:crater.x,y:crater.y+45},['#ffbf55','#e45a25','#8d3025']));haze(g,crater.x-3,crater.y+35,58,15,'#ffb34e91');
    for(let i=0;i<24;i++){const a=i/24*Math.PI*2,p={x:crater.x+Math.cos(a)*(78+random(i,43)*15),y:crater.y+24+Math.sin(a)*(20+random(i,44)*5)};line(g,[p,{x:p.x+Math.cos(a)*random(i,45)*12,y:p.y+Math.sin(a)*random(i,45)*6}],'#ffcf6b9e',1+random(i,46)*1.5);}
    // A broken foreground lip makes the crater read as cut into the mountain.
    haze(g,crater.x+20,crater.y+48,130,42,'#e8752d24');
   }
  function bakeCone(){
   cone=document.createElement('canvas');const ratio=1;cone.width=bounds.w;cone.height=bounds.h;const g=cone.getContext('2d');g.translate(-bounds.x,-bounds.y);
   haze(g,base.x+100,base.y+80,770,185,'#24494f58');
   if(images['volcano-painted']){
    for(const p of ranges.filter(p=>p.y<base.y+120))relief.ridge(g,p.x,p.y,p.w,p.h,p.seed);
    g.drawImage(images['volcano-painted'],base.x-600,base.y-620,1200,800);
    for(const p of ranges.filter(p=>p.y>=base.y+120))relief.ridge(g,p.x,p.y,p.w*.82,p.h*.80,p.seed);
    return;
   }

   for(const p of ranges.filter(p=>p.y<base.y+120))relief.ridge(g,p.x,p.y,p.w,p.h,p.seed);
   const faces=[];for(let j=0;j<48;j++)for(let i=0;i<120;i++){
    const r=radiusMin+(1-radiusMin)*j/48,s=radiusMin+(1-radiusMin)*(j+1)/48,a=i/120*Math.PI*2,b=(i+1)/120*Math.PI*2,p=surface(r,a),q=surface(s,a),v=surface(s,b),u=surface(r,b),mid=(a+b)/2,m=(r+s)/2;
    const slope=(height(Math.max(radiusMin,m-.005),mid)-height(Math.min(1,m+.005),mid))/(.01*620),nx=Math.cos(mid)*slope,ny=Math.sin(mid)*slope,light=(-nx*.55-ny*.60+.9)/Math.hypot(nx,ny,1),tone=Math.max(.10,Math.min(1,light*.55+.40));
    const grain=(random(i,j+130)-.5)*6,color=`rgb(${Math.round(57+tone*104+grain)},${Math.round(78+tone*84+grain)},${Math.round(77+tone*64+grain)})`;
    faces.push({ps:[p,q,v,u],color,depth:(p.ground+q.ground+v.ground+u.ground)/4});
   }
   faces.sort((a,b)=>a.depth-b.depth);for(const f of faces){fill(g,f.ps,f.color);g.strokeStyle=f.color;g.lineWidth=.7;g.stroke();}
   g.save();path(g,shell);g.clip();g.globalAlpha=.14;g.fillStyle=g.createPattern(relief.texture,'repeat');g.fillRect(base.x-680,base.y-550,1360,780);g.globalAlpha=1;
   for(let i=0;i<70;i++){const p=surface(.26+random(i,95)*.67,.08+random(i,96)*3),w=85+random(i,97)*95,h=100+random(i,98)*145;g.globalAlpha=.18+random(i,99)*.15;g.drawImage(relief.bare,p.x-w*.5,p.y-h*.42,w,h);}g.globalAlpha=1;
   for(let i=0;i<1750;i++){const x=base.x-650+random(i,24)*1300,y=base.y-490+random(i,25)*680;ellipse(g,x,y,.45+random(i,26)*1.7,.35+random(i,27),i%4?'#d8cbaa2b':'#25454c38');}
    const flows=[[0,2.12,.91],[1,.91,.83],[2,1.43,.51],[3,1.72,.65]];
    for(const [index,start,end]of flows){const ps=[],ws=[];for(let j=0;j<=40;j++){const t=j/40,r=radiusMin+.015+(end-radiusMin-.015)*t,a=start+Math.sin(t*7+index)*.09+t*(index===0?.20:-.045);ps.push(surface(r,a));ws.push((7+t*14)*(1+.40*Math.sin(j*.53+index)+.24*Math.sin(j*1.1)));}molten(g,ps,ws,index);if(index<3){const ps2=[],ws2=[];for(let j=0;j<19;j++){const t=j/18,r=.52+t*.25,a=start+(index===0?.12:-.02)+t*(index===0?.30:-.24);ps2.push(surface(r,a));ws2.push((1-t)*8+1.4);}molten(g,ps2,ws2,index+4);}}
   g.restore();caldera(g);
   for(const p of ranges.filter(p=>p.y>=base.y+120))relief.ridge(g,p.x,p.y,p.w,p.h,p.seed);
   for(let i=0;i<55;i++){const a=random(i,28)*Math.PI,r=.96+random(i,29)*.075,p=surface(r,a),s=2+random(i,30)*8;fill(g,[{x:p.x-s,y:p.y},{x:p.x,y:p.y-s*.6},{x:p.x+s,y:p.y+2},{x:p.x+1,y:p.y+4}],'#74847480');}
  }
  function bakeSmoke(){for(let variant=0;variant<3;variant++){
   const c=document.createElement('canvas');c.width=c.height=192;const g=c.getContext('2d');
   for(let i=0;i<22;i++){const a=i*2.399,d=random(i,variant+52)*43,x=96+Math.cos(a)*d,y=96+Math.sin(a)*d,r=25+random(i,variant+55)*30,v=g.createRadialGradient(x,y,0,x,y,r),rgb=variant===0?'48,51,53':variant===1?'151,158,157':'232,236,228';v.addColorStop(0,`rgba(${rgb},.16)`);v.addColorStop(.4,`rgba(${rgb},.10)`);v.addColorStop(1,`rgba(${rgb},0)`);g.fillStyle=v;g.fillRect(x-r,y-r,r*2,r*2);}smoke.push(c);
  }}
  function visible(g){const t=g.getTransform(),x=bounds.x*t.a+t.e,y=bounds.y*t.d+t.f;return x<g.canvas.width&&y<g.canvas.height&&x+bounds.w*t.a>0&&y+bounds.h*t.d>0;}
  function draw(g,time=0){
   if(!visible(g))return;cone ||= (bakeCone(),cone);g.drawImage(cone,bounds.x,bounds.y,bounds.w,bounds.h);if(!smoke.length)bakeSmoke();if(S.life?.effects===false||(S.interface?.reduced||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches))time=0;time=Math.floor(time*18)/18;
    // Stable age ordering and overlapping soft eddies form a continuous plume.
    const particles=Array.from({length:72},(_,i)=>({i,age:(time*.075+i/72)%1})).sort((a,b)=>b.age-a.age);
    g.save();for(const {i,age} of particles){const rise=age*520,drift=age*age*145+Math.sin(age*9+time*.42+i*.31)*age*38,size=80+age*280;
     g.save();g.translate(crater.x+drift,crater.y-12-rise);g.rotate(Math.sin(i*2.3+time*.16)*.55);g.globalAlpha=Math.sin(Math.min(1,age*9)*Math.PI/2)*Math.pow(1-age,1.2)*.62;
     const alpha=g.globalAlpha,dark=Math.max(0,1-age*2.6);g.globalAlpha=alpha*dark;g.drawImage(smoke[0],-size*.5,-size*.55,size,size*.95);g.globalAlpha=alpha*(1-dark*.7);g.drawImage(smoke[i%4===0?2:1],-size*.5,-size*.55,size,size*.95);g.restore();}
    g.restore();

  }
  return {terrain,draw,covers,inspect:()=>({area:{...map.stats},cone:{...map.cone},crater:{...crater,shape:'eroded-breached-caldera'},relief:images['volcano-painted']?'painted-volcanic-massif':'radial-height-field',mountainRanges:ranges.length,smoke:{continuous:true,colors:['charcoal','white'],particles:72,animationHz:18},bounds:{...bounds},cacheBytes:(cone?cone.width*cone.height*4:0)+relief.textureBytes+smoke.reduce((n,c)=>n+c.width*c.height*4,0)})};
 }
 return {create,createRockPainter};
})();
