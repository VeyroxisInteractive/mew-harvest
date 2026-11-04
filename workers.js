'use strict';
// Articulated foreground work, using the original cat artwork and grounded feet.
// All props are positioned from a paw/grip; this renderer is called only on arrival.
function workerMode(cat){
 const staged=typeof WorkerFlow!=='undefined'?WorkerFlow.mode(cat):null;if(staged)return staged;
 const j=cat.job,b=S.buildings.find(b=>b.id===j?.target);
 if(j?.team)return 'team';
 if(j?.hatSewing)return 'sewing';
 if(j?.kind==='home')return j.homeKind==='meal'?'meal':j.homeKind==='play'?'play':'study';
 if(j?.kind==='cook')return BUILDINGS[b?.type]?.workStyle||b?.type||'mixer';
 if(j?.kind==='produce')return b?.type==='ducks'?'feed':b?.type==='cafe'?'mixer':b?.type==='bees'?'bees':'water';
 return j?.kind;
}
function drawWorkingCat(ctx,image,cat,p,size,mode,time,flip){
 const speed=['chop','mine','dig'].includes(mode)?2.8:['plant','eggs','milk','feed'].includes(mode)?2.1:3.1;
 const phase=time*speed+cat.id,raw=Math.sin(phase),sw=raw*(1.35-.35*raw*raw),cw=Math.cos(phase);
 const colors=[['#ac8873','#d4b7a0'],['#d9bfa7','#fff1df'],['#777574','#a8a5a0'],['#c08a4f','#eac28a']][cat.id%4];
 ctx.save();ctx.translate(p.x,p.y+2);ctx.scale((flip?-1:1)*size/65,size/65);
 const effort=['dig','chop','mine','harvest'].includes(mode)?Math.max(0,sw)*.035:mode.startsWith('idle-')?Math.sin(time*1.8)*.003:sw*.009;ctx.transform(1,0,-effort,1,0,0);
 const paws=[];
 const line=(x,y,xx,yy,color,w)=>{ctx.strokeStyle=color;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.stroke();};
 const oval=(x,y,rx,ry,color)=>{if(/^#[0-9a-f]{6}$/i.test(color)&&rx>3&&ry>2){const g=ctx.createRadialGradient(x-rx*.3,y-ry*.4,0,x,y,Math.max(rx,ry));g.addColorStop(0,color);g.addColorStop(.7,color);g.addColorStop(1,color+'bb');ctx.fillStyle=g;}else ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();};
 // Forearm polygons use the original fur and paw pixels, not drawn limb shapes.
 const parts=[{anchor:[233,350],paw:[234,410],poly:[[213,347],[251,357],[257,382],[258,413],[247,427],[221,426],[207,403],[207,370]]},{anchor:[350,350],paw:[355,408],poly:[[338,344],[356,348],[372,374],[380,405],[369,425],[348,425],[339,400]]}];
 const trace=part=>{ctx.beginPath();part.poly.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();};
 const arm=(side,x,y)=>paws.push([side,x*.7-5,y*.85-6]);
 // Original-art limb skinning. The paw endpoint equals
 // the grip exactly; no reach clamp may leave the tool outside the hand.
 const paintPaw=(side,x,y)=>{
  const part=parts[side<0?0:1],gain=65/512/.5;
  const shoulder={x:(part.anchor[0]*65/512-32.5-1)/.5,y:(part.anchor[1]*65/512-65+3)/.5};
  const from=part.anchor,to=part.paw;
  const srcAngle=Math.atan2(to[1]-from[1],to[0]-from[0]);
  const dstAngle=Math.atan2(y-shoulder.y,x-shoulder.x);
  const stretch=Math.hypot(x-shoulder.x,y-shoulder.y)/Math.hypot(to[0]-from[0],to[1]-from[1]);
  ctx.save();ctx.translate(shoulder.x,shoulder.y);ctx.rotate(dstAngle);ctx.scale(stretch,gain);ctx.rotate(-srcAngle);ctx.translate(-from[0],-from[1]);
  trace(part);ctx.clip();ctx.drawImage(image,0,0,512,512);ctx.restore();
 };
 const table=['bakery','dairy','fryer','mixer','cakeoven','pot','icecream','florist','craft','mill','pottery','sewing','chocolate','ingredients','plate'].includes(mode);
 if(table){ctx.save();ctx.scale(.75,1);line(8,-9,8,-2,'#6e4e30',3);line(38,-9,38,-2,'#6e4e30',3);ctx.fillStyle='#997149';ctx.fillRect(3,-13,40,4);oval(23,-13,21,3.5,'#d3ad75');ctx.restore();}
 // Remove the resting forearms from the base only while working. The same pixels
 // are rendered at the animated joints; sleeves, face and body stay untouched.
 const idle=mode.startsWith('idle-');
 ctx.save();if(!idle){ctx.translate(-32.5,-65);ctx.scale(65/512,65/512);
 // Continue the underlying tail/overalls texture behind the lifted forearms.

 // Reconstruct only the body silhouette behind the displaced arms, never a
 // rectangular patch outside the cat. Tail and overalls remain separate.
 const patch=(points,sx,sy,sw,sh,dx,dy,dw,dh)=>{ctx.save();ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();ctx.drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh);ctx.restore();};
 patch([[207,397],[219,400],[232,420],[228,434],[207,428]],185,395,28,40,207,395,27,40);
 patch([[251,354],[260,354],[260,428],[242,428],[244,382]],262,354,20,74,242,354,20,74);
 patch([[337,350],[343,353],[351,390],[347,424],[337,424]],320,350,20,74,334,350,20,74);

 ctx.beginPath();ctx.rect(0,0,512,512);for(const part of parts){part.poly.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}ctx.clip('evenodd');ctx.drawImage(image,0,0,512,512);}else{ctx.drawImage(image,-32.5,-65,65,65);}ctx.restore();
 // Align all prop coordinates to the actual torso, excluding transparent image margins.
 ctx.translate(1,-3);ctx.scale(.5,.5);
 // Keep stations within the short forearms' natural workspace.
 ctx.save();ctx.translate(-5,-6);ctx.scale(.7,.85);
 if(['dig','plant','harvest','pack'].includes(mode)){
  if(mode==='dig'){const bx=2+sw*4,by=-30+cw*3,hx=34+sw*9,hy=-7+cw*9;farmWood(ctx,bx,by,hx,hy,3.2);farmMetal(ctx,'hoe',hx,hy,Math.atan2(hy-by,hx-bx)-Math.PI/2);arm(-1,bx+(hx-bx)*.16,by+(hy-by)*.16);arm(1,bx+(hx-bx)*.57,by+(hy-by)*.57);for(let i=0;i<3;i++)oval(25+i*4,-4-Math.abs(sw)*i*3,2,1,'#9c7546');}
  if(mode==='plant'){oval(-5,-23,7,8,'#bf925d');arm(-1,-6,-24);arm(1,20+sw*4,-14+cw*5);for(let i=0;i<3;i++)oval(21+i*3,-8+((time*9+i*3)%8),1,1,'#e2c58a');}
  if(mode==='harvest'){arm(-1,10,-14+sw*3);arm(1,22,-10+cw*4);farmWood(ctx,22,-10+cw*4,30,-5,3);farmMetal(ctx,'sickle',30,-5,.25);for(let i=0;i<3;i++){line(14+i*4,-3,13+i*4,-18,'#739443',2);oval(13+i*4,-19,3,5,'#e3c36e');}}
  if(mode==='pack'){ctx.fillStyle='#bd8c53';ctx.fillRect(10,-13,26,13);line(10,-13,36,-13,'#e1ba7d',3);arm(-1,12,-14);arm(1,23+sw*5,-26+cw*7);oval(23+sw*5,-22+cw*7,4,5,'#9cae4c');}
 }else if(mode==='ingredients'){
  ctx.fillStyle='#a97d4d';ctx.fillRect(2,-23,15,12);oval(30,-24,12,5,'#a5704a');oval(30,-27,12,3,'#e8d7a4');const x=18+sw*9,y=-37-cw*3;oval(x,y+3,4,4,'#dfb36b');arm(-1,4,-26);arm(1,x,y);
 }else if(mode==='plate'){
  const x=22,y=-27;oval(x,y+4,16,4,'#c5d5cb');oval(x,y,12,5,'#e7bc72');arm(-1,x-13,y+3);arm(1,x+13,y+3);for(let i=0;i<2;i++)oval(x+i*8-4,y-13-((time*6+i*4)%10),1,3,'#fff5d577');
 }else if(mode==='milk'){
  // The actual pen animal is drawn beside this station by the world renderer.
  ctx.fillStyle='#9b7250';ctx.fillRect(-6,-7,16,4);line(-4,-3,-4,1,'#704d32',2);line(7,-3,7,1,'#704d32',2);
  oval(29,-3,9,4,'#829e99');ctx.fillStyle='#a9c0b6';ctx.fillRect(20,-15,18,12);oval(29,-15,9,3,'#f6edd6');arm(-1,18,-24+sw*3);arm(1,29,-25-sw*3);line(27,-22,29,-16,'#f5eedc',1);
 }else if(mode==='eggs'){
  oval(27,-5,17,6,'#a5834b');for(let i=0;i<3;i++)oval(20+i*7,-9,3,4,'#f7e8c8');ctx.fillStyle='#bc905c';ctx.fillRect(-12,-15,17,12);const x=16+sw*10,y=-20+cw*5;arm(-1,-5,-17);arm(1,x,y);oval(x,y+3,3,4,'#fff0d1');
 }else if(mode==='handover'){
  const x=20+Math.max(0,sw)*6,y=-25;ctx.fillStyle='#d5aa73';ctx.fillRect(x-10,y-8,21,16);line(x,y-8,x,y+8,'#9b6952',2);arm(-1,x-10,y+4);arm(1,x+10,y+4);
 }else if(['bait','cast','reel','catch'].includes(mode)){
  if(mode==='bait'){arm(-1,16,-30);arm(1,20,-31+sw*2);oval(18,-29,2,2,'#dd9f77');line(18,-28,45,-55,'#a67c48',2);}
  if(mode==='cast'){const x=27+sw*20,y=-51-cw*13;arm(-1,10,-27);arm(1,17,-32);line(10,-25,x,y,'#b08753',2);line(x,y,55,-3,'#dce6d0',.7);oval(55,-2,2,3,'#d89667');}
  if(mode==='reel'){arm(-1,15,-27);arm(1,21+sw*3,-30+cw*3);line(13,-25,43,-62+sw*2,'#a67c48',2);oval(18,-29,4,4,'#75877c');line(43,-62+sw*2,57,-3,'#d8e6d2',1);for(let i=0;i<3;i++)oval(57+(i-1)*6,-3-Math.abs(sw)*5,2,1,'#c5e5d7');}
  if(mode==='catch'){line(14,-27,36,-60,'#a67c48',2);line(36,-60,38,-30,'#dae4ce',1);ctx.save();ctx.translate(38,-25);ctx.rotate(sw*.15);oval(0,0,5,10,'#7faeaf');ctx.fillStyle='#467d89';ctx.beginPath();ctx.moveTo(0,7);ctx.lineTo(-5,15);ctx.lineTo(5,15);ctx.fill();oval(1,-4,1,1,'#234347');ctx.restore();arm(-1,13,-25);arm(1,29,-24);ctx.fillStyle='#b58b56';ctx.fillRect(14,-12,28,12);}
 }else if(mode.startsWith('idle-')){
  if(mode==='idle-groom'){ /* painted paws remain intact during breathing */ }
  if(mode==='idle-stretch'){ /* upper-body lean provides the idle stretch */ }
  if(mode==='idle-sleep'){ctx.font='12px serif';ctx.fillStyle='#687a7c';ctx.fillText('z',15,-60-Math.sin(time)*2);}
 }else if(mode.startsWith('photo-')){
  if(mode==='photo-wave'){arm(-1,-13,-24);arm(1,18+sw*4,-49+cw*3);}
  else if(mode==='photo-heart'){arm(-1,0,-32);arm(1,3,-32);ctx.font='20px serif';ctx.fillStyle='#d56e81';ctx.fillText('♥',-7,-56);}
  else{arm(-1,-21,-46+sw*2);arm(1,21,-46-cw*2);for(let i=0;i<6;i++)oval(-28+i*11,-57-(i%2)*5,1.5,2,['#edbd55','#90b981','#dd9a9e'][i%3]);}
 }else if(mode==='team'){arm(-1,-12,-22);arm(1,12,-22);line(-12,-22,12,-22,'#a7804b',3);
 }else if(['mill','pottery','sewing','chocolate','ingredients','plate'].includes(mode)){
  if(mode==='mill'){ctx.fillStyle='#b3975e';ctx.fillRect(8,-35,26,17);oval(21,-35,14,4,'#e4cb8b');line(30,-32,37+sw*5,-39+cw*5,'#6e7258',3);arm(1,37+sw*5,-39+cw*5);arm(-1,10,-30);}
  if(mode==='pottery'){oval(24,-22,17,4,'#657b74');oval(24,-32,9+sw,13,'#bd855f');oval(24,-43,5,2,'#674d3d');arm(-1,15,-31+cw*2);arm(1,32,-31+sw*2);}
  if(mode==='sewing'){ctx.fillStyle='#839eaf';ctx.fillRect(10,-26,28,5);line(30,-43,30,-26+sw*2,'#d0d4b5',2);line(20,-43,33,-43,'#5a7068',5);arm(-1,13,-28);arm(1,25+sw*3,-29);}
  if(mode==='chocolate'){ctx.fillStyle='#a9956c';ctx.fillRect(9,-28,29,9);for(let i=0;i<3;i++){ctx.fillStyle='#604034';ctx.fillRect(12+i*8,-26,6,5);}arm(-1,10,-25);arm(1,22+sw*7,-34);line(22+sw*7,-34,25+sw*7,-26,'#77503a',2);}
 }else if(mode==='mixer'){
  ctx.fillStyle='#87b4b166';ctx.fillRect(14,-45,16,23);oval(22,-23,11,3,'#9bbaaa');ctx.fillStyle='#efb35e';ctx.fillRect(16,-34+sw,12,10-sw);line(22+sw*4,-50,22+cw*3,-29,'#7b6243',2);arm(-1,13,-29);arm(1,(22+sw*4)*.7+(22+cw*3)*.3,-43.7);
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
  const bx=1+sw*3,by=-30+cw*3,hx=36+sw*7,hy=-25-cw*24;
  const angle=Math.atan2(hy-by,hx-bx)+Math.PI/2;
  farmWood(ctx,bx,by,hx,hy,3.5);farmMetal(ctx,mode==='mine'?'pick':mode==='build'?'hammer':mode==='crop'?'hoe':'axe',hx,hy,angle);
  arm(-1,bx+(hx-bx)*.14,by+(hy-by)*.14);arm(1,bx+(hx-bx)*.5,by+(hy-by)*.5);
 }else if(mode==='fish'){
 const tip={x:48+sw*2,y:-61+cw*2};arm(-1,12,-25);arm(1,19,-29);line(12,-23,tip.x,tip.y,'#aa7845',2);oval(18,-28,3,3,'#586e68');ctx.strokeStyle='#dfe9ccaa';ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(tip.x,tip.y);ctx.quadraticCurveTo(58,-28,57,1+sw);ctx.stroke();oval(57,1+sw,2,2.5,'#e68b61');ctx.strokeStyle='#c2eee185';ctx.beginPath();ctx.ellipse(57,4,6+(time%2)*4,2,0,0,Math.PI*2);ctx.stroke();
 }else if(mode==='meal'){
  const x=16,y=-25;oval(x,y+3,10,4,'#e6d3a6');oval(x,y,10,3,'#916a43');arm(-1,x-8,y+2);const sx=22+sw*4,sy=-30-cw*5;arm(1,sx,sy);line(sx,sy,sx-6,sy-2,'#b8bcb0',2);oval(sx-7,sy-2,3,1.5,'#ddd6ac');
 }else if(mode==='play'){
  const x=17+sw*5,y=-19-cw*7;oval(x,y,6,6,'#dc9e6b');line(x-4,y,x+4,y,'#f5d699',1.5);arm(-1,x-6,y+3);arm(1,x+6,y+3);
 }else if(mode==='birthday'){
  const x=18,y=-25+sw*.5;oval(x,y+8,16,4,'#e4cea0');ctx.fillStyle='#c48b67';ctx.fillRect(x-11,y-4,22,11);oval(x,y-4,11,3,'#f5e2b9');line(x,y-5,x,y-13,'#da9c68',2);oval(x,y-15,2,3+cw,'#f8ca57');arm(-1,x-12,y+8);arm(1,x+12,y+8);
 }else if(mode==='study'){
  const x=16,y=-28+sw*.5;ctx.fillStyle='#704c3c';ctx.fillRect(x-12,y-5,26,18);ctx.fillStyle='#f2dfb2';ctx.fillRect(x-10,y-3,22,14);line(x+1,y-3,x+1,y+11,'#bba57e',1);for(let n=0;n<3;n++){line(x-8,y+n*3,x-1,y+n*3,'#96815f',.7);line(x+3,y+n*3,x+10,y+n*3,'#96815f',.7);}arm(-1,x-10,y+8);arm(1,x+12,y+8);
 }else if(mode==='care'){
  const x=18+sw*5,y=-25+cw*2;arm(-1,8,-24);arm(1,x,y);line(x,y,x+5,y+7,'#95663f',3);ctx.fillStyle='#b99456';ctx.fillRect(x+1,y+5,12,5);for(let n=0;n<5;n++)line(x+2+n*2,y+10,x+2+n*2,y+13,'#e0c78e',1);oval(5,-3,9,3,'#86b7b4');
 }else if(mode==='feed'){
  const x=16,y=-26+sw*1.2;ctx.save();ctx.translate(x,y);ctx.rotate(.2+sw*.13);oval(0,1,10,5,'#c39053');oval(0,-2,10,3,'#ead280');ctx.restore();arm(-1,x-8,y+1);arm(1,x+7,y-1);
  oval(31,-2,15,5,'#77533b');oval(31,-4,14,4,'#d6b878');for(let i=0;i<8;i++)oval(22+(i*7)%20,-5+(i%2)*2,1.5,1,'#f0d48b');for(let i=0;i<4;i++){const t=(time*.8+i*.25)%1;oval(24+t*8,y+3+t*21,1.1,.7,'#d8b76e');}
 }else if(mode==='water'||mode==='crop'||mode==='bees'){
  const x=14,y=-27;ctx.save();ctx.translate(x,y);ctx.rotate(.1+sw*.1);
  if(mode==='bees'){ctx.fillStyle='#979c8b';ctx.fillRect(-6,-5,13,12);line(6,0,18,-5,'#819d91',4);}else farmWaterCan(ctx);ctx.restore();arm(-1,7,y);arm(1,16,y-4);
  for(let i=0;i<4;i++){const t=(time+i*.25)%1;oval(32+t*5,y-3+t*24,mode==='bees'?2:1,mode==='bees'?3:1.8,mode==='bees'?'#e7e7d590':'#b5e5eacc');}
 }
 ctx.restore();
 // Paws overlap the handles in the foreground, making the grip visible.
 for(const paw of paws)paintPaw(...paw);
 ctx.restore();
}
// Small shaded tools share their attachment coordinates with the existing paw rig.
function farmWood(ctx,x,y,xx,yy,w=3){ctx.save();const dx=xx-x,dy=yy-y,len=Math.hypot(dx,dy);ctx.translate(x,y);ctx.rotate(Math.atan2(dy,dx));const g=ctx.createLinearGradient(0,-w/2,0,w/2);g.addColorStop(0,'#e0b37a');g.addColorStop(.35,'#b77c42');g.addColorStop(1,'#68402a');ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(-1,-w/2,len+2,w,w/2);ctx.fill();ctx.strokeStyle='#6c452a88';ctx.lineWidth=.35;for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(2,-w/4+i*w/3);ctx.bezierCurveTo(len*.3,-w/3,len*.65,w/4,len-1,-w/5+i*w/3);ctx.stroke();}ctx.restore();}
function farmMetal(ctx,kind,x,y,angle=0){ctx.save();ctx.translate(x,y);ctx.rotate(angle);const g=ctx.createLinearGradient(-6,-7,12,7);g.addColorStop(0,'#4c6268');g.addColorStop(.32,'#b0c1c3');g.addColorStop(.48,'#eff0dc');g.addColorStop(.58,'#91a4aa');g.addColorStop(1,'#485c63');ctx.fillStyle=g;ctx.strokeStyle='#43545a';ctx.lineWidth=.65;ctx.beginPath();
 if(kind==='axe'){ctx.moveTo(-4,-3);ctx.lineTo(2,-3);ctx.lineTo(12,-9);ctx.quadraticCurveTo(16,0,12,9);ctx.lineTo(2,3);ctx.lineTo(-4,3);ctx.closePath();}
 else if(kind==='pick'){ctx.moveTo(-16,5);ctx.quadraticCurveTo(-9,-7,3,-5);ctx.quadraticCurveTo(12,-4,17,5);ctx.quadraticCurveTo(8,0,1,0);ctx.quadraticCurveTo(-8,0,-16,5);}
 else if(kind==='hoe'){ctx.moveTo(-3,-2);ctx.lineTo(3,-2);ctx.lineTo(10,10);ctx.lineTo(-7,10);ctx.closePath();}
 else if(kind==='hammer'){ctx.roundRect(-7,-4,17,8,1.5);}
 else if(kind==='sickle'){ctx.moveTo(-3,0);ctx.bezierCurveTo(-12,-3,-11,-17,1,-19);ctx.bezierCurveTo(16,-20,19,-5,8,0);ctx.bezierCurveTo(15,-10,7,-15,1,-13);ctx.bezierCurveTo(-4,-11,-5,-5,1,-3);ctx.closePath();}
 ctx.fill();ctx.stroke();ctx.fillStyle='#53656a';ctx.beginPath();ctx.ellipse(0,0,2,1.2,0,0,7);ctx.fill();ctx.fillStyle='#e5e3c9';ctx.beginPath();ctx.arc(-.6,-.4,.6,0,7);ctx.fill();ctx.restore();}
function farmWaterCan(ctx){const g=ctx.createLinearGradient(-7,0,8,0);g.addColorStop(0,'#3d6968');g.addColorStop(.35,'#a8c5b7');g.addColorStop(.6,'#719d92');g.addColorStop(1,'#365b5b');ctx.strokeStyle='#3c6260';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(-8,0,5,6,0,0,7);ctx.stroke();ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(-6,-6,14,14,3);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(7,2);ctx.lineTo(18,-7);ctx.lineTo(20,-4);ctx.lineTo(8,6);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#c1d1bd';ctx.beginPath();ctx.ellipse(20,-6,4,2,-.8,0,7);ctx.fill();ctx.strokeStyle='#e1e5c4';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-3,-4);ctx.lineTo(-3,5);ctx.stroke();ctx.fillStyle='#365a58';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(18.5+i,-7+i*.7,.4,0,7);ctx.fill();}}
