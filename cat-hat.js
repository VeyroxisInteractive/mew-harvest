'use strict';
// Woven straw geometry fitted to the painted cats' head, not their image bounds.
const CatHatArt=(()=>{
 function drawAt(g,x,y,width=35,style='straw'){if(style!=='straw'){shaped(g,x,y,width,style);return;}g.save();g.translate(x,y);g.scale(width/35,width/35);g.rotate(-.07);
  g.fillStyle='#553b2538';g.beginPath();g.ellipse(1,3,15.5,4.8,0,0,Math.PI*2);g.fill();
  const brim=g.createLinearGradient(0,-3,0,5);brim.addColorStop(0,'#f5db92');brim.addColorStop(.48,'#d7ae5c');brim.addColorStop(1,'#9c7138');g.fillStyle=brim;g.beginPath();g.ellipse(0,0,17.5,5.7,0,0,Math.PI*2);g.fill();g.strokeStyle='#926933';g.lineWidth=.65;g.stroke();
  g.save();g.clip();for(let i=0;i<6;i++){g.strokeStyle=i%2?'#f8dea86b':'#80582245';g.lineWidth=.45;g.beginPath();g.ellipse(0,-1,11+i*1.3,2+i*.65,0,0,Math.PI*2);g.stroke();}for(let i=0;i<36;i++){const a=i*Math.PI/18;g.beginPath();g.moveTo(Math.cos(a)*11,Math.sin(a)*2);g.lineTo(Math.cos(a)*18,Math.sin(a)*6);g.strokeStyle='#97692d40';g.stroke();}g.restore();
  const crown=g.createLinearGradient(-10,-10,11,1);crown.addColorStop(0,'#c79947');crown.addColorStop(.36,'#f4d897');crown.addColorStop(.7,'#dfb767');crown.addColorStop(1,'#ae7c37');g.fillStyle=crown;g.beginPath();g.moveTo(-11,-1);g.bezierCurveTo(-10,-5,-9,-11,-6,-12);g.bezierCurveTo(-2,-14,7,-13,9,-9);g.lineTo(11,-1);g.bezierCurveTo(7,3,-6,3,-11,-1);g.fill();g.strokeStyle='#b38746';g.lineWidth=.5;g.stroke();
  g.save();g.clip();for(let j=0;j<8;j++){g.beginPath();g.ellipse(0,-12+j*1.7,10.5,2.5,0,0,Math.PI);g.strokeStyle=j%2?'#fff0ba66':'#94652355';g.lineWidth=.5;g.stroke();}for(let i=-9;i<11;i+=2){g.beginPath();g.moveTo(i,-14);g.lineTo(i+2,3);g.strokeStyle='#8b642b25';g.stroke();}g.restore();
  g.strokeStyle='#705139';g.lineWidth=2.5;g.beginPath();g.moveTo(-10,-2.5);g.quadraticCurveTo(0,2.1,10,-2.5);g.stroke();g.strokeStyle='#ab7950';g.lineWidth=.6;g.beginPath();g.moveTo(-10,-3.7);g.quadraticCurveTo(0,.5,10,-3.7);g.stroke();g.restore();
 }
 function shaped(g,x,y,width,style){g.save();g.translate(x,y);g.scale(width/35,width/35);g.rotate(-.07);
  const ellipse=(x,y,rx,ry,color)=>{g.fillStyle=color;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill();};
  if(style==='cowboy'){ellipse(0,1,18,4,'#805332');g.fillStyle='#b38352';g.beginPath();g.moveTo(-18,-2);g.quadraticCurveTo(-15,7,0,3);g.quadraticCurveTo(15,6,18,-3);g.quadraticCurveTo(10,0,9,-5);g.lineTo(7,-14);g.quadraticCurveTo(2,-17,0,-12);g.quadraticCurveTo(-7,-17,-8,-12);g.lineTo(-10,-3);g.closePath();g.fill();g.strokeStyle='#e1b779';g.lineWidth=.8;g.stroke();g.strokeStyle='#533d2e';g.lineWidth=2;g.beginPath();g.moveTo(-9,-3);g.quadraticCurveTo(0,0,9,-3);g.stroke();}
  if(style==='cap'){ellipse(9,2,14,3,'#294e79');const v=g.createLinearGradient(-10,-15,8,1);v.addColorStop(0,'#94bad9');v.addColorStop(1,'#365e8c');g.fillStyle=v;g.beginPath();g.moveTo(-12,1);g.bezierCurveTo(-14,-18,11,-18,12,0);g.closePath();g.fill();g.strokeStyle='#cfdfeb';g.lineWidth=.6;g.beginPath();g.moveTo(0,-12);g.quadraticCurveTo(4,-8,4,0);g.stroke();ellipse(0,-13,2,1,'#294e79');}
  if(style==='bucket'){ellipse(0,1,17,5,'#72855a');g.fillStyle='#a4b783';g.beginPath();g.moveTo(-12,0);g.lineTo(-9,-12);g.quadraticCurveTo(0,-16,9,-12);g.lineTo(12,0);g.quadraticCurveTo(0,5,-12,0);g.fill();g.strokeStyle='#52633d';g.lineWidth=2;g.beginPath();g.moveTo(-11,-3);g.quadraticCurveTo(0,1,11,-3);g.stroke();ellipse(-5,-8,1,.7,'#5e6c42');ellipse(4,-8,1,.7,'#5e6c42');}
  if(style==='beanie'){const v=g.createLinearGradient(-10,-17,9,1);v.addColorStop(0,'#ee9691');v.addColorStop(1,'#aa4550');g.fillStyle=v;g.beginPath();g.moveTo(-12,1);g.bezierCurveTo(-15,-21,13,-21,12,1);g.closePath();g.fill();g.fillStyle='#c66568';g.beginPath();g.roundRect(-13,-4,26,7,3);g.fill();for(let i=-11;i<13;i+=2){g.strokeStyle='#f5b8a6a0';g.lineWidth=.55;g.beginPath();g.moveTo(i,-3);g.lineTo(i,2);g.stroke();}ellipse(0,-17,4,3.5,'#d77378');}
  if(style==='chef'){g.fillStyle='#dfdfd0';g.beginPath();g.roundRect(-10,-10,20,12,2);g.fill();for(const [x,y,rr]of [[-9,-13,7],[0,-18,8],[9,-13,7]])ellipse(x,y,rr,rr,'#fffdf1');g.strokeStyle='#b8bbaa';g.lineWidth=.7;g.beginPath();g.moveTo(-8,-7);g.lineTo(-8,0);g.moveTo(0,-8);g.lineTo(0,0);g.moveTo(8,-7);g.lineTo(8,0);g.stroke();}
  g.restore();
 }
 function draw(g,p,size,flip,style='straw'){g.save();g.translate(p.x,p.y+1);if(flip)g.scale(-1,1);drawAt(g,size*.05,-size*.615,size*.56,style);g.restore();}
 return {draw,drawAt};
})();
