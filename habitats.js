'use strict';
const AnimalHabitats=(()=>{
 function redeem(){if(!has({conservationtoken:5}))return false;take({conservationtoken:5});give('animal_treat',2);change();return true;}
 actions.habitatRedeem=redeem;
 const oldRender=renderPanel;
 renderPanel=function(){oldRender();const b=S.buildings.find(b=>b.id===panelId),d=b&&HABITATS[b.type];if(panel!=='building'||!d)return;
  $('sheetBody').insertAdjacentHTML('beforeend','<div class="card"><h2>Habitat care</h2><p>'+ (d.product==='conservationtoken'?'Care cycles earn conservation tokens. Exchange five tokens for two animal treats.':d.species==='snail'?'Snails help turn garden food into compost.':d.species==='carp'?'Welcome at least two breeding fish, then feed them and collect the next batch after its growth cycle.':d.species==='peacock'?'Collect naturally shed feathers after feeding and care.':'Feed, provide fresh water and collect when the cycle finishes.')+'</p><p>Feed: '+ITEMS[d.feed].name+'. '+(d.allowHay===false?'This species requires its own feed.':'Hay bales can also be used.')+'</p>'+btn('5 tokens → 2 animal treats','habitatRedeem','',!has({conservationtoken:5}))+'</div>');
 };
 return{redeem};
})();
// Native canvas animals with species-specific silhouettes and grounded movement.
function drawHabitatAnimal(ctx,species,time,index,routine,color){
 const walk=routine==='Walking',step=walk?Math.sin(time*7+index)*3:0;
 const oval=(x,y,rx,ry,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();};
 const line=(x,y,xx,yy,c,w)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.stroke();};
 const eye=(x,y)=>{oval(x,y,1.2,1.5,'#302f28');oval(x+.3,y-.4,.3,.4,'#fff');};
 ctx.save();if(walk&&Math.cos(time*.5+index)<0)ctx.scale(-1,1);
 if(['koi','carp'].includes(species)){
  ctx.rotate(Math.sin(time*.9+index)*.12);ctx.fillStyle=species==='koi'?'#ed9b65':'#8b917c';ctx.beginPath();ctx.moveTo(-10,-8);ctx.lineTo(-21,-15-step);ctx.lineTo(-20,-2+step);ctx.closePath();ctx.fill();oval(0,-8,15,6,species==='koi'?'#eee3cf':'#b7ae83');if(species==='koi'){oval(-4,-9,4,4,'#d5683d');oval(7,-8,3,3,'#d5683d');}line(-3,-5,1,-1,'#bfaa7c',2);eye(10,-9);ctx.strokeStyle='#dcf3d780';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(-1,1,21,4,0,0,Math.PI*2);ctx.stroke();
 }else if(species==='turtle'){
  for(const [x,y]of [[-9,-2],[8,-2],[-9,-13],[8,-13]])oval(x,y+(x<0?step:-step)/3,4,3,'#728951');oval(0,-8,13,10,'#586d3c');oval(0,-9,10,8,'#879257');line(-8,-10,7,-6,'#526333',1);line(-5,-15,2,-1,'#526333',1);oval(15,-8,5,4,'#98a766');eye(17,-10);
 }else if(species==='snail'){
  oval(0,-2,18,4,'#a8a17b');oval(-4,-11,11,10,'#a67b53');ctx.strokeStyle='#674f38';ctx.lineWidth=1.6;ctx.beginPath();for(let n=0;n<50;n++){const a=n*.22,r=n*.14;const x=-4+Math.cos(a)*r,y=-11+Math.sin(a)*r;n?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();oval(13,-6,5,6,'#b1ad82');line(13,-10,14,-16,'#aaa77a',1.5);line(16,-9,19,-15,'#aaa77a',1.5);eye(14,-16);eye(19,-15);
 }else if(species==='silkworm'){
  line(-19,0,20,-4,'#6e9d4e',6);for(let n=0;n<7;n++)oval(-15+n*5,-6+Math.sin(time*2+n)*1.3,4,4,'#e2d7b7');oval(18,-8,4,4,'#c7b58c');eye(20,-9);
 }else if(['turkey','quail','goose','peacock'].includes(species)){
  if(species==='turkey'||species==='peacock')for(let n=0;n<7;n++){const a=-2.6+n*.35,x=-10+Math.cos(a)*16,y=-12+Math.sin(a)*21;oval(x,y,5,12,species==='peacock'?'#568c5e':'#795442');oval(x,y-5,2.4,3,species==='peacock'?'#6cafb0':'#c39b6d');}
  line(-5,-6,-6+step,0,'#a7783f',2);line(5,-6,6-step,0,'#a7783f',2);oval(0,-14,13,species==='quail'?9:11,color);oval(-2,-14,8,6,species==='goose'?'#d0cfbc':species==='peacock'?'#357788':'#8d7056');
  const neck=species==='goose'?14:species==='quail'?0:7;line(9,-17,11,-23-neck,color,species==='goose'?6:5);oval(12,-24-neck,6,6,color);eye(14,-26-neck);line(17,-23-neck,22,-22-neck,'#c89a4c',3);if(species==='turkey')line(13,-19,14,-14,'#b64c40',3);if(species==='quail')for(let i=0;i<5;i++)oval(-7+i*3,-16+(i%2)*5,1,1,'#dfc8a1');
 }else{
  for(let i=0;i<4;i++){const x=-11+i*7;line(x,-12,x+(i%2?step:-step),0,color,3);line(x+(i%2?step:-step),0,x+3+(i%2?step:-step),0,'#66513c',2);}
  oval(0,-20,18,12,color);if(species==='alpaca')for(let n=0;n<7;n++)oval(-12+n*4,-25-(n%2)*2,5,6,'#e9ddc2');
  const bend=routine==='Eating'||routine==='Drinking'?15:0;line(11,-20,14,-43+bend,color,9);oval(16,-45+bend,9,6,color);oval(23,-43+bend,5,4,'#dfc6a1');eye(19,-47+bend);line(13,-49+bend,11,-58+bend,color,3);line(19,-49+bend,22,-57+bend,color,3);line(-16,-22,-23,-27+step,color,3);
  if(species==='deer'){line(10,-50+bend,5,-63+bend,'#866444',2);line(7,-58+bend,1,-60+bend,'#866444',2);line(19,-50+bend,21,-64+bend,'#866444',2);line(21,-58+bend,27,-60+bend,'#866444',2);for(let n=0;n<5;n++)oval(-11+n*5,-23+(n%2)*6,1.4,1.7,'#ead7b7');}
 }
 ctx.restore();
}
