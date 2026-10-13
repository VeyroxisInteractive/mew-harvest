'use strict';
// Species absent from the original catalog only. Existing rabbit/sheep/goat IDs stay intact.
const HABITATS={
 alpaca:{name:'Alpaca Ranch',species:'alpaca',icon:'🦙',level:30,cost:4600,animalCost:650,feed:'clover',product:'alpacafleece',cycle:900,color:'#d7c3a0',water:false},
 turkey:{name:'Turkey Barn',species:'turkey',icon:'🦃',level:33,cost:4800,animalCost:500,feed:'corn',product:'turkeyfeather',cycle:720,color:'#916452',water:false},
 goose:{name:'Goose Lake',species:'goose',icon:'🪿',level:36,cost:5300,animalCost:580,feed:'wheat',product:'goosefeather',cycle:780,color:'#ede8d5',water:true},
 quail:{name:'Quail House',species:'quail',icon:'🐦',level:39,cost:5800,animalCost:620,feed:'wheat',product:'quailegg',cycle:600,color:'#ac8a65',water:false},
 peacock:{name:'Peacock Garden',species:'peacock',icon:'🦚',level:42,cost:6600,animalCost:800,feed:'corn',product:'peacockfeather',cycle:1200,color:'#377b86',water:false},
 silkworm:{name:'Silkworm House',species:'silkworm',icon:'🐛',level:46,cost:7500,animalCost:500,feed:'mulberryleaf',product:'silk',cycle:1000,color:'#e8dec0',water:false,allowHay:false},
 snail:{name:'Snail Garden',species:'snail',icon:'🐌',level:49,cost:7900,animalCost:350,feed:'cabbage',product:'compost',cycle:800,color:'#ab8261',water:false,allowHay:false},
 hatchery:{name:'Fish Hatchery',minAnimals:2,species:'carp',icon:'🐟',level:52,cost:9200,animalCost:800,feed:'premium_feed',product:'carp',cycle:1500,color:'#aa936f',water:true,allowHay:false},
 koi:{name:'Koi Garden',species:'koi',icon:'🐟',level:55,cost:10000,animalCost:950,feed:'premium_feed',product:'conservationtoken',cycle:1200,color:'#e2b26f',water:true,allowHay:false},
 turtle:{name:'Turtle Sanctuary',species:'turtle',icon:'🐢',level:58,cost:11000,animalCost:950,feed:'cabbage',product:'conservationtoken',cycle:1400,color:'#6e8650',water:true,allowHay:false},
 deer:{name:'Deer Meadow',species:'deer',icon:'🦌',level:64,cost:13000,animalCost:1200,feed:'clover',product:'conservationtoken',cycle:1600,color:'#be8754',water:false}
};
for(const [key,name,icon,value] of [
 ['alpacafleece','Alpaca fleece','🧶',140],['turkeyfeather','Turkey feathers','🪶',110],['goosefeather','Goose down','🪶',120],['quailegg','Quail eggs','🥚',105],['peacockfeather','Shed peacock feathers','🪶',190],['silk','Silk thread','🧵',180],['conservationtoken','Conservation token','🌿',0],['mulberryleaf','Mulberry leaves','🍃',24]
]){if(ITEMS[key])throw Error('Duplicate animal product '+key);ITEMS[key]={name,icon,value};}
TREES.mulberryleaf={name:'Mulberry tree',icon:'🌳',level:46,cost:680,time:600};
for(const [key,d]of Object.entries(HABITATS)){
 if(BUILDINGS[key])throw Error('Duplicate habitat '+key);
 BUILDINGS[key]={...d,animal:d.icon,size:2,time:240,sprite:4,art:'habitat-'+key};
}
