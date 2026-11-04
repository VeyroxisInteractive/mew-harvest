'use strict';
// High-resolution transparent sprites: oak crate, wicker basket, burlap sack, metal pail.
const StorageArt=(()=>{const atlas=new Image();atlas.src='art/storage-atlas-120.png';const slots={crate:0,basket:1,sack:2,bucket:3};
 function draw(g,kind,x,y,w=40){if(!atlas.complete||!atlas.naturalWidth)return;const i=slots[kind]??0,sx=atlas.naturalWidth/2,sy=atlas.naturalHeight/2;g.drawImage(atlas,(i%2)*sx,Math.floor(i/2)*sy,sx,sy,x-w/2,y-w,w,w);}
 function pallet(g,x,y,w=106){g.save();g.translate(x,y);g.fillStyle='#70492e';g.beginPath();g.moveTo(-w/2,-13);g.lineTo(0,-30);g.lineTo(w/2,-8);g.lineTo(0,12);g.closePath();g.fill();g.fillStyle='#92643c';g.beginPath();g.moveTo(-w/2,-13);g.lineTo(0,7);g.lineTo(w/2,-8);g.lineTo(w/2,0);g.lineTo(0,20);g.lineTo(-w/2,0);g.closePath();g.fill();for(let i=0;i<6;i++){const t=i/6;g.strokeStyle=i%2?'#bd9059':'#d3a971';g.lineWidth=5;g.beginPath();g.moveTo(-w/2+t*w/2,-13-t*17);g.lineTo(t*w/2,7-t*15);g.stroke();}g.restore();}
 return {draw,pallet};})();
