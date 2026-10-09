'use strict';
// Articulated foreground work, using the original cat artwork and grounded feet.
// All props are positioned from a paw/grip; this renderer is called only on arrival.
function workerMode(cat){
 const j=cat.job,b=S.buildings.find(b=>b.id===j?.target);
 if(j?.kind==='cook')return BUILDINGS[b?.type]?.workStyle||b?.type||'mixer';
 if(j?.kind==='produce')return b?.type==='ducks'?'feed':b?.type==='cafe'?'mixer':b?.type==='bees'?'bees':'water';
 return j?.kind;
}
function drawWorkingCat(ctx,image,cat,p,size,mode,time,flip){
 const phase=time*4.5+cat.id,sw=Math.sin(phase),cw=Math.cos(phase);
 const colors=[['#ac8873','#d4b7a0'],['#b7b4ad','#e6e1d8'],['#777574','#a8a5a0'],['#c08a4f','#eac28a']][cat.id%4];
 ctx.save();ctx.translate(p.x,p.y+2);ctx.scale((flip?-1:1)*size/65,size/65);
 const line=(x,y,xx,yy,color,w)=>{ctx.strokeStyle=color;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.stroke();};
 const oval=(x,y,rx,ry,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();};
 const arm=(side,x,y)=>{const shoulder=side*9,elbow=shoulder+(x-shoulder)*.38;line(shoulder,-30,elbow,-23,colors[0],4.5);line(elbow,-23,x,y,colors[0],4.2);line(elbow-1,-24,x-1,y-1,colors[1],1.6);oval(x,y,2.6,2.2,colors[1]);};
 const table=['bakery','dairy','fryer','mixer','cakeoven','pot','icecream','florist','craft','mill','pottery','sewing','chocolate'].includes(mode);
 if(table){ctx.save();ctx.scale(.75,1);line(8,-9,8,-2,'#6e4e30',3);line(38,-9,38,-2,'#6e4e30',3);ctx.fillStyle='#997149';ctx.fillRect(3,-13,40,4);oval(23,-13,21,3.5,'#d3ad75');ctx.restore();}
 // Lower legs remain fixed. Lean the upper body around its hip instead of floating.
 const hip=.80,iw=image.width,ih=image.height;
 ctx.drawImage(image,0,ih*hip,iw,ih*(1-hip),-32.5,-65*(1-hip),65,65*(1-hip));
 ctx.save();ctx.translate(0,-65*(1-hip));ctx.rotate(sw*(mode==='chop'||mode==='mine'?.055:.025));
 ctx.drawImage(image,0,0,iw,ih*(hip+.012),-32.5,-65*hip,65,65*(hip+.012));ctx.restore();
 // The painted cats have large heads and short torsos: paws/props sit at apron height.
 ctx.translate(0,10);ctx.scale(.75,1);
 if(['mill','pottery','sewing','chocolate'].includes(mode)){
  if(mode==='mill'){ctx.fillStyle='#b3975e';ctx.fillRect(8,-35,26,17);oval(21,-35,14,4,'#e4cb8b');line(30,-32,37+sw*5,-39+cw*5,'#6e7258',3);arm(1,37+sw*5,-39+cw*5);arm(-1,10,-30);}
  if(mode==='pottery'){oval(24,-22,17,4,'#657b74');oval(24,-32,9+sw,13,'#bd855f');oval(24,-43,5,2,'#674d3d');arm(-1,15,-31+cw*2);arm(1,32,-31+sw*2);}
  if(mode==='sewing'){ctx.fillStyle='#839eaf';ctx.fillRect(10,-26,28,5);line(30,-43,30,-26+sw*2,'#d0d4b5',2);line(20,-43,33,-43,'#5a7068',5);arm(-1,13,-28);arm(1,25+sw*3,-29);}
  if(mode==='chocolate'){ctx.fillStyle='#a9956c';ctx.fillRect(9,-28,29,9);for(let i=0;i<3;i++){ctx.fillStyle='#604034';ctx.fillRect(12+i*8,-26,6,5);}arm(-1,10,-25);arm(1,22+sw*7,-34);line(22+sw*7,-34,25+sw*7,-26,'#77503a',2);}
 }else if(mode==='mixer'){
  ctx.fillStyle='#87b4b166';ctx.fillRect(14,-45,16,23);oval(22,-23,11,3,'#9bbaaa');ctx.fillStyle='#efb35e';ctx.fillRect(16,-34+sw,12,10-sw);line(22+sw*4,-50,22+cw*3,-29,'#7b6243',2);arm(-1,13,-29);arm(1,22+sw*4,-43);
 }else if(mode==='icecream'){
  oval(21,-26,13,6,'#e8d7b8');oval(21,-29,12,3,'#b7d3c6');const x=25+sw*6,y=-35-cw*3;line(x,y,x+3,y-8,'#9caa9a',2);oval(x,y,4,3,'#f4d3a0');arm(-1,10,-26);arm(1,x+3,y-8);
 }else if(mode==='cakeoven'){
  ctx.fillStyle='#a86e4b';ctx.fillRect(10,-30,27,9);oval(23,-30,14,4,'#f2dcc2');line(22+sw*9,-34,25+sw*9,-29,'#c5d5c2',2);arm(-1,10,-25);arm(1,22+sw*9,-34);
 }else if(['bakery','craft'].includes(mode)){
  if(mode==='bakery'){
   oval(23,-24,12,4,'#f2db9b');const y=-28+sw*2,x=23+cw*4;
   line(x-11,y,x+11,y,'#a67742',4);arm(-1,x-10,y);arm(1,x+10,y);
  }else{
   ctx.fillStyle='#b78651';ctx.fillRect(12,-28,26,5);arm(-1,13,-27);
   const x=27+sw*5,y=-36-Math.max(0,cw)*12;line(x,y,x+5,y-9,'#9a6539',3);line(x+1,y-11,x+11,y-7,'#748284',5);arm(1,x,y);
  }
 }else if(['mixer','dairy','cakeoven','icecream','pot','fryer'].includes(mode)){
  const pan=['pot','fryer'].includes(mode),x=19,y=-27;
  oval(x,y+4,pan?13:11,6,pan?'#606b63':mode==='icecream'?'#92b5b0':'#b76f49');
  oval(x,y,pan?13:11,3.8,'#eed69b');arm(-1,x-11,y+2);
  const hand={x:x+4+sw*5,y:y-10+cw*2};line(hand.x,hand.y,x+sw*5,y+cw,'#886543',2.5);arm(1,hand.x,hand.y);
  if(pan){for(let i=0;i<2;i++)oval(x-5+i*10,y-14-((time*7+i*8)%16),2,4,'#fff8de60');}
 }else if(mode==='florist'){
  line(12,-22,29,-33,'#568342',3);line(13,-22,25,-36,'#568342',2);line(13,-22,34,-29,'#568342',2);
  for(const [x,y,color]of [[29,-33,'#eaaeaa'],[25,-36,'#f3d06b'],[34,-29,'#d291bd']]){oval(x,y,4,3.4,color);oval(x,y,1.3,1.3,'#fff1bd');}
  arm(-1,13,-23);arm(1,26+sw*5,-29+cw*3);
 }else if(['chop','mine','build'].includes(mode)||mode==='crop'&&Math.floor(time/4)%2===0){
  const angle=-.8+sw*.85,x=13,y=-27;
  const hx=x+Math.sin(angle)*23,hy=y-Math.cos(angle)*23;
  line(x-5,y+8,hx,hy,'#966939',3.5);ctx.save();ctx.translate(hx,hy);ctx.rotate(angle);
  if(mode==='mine')line(-10,0,12,0,'#91a2a2',4);
  else{ctx.fillStyle=mode==='crop'?'#85775f':'#a8b5af';ctx.fillRect(-2,-4,mode==='build'?11:13,8);}
  ctx.restore();arm(-1,x-4,y+7);arm(1,x,y);
 }else if(mode==='fish'){
 const tip={x:48+sw*2,y:-61+cw*2};arm(-1,12,-25);arm(1,19,-29);line(12,-23,tip.x,tip.y,'#aa7845',2);oval(18,-28,3,3,'#586e68');ctx.strokeStyle='#dfe9ccaa';ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(tip.x,tip.y);ctx.quadraticCurveTo(58,-28,57,1+sw);ctx.stroke();oval(57,1+sw,2,2.5,'#e68b61');ctx.strokeStyle='#c2eee185';ctx.beginPath();ctx.ellipse(57,4,6+(time%2)*4,2,0,0,Math.PI*2);ctx.stroke();
 }else if(mode==='feed'){
  const x=16,y=-26+sw*1.2;ctx.save();ctx.translate(x,y);ctx.rotate(.2+sw*.13);oval(0,1,10,5,'#c39053');oval(0,-2,10,3,'#ead280');ctx.restore();arm(-1,x-8,y+1);arm(1,x+7,y-1);
  for(let i=0;i<4;i++){const t=(time*.8+i*.25)%1;oval(24+t*8,y+3+t*21,1.1,.7,'#d8b76e');}
 }else if(mode==='water'||mode==='crop'||mode==='bees'){
  const x=14,y=-27;ctx.save();ctx.translate(x,y);ctx.rotate(.1+sw*.1);
  ctx.fillStyle=mode==='bees'?'#979c8b':'#799c91';ctx.fillRect(-6,-5,13,12);line(6,0,18,-5,'#819d91',4);ctx.strokeStyle='#587e72';ctx.lineWidth=2;ctx.strokeRect(-10,-5,5,8);ctx.restore();arm(-1,7,y);arm(1,16,y-4);
  for(let i=0;i<4;i++){const t=(time+i*.25)%1;oval(32+t*5,y-3+t*24,mode==='bees'?2:1,mode==='bees'?3:1.8,mode==='bees'?'#e7e7d590':'#b5e5eacc');}
 }
 ctx.restore();
}
