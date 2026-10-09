'use strict';
const CROPS={
 wheat:{name:'Wheat',icon:'🌾',level:1,seconds:60,cost:1,value:4},clover:{name:'Clover',icon:'☘️',level:2,seconds:120,cost:2,value:7},corn:{name:'Corn',icon:'🌽',level:3,seconds:300,cost:3,value:12},potato:{name:'Potato',icon:'🥔',level:5,seconds:900,cost:5,value:20},carrot:{name:'Carrot',icon:'🥕',level:7,seconds:1200,cost:6,value:25},tomato:{name:'Tomato',icon:'🍅',level:9,seconds:1800,cost:8,value:32},strawberry:{name:'Strawberry',icon:'🍓',level:12,seconds:3600,cost:12,value:50},cabbage:{name:'Cabbage',icon:'🥬',level:15,seconds:4800,cost:16,value:65},rice:{name:'Rice',icon:'🌾',level:18,seconds:7200,cost:20,value:80},beans:{name:'Red beans',icon:'🫘',level:21,seconds:10800,cost:24,value:100},soy:{name:'Soybeans',icon:'🫛',level:24,seconds:14400,cost:30,value:125}};
const GOODS={egg:{name:'Egg',icon:'🥚',value:18},milk:{name:'Milk',icon:'🥛',value:30},wool:{name:'Wool',icon:'🧶',value:55},truffle:{name:'Truffle',icon:'🍄',value:80},apple:{name:'Apple',icon:'🍎',value:35},orange:{name:'Orange',icon:'🍊',value:45},bread:{name:'Bread',icon:'🍞',value:30},cornbread:{name:'Corn bread',icon:'🥖',value:60},bun:{name:'Milk bun',icon:'🥐',value:85},butter:{name:'Butter',icon:'🧈',value:75},cheese:{name:'Cheese',icon:'🧀',value:95},cream:{name:'Cream',icon:'🥛',value:55},fries:{name:'Fries',icon:'🍟',value:90},omelette:{name:'Omelette',icon:'🍳',value:110},popcorn:{name:'Popcorn',icon:'🍿',value:65},pancake:{name:'Pancakes',icon:'🥞',value:135},juice:{name:'Orange juice',icon:'🧃',value:120},applejuice:{name:'Apple juice',icon:'🧃',value:90},smoothie:{name:'Berry smoothie',icon:'🥤',value:175},cake:{name:'Berry cake',icon:'🍰',value:240},pie:{name:'Apple pie',icon:'🥧',value:190},cookies:{name:'Cookies',icon:'🍪',value:175},soup:{name:'Vegetable soup',icon:'🍲',value:190},ketchup:{name:'Ketchup',icon:'🥫',value:150},stew:{name:'Truffle stew',icon:'🥘',value:280},ricebowl:{name:'Rice bowl',icon:'🍚',value:220},jam:{name:'Berry jam',icon:'🫙',value:220},tofu:{name:'Tofu',icon:'◻️',value:300}};
const ITEMS={...CROPS,...GOODS};
const BUILDINGS={store:{name:'Island store',sprite:0,size:2,level:1,cost:0,time:0},house:{name:'Cat cottage',sprite:1,size:2,level:1,cost:0,time:0},hen:{name:'Hen coop',sprite:2,size:2,level:1,cost:100,time:15,animal:'🐔',feed:'wheat',product:'egg',cycle:120,animalCost:40},cow:{name:'Cow shed',sprite:3,size:2,level:4,cost:350,time:60,animal:'🐄',feed:'clover',product:'milk',cycle:300,animalCost:120},sheep:{name:'Sheep paddock',sprite:4,size:2,level:10,cost:1600,time:180,animal:'🐑',feed:'corn',product:'wool',cycle:600,animalCost:350},pig:{name:'Pig pen',sprite:5,size:2,level:16,cost:3200,time:300,animal:'🐖',feed:'potato',product:'truffle',cycle:900,animalCost:600},bakery:{name:'Bakery',sprite:6,size:2,level:5,cost:200,time:60},dairy:{name:'Dairy',sprite:7,size:2,level:8,cost:2000,time:180},fryer:{name:'Frying kitchen',sprite:8,size:2,level:11,cost:2500,time:240},mixer:{name:'Juice kitchen',sprite:9,size:2,level:14,cost:3000,time:300},cakeoven:{name:'Cake kitchen',sprite:10,size:2,level:17,cost:5000,time:600},pot:{name:'Soup kitchen',sprite:11,size:2,level:20,cost:6500,time:900}};
const RECIPES={bread:{at:'bakery',level:5,need:{wheat:3},time:60},cornbread:{at:'bakery',level:6,need:{wheat:2,corn:2},time:120},bun:{at:'bakery',level:8,need:{wheat:2,milk:1},time:150},butter:{at:'dairy',level:8,need:{milk:2},time:180},cheese:{at:'dairy',level:9,need:{milk:3},time:240},cream:{at:'dairy',level:8,need:{milk:1},time:120},fries:{at:'fryer',level:11,need:{potato:3},time:180},omelette:{at:'fryer',level:11,need:{egg:3,milk:1},time:180},popcorn:{at:'fryer',level:11,need:{corn:3},time:120},pancake:{at:'fryer',level:12,need:{wheat:2,egg:2,milk:1},time:240},juice:{at:'mixer',level:14,need:{orange:3},time:180},applejuice:{at:'mixer',level:14,need:{apple:3},time:150},smoothie:{at:'mixer',level:15,need:{strawberry:2,milk:2},time:240},cake:{at:'cakeoven',level:17,need:{wheat:3,egg:2,strawberry:3},time:360},pie:{at:'cakeoven',level:17,need:{wheat:3,butter:1,apple:2},time:300},cookies:{at:'cakeoven',level:18,need:{wheat:3,butter:2},time:240},soup:{at:'pot',level:20,need:{carrot:2,potato:2,cabbage:1},time:360},ketchup:{at:'pot',level:20,need:{tomato:4},time:300},stew:{at:'pot',level:21,need:{truffle:2,potato:2,milk:1},time:480},ricebowl:{at:'pot',level:21,need:{rice:3,egg:1},time:300},jam:{at:'pot',level:22,need:{strawberry:4},time:420},tofu:{at:'pot',level:24,need:{soy:4},time:480}};
const TREES={apple:{name:'Apple tree',icon:'🌳',level:6,cost:160,time:600},orange:{name:'Orange tree',icon:'🌳',level:12,cost:320,time:900}};
const CAT_NAMES=['Mio','Mochi','Yuki','Nori','Sora','Biscuit','Momo','Kiki','Tofu','Lulu','Pip','Coco'];
const SAVE_KEY='mio-new-island-20261001-v1';
// One geography definition shared by ownership, travel, layouts and rendering.
// The second land keeps its original world anchor so existing routes and
// layouts remain meaningful, but its playable footprint is now a full warm
// expansion instead of the old dark 24 x 24 patch.  The outline is shared by
// ownership, hit testing, terrain masks and the renderer so no invisible
// rectangular land remains at the coast.
const SUNRISE_MAP={revision:2,geometryRevision:2,x:56,y:0,size:38,legacyX:24,previousX:40,bridgeY:6,bridgeWidth:2,
 outline:[[56,2],[60,-1],[67,0],[73,-2],[80,0],[86,-1],[91,3],[93,8],[92,13],[94,18],[91,24],[93,29],[88,34],[81,35],[75,37],[68,35],[62,37],[57,33],[55,28],[56,23],[54,19],[56,15],[55,11],[56,7]]};
