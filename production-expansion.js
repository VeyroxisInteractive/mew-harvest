'use strict';
// Extend the existing stations and queues. No second shop, inventory or order engine.
const VILLAGE_RECIPES={
 wheatflour:['Wheat flour','🌾',38,'feedmill',18,{wheat:3},100],
 cornflour:['Corn flour','🌽',42,'feedmill',19,{corn:3},110],
 sugar:['Cane sugar','🍬',55,'feedmill',31,{sugarcane:3},150],
 herbspice:['Ground herb spice','🌿',75,'feedmill',34,{herb:2,chili:1,garlic:1},160],
 gardenpizza:['Garden pizza','🍕',245,'bakery',36,{wheatflour:2,cheese:1,tomato:2},300],
 mushroompizza:['Mushroom pizza','🍕',290,'bakery',39,{wheatflour:2,cheese:1,mushroom:2},330],
 eggnoodles:['Egg noodles','🍜',180,'pot',37,{wheatflour:2,egg:2,carrot:1},250],
 mushroomnoodles:['Mushroom noodles','🍜',245,'pot',40,{wheatflour:2,mushroom:2,herbspice:1},300],
 cookedfishroll:['Cooked fish sushi rolls','🍣',240,'pot',41,{rice:3,grilledfish:1,cabbage:1},240],
 gardenroll:['Garden sushi rolls','🍣',160,'pot',41,{rice:3,carrot:2,cabbage:1},210],
 mangogelato:['Mango gelato','🍨',285,'icecream',43,{mango:2,cream:1,sugar:1},300],
 peachgelato:['Peach gelato','🍨',290,'icecream',44,{peach:2,cream:1,sugar:1},300],
 honeywaffle:['Honey waffle','🧇',215,'fryer',34,{wheatflour:2,egg:1,honey:1},240],
 berrywaffle:['Berry waffle','🧇',235,'fryer',36,{wheatflour:2,egg:1,strawberry:2},270],
 chocolatedonut:['Chocolate donut','🍩',270,'fryer',46,{wheatflour:2,chocolate:1,butter:1},330],
 sugardonut:['Sugar donut','🍩',195,'fryer',44,{wheatflour:2,sugar:1,butter:1},280],
 berrysyrup:['Berry syrup','🍯',235,'pot',35,{strawberry:3,sugar:1},210],
 peachsyrup:['Peach syrup','🍯',245,'pot',38,{peach:3,sugar:1},240],
 milktea:['Milk tea','🍵',140,'mixer',33,{herb:2,milk:1,sugar:1},180],
 ricepearls:['Rice pearls','⚪',65,'pot',47,{rice:2,sugar:1},160],
 bubbletea:['Milk bubble tea','🧋',270,'mixer',48,{milktea:1,ricepearls:1},210],
 berrybubbletea:['Berry bubble tea','🧋',330,'mixer',49,{milktea:1,ricepearls:1,berrysyrup:1},240],
 lavenderperfume:['Lavender perfume','🧴',225,'florist',51,{lavender:3,lemon:1,ceramic:1},360],
 roseperfume:['Rose perfume','🧴',240,'florist',53,{rose:3,orange:1,ceramic:1},390],
 woodentoy:['Wooden cat toy','🪀',175,'tailor',35,{plank:2,rope:1},240],
 plushcat:['Plush cat','🧸',240,'tailor',39,{wovencloth:2,wool:1},300]
};

for(const [id,[name,icon,value,at,level,need,time]]of Object.entries(VILLAGE_RECIPES)){
 if(ITEMS[id]||RECIPES[id])throw new Error('Duplicate production item: '+id);
 ITEMS[id]={name,icon,value};RECIPES[id]={at,level,need,time};
}
if(CROPS.sugarcane||ITEMS.sugarcane)throw new Error('Duplicate sugarcane');
CROPS.sugarcane={name:'Sugarcane',icon:'🎋',level:31,seconds:1500,cost:14,value:27,sprite:1};
ITEMS.sugarcane={name:'Sugarcane',icon:'🎋',value:27};
// Code-native cane artwork: jointed stems and long leaves, including growth stages.
function drawSugarcane(ctx,x,y,growth,time,id){
 ctx.save();ctx.translate(x,y);const scale=.3+.7*Math.max(0,Math.min(1,growth));ctx.scale(scale,scale);
 for(let i=0;i<7;i++){
  const baseX=(i-3)*8,baseY=(i%3)*3,height=48+(i%3)*8,sway=Math.sin(time*1.8+id+i)*2;
  ctx.strokeStyle=i%2?'#608b3b':'#82a950';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(baseX,baseY);ctx.quadraticCurveTo(baseX+sway,baseY-height/2,baseX+sway*1.7,baseY-height);ctx.stroke();
  for(let n=1;n<5;n++){const yy=baseY-height*n/5;ctx.strokeStyle='#c1ce7a';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(baseX-2+sway*n/5,yy);ctx.lineTo(baseX+2+sway*n/5,yy);ctx.stroke();}
  for(const side of [-1,1]){ctx.fillStyle=side<0?'#477d39':'#91b84b';ctx.beginPath();ctx.moveTo(baseX+sway,baseY-height+8);ctx.quadraticCurveTo(baseX+side*17+sway,baseY-height-12,baseX+side*24+sway,baseY-height+12);ctx.quadraticCurveTo(baseX+side*12+sway,baseY-height-2,baseX+sway,baseY-height+8);ctx.fill();}
 }
 ctx.restore();
}
