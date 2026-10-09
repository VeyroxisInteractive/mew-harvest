'use strict';
// Extend existing production tables; no parallel inventory or duplicate shop.
Object.assign(CROPS,{cocoa:{name:'Cocoa',icon:'🍫',level:26,seconds:3600,cost:22,value:72,sprite:6}});
Object.assign(ITEMS,{cocoa:{name:'Cocoa',icon:'🍫',value:72},clay:{name:'Clay',icon:'🟤',value:16},ceramic:{name:'Ceramic vase',icon:'🏺',value:120},chocolate:{name:'Chocolate bar',icon:'🍫',value:150},trufflebox:{name:'Chocolate truffles',icon:'🎁',value:260},wovencloth:{name:'Woven cloth',icon:'🧵',value:100}});
const NEW_WORKSHOPS={feedmill:{name:'Animal Feed Mill',level:12,cost:1600,time:180,sprite:6,workStyle:'mill'},pottery:{name:'Pottery Workshop',level:20,cost:2600,time:240,sprite:7,workStyle:'pottery'},tailor:{name:'Tailor Studio',level:24,cost:3200,time:300,sprite:8,workStyle:'sewing'},chocolatier:{name:'Chocolate Kitchen',level:26,cost:4200,time:360,sprite:10,workStyle:'chocolate'}};
for(const [k,d]of Object.entries(NEW_WORKSHOPS))BUILDINGS[k]={...d,size:2,art:'workshop-'+k};
Object.assign(RECIPES,{hay_bale:{at:'feedmill',level:12,need:{wheat:3,clover:2},time:90},premium_feed:{at:'feedmill',level:16,need:{corn:3,soy:2},time:150},ceramic:{at:'pottery',level:20,need:{clay:4,wood:1},time:180},wovencloth:{at:'tailor',level:24,need:{wool:2,fiber:3},time:180},chocolate:{at:'chocolatier',level:26,need:{cocoa:3,milk:1},time:210},trufflebox:{at:'chocolatier',level:30,need:{chocolate:2,cream:1,honey:1},time:300}});
for(const [k,r]of Object.entries(RECIPES))if(NEW_WORKSHOPS[r.at])LEGACY_RECIPE_LEVELS[k]=r.level;
shopEntry('pottery_clay',{name:'Pottery clay · 5',icon:'🟤',category:'materials',kind:'item',item:'clay',count:5,cost:90,level:20,purpose:'Clay for your Pottery Workshop. Also found in cave expeditions.'});
// Retain old outfit ownership in saves, but remove invisible outfits from sale.
for(const [k,d]of Object.entries(SHOP_CATALOG))if(d.kind==='outfit')delete SHOP_CATALOG[k];
const TOWN_PROJECTS={park:{name:'Village Park',level:15,need:[{wood:15,stone:10},{plank:8,flower:10},{ceramic:2}],bonus:'A permanent +5 friendship for every current cat.'},school:{name:'Village School',level:25,need:[{brick:15,plank:12},{wovencloth:4,ceramic:3},{wood:20,rope:8}],bonus:'A permanent +10 farm and cooking skill for every current cat.'},townhall:{name:'Town Hall',level:35,need:[{brick:25,plank:20},{ceramic:5,wovencloth:6},{chocolate:8,flower:20}],bonus:'A one-time 2,000 coin village grant.'}};

for(const [k,d]of Object.entries(TOWN_PROJECTS))BUILDINGS['town_'+k]={name:d.name,level:d.level,cost:0,time:15,size:2,sprite:1,art:'town-'+k,project:k};