// The painted Farm Land extends beyond the original paid-parcel grid. These
// are validation/search limits only; the visual grass mask decides which
// cells inside them are actually buildable.
const FARM_GREEN_BOUNDS={x1:-24,y1:-24,x2:40,y2:40};
function mapPointInPolygon(x,y,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [ax,ay]=points[i],[bx,by]=points[j];if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;}return inside;}
const inValley=(x,y)=>mapPointInPolygon(x+.5,y+.5,SUNRISE_MAP.outline);
// A single sampled river bed drives art, water collision, walking and presets.
// Widths are in map units, not screen pixels. No save/map-anchor migration:
// existing objects, jobs, cargo and progress keep their coordinates and IDs.
const SUNRISE_RIVER=(()=>{
 const controls=[[60.4,3.2,.52],[62,5.5,.62],[60.3,8.2,.62],[61.6,10.1,.73],[62,12.6,.85],[61.6,15,.92],[64.3,17.3,1.02],[67.4,18.65,1.12],[70.6,17.8,.92],[74,19,.97],[77.6,18.8,1.08],[80.4,18.7,.94],[81.3,20.3,.83],[82.4,21.4,1.18],[84.6,21,1.15],[87.4,23.4,1.25],[90.2,24.6,1.3],[93,26.4,1.62],[96,28.5,2.5]];
 const samples=[],steps=18,curve=(a,b,c,d,t)=>.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
 for(let i=0;i<controls.length-1;i++)for(let j=0;j<steps;j++){
  const a=controls[Math.max(0,i-1)],b=controls[i],c=controls[i+1],d=controls[Math.min(controls.length-1,i+2)],t=j/steps;
  const x=curve(a[0],b[0],c[0],d[0],t),y=curve(a[1],b[1],c[1],d[1],t),w=b[2]+(c[2]-b[2])*t;
  samples.push({x,y,w,u:i+t});
 }const last=controls.at(-1);samples.push({x:last[0],y:last[1],w:last[2],u:controls.length-1});
 let distance=0;for(let i=0;i<samples.length;i++){const p=samples[i],a=samples[Math.max(0,i-1)],b=samples[Math.min(samples.length-1,i+1)],dx=b.x-a.x,dy=b.y-a.y,n=Math.hypot(dx,dy)||1;p.nx=-dy/n;p.ny=dx/n;if(i)distance+=Math.hypot(p.x-a.x,p.y-a.y);p.distance=distance;p.left=p.w*(1+.075*Math.sin(p.u*5.3)+.04*Math.sin(p.u*13.7));p.right=p.w*(1+.09*Math.cos(p.u*4.1)+.035*Math.sin(p.u*17));}
 const edge=side=>samples.map(p=>[p.x+p.nx*p[side]*(side==='left'?1:-1),p.y+p.ny*p[side]*(side==='left'?1:-1)]),left=edge('left'),right=edge('right'),polygon=left.concat(right.slice().reverse());
 const wet=new Set(),waterAt=(x,y)=>wet.has(Math.floor(x)+','+Math.floor(y))&&mapPointInPolygon(x,y,polygon);
 // Conservative polygon/rectangle intersection: partial water footprints are
 // blocked, but a dry bank never inherits the old whole-row restriction.
 // Rasterize tiny mesh quads locally, rather than testing the entire map
 // against hundreds of polygon edges on every load (important on phones).
 for(let n=0;n<samples.length-1;n++){
  const quad=[left[n],left[n+1],right[n+1],right[n]],xs=quad.map(p=>p[0]),ys=quad.map(p=>p[1]);
  for(let x=Math.floor(Math.min(...xs));x<=Math.floor(Math.max(...xs));x++)for(let y=Math.floor(Math.min(...ys));y<=Math.floor(Math.max(...ys));y++){
   const key=x+','+y;if(wet.has(key))continue;
   let hit=[[x,y],[x+1,y],[x+1,y+1],[x,y+1],[x+.5,y+.5]].some(p=>mapPointInPolygon(...p,quad));
   for(let i=0;!hit&&i<quad.length;i++){
    const a=quad[i],b=quad[(i+1)%quad.length];let lo=0,hi=1;
    for(let axis=0;axis<2&&lo<=hi;axis++){const min=axis?y:x,max=min+1,d=b[axis]-a[axis];if(Math.abs(d)<1e-9){if(a[axis]<min||a[axis]>max){lo=2;break;}}else{const t1=(min-a[axis])/d,t2=(max-a[axis])/d;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2));}}
    hit=lo<=hi;
   }if(hit)wet.add(key);
  }
 }
 return {controls,samples,left,right,polygon,waterAt,length:distance,wet,falls:[{from:2,to:3,width:31},{from:12,to:13,width:39}],source:controls[0],mouth:controls.at(-1)};
})();
const sunriseRiverTile=(x,y)=>inValley(x,y)&&SUNRISE_RIVER.wet.has(Math.floor(x)+','+Math.floor(y));
const mainShore=s=>s.eastValley?40:Math.max(24,s.size+8);
// The west shoreline bends into the channel. A column alone cannot tell
// water from land: classify the same tile used by ownership and navigation.
const channelTile=(x,s,y)=>!!s.eastValley&&x>=mainShore(s)&&x<SUNRISE_MAP.x&&!(Number.isFinite(y)&&inValley(Math.floor(x),Math.floor(y)));
const sunriseBridgeTile=(x,y,s)=>channelTile(x,s,y)&&y>=SUNRISE_MAP.bridgeY&&y<SUNRISE_MAP.bridgeY+SUNRISE_MAP.bridgeWidth;
const SUNRISE_APPROACH=[[56.6,7],[56.9,10.3],[56.4,14],[55.7,18.5],[57.2,23],[60.4,26.1],[64.4,25.2],[68,23.8]];
function sunriseApproachTile(x,y){return SUNRISE_APPROACH.some((p,i)=>{if(!i)return false;const a=SUNRISE_APPROACH[i-1],dx=p[0]-a[0],dy=p[1]-a[1],t=Math.max(0,Math.min(1,((x+.5-a[0])*dx+(y+.5-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(x+.5-a[0]-dx*t,y+.5-a[1]-dy*t)<.58;});}
// Farm's original water artwork/bridge is independent of Second-Land geometry.
// Keep the save anchor/revisions fixed: the redesign never moves saved objects.
const SUNRISE_VOLCANIC=(()=>{
 const boundary=x=>10.2+1.2*Math.sin((x-58)*.25)+.55*Math.sin(x*.63);
 const contains=(x,y)=>mapPointInPolygon(x,y,SUNRISE_MAP.outline)&&y<boundary(x);
 const tiles=new Set();let total=0,water=0,open=0;
 for(let x=54;x<95;x++)for(let y=-2;y<38;y++)if(inValley(x,y)){
  total++;if([[.03,.03],[.97,.03],[.97,.97],[.03,.97],[.5,.5]].some(([dx,dy])=>contains(x+dx,y+dy)))tiles.add(x+','+y);
  else if(sunriseRiverTile(x,y))water++;else open++;
 }
 const edge=[];for(let x=54;x<=95;x+=.2)edge.push([x,boundary(x)]);
 return {boundary,contains,tiles,edge,cone:{x:80,y:5,width:1120,height:640},stats:{total,mountains:tiles.size,water,open,mountainFraction:tiles.size/total,openFraction:open/total}};
})();
const sunriseMountainTile=(x,y)=>inValley(x,y)&&SUNRISE_VOLCANIC.tiles.has(Math.floor(x)+','+Math.floor(y));
const SUNRISE_FERRY={farm:{x:39.5,y:7.5},island:{x:56.5,y:27.5}};

Object.assign(ITEMS,{wood:{name:'Wood',icon:'🪵',value:3},stone:{name:'Stone',icon:'🪨',value:3},iron:{name:'Iron',icon:'⛏️',value:8},plank:{name:'Plank',icon:'🪵',value:6},brick:{name:'Stone block',icon:'🧱',value:6},bench:{name:'Bench',icon:'🪑',value:30},path:{name:'Path tile',icon:'🪨',value:2}});

Object.assign(ITEMS,{fiber:{name:'Grass fiber',icon:'🌿',value:2},rope:{name:'Rope',icon:'🧶',value:10}});

const DECOR_SHOP={guesthouse:{name:'Guest cottage',cost:750,sprite:1,art:'building-1',size:2},woodfence:{name:'Wood fence',cost:35,sprite:0},silverfence:{name:'Silver fence',cost:150,sprite:1},goldfence:{name:'Gold fence',cost:350,sprite:2},gate:{name:'Garden gate',cost:120,sprite:3}};
const OUTFITS={hat:{name:'Straw hat',cost:80,sprite:4,slot:'hat'},vest:{name:'Blue farm vest',cost:120,sprite:5,slot:'vest'}};
for(const[k,d]of Object.entries(DECOR_SHOP))ITEMS[k]={name:d.name,icon:'🪵',value:Math.floor(d.cost/3)};

Object.assign(ITEMS,{perch:{name:'River perch',icon:'🐟',value:24},carp:{name:'Golden carp',icon:'🐠',value:48},pearl:{name:'River pearl',icon:'🦪',value:120},bait:{name:'Fishing bait',icon:'🪱',value:3},gem:{name:'Cave crystal',icon:'💎',value:90},grilledfish:{name:'Grilled fish',icon:'🍽️',value:90}});
RECIPES.grilledfish={at:'fryer',level:4,need:{perch:2},time:120};
const EXPEDITIONS={woods:{name:'Willow woods',level:2,cost:25,time:60,reward:{wood:8,fiber:5}},cave:{name:'Crystal cave',level:5,cost:70,time:120,reward:{stone:10,iron:3,gem:1}},islet:{name:'Shell island',level:8,cost:120,time:180,reward:{pearl:2,wood:8}}};
const PERSONALITIES=['Curious','Gentle','Energetic','Thoughtful'];

const LIFE_BUILDINGS={bees:{name:'Bee garden',sprite:0,cost:260,level:3,need:{wood:8},input:{clover:2},output:'honey',count:2,time:90},ducks:{name:'Duck pond',sprite:1,cost:320,level:4,need:{stone:8,wood:5},input:{wheat:2},output:'duckegg',count:2,time:100},greenhouse:{name:'Greenhouse',sprite:2,cost:600,level:6,need:{plank:10,brick:5},input:{fiber:3},output:'herb',count:3,time:120},cafe:{name:'Cat café',sprite:3,cost:700,level:7,need:{plank:10,brick:8},input:{bread:2,milk:1},output:'cafeticket',count:1,time:90},water:{name:'Water tower',sprite:4,cost:240,level:3,need:{wood:8,iron:2},input:{},output:null,count:0,time:0}};
Object.assign(ITEMS,{honey:{name:'Honey',icon:'🍯',value:35},duckegg:{name:'Duck egg',icon:'🥚',value:24},herb:{name:'Garden herbs',icon:'🌿',value:35},cafeticket:{name:'Café earnings voucher',icon:'☕',value:150},compost:{name:'Compost',icon:'🌱',value:4}});
for(const[k,d]of Object.entries(LIFE_BUILDINGS))BUILDINGS[k]={...d,sprite:0,size:2,time:30,life:true};
const VILLAGE_MILESTONES=[{id:'restore',name:'Repair the old cottage',reward:100,test:()=>S.village.restoration>=1},{id:'farmer',name:'Harvest 25 fields',reward:120,test:()=>S.stats.harvest>=25},{id:'trader',name:'Serve 15 customers',reward:180,test:()=>S.stats.served>=15},{id:'fisher',name:'Catch 5 fish',reward:160,test:()=>S.village.fishCaught>=5},{id:'explorer',name:'Bring back 12 exploration finds',reward:200,test:()=>S.life.explored>=12},{id:'village',name:'Build 10 buildings',reward:300,test:()=>S.buildings.length>=10}];

Object.assign(ITEMS,{honeybun:{name:'Honey bun',icon:'🥐',value:115},herbomelette:{name:'Herb omelette',icon:'🍳',value:140},herbaltea:{name:'Herbal tea',icon:'🍵',value:115}});
Object.assign(RECIPES,{honeybun:{at:'bakery',level:6,need:{wheat:2,honey:1},time:140},herbomelette:{at:'fryer',level:11,need:{duckegg:2,herb:1},time:180},herbaltea:{at:'mixer',level:14,need:{herb:2,honey:1},time:120}});

const CRAFT_DURATIONS={rope:15,plank:25,brick:25,bench:45,path:15,bait:10,compost:20,claybrick:30,woodenbeam:35,rooftile:30,metalhardware:35,concreteblock:45};

Object.assign(DECOR_SHOP,{
 planter:{name:'Flower planter',cost:110,art:'market-0',size:1,category:'garden',description:'Place, water and wait 90 seconds. Collect 2 flowers for bouquets, tea and gifts; a cat delivers them to the barn.'},
 lamp:{name:'Village lantern',cost:140,art:'market-1',size:1,category:'garden',description:'A warm light for evening paths. Tap to switch it on or off.'},
 fountain:{name:'Stone fountain',cost:380,art:'market-2',size:2,category:'garden',description:'A daily gathering gives every cat 3 affection.'},
 picnic:{name:'Picnic table',cost:220,art:'market-3',size:2,category:'garden',description:'Share bread and milk once a day for 5 friendship per cat.'},
 signpost:{name:'Village signpost',cost:55,art:'market-4',size:1,category:'garden',description:'Open the farm overview from anywhere you place a sign.'},
 arch:{name:'Flower garden arch',cost:280,art:'market-5',size:1,category:'garden',description:'A welcoming entrance. Walk through it like a gate.'}
});
for(const[k,d]of Object.entries(DECOR_SHOP))ITEMS[k] ||= {name:d.name,icon:'🏡',value:Math.floor(d.cost/3)};

ITEMS.flower={name:'Garden flowers',icon:'🌸',value:12};

const ROOM_ITEMS={flowers:{name:'Flower corner',art:'market-0',coins:90,need:{wood:4}},lantern:{name:'Reading lantern',art:'market-1',coins:120,need:{iron:2}},table:{name:'Family table',art:'market-3',coins:180,need:{plank:6}},bench:{name:'Window bench',art:'resource-7',coins:100,need:{plank:4}}};
const CHAPTERS=[
 {name:'A place to call home',text:'Repair the cottage and share your first harvest with the village.',coins:120,goods:{wood:8},goals:[['harvest',6,'Harvest fields'],['restoration',1,'Restore the cottage'],['served',3,'Serve customers']]},
 {name:'New neighbours',text:'Make a comfortable home for your animals.',coins:180,goods:{clover:6},goals:[['animals',12,'Collect animal goods'],['cow',1,'Build a cow shed'],['served',10,'Serve customers']]},
 {name:'The working village',text:'Turn ingredients into goods and keep deliveries moving.',coins:250,goods:{plank:6},goals:[['cooked',10,'Cook products'],['deliveries',20,'Complete deliveries'],['bakery',1,'Build a bakery']]},
 {name:'Beyond the river',text:'Catch fish and bring useful finds back from your journeys.',coins:300,goods:{bait:6},goals:[['pier',1,'Build the fishing pier'],['fishCaught',10,'Catch fish'],['explored',20,'Collect exploration finds']]},
 {name:'A greener farm',text:'Grow herbs, care for bees and irrigate your fields.',coins:400,goods:{compost:8},goals:[['water',1,'Build a water tower'],['greenhouse',1,'Build a greenhouse'],['bees',1,'Build a bee garden']]},
 {name:'Friends at home',text:'Welcome helpers, decorate the village and get to know your cats.',coins:500,goods:{flower:6},goals:[['cats',6,'Welcome cats'],['decor',8,'Place decorations'],['bonds',3,'Reach friendship rank 1 with cats']]},
 {name:'Market day',text:'Make your store a destination for the whole island.',coins:650,goods:{brick:10},goals:[['discoveries',35,'Discover goods'],['store',2,'Upgrade store twice'],['restoration',2,'Finish cottage restoration']]},
 {name:'Mew Harvest village',text:'Your old farm has become a village. Keep shaping it your way.',coins:1000,goods:{gem:5},goals:[['buildings',15,'Construct buildings'],['parcels',8,'Unlock meadow plots'],['served',100,'Serve customers']]}
];

Object.assign(ITEMS,{rabbitfur:{name:'Brushed rabbit fluff',icon:'🧶',value:42},bouquet:{name:'Flower bouquet',icon:'💐',value:95},garland:{name:'Flower garland',icon:'🌼',value:135},wreath:{name:'Flower wreath',icon:'🌺',value:160},carrotcake:{name:'Carrot cake',icon:'🍰',value:220},honeyyogurt:{name:'Honey yogurt',icon:'🍨',value:150},creamsoup:{name:'Creamy corn soup',icon:'🍲',value:185},flowertea:{name:'Floral orange tea',icon:'🌸',value:135}});
BUILDINGS.florist={name:'Flower boutique',sprite:12,art:'coast-0',size:2,level:6,cost:550,time:45};
BUILDINGS.rabbit={name:'Rabbit garden',sprite:13,art:'coast-1',size:2,level:7,cost:650,time:60,animal:'🐇',feed:'carrot',product:'rabbitfur',cycle:240,animalCost:90};
Object.assign(RECIPES,{bouquet:{at:'florist',level:6,need:{flower:4,fiber:2},time:90},garland:{at:'florist',level:8,need:{flower:6,rope:1},time:150},wreath:{at:'florist',level:10,need:{flower:6,wood:2},time:180},carrotcake:{at:'cakeoven',level:17,need:{carrot:2,wheat:2,egg:1},time:270},honeyyogurt:{at:'dairy',level:8,need:{milk:2,honey:1},time:180},creamsoup:{at:'pot',level:20,need:{corn:2,cream:1},time:240},flowertea:{at:'mixer',level:14,need:{flower:2,orange:1,honey:1},time:150}});
Object.assign(DECOR_SHOP,{shellgarden:{name:'Seashell garden',cost:150,art:'coast-5',size:1,category:'garden',description:'A small coastal garden for your village.'},flowercorner:{name:'Flower corner',cost:180,art:'market-0',size:1,category:'garden',description:'A flowering corner with room to grow four flowers.'},rabbitstatue:{name:'Rabbit ornament',cost:95,art:'coast-2',size:1,category:'garden',description:'A little garden ornament. Living rabbits have their own home.'}});
for(const[k,d]of Object.entries(DECOR_SHOP))ITEMS[k] ||= {name:d.name,icon:'🌸',value:Math.floor(d.cost/3)};

// Riverside market expansion.
BUILDINGS.icecream={name:'Ice-cream kitchen',art:'new-0',size:2,level:9,cost:800,time:60};
BUILDINGS.goat={name:'Goat meadow',art:'new-1',size:2,level:8,cost:720,time:60,animal:'🐐',feed:'clover',product:'goatmilk',cycle:210,animalCost:110};
Object.assign(ITEMS,{goatmilk:{name:'Goat milk',icon:'🥛',value:38},honeyice:{name:'Honey ice cream',icon:'🍨',value:145},berryice:{name:'Strawberry ice cream',icon:'🍓',value:165},goatcheese:{name:'Goat cheese',icon:'🧀',value:125}});
Object.assign(RECIPES,{honeyice:{at:'icecream',level:9,need:{milk:2,honey:1},time:180},berryice:{at:'icecream',level:10,need:{milk:2,strawberry:2},time:210},goatcheese:{at:'dairy',level:8,need:{goatmilk:3},time:180}});
Object.assign(DECOR_SHOP,{bicycle:{name:'Basket bicycle',cost:320,art:'new-3',size:1,category:'garden',description:'A parked village bicycle with a basket. Place it beside your cottage or shop.'},flowerbarrow:{name:'Flower wheelbarrow',cost:190,art:'new-4',size:1,category:'garden',description:'A colourful flower display for garden paths.'},parcelcart:{name:'Market parcel cart',cost:240,art:'new-5',size:1,category:'garden',description:'A decorative goods cart for your market square.'}});
for(const[k,d]of Object.entries(DECOR_SHOP))ITEMS[k] ||= {name:d.name,icon:'🏡',value:Math.floor(d.cost/3)};
const LEGACY_RECIPE_LEVELS=Object.fromEntries(Object.entries(RECIPES).map(([k,r])=>[k,r.level]));
Object.assign(BUILDINGS.rabbit,{level:22,cost:4200,time:300});
Object.assign(BUILDINGS.florist,{level:25,cost:6200,time:480});
Object.assign(BUILDINGS.goat,{level:28,cost:8500,time:600});
Object.assign(BUILDINGS.icecream,{level:32,cost:12000,time:900});
Object.assign(RECIPES.bouquet,{level:25});Object.assign(RECIPES.garland,{level:26});Object.assign(RECIPES.wreath,{level:30});
Object.assign(RECIPES.goatcheese,{level:28});Object.assign(RECIPES.honeyice,{level:32});Object.assign(RECIPES.berryice,{level:33});
// The brief confirms premium levels, not recipe names. These connected recipes fill them.
Object.assign(ITEMS,{
 honeylayer:{name:'Honey layer cake',icon:'🍰',value:520},festivalwreath:{name:'Festival wreath',icon:'🌺',value:470},
 trufflegratin:{name:'Truffle & goat gratin',icon:'🥘',value:640},icecake:{name:'Berry ice-cream cake',icon:'🍨',value:850},
 harvesthamper:{name:'Harvest gift hamper',icon:'🎁',value:980}
});
Object.assign(RECIPES,{
 honeylayer:{at:'cakeoven',level:35,need:{wheat:5,butter:2,honey:3,egg:2},time:720},
 festivalwreath:{at:'florist',level:38,need:{bouquet:2,rope:2,flower:8},time:780},
 trufflegratin:{at:'pot',level:42,need:{truffle:3,goatcheese:2,potato:4,herb:2},time:900},
 icecake:{at:'icecream',level:45,need:{cake:1,berryice:2,cream:2},time:1080},
 harvesthamper:{at:'florist',level:48,need:{honeylayer:1,bouquet:2,apple:4,rope:2},time:1200}
});

// Connected shop expansion. Existing crops, trees, supplies, decorations and
// outfits above remain the canonical entries; this block only adds things that
// did not already have a usable equivalent.
Object.assign(CROPS,{
 blueberry:{name:'Blueberry',icon:'🫐',level:14,seconds:4200,cost:14,value:62,seedOnly:true,sprite:6},
 watermelon:{name:'Watermelon',icon:'🍉',level:17,seconds:6000,cost:18,value:86,seedOnly:true,sprite:7},
 pumpkin:{name:'Pumpkin',icon:'🎃',level:19,seconds:8400,cost:22,value:105,seedOnly:true,sprite:8},
 chili:{name:'Chili',icon:'🌶️',level:22,seconds:9600,cost:25,value:120,seedOnly:true,sprite:9},
 garlic:{name:'Garlic',icon:'🧄',level:24,seconds:10800,cost:28,value:135,seedOnly:true,sprite:10},
 onion:{name:'Onion',icon:'🧅',level:26,seconds:12000,cost:31,value:150,seedOnly:true,sprite:11},
 rose:{name:'Rose',icon:'🌹',level:16,seconds:4800,cost:16,value:72,seedOnly:true,sprite:12},
 tulip:{name:'Tulip',icon:'🌷',level:18,seconds:5400,cost:18,value:82,seedOnly:true,sprite:13},
 daisy:{name:'Daisy',icon:'🌼',level:12,seconds:3600,cost:12,value:58,seedOnly:true,sprite:14},
 lavender:{name:'Lavender',icon:'💜',level:20,seconds:6600,cost:21,value:98,seedOnly:true,sprite:15},
 hibiscus:{name:'Hibiscus',icon:'🌺',level:23,seconds:7800,cost:24,value:118,seedOnly:true,sprite:12},
 lotus:{name:'Lotus',icon:'🪷',level:27,seconds:9000,cost:29,value:145,seedOnly:true,sprite:13}
});
Object.assign(ITEMS,CROPS);
Object.assign(TREES,{
 mango:{name:'Mango sapling',icon:'🥭',level:18,cost:500,time:1050},
 coconut:{name:'Coconut sapling',icon:'🥥',level:20,cost:580,time:1200},
 peach:{name:'Peach sapling',icon:'🍑',level:22,cost:650,time:1200},
 lemon:{name:'Lemon sapling',icon:'🍋',level:24,cost:720,time:1350},
 cherry:{name:'Cherry sapling',icon:'🍒',level:26,cost:800,time:1500},
 pear:{name:'Pear sapling',icon:'🍐',level:28,cost:900,time:1650},
 grape:{name:'Grape vine',icon:'🍇',level:30,cost:980,time:1500},
 pine:{name:'Pine sapling',icon:'🌲',level:10,cost:240,time:780},
 bamboo:{name:'Bamboo sapling',icon:'🎋',level:15,cost:380,time:900}
});
Object.assign(ITEMS,{
 blueberry:{name:'Blueberries',icon:'🫐',value:62},watermelon:{name:'Watermelon',icon:'🍉',value:86},pumpkin:{name:'Pumpkin',icon:'🎃',value:105},chili:{name:'Chili',icon:'🌶️',value:120},garlic:{name:'Garlic',icon:'🧄',value:135},onion:{name:'Onion',icon:'🧅',value:150},
 mango:{name:'Mango',icon:'🥭',value:75},coconut:{name:'Coconut',icon:'🥥',value:82},peach:{name:'Peach',icon:'🍑',value:88},lemon:{name:'Lemon',icon:'🍋',value:70},cherry:{name:'Cherries',icon:'🍒',value:96},pear:{name:'Pear',icon:'🍐',value:78},grape:{name:'Grapes',icon:'🍇',value:92},pine:{name:'Pine cones',icon:'🌲',value:40},bamboo:{name:'Bamboo',icon:'🎋',value:46},
 mushroom:{name:'Forest mushrooms',icon:'🍄',value:74},hardwood:{name:'Hardwood',icon:'🪵',value:14},concreteblock:{name:'Concrete block',icon:'◼️',value:22},rooftile:{name:'Roof tiles',icon:'🏠',value:18},woodenbeam:{name:'Wooden beams',icon:'🪵',value:20},claybrick:{name:'Clay bricks',icon:'🧱',value:16},rawclay:{name:'Raw clay',icon:'🟤',value:8},ironparts:{name:'Iron parts',icon:'⚙️',value:18},metalhardware:{name:'Metal hardware',icon:'🔩',value:22},machineparts:{name:'Machine parts',icon:'🛠️',value:30},toolparts:{name:'Tool parts',icon:'🔧',value:25},boat_supply_kit:{name:'Boat Supply Kit',icon:'🛶',value:100},dock_upgrade_parts:{name:'Dock Upgrade Parts',icon:'⚓',value:120},
 premium_feed:{name:'Premium feed',icon:'🌟',value:45},hay_bale:{name:'Hay bale',icon:'🌾',value:28},animal_treat:{name:'Animal treat',icon:'🍎',value:32},chicken_nest:{name:'Chicken nest',icon:'🪺',value:40},cow_brush:{name:'Cow brush',icon:'🧹',value:48},goat_brush:{name:'Goat brush',icon:'🧹',value:48},
 premium_bait:{name:'Premium bait',icon:'✨',value:14},special_bait:{name:'Special bait',icon:'🪲',value:24},fishing_hook:{name:'Fishing hook',icon:'🪝',value:30},fishing_net:{name:'Fishing net',icon:'🕸️',value:60},tackle_box:{name:'Tackle box',icon:'🧰',value:85},fish_bucket:{name:'Fish bucket',icon:'🪣',value:45},
 builder_toolkit:{name:'Builder toolkit',icon:'🧰',value:100},repair_kit:{name:'Repair kit',icon:'🩹',value:75},carpenter_kit:{name:'Carpenter kit',icon:'🔨',value:95},workshop_upgrade_kit:{name:'Workshop upgrade kit',icon:'🛠️',value:180},maintenance_kit:{name:'Maintenance kit',icon:'🔩',value:80},sprinkler:{name:'Sprinkler',icon:'💦',value:130},irrigation_parts:{name:'Irrigation parts',icon:'🚿',value:75},water_tank:{name:'Water tank',icon:'🛢️',value:150},seed_tray:{name:'Seed tray',icon:'🌱',value:55},
 explorer_map:{name:'Explorer map',icon:'🗺️',value:55},compass:{name:'Compass',icon:'🧭',value:65},explorer_bag:{name:'Explorer bag',icon:'🎒',value:75},cave_lantern:{name:'Cave lantern',icon:'🏮',value:70},mining_supply_pack:{name:'Mining supply pack',icon:'⛏️',value:110},foraging_basket:{name:'Foraging basket',icon:'🧺',value:65},treasure_map_piece:{name:'Treasure map piece',icon:'📜',value:90},old_exploration_key:{name:'Old exploration key',icon:'🗝️',value:120},
 watermelonjuice:{name:'Watermelon juice',icon:'🧃',value:210},blueberryjam:{name:'Blueberry jam',icon:'🫙',value:245},pumpkinpie:{name:'Pumpkin pie',icon:'🥧',value:300},spicysauce:{name:'Spicy sauce',icon:'🌶️',value:280},mushroomstew:{name:'Mushroom stew',icon:'🍲',value:260}
});
Object.assign(RECIPES,{
 watermelonjuice:{at:'mixer',level:17,need:{watermelon:2},time:240},blueberryjam:{at:'pot',level:22,need:{blueberry:4},time:420},pumpkinpie:{at:'cakeoven',level:24,need:{pumpkin:2,wheat:3,egg:1},time:480},spicysauce:{at:'pot',level:26,need:{chili:3,garlic:1,onion:1},time:420},mushroomstew:{at:'pot',level:24,need:{mushroom:3,carrot:1,onion:1},time:420}
});

// Decorations reuse the established art language and remain fully placeable.
Object.assign(DECOR_SHOP,{
 hangingplant:{name:'Hanging plant',cost:130,art:'market-0',size:1,category:'garden',description:'A leafy hanging plant for a cottage path.'},waterlily:{name:'Water lily',cost:145,art:'market-0',size:1,category:'garden',description:'A water garden accent.'},decorativecactus:{name:'Decorative cactus',cost:155,art:'market-1',size:1,category:'garden',description:'A hardy potted garden accent.'},windowflowerbox:{name:'Window flower box',cost:175,art:'market-0',size:1,category:'garden',description:'A bright flower box for the cottage.'},
 birdhouse:{name:'Bird house',cost:120,art:'market-4',size:1,category:'garden',description:'A small shelter that makes a garden feel lived in.'},birdbath:{name:'Bird bath',cost:165,art:'market-2',size:1,category:'garden',description:'A quiet water feature for the garden.'},butterflyhouse:{name:'Butterfly house',cost:190,art:'market-0',size:1,category:'garden',description:'A colourful garden shelter for butterflies.'},campfire:{name:'Campfire',cost:180,art:'market-1',size:1,category:'garden',description:'A cosy gathering place for evening paths.'},pathlights:{name:'Path lights',cost:210,art:'market-1',size:1,category:'garden',description:'Small lights for a safe, welcoming path.'},festivalflags:{name:'Festival flags',cost:220,art:'market-5',size:1,category:'seasonal',description:'Bright flags for village celebrations.'},festivalgarland:{name:'Festival garland',cost:240,art:'market-5',size:1,category:'seasonal',description:'A festive garden garland.'},festival_lanterns:{name:'Festival lanterns',cost:260,art:'market-1',size:1,category:'seasonal',description:'Lanterns for seasonal evenings.'},gardenhedge:{name:'Garden hedge',cost:200,art:'market-0',size:1,category:'garden',description:'A leafy border for paths and fields.'},riverstones:{name:'River stones',cost:95,art:'resource-4',size:1,category:'garden',description:'A natural stone border.'},fieldborder:{name:'Field border',cost:105,art:'resource-4',size:1,category:'garden',description:'A neat border around a growing field.'},
 handcart:{name:'Hand cart',cost:240,art:'new-5',size:1,category:'transport',description:'A parked cart for the market yard.'},merchantcart:{name:'Merchant cart',cost:320,art:'new-5',size:1,category:'transport',description:'A market cart for trading days.'},deliverycrate:{name:'Delivery crate',cost:110,art:'new-5',size:1,category:'transport',description:'A crate display for the delivery yard.'},producecrate:{name:'Produce crate',cost:100,art:'new-5',size:1,category:'transport',description:'A colourful crate for harvested goods.'},smallrowboat:{name:'Small rowboat',cost:420,art:'new-3',size:1,category:'transport',description:'A little boat beside the river.'}
});
for(const[k,d]of Object.entries(DECOR_SHOP))ITEMS[k] ||= {name:d.name,icon:'🏡',value:Math.floor(d.cost/3)};

// Shop entries are data-driven so the existing category UI can render useful
// purchases without inventing separate inventory systems for every category.
const SHOP_CATALOG={};
const shopEntry=(id,d)=>SHOP_CATALOG[id]={id,...d};
for(const [crop,name] of [['blueberry','Blueberry Seeds'],['watermelon','Watermelon Seeds'],['pumpkin','Pumpkin Seeds'],['chili','Chili Seeds'],['garlic','Garlic Seeds'],['onion','Onion Seeds'],['rose','Rose Seeds'],['tulip','Tulip Seeds'],['daisy','Daisy Seeds'],['lavender','Lavender Seeds'],['hibiscus','Hibiscus Seeds'],['lotus','Lotus Seeds']])shopEntry(crop+'_seeds',{name,icon:CROPS[crop].icon,category:'seeds',kind:'seed',crop,count:5,cost:CROPS[crop].cost*3,level:CROPS[crop].level,purpose:'Plant '+CROPS[crop].name+' in a field.'});
shopEntry('herb_starter_pack',{name:'Herb starter pack',icon:'🌿',category:'seeds',kind:'item',item:'herb',count:3,cost:120,level:14,purpose:'Starter herbs for tea and omelettes.'});
shopEntry('mushroom_grow_kit',{name:'Mushroom grow kit',icon:'🍄',category:'seeds',kind:'item',item:'mushroom',count:3,cost:180,level:20,purpose:'Grow mushrooms for the kitchen.'});
for(const [tree,name] of [['mango','Mango Sapling'],['coconut','Coconut Sapling'],['peach','Peach Sapling'],['lemon','Lemon Sapling'],['cherry','Cherry Sapling'],['pear','Pear Sapling'],['grape','Grape Vine'],['pine','Pine Sapling'],['bamboo','Bamboo Sapling']])shopEntry(tree+'_sapling',{name,icon:TREES[tree].icon,category:'trees',kind:'tree',tree,count:1,cost:TREES[tree].cost,level:TREES[tree].level,purpose:'Plant a fruiting tree on the farm.'});
for(const [item,name,cost,level] of [['hardwood','Hardwood',70,8],['concreteblock','Concrete Block',110,16],['rooftile','Roof Tiles',90,12],['woodenbeam','Wooden Beams',95,12],['claybrick','Clay Bricks',80,10],['rawclay','Raw Clay',45,8],['ironparts','Iron Parts',80,14],['metalhardware','Metal Hardware',105,18],['machineparts','Machine Parts',150,24],['toolparts','Tool Parts',120,16]])shopEntry(item,{name,icon:ITEMS[item].icon,category:'materials',kind:'item',item,count:2,cost,level,purpose:'Crafting and building material.'});
for(const [item,name,cost,level,count] of [['premium_feed','Premium Feed',120,12,4],['hay_bale','Hay Bale',80,8,3],['animal_treat','Animal Treat',90,14,3],['chicken_nest','Chicken Nest',100,10,1],['cow_brush','Cow Brush',130,12,1],['goat_brush','Goat Brush',145,20,1]])shopEntry(item,{name,icon:ITEMS[item].icon,category:'animal',kind:'item',item,count,cost,level,purpose:'Care for animals and improve reliable production.'});
for(const [item,name,cost,level,count] of [['premium_bait','Premium Bait',75,8,5],['special_bait','Special Bait',140,16,4],['fishing_hook','Fishing Hook',90,10,1],['fishing_net','Fishing Net',180,18,1],['tackle_box','Tackle Box',240,22,1],['fish_bucket','Fish Bucket',120,12,1]])shopEntry(item,{name,icon:ITEMS[item].icon,category:'fishing',kind:'item',item,count,cost,level,purpose:'Fishing equipment for better catches.'});
shopEntry('pondplants',{name:'Pond Plants',icon:'🌿',category:'fishing',kind:'decor',decor:'waterlily',cost:160,level:14,purpose:'Place a water garden accent beside the farm pond.'});
shopEntry('ponddecoration',{name:'Pond Decoration',icon:'🐟',category:'fishing',kind:'decor',decor:'birdbath',cost:220,level:18,purpose:'Place a small water feature beside the pond.'});
shopEntry('boat_supply_kit',{name:'Boat Supply Kit',icon:'🛶',category:'transport',kind:'item',item:'boat_supply_kit',count:1,cost:210,level:8,purpose:'Substitutes for wood and rope when building the fishing pier.'});
shopEntry('dock_upgrade_parts',{name:'Dock Upgrade Parts',icon:'⚓',category:'transport',kind:'item',item:'dock_upgrade_parts',count:1,cost:260,level:18,purpose:'A dock supply crate for the fishing pier.'});
for(const [item,name,cost,level] of [['builder_toolkit','Builder Toolkit',220,10],['repair_kit','Repair Kit',150,8],['carpenter_kit','Carpenter Kit',190,14],['workshop_upgrade_kit','Workshop Upgrade Kit',380,24],['maintenance_kit','Maintenance Kit',160,16],['sprinkler','Sprinkler',260,18],['irrigation_parts','Irrigation Parts',140,14],['water_tank','Water Tank',320,20],['seed_tray','Seed Tray',120,12]])shopEntry(item,{name,icon:ITEMS[item].icon,category:'tools',kind:'item',item,count:1,cost,level,purpose:'A reusable farm improvement or a construction shortcut.'});
for(const [item,name,cost,level] of [['explorer_map','Explorer Map',120,5],['compass','Compass',150,8],['explorer_bag','Explorer Bag',180,10],['cave_lantern','Cave Lantern',200,12],['mining_supply_pack','Mining Supply Pack',260,16],['foraging_basket','Foraging Basket',150,8],['treasure_map_piece','Treasure Map Piece',300,22],['old_exploration_key','Old Exploration Key',420,30]])shopEntry(item,{name,icon:ITEMS[item].icon,category:'exploration',kind:'item',item,count:1,cost,level,purpose:'Consumed by expeditions to improve their cost, time or haul.'});

// The first two pieces predate the data-driven wardrobe and keep their save
// IDs/properties intact. New pieces are lightweight vector garments rendered on
// top of each cat's existing appearance.
Object.assign(OUTFITS,{
 farmer_outfit:{name:'Farmer Outfit',cost:220,slot:'body',category:'clothing',level:3,style:'overalls',color:'blue'},chef_hat:{name:'Chef Hat',cost:260,slot:'head',category:'clothing',level:11,style:'chefHat',color:'white'},fisher_hat:{name:'Fisher Hat',cost:280,slot:'head',category:'clothing',level:14,style:'fisherHat',color:'blue'},miner_helmet:{name:'Miner Helmet',cost:340,slot:'head',category:'clothing',level:18,style:'minerHelmet',color:'yellow'},festival_hat:{name:'Festival Hat',cost:300,slot:'head',category:'clothing',level:20,style:'festivalHat',color:'pink'},winter_hat:{name:'Winter Hat',cost:360,slot:'head',category:'clothing',level:28,style:'winterHat',color:'red'},flower_crown:{name:'Flower Crown',cost:330,slot:'head',category:'clothing',level:22,style:'flowerCrown',color:'pink'},cowboy_hat:{name:'Cowboy Hat',cost:380,slot:'head',category:'clothing',level:25,style:'cowboyHat',color:'brown'},rain_hood:{name:'Rain Hood',cost:300,slot:'head',category:'clothing',level:24,style:'rainHood',color:'yellow'},chef_outfit:{name:'Chef Outfit',cost:320,slot:'body',category:'clothing',level:12,style:'chefOutfit',color:'white'},fisher_outfit:{name:'Fisher Outfit',cost:340,slot:'body',category:'clothing',level:15,style:'fisherOutfit',color:'blue'},miner_outfit:{name:'Miner Outfit',cost:380,slot:'body',category:'clothing',level:19,style:'minerOutfit',color:'brown'},builder_outfit:{name:'Builder Outfit',cost:360,slot:'body',category:'clothing',level:16,style:'builderOutfit',color:'orange'},merchant_outfit:{name:'Merchant Outfit',cost:420,slot:'body',category:'clothing',level:24,style:'merchantOutfit',color:'purple'},delivery_outfit:{name:'Delivery Outfit',cost:400,slot:'body',category:'clothing',level:18,style:'deliveryOutfit',color:'green'},overalls:{name:'Overalls',cost:240,slot:'body',category:'clothing',level:4,style:'overalls',color:'blue'},raincoat:{name:'Raincoat',cost:390,slot:'body',category:'clothing',level:24,style:'raincoat',color:'yellow'},winter_coat:{name:'Winter Coat',cost:440,slot:'body',category:'clothing',level:28,style:'winterCoat',color:'red'},casual_shirt:{name:'Casual Shirt',cost:180,slot:'body',category:'clothing',level:5,style:'casualShirt',color:'green'},hoodie:{name:'Hoodie',cost:260,slot:'body',category:'clothing',level:10,style:'hoodie',color:'purple'},sweater:{name:'Sweater',cost:290,slot:'body',category:'clothing',level:14,style:'sweater',color:'orange'},festival_outfit:{name:'Festival Outfit',cost:460,slot:'body',category:'clothing',level:20,style:'festivalOutfit',color:'pink'},traditional_outfit:{name:'Island Festival Outfit',cost:500,slot:'body',category:'clothing',level:30,style:'traditionalOutfit',color:'purple'},scarf:{name:'Scarf',cost:160,slot:'neck',category:'accessory',level:5,style:'scarf',color:'red'},bow_tie:{name:'Bow Tie',cost:190,slot:'neck',category:'accessory',level:11,style:'bowTie',color:'black'},bandana:{name:'Bandana',cost:150,slot:'neck',category:'accessory',level:7,style:'bandana',color:'green'},collar:{name:'Collar',cost:120,slot:'neck',category:'accessory',level:3,style:'collar',color:'blue'},flower_necklace:{name:'Flower Necklace',cost:220,slot:'neck',category:'accessory',level:18,style:'flowerNecklace',color:'pink'},worker_backpack:{name:'Worker Backpack',cost:260,slot:'back',category:'accessory',level:8,style:'workerBackpack',color:'brown'},explorer_backpack:{name:'Explorer Backpack',cost:360,slot:'back',category:'accessory',level:12,style:'explorerBackpack',color:'green'},delivery_bag:{name:'Delivery Bag',cost:320,slot:'back',category:'accessory',level:18,style:'deliveryBag',color:'orange'},adventure_pack:{name:'Small Adventure Pack',cost:300,slot:'back',category:'accessory',level:10,style:'adventurePack',color:'blue'},work_gloves:{name:'Work Gloves',cost:170,slot:'accessory',category:'accessory',level:8,style:'workGloves',color:'brown'},boots:{name:'Boots',cost:200,slot:'accessory',category:'accessory',level:10,style:'boots',color:'brown'},glasses:{name:'Glasses',cost:180,slot:'accessory',category:'accessory',level:12,style:'glasses',color:'black'},round_glasses:{name:'Round Glasses',cost:210,slot:'accessory',category:'accessory',level:16,style:'roundGlasses',color:'black'},sunglasses:{name:'Sunglasses',cost:250,slot:'accessory',category:'accessory',level:20,style:'sunglasses',color:'black'}
});
for(const[k,d]of Object.entries(OUTFITS))if(d.category)shopEntry(k,{name:d.name,icon:d.slot==='head'?'🧢':d.slot==='body'?'👕':d.slot==='neck'?'🎀':d.slot==='back'?'🎒':'👓',category:d.slot==='head'||d.slot==='body'?'clothing':'accessories',kind:'outfit',outfit:k,count:1,cost:d.cost,level:d.level,purpose:'Wear it on any cat from the Wardrobe.'});
for(const[k,d]of Object.entries(ROOM_ITEMS))shopEntry('furniture_'+k,{name:d.name,icon:'🛋️',category:'furniture',kind:'room',room:k,count:1,cost:d.coins,level:1,purpose:'Place it inside the cat cottage for comfort and friendship.'});
const OUTFIT_COLORS=['red','blue','green','yellow','orange','purple','pink','black','white','brown'];
const OUTFIT_SETS={farmer:{name:'Farmer Set',pieces:{head:'hat',body:'overalls'}},chef:{name:'Chef Set',pieces:{head:'chef_hat',body:'chef_outfit'}},fisher:{name:'Fisher Set',pieces:{head:'fisher_hat',body:'fisher_outfit'}},miner:{name:'Miner Set',pieces:{head:'miner_helmet',body:'miner_outfit'}},builder:{name:'Builder Set',pieces:{body:'builder_outfit',accessory:'work_gloves'}},delivery:{name:'Delivery Set',pieces:{body:'delivery_outfit',back:'delivery_bag'}},rain:{name:'Rain Set',pieces:{head:'rain_hood',body:'raincoat'}},winter:{name:'Winter Set',pieces:{head:'winter_hat',body:'winter_coat',neck:'scarf'}},festival:{name:'Festival Set',pieces:{head:'festival_hat',body:'festival_outfit'}},explorer:{name:'Explorer Set',pieces:{back:'explorer_backpack'}}};

// Wardrobe refresh: replace designs in-place so every paid item remains owned.
const FASHION_REFRESH={
 hat:['City Cap','cap','blue'],vest:['Indigo Denim Jacket','denim','blue'],
 farmer_outfit:['Harvest Utility Jacket','utility','green'],chef_hat:['Cream Studio Beret','beret','white'],fisher_hat:['Coastal Bucket Hat','bucket','blue'],miner_helmet:['Slate Street Cap','cap','black'],festival_hat:['Rose Festival Beret','beret','pink'],winter_hat:['Cable Knit Beanie','beanie','red'],flower_crown:['Golden Leaf Tiara','crown','green'],cowboy_hat:['Suede Trail Fedora','fedora','brown'],rain_hood:['Sunshine Rain Bucket','bucket','yellow'],
 chef_outfit:['Atelier Apron Set','apron','white'],fisher_outfit:['Coastal Rugby Top','rugby','blue'],miner_outfit:['Midnight Biker Jacket','biker','black'],builder_outfit:['Canyon Utility Jacket','utility','orange'],merchant_outfit:['Plum Tailored Jacket','tailored','purple'],delivery_outfit:['Forest Varsity Jacket','varsity','green'],overalls:['Selvedge Denim Set','denim','blue'],raincoat:['Golden Rain Jacket','rainwear','yellow'],winter_coat:['Crimson Sherpa Jacket','sherpa','red'],casual_shirt:['Seafoam Polo','polo','green'],hoodie:['Lavender Pocket Hoodie','hoodie','purple'],sweater:['Amber Cable Knit','knit','orange'],festival_outfit:['Rose Satin Bomber','bomber','pink'],traditional_outfit:['Royal Embroidered Kurta','kurta','purple'],
 glasses:['Crystal Square Frames','squareFrames','black'],round_glasses:['Rose Cat-Eye Frames','catEye','pink'],sunglasses:['Gold Aviator Shades','aviator','brown'],
 scarf:['Woven Winter Scarf','scarf','red'],bow_tie:['Midnight Silk Bow','bowTie','black'],bandana:['Forest Scout Bandana','bandana','green'],collar:['Ocean Charm Collar','collar','blue'],flower_necklace:['Golden Petal Pendant','flowerNecklace','pink'],worker_backpack:['Canvas Daypack','workerBackpack','brown'],explorer_backpack:['Alpine Rucksack','explorerBackpack','green'],delivery_bag:['Tangerine Courier Pack','deliveryBag','orange'],adventure_pack:['Denim Mini Backpack','adventurePack','blue'],work_gloves:['Trail Grip Gloves','workGloves','brown'],boots:['City High-Top Shoes','boots','white']};
for(const [id,[name,style,color]] of Object.entries(FASHION_REFRESH)){
 Object.assign(OUTFITS[id],{name,style,color});
 if(SHOP_CATALOG[id])SHOP_CATALOG[id].name=name;
}
Object.entries(OUTFIT_SETS).forEach(([id,d])=>{d.name=({farmer:'Harvest Denim',chef:'Studio Cream',fisher:'Coastal Blue',miner:'Midnight Rider',builder:'Canyon Workwear',delivery:'Forest Varsity',rain:'Golden Rain',winter:'Crimson Winter',festival:'Rose Satin',explorer:'Alpine Explorer'})[id]||d.name;});
