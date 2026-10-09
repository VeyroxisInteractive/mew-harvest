'use strict';
// Shared garment renderer for the farm and wardrobe. Coordinates follow the
// existing biped sprite's chest, ears and eye line; save IDs remain stable.
const CatFashion=(()=>{
 const colors={red:'#ba4149',blue:'#326caa',green:'#348276',yellow:'#e5b346',orange:'#cc7541',purple:'#7456a4',pink:'#d574a3',black:'#293443',white:'#eee9dd',brown:'#8a6249'};
 function draw(g,c,slot,p,size,flip=false){
  const key=c.outfit?.[slot]||({head:c.hat,body:c.vest}[slot]),d=OUTFITS[key];if(!d)return;
  const style=d.style,color=colors[c.outfitColors?.[slot]||d.color]||colors.blue;
  g.save();g.translate(p.x,p.y+1);g.scale((flip?-1:1)*size/65,size/65);g.translate(6,0);g.lineCap='round';g.lineJoin='round';
  const line=(pts,col='#fff8',w=.7)=>{g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.strokeStyle=col;g.lineWidth=w;g.stroke();};
  const shape=(pts,fill,stroke='#233243',w=.7)=>{g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fillStyle=fill;g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=w;g.stroke();}};
  const rr=(x,y,w,h,r,fill,stroke)=>{g.beginPath();g.roundRect(x,y,w,h,r);g.fillStyle=fill;g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=.7;g.stroke();}};
  const oval=(x,y,rx,ry,fill,stroke)=>{g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fillStyle=fill;g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=.7;g.stroke();}};
  const shade=g.createLinearGradient(-14,slot==='head'?-58:-30,15,slot==='head'?-44:-8);shade.addColorStop(0,color);shade.addColorStop(.45,color);shade.addColorStop(1,'#263a4a');
  if(slot==='body'){g.scale(.86,1);
   // Rounded shoulders, fitted waist, separate sleeves and shorts, never a box.
   shape([[-11,-28],[-6,-30],[5,-29],[10,-25],[10,-10],[7,-7],[-8,-8],[-11,-13]],shade);
   shape([[-11,-28],[-15,-24],[-15,-19],[-10,-17],[-7,-24]],shade);
   shape([[7,-27],[11,-24],[13,-18],[9,-17],[6,-23]],shade);
   rr(-10,-12,10,7,2,'#263f57');rr(1,-12,9,7,2,'#263f57');line([[-8,-6],[-2,-6]],'#9eb5c6');line([[3,-6],[8,-6]],'#9eb5c6');
   shape([[-7,-30],[-3,-25],[0,-28],[4,-25],[7,-29]],'#f1e8d7',null);
   if(['denim','utility','bomber','varsity','biker','parka','rainwear','sherpa','tailored'].includes(style)){
    line([[0,-26],[0,-10]],'#d5d6ce',1);oval(0,-23,.7,1,'#e6b961');
    if(style==='varsity'||style==='bomber'){rr(-10,-12,20,3,1,'#eee3cb');line([[-9,-10.5],[9,-10.5]],color,.7);rr(-8,-25,4,5,1,'#f5e9d3');line([[-6,-24],[-6,-21]],color,1);}
    else if(style==='biker'){line([[5,-27],[-5,-12]],'#c7d7e0',1.2);shape([[-6,-29],[0,-25],[-6,-20]],'#536473');}
    else{for(const x of [-7,3]){rr(x,-22,5,5,1,color,'#dfdcd288');line([[x,-21],[x+5,-21]],'#f6ead699');oval(x+2.5,-20,.5,.5,'#e8c779');}}
    if(style==='sherpa'||style==='parka'){line([[-8,-28],[-4,-24],[0,-27],[5,-24],[8,-27]],'#efdfc4',3);}
    if(style==='rainwear'){line([[-10,-13],[9,-13]],'#f7de77',1.5);}
   }else if(style==='hoodie'){
    line([[-7,-28],[-5,-24],[1,-24],[6,-28]],'#fff5',1.6);line([[-4,-25],[-4,-21]],'#f5eee0',.8);line([[4,-25],[4,-21]],'#f5eee0',.8);rr(-6,-17,12,5,2,color,'#1b374870');line([[-4,-17],[-6,-14]],'#efdfc9',.6);
   }else if(style==='knit'||style==='cardigan'){
    for(let y=-23;y<-11;y+=3)line([[-8,y],[-5,y+1],[-2,y],[1,y+1],[4,y],[7,y+1]],'#fff5',.7);
    if(style==='cardigan')line([[0,-26],[0,-10]],'#e9d6bb',2);
   }else if(style==='polo'||style==='rugby'){
    for(let y=-22;y<-10;y+=5)rr(-9,y,18,2.5,1,'#f3ead5');line([[0,-26],[0,-22]],'#e2dbc8',1);
   }else if(style==='apron'){
    shape([[-7,-23],[6,-23],[8,-9],[-9,-9]],'#f3e3c4');line([[-6,-29],[-5,-22],[5,-22],[5,-28]],'#d7b87c',1.2);rr(-4,-17,7,5,1,color);oval(-5,-23,.8,.8,'#b48548');oval(5,-23,.8,.8,'#b48548');
   }else if(style==='kurta'){
    rr(-10,-14,20,5,1,color);line([[0,-27],[0,-10]],'#e4bc70',1);for(let y=-25;y<-13;y+=3)oval(2,y,.65,.65,'#f2cf81');line([[-9,-11],[9,-11]],'#e4bc70',1.2);
   }else {rr(-6,-24,5,4,1,'#e8bf65');line([[-7,-11],[7,-11]],'#eee4c1',.8);}
   line([[-13,-20],[-10,-19]],'#efe8d277');line([[10,-19],[12,-19]],'#efe8d277');
  }
  if(slot==='head'){g.translate(0,4);
   if(style==='beanie'){g.beginPath();g.moveTo(-11,-47);g.bezierCurveTo(-14,-59,9,-62,12,-48);g.closePath();g.fillStyle=shade;g.fill();for(let x=-8;x<10;x+=3)line([[x,-53],[x,-48]],'#fff4');rr(-12,-49,25,5,2,color,'#304152');rr(3,-48,5,3,1,'#edddbd');}
   else if(style==='beret'){oval(-2,-52,15,6,shade,'#293b4a');rr(-10,-49,22,3,1,'#283442');line([[-3,-57],[-1,-60]],color,2);oval(7,-50,1,1,'#deb761');}
   else if(style==='bucket'){shape([[-10,-55],[9,-55],[12,-46],[-13,-46]],shade);oval(0,-46,17,3,color,'#293b4a');line([[-10,-51],[10,-51]],'#ecdcbc',1.5);rr(-2,-50,5,3,1,'#eee2c8');}
   else if(style==='fedora'){oval(0,-47,19,3,color,'#293b4a');shape([[-10,-48],[-10,-55],[-4,-59],[3,-56],[9,-57],[12,-48]],shade);rr(-10,-51,22,3,1,'#323441');line([[8,-52],[12,-59]],'#ebd29a',1.2);}
   else if(style==='visor'){g.beginPath();g.ellipse(5,-47,17,4,.06,0,Math.PI);g.fillStyle=color;g.fill();line([[-13,-49],[7,-49]],'#eee5d3',3);}
   else if(style==='crown'){shape([[-12,-48],[-12,-56],[-5,-51],[0,-58],[5,-51],[12,-55],[11,-47]],'#e4b455','#8b6238');rr(-12,-49,24,3,1,'#f7d77d');oval(0,-52,1.7,2.2,color);}
   else{g.beginPath();g.moveTo(-12,-48);g.bezierCurveTo(-12,-60,10,-60,12,-48);g.closePath();g.fillStyle=shade;g.fill();g.strokeStyle='#293b4a';g.lineWidth=.8;g.stroke();oval(9,-47,13,3,color,'#293b4a');line([[0,-56],[1,-49]],'#fff5',.7);rr(-5,-53,6,4,1,'#f4e7cb');line([[-3,-52],[-1,-50]],color,1);}
  }
  if(slot==='accessory'){
   if(['aviator','squareFrames','catEye'].includes(style)){
    const lens=g.createLinearGradient(0,-40,0,-32);lens.addColorStop(0,style==='aviator'?'#305780cc':'#bdd8dc88');lens.addColorStop(.6,style==='catEye'?'#7a6194cc':'#5baab688');lens.addColorStop(1,'#d7eef58a');
    for(const x of [-8,5]){
     if(style==='aviator'){g.beginPath();g.moveTo(x-4,-39);g.bezierCurveTo(x+5,-42,x+6,-32,x,-32);g.bezierCurveTo(x-4,-32,x-6,-37,x-4,-39);g.fillStyle=lens;g.fill();g.strokeStyle='#d8b864';g.lineWidth=.9;g.stroke();}
     else if(style==='catEye')shape([[x-6,-40],[x+5,-39],[x+4,-33],[x-3,-33]],lens,color,1.2);
     else rr(x-5,-40,10,7,2,lens,color);
     line([[x-3,-38],[x,-37]],'#f8ffff',.8);
    }
    line([[-3,-37],[0,-38],[2,-37]],style==='aviator'?'#d8b864':color,1);line([[-13,-38],[-15,-40]],color,1);line([[10,-37],[12,-38]],color,1);
   }else if(style==='boots'){rr(-10,-5,9,4,2,color);rr(2,-5,10,4,2,color);line([[-9,-1],[-2,-1]],'#f0e6d2',1.4);line([[3,-1],[11,-1]],'#f0e6d2',1.4);}
   else {rr(-15,-14,5,6,2,color);rr(10,-13,5,5,2,color);}
  }
  if(slot==='neck'){line([[-10,-28],[-6,-25],[2,-24],[8,-27]],color,2.5);if(style==='bowTie'){shape([[-1,-25],[-7,-28],[-7,-22]],color);shape([[-1,-25],[5,-28],[5,-22]],color);oval(-1,-25,1.5,1.5,'#ddba69');}else if(style==='bandana')shape([[-8,-26],[6,-26],[-1,-19]],color);else if(style==='scarf'){rr(-7,-25,5,12,1,color);line([[-7,-15],[-2,-15]],'#eee4d4',1);}else oval(-1,-23,1.5,2,'#e1b45e');}
  if(slot==='back'){rr(-20,-28,10,19,3,shade,'#283948');rr(-19,-19,8,7,2,color,'#eadfbd88');line([[-16,-28],[-16,-10]],'#e9cea0',1.5);rr(-17,-25,3,2,1,'#ecc16b');}
  g.restore();
 }
 function portrait(canvas,c,image){if(!canvas||!image)return;const g=canvas.getContext('2d');g.clearRect(0,0,canvas.width,canvas.height);const s=Math.min(canvas.width,canvas.height)*.87,p={x:canvas.width/2-8,y:canvas.height-8};draw(g,c,'back',p,s);g.drawImage(image,p.x-s/2,p.y-s,s,s);for(const slot of ['body','neck','accessory','head'])draw(g,c,slot,p,s);}
 return {draw,portrait};
})();
