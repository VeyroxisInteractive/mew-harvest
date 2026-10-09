'use strict';
// Reference-inspired timber deck, masonry arches and warm lanterns.
const StoneBridgeArt=(()=>{
 const iso=(x,y)=>({x:768+(x-y)*48,y:180+(x+y)*24});
 function line(g,a,b,color,w){g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.strokeStyle=color;g.lineWidth=w;g.stroke();}
 function poly(g,p,color){g.beginPath();p.forEach((q,i)=>i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y));g.closePath();g.fillStyle=color;g.fill();}
 const rand=(a,b=0)=>CosmeticTerrain.random(a,b,64,89117);
 function gradient(g,a,b,colors){const v=g.createLinearGradient(a.x,a.y,b.x,b.y);colors.forEach((c,i)=>v.addColorStop(i/(colors.length-1),c));return v;}
 function polygon(g,p,c,edge,w=1){poly(g,p,c);if(edge){g.strokeStyle=edge;g.lineWidth=w;g.stroke();}}
 const shift=(p,y)=>({x:p.x,y:p.y+y});
 function create(){let key,base,front,bounds,bakes=0;
 function bake(fn){const c=document.createElement('canvas');c.width=Math.ceil(bounds.w*1.15);c.height=Math.ceil(bounds.h*1.15);const g=c.getContext('2d');g.scale(1.15,1.15);g.translate(-bounds.x,-bounds.y);g.lineJoin='round';fn(g);return c;}
  function lamp(g,x,y){
   const p=iso(x,y);line(g,{x:p.x,y:p.y-46},{x:p.x,y:p.y-73},'#705031',3);
   polygon(g,[{x:p.x-8,y:p.y-84},{x:p.x+7,y:p.y-84},{x:p.x+8,y:p.y-72},{x:p.x-8,y:p.y-72}],gradient(g,{x:p.x-8,y:p.y-83},{x:p.x+8,y:p.y-70},['#fff1bf','#d2b56f']),'#2d4144',1.6);
   polygon(g,[{x:p.x-10,y:p.y-84},{x:p.x,y:p.y-90},{x:p.x+10,y:p.y-84}],'#9a6530','#293f43');
   line(g,{x:p.x,y:p.y-84},{x:p.x,y:p.y-72},'#506361',1.3);
  }

 function rails(g,x1,x2,y){
  for(const h of [-22,-43]){const a=shift(iso(x1,y),h),b=shift(iso(x2,y),h);line(g,a,b,'#4a3021',8);line(g,shift(a,-2),shift(b,-2),'#c18b50',3);}
  for(let x=x1;x<x2+.1;x+=1.55){const p=iso(Math.min(x,x2),y);line(g,shift(p,4),shift(p,-51),'#503421',11);line(g,{x:p.x-2,y:p.y+1},{x:p.x-2,y:p.y-50},'#ae7845',5);poly(g,[{x:p.x-7,y:p.y-51},{x:p.x,y:p.y-55},{x:p.x+7,y:p.y-51},{x:p.x,y:p.y-47}],'#d6ab72');for(const h of [-23,-43]){g.fillStyle='#3d3930';g.fillRect(p.x-2,p.y+h,3,3);}}
  for(let i=0;i<=4;i++)lamp(g,x1+(x2-x1)*i/4,y);
 }
  function viaduct(g,x1,x2,y,near){
   const a=iso(x1,y),length=(x2-x1)*48,arches=4,pitch=length/arches,rx=pitch*.34,ry=43,spring=82;
   g.save();g.transform(1,.5,0,1,a.x,a.y);
   const wall=new Path2D();wall.rect(0,11,length,90);
   for(let i=0;i<arches;i++){const cx=pitch*(i+.5);wall.moveTo(cx-rx,104);wall.lineTo(cx-rx,spring);wall.ellipse(cx,spring,rx,ry,0,Math.PI,Math.PI*2);wall.lineTo(cx+rx,104);wall.closePath();}
   g.fillStyle=gradient(g,{x:0,y:6},{x:length,y:98},near?['#9aa992','#718981','#3b5e60']:['#7d9487','#44686b','#284d54']);g.fill(wall,'evenodd');
   g.save();g.clip(wall,'evenodd');
   for(let row=0;row<5;row++){const yy=14+row*17;line(g,{x:0,y:yy},{x:length,y:yy},'#344f4e80',1.1);line(g,{x:0,y:yy+1.4},{x:length,y:yy+1.4},'#d5d6b53d',.7);for(let xx=(row%2)*20;xx<length;xx+=39)line(g,{x:xx,y:yy},{x:xx,y:yy+17},'#38565280',.9);}
   for(let i=0;i<520;i++){const x=rand(i,10)*length,y=14+rand(i,11)*88;g.fillStyle=i%3?'#e0d8ad28':'#1b41402e';g.fillRect(x,y,.6+rand(i,12)*2,.5+rand(i,13));}
   g.restore();
   for(let i=0;i<arches;i++){const cx=pitch*(i+.5);for(let k=0;k<15;k++){const angle=Math.PI+k/15*Math.PI,next=Math.PI+(k+1)/15*Math.PI,at=(a,pad)=>({x:cx+Math.cos(a)*(rx+pad),y:spring+Math.sin(a)*(ry+pad)});polygon(g,[at(angle,0),at(next,0),at(next,13),at(angle,13)],k%3?'#a9b299':'#d5ccb0','#4c6761',.8);}
    line(g,{x:cx-rx,y:spring},{x:cx-rx,y:102},'#4c6761',2);line(g,{x:cx+rx,y:spring},{x:cx+rx,y:102},'#4c6761',2);
   }
   for(let i=0;i<=arches;i++){const cx=pitch*i;polygon(g,[{x:Math.max(0,cx-15),y:89},{x:Math.min(length,cx+15),y:89},{x:Math.min(length,cx+20),y:105},{x:Math.max(0,cx-20),y:105}],'#587873','#2e5054',1);}
   g.restore();
   if(near)for(let i=0;i<=arches;i++){const p=iso(x1+(x2-x1)*i/arches,y);g.strokeStyle='#d4edcf78';g.lineWidth=1.5;g.beginPath();g.ellipse(p.x+5,p.y+108,27,5,.18,0,Math.PI*1.8);g.stroke();}
  }

 function ensure(shore){if(key===shore)return;key=shore;
 const x1=shore-.8,x2=SUNRISE_MAP.x+.25,y=SUNRISE_MAP.bridgeY-.2,w=SUNRISE_MAP.bridgeWidth+.4,ps=[iso(x1,y),iso(x2,y),iso(x2,y+w),iso(x1,y+w)];bounds={x:Math.min(...ps.map(p=>p.x))-35,y:Math.min(...ps.map(p=>p.y))-80,w:Math.max(...ps.map(p=>p.x))-Math.min(...ps.map(p=>p.x))+70,h:Math.max(...ps.map(p=>p.y))-Math.min(...ps.map(p=>p.y))+230};
 base=bake(g=>{
  // Clip every supporting wall to open water: no masonry or water ripples on grass.
  const sea=new Path2D();sea.rect(-12000,-12000,30000,30000);
  for(const land of [SUNRISE_MAP.outline,[[-60,-60],[shore,-60],[shore,65],[-60,65]]]){land.map(p=>iso(...p)).forEach((p,i)=>i?sea.lineTo(p.x,p.y):sea.moveTo(p.x,p.y));sea.closePath();}
  g.save();g.clip(sea,'evenodd');
  viaduct(g,shore+.15,SUNRISE_MAP.x-1.3,y,false);viaduct(g,shore+.15,SUNRISE_MAP.x-1.3,y+w,true);

  for(const yy of [y,y+w]){const a=iso(x1,yy),b=iso(x2,yy);poly(g,[a,b,shift(b,19),shift(a,19)],'#543825');line(g,shift(a,4),shift(b,4),'#a47141',4);}
  g.restore();
  poly(g,ps,'#583c28');
  for(let x=x1,i=0;x<x2;x+=.30,i++){const end=Math.min(x+.278,x2),p=[iso(x,y),iso(end,y),iso(end,y+w),iso(x,y+w)];poly(g,p,['#b98750','#c29660','#a97946','#d0a16a','#b18a56'][i%5]);line(g,p[0],p[3],'#e0b77b',1.2);
   for(let k=0;k<4;k++){const xx=x+.035+k*.055;line(g,iso(xx,y+.15+(i%3)*.12),iso(xx,y+w-.15),'#62442535',.8);}for(const yy of [y+.24,y+w-.24]){const n=iso(x+.14,yy);g.fillStyle='#4d4438';g.beginPath();g.arc(n.x,n.y,1.5,0,Math.PI*2);g.fill();}}
  rails(g,x1,x2,y);
 });front=bake(g=>rails(g,x1,x2,y+w));bakes++;}
 function draw(g,shore,time=0){ensure(shore);g.drawImage(base,bounds.x,bounds.y,bounds.w,bounds.h);if(typeof timeOfDay==='function'&&timeOfDay()!=='Day'&&S.life?.effects!==false){g.save();for(const yy of [SUNRISE_MAP.bridgeY-.2,SUNRISE_MAP.bridgeY+SUNRISE_MAP.bridgeWidth+.2])for(let i=0;i<=4;i++){const p=iso(shore-.8+(SUNRISE_MAP.x+.25-shore+.8)*i/4,yy),glow=g.createRadialGradient(p.x,p.y-78,1,p.x,p.y-78,34);glow.addColorStop(0,'#ffe7a34d');glow.addColorStop(1,'#ffe7a300');g.fillStyle=glow;g.fillRect(p.x-34,p.y-112,68,68);}g.restore();}}
 function foreground(g){if(front)g.drawImage(front,bounds.x,bounds.y,bounds.w,bounds.h);}
 return {draw,foreground,inspect:()=>({material:'timber-deck-stone-piers',style:'lantern-arch-bridge',arches:4,cacheBakes:bakes,cacheBytes:[base,front].reduce((n,c)=>n+(c?c.width*c.height*4:0),0),bounds})};
 }return {create};
})();
