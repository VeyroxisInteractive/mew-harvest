'use strict';
// Canvas-native vehicle: shared with the loading scene, no sprite-sheet timers.
const TractorArt=(()=>{
 function poly(g,p,color,edge){g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fillStyle=color;g.fill();if(edge){g.strokeStyle=edge;g.lineWidth=1;g.stroke();}}
 function line(g,x,y,a,b,color,w=1){g.strokeStyle=color;g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(a,b);g.stroke();}
 function gradient(g,y1,y2,a,b){const c=g.createLinearGradient(0,y1,0,y2);c.addColorStop(0,a);c.addColorStop(1,b);return c;}
 function wheel(g,x,y,r,t){g.save();g.translate(x,y);g.scale(.8,1);
  const rubber=g.createRadialGradient(-r*.3,-r*.4,1,0,0,r);rubber.addColorStop(0,'#59605a');rubber.addColorStop(.6,'#29302c');rubber.addColorStop(1,'#141d19');g.fillStyle=rubber;g.beginPath();g.arc(0,0,r,0,Math.PI*2);g.fill();
  g.save();g.beginPath();g.arc(0,0,r-.2,0,Math.PI*2);g.clip();g.rotate(t);for(let i=0;i<16;i++){const a=i*Math.PI/8;g.save();g.rotate(a);g.strokeStyle='#121915';g.lineWidth=r*.14;g.lineCap='round';g.beginPath();g.moveTo(r*.71,-2);g.lineTo(r*.95,1);g.stroke();g.strokeStyle='#687065';g.lineWidth=.7;g.beginPath();g.moveTo(r*.74,-3);g.lineTo(r*.97,0);g.stroke();g.restore();}
  const hub=g.createLinearGradient(-r*.5,-r*.5,r*.5,r*.5);hub.addColorStop(0,'#fff0c7');hub.addColorStop(.55,'#dbb56d');hub.addColorStop(1,'#9d733d');g.fillStyle=hub;g.beginPath();g.arc(0,0,r*.47,0,Math.PI*2);g.fill();g.strokeStyle='#101c17';g.lineWidth=1.2;g.stroke();
  for(let i=0;i<6;i++){const a=i*Math.PI/3;g.fillStyle='#47544b';g.beginPath();g.arc(Math.cos(a)*r*.29,Math.sin(a)*r*.29,1,0,Math.PI*2);g.fill();}g.fillStyle='#c7c8ae';g.beginPath();g.arc(0,0,r*.16,0,Math.PI*2);g.fill();g.restore();g.restore();}
 function crate(g,x,y){poly(g,[[x,y],[x+17,y+7],[x+17,y-10],[x,y-17]],'#ae7842','#704823');poly(g,[[x+17,y+7],[x+28,y+1],[x+28,y-16],[x+17,y-10]],'#805532','#604323');poly(g,[[x,y-17],[x+11,y-23],[x+28,y-16],[x+17,y-10]],'#deb875','#9e7949');line(g,x+4,y-12,x+14,y+2,'#d7ad6b',2);line(g,x+4,y-1,x+14,y-7,'#d7ad6b',2);}
 function orientation(state){const dx=Number.isFinite(state.dx)?state.dx:1,dy=Number.isFinite(state.dy)?state.dy:0,x=48*(dx-dy),y=24*(dx+dy),flip=x<0,a=Math.atan2(y,x);return {flip,angle:flip?a-(a>=0?Math.PI:-Math.PI):a};}
 function draw(g,p,cat,state,time=0,effects=true){
  const reduced=typeof window!=='undefined'&&(S.interface?.reduced||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches),t=reduced?0:time,moving=state.driving&&!reduced,spin=moving?t*7:0;
  const heading=orientation(state);g.save();g.translate(p.x,p.y);g.scale(1.28,1.28);g.rotate(heading.angle);if(heading.flip)g.scale(-1,1);
  g.fillStyle='#243f382a';g.beginPath();g.ellipse(-16,8,77,12,0,0,Math.PI*2);g.fill();
  if(moving&&effects){for(let i=0;i<4;i++){const a=(t*.8+i*.25)%1;g.globalAlpha=(1-a)*.2;g.fillStyle='#ded4a4';g.beginPath();g.ellipse(-77-a*24,5-a*4,3+a*7,2+a*3,0,0,Math.PI*2);g.fill();}g.globalAlpha=1;}
  // Far wheels, trailer bed, hitch and sprung body.
  wheel(g,-60,-8,9,spin);wheel(g,-1,-8,19,spin);wheel(g,38,-6,10,spin);
  g.translate(0,moving?Math.sin(t*17)*.65:0);
  line(g,-36,-9,-15,-9,'#5b5d44',5);
  poly(g,[[-84,-14],[-47,-19],[-31,-11],[-68,-5]],'#d9ad67','#70532e');
  poly(g,[[-84,-14],[-68,-5],[-68,3],[-84,-5]],'#88623b','#5b462e');
  poly(g,[[-68,-5],[-31,-11],[-31,-2],[-68,3]],gradient(g,-11,3,'#d6ac70','#986b3e'),'#5b462e');
  if(state.loaded){crate(g,-76,-13);crate(g,-55,-17);}
  else if(['loading','unloading'].includes(state.phase)){const progress=state.phaseProgress||0;g.save();g.globalAlpha=state.phase==='loading'?progress:1-progress;crate(g,-70,-13-(1-progress)*15);g.restore();}
  for(let i=0;i<4;i++){const x=-68+i*11;line(g,x,1,x,-11,'#6f4d2e',2);}
  wheel(g,-62,5,11,spin);
  poly(g,[[-20,-11],[41,-13],[46,-6],[-16,-3]],'#3f5338','#24372d');
  // Rounded steel hood, visible engine block and front axle.
  poly(g,[[7,-18],[42,-20],[44,-7],[8,-6]],gradient(g,-20,-6,'#5c655a','#242f28'),'#25372b');
  for(let i=0;i<7;i++)line(g,12+i*3.5,-17,12+i*3.5,-8,'#899080',.7);
  line(g,27,-7,42,3,'#39493e',3);line(g,5,-6,28,-6,'#939981',2);
  g.fillStyle=gradient(g,-37,-15,'#ef8770','#9d352a');g.beginPath();g.moveTo(9,-34);g.bezierCurveTo(16,-37,34,-38,43,-34);g.quadraticCurveTo(48,-32,48,-27);g.lineTo(48,-17);g.quadraticCurveTo(27,-13,10,-16);g.closePath();g.fill();g.strokeStyle='#7d3429';g.lineWidth=1;g.stroke();
  g.strokeStyle='#ffe2bfaa';g.lineWidth=1.4;g.beginPath();g.moveTo(13,-33);g.quadraticCurveTo(31,-36,43,-32);g.stroke();
  poly(g,[[39,-30],[47,-31],[47,-18],[39,-17]],'#26382d','#758768');
  for(let i=0;i<5;i++)line(g,40+i*1.25,-29,40+i*1.25,-19,'#a0a897',.7);
  line(g,18,-25,34,-27,'#ffe2af',1.3);line(g,18,-22,31,-24,'#843e2b',1);g.fillStyle='#edc88c';g.beginPath();g.roundRect(18,-28,13,4,2);g.fill();
  line(g,29,-35,29,-53,'#353d35',4);line(g,27,-54,32,-54,'#707766',3);line(g,28,-48,28,-37,'#c2c4a2',.7);
  for(const x of [41,48]){g.fillStyle='#58634b';g.beginPath();g.ellipse(x,-31,3.5,4,0,0,Math.PI*2);g.fill();g.fillStyle='#fff1bb';g.beginPath();g.ellipse(x+.4,-31,2.4,2.8,0,0,Math.PI*2);g.fill();}
  line(g,40,-9,52,-12,'#8e9480',4);
  // Rounded front wheel guards, side service panel and hydraulic hoses.
  g.strokeStyle='#bd5840';g.lineWidth=3.2;g.beginPath();g.ellipse(36,0,12,12,0,Math.PI*1.08,Math.PI*1.94);g.stroke();
  g.strokeStyle='#202d27';g.lineWidth=1.5;g.beginPath();g.moveTo(10,-18);g.bezierCurveTo(3,-11,16,-7,22,-12);g.stroke();
  g.fillStyle='#606b58';g.beginPath();g.roundRect(17,-15,12,6,1.3);g.fill();
  for(let i=0;i<4;i++)line(g,19+i*2,-14,19+i*2,-10,'#c1c8a2',.6);
  line(g,-19,-8,-32,-4,'#6a7461',3);line(g,-32,-4,-39,-8,'#aab598',2);

  // Rear marker lamps and a substantial sun canopy with shaded underside.
  for(const x of [-26,-4]){g.fillStyle='#58291f';g.fillRect(x,-26,4,6);g.fillStyle='#ffbf58';g.fillRect(x+.6,-25,2.8,2.4);}
  line(g,-23,-21,-23,-69,'#52604f',2.2);line(g,1,-31,1,-73,'#52604f',2.2);
  poly(g,[[-33,-69],[-11,-78],[13,-73],[-9,-64]],gradient(g,-78,-64,'#e8d8a7','#a6966e'),'#716a4e');
  poly(g,[[-33,-69],[-9,-64],[13,-73],[13,-69],[-9,-60],[-33,-65]],'#8e825d','#655d42');
  // Rear safety hoop, cushioned seat and access step.
  line(g,-21,-19,-21,-55,'#536149',3);line(g,-21,-55,-6,-59,'#536149',3);line(g,-6,-59,-6,-40,'#536149',2.5);
  g.fillStyle='#463d31';g.beginPath();g.roundRect(-19,-32,15,13,3);g.fill();line(g,-15,-20,0,-19,'#7c6a4a',5);
  poly(g,[[7,-9],[19,-11],[20,-7],[8,-5]],'#9caa86','#3d5039');for(let i=0;i<4;i++)line(g,10+i*2,-9,10+i*2,-7,'#465842',.7);
  // Driver is seated behind the bonnet, upper body anchored to the seat.
  poly(g,[[-14,-16],[4,-17],[4,-22],[-14,-21]],'#665039');
  if(cat&&!['loading','unloading'].includes(state.phase)){g.drawImage(cat,cat.width*.35,cat.height*.28,cat.width*.43,cat.height*.55,-27,-65,40,51);line(g,-1,-35,11,-32,'#f3d9a8',4);line(g,-9,-34,7,-28,'#e5c18a',4);if(state.hat&&typeof CatHatArt!=='undefined')CatHatArt.drawAt(g,-5,-58,37,state.hat);}
  line(g,4,-17,10,-32,'#38473a',2);g.strokeStyle='#2c4034';g.lineWidth=2.4;g.beginPath();g.ellipse(10,-32,6,3,-.4,0,Math.PI*2);g.stroke();
  // Back mudguard and near tyres hide the bottom of the seated driver.
  g.fillStyle=gradient(g,-27,-16,'#f59878','#a33d2c');g.beginPath();g.moveTo(-29,-15);g.quadraticCurveTo(-24,-30,-10,-28);g.quadraticCurveTo(3,-29,9,-15);g.lineTo(4,-14);g.quadraticCurveTo(-10,-31,-24,-12);g.closePath();g.fill();g.strokeStyle='#7d3429';g.lineWidth=1;g.stroke();
  wheel(g,-9,1,21,spin);wheel(g,36,1,11,spin);
  line(g,15,-11,24,-12,'#c6c39a',3);
  if(!reduced&&effects&&cat&&state.phase!=='parked'){for(let i=0;i<3;i++){const a=(t*.55+i/3)%1;g.globalAlpha=(1-a)*.16;g.fillStyle='#f2eee2';g.beginPath();g.arc(29-a*5,-57-a*19,2+a*3,0,Math.PI*2);g.fill();}g.globalAlpha=1;}
  if(cat&&['loading','unloading'].includes(state.phase)){const t=state.phaseProgress||0,x=-62+Math.sin(t*Math.PI)*22;g.drawImage(cat,cat.width*.25,cat.height*.18,cat.width*.60,cat.height*.77,x-18,-39,38,49);if(state.hat&&typeof CatHatArt!=='undefined')CatHatArt.drawAt(g,x,-35,32,state.hat);g.save();g.translate(x-12,-10-Math.sin(t*Math.PI)*9);g.scale(.65,.65);crate(g,0,0);g.restore();}
  g.restore();
 }
 return {draw,orientation};
})();
