'use strict';
const BEE_VARIETIES={
 wildflowerhoney:{name:'Wildflower honey',icon:'🍯',value:95,level:18,need:{flower:3,clover:2},time:180},
 orchardhoney:{name:'Orchard honey',icon:'🍯',value:125,level:24,need:{apple:2,flower:2},time:240}
};
for(const [k,d]of Object.entries(BEE_VARIETIES)){if(ITEMS[k])throw Error('Duplicate honey: '+k);ITEMS[k]={name:d.name,icon:d.icon,value:d.value};}
for(const [k,d]of Object.entries({honeybutter:{name:'Wildflower honey butter',icon:'🧈',value:230,at:'dairy',level:35,need:{butter:1,wildflowerhoney:1},time:180},orchardtea:{name:'Orchard honey tea',icon:'🍵',value:190,at:'mixer',level:36,need:{herb:2,orchardhoney:1},time:150}})){
 if(ITEMS[k]||RECIPES[k])throw Error('Duplicate recipe: '+k);ITEMS[k]={name:d.name,icon:d.icon,value:d.value};RECIPES[k]={at:d.at,level:d.level,need:d.need,time:d.time};
}
const SCHOOL_SUBJECTS={farm:['Seed selection','Soil stewardship','Harvest planning'],cook:['Kitchen hygiene','Ingredient preparation','Batch planning'],haul:['Safe packing','Route reading','Delivery planning']};
