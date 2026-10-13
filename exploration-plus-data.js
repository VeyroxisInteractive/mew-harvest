'use strict';
for(const key of ['reef','ruins'])if(EXPEDITIONS[key])throw Error('Duplicate region '+key);
EXPEDITIONS.reef={name:'Coral reef dive',level:35,cost:160,time:240,reward:{pearl:2,seashell:4}};
EXPEDITIONS.ruins={name:'Ancient Cat Ruins',level:45,cost:220,time:300,reward:{relicfragment:3,rawclay:5}};
if(ITEMS.divingkit)throw Error('Duplicate diving kit');
ITEMS.divingkit={name:'Dive air kit',icon:'🤿',value:0};


CRAFT_DURATIONS.divingkit=60;
