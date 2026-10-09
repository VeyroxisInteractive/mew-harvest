'use strict';
// Loaded before the engine so new items and optional saves validate on both entry paths.
const CAT_PROFILES=[
 ['bread','Morning baker','farm','I planted my first seed with you.','The kitchen smells like home.','I used to call this an island. Now I call it our home.'],
 ['honey','Sweet tooth','cook','You remembered my favourite treat!','I saved a sunny picnic spot for us.','Every harvest tastes better when we share it.'],
 ['milk','Quiet dreamer','haul','I found a quiet corner beside the river.','I no longer feel shy around our neighbours.','Even on rainy days, I know I belong here.'],
 ['perch','River explorer','haul','There are little fish under the bridge!','One day we should explore every shoreline.','My favourite adventure is coming home to you.'],
 ['apple','Sky watcher','farm','The orchard has the best cloud-watching spot.','Our trees have grown almost as much as our friendship.','I wish every cat could find a home like this.'],
 ['cookies','Cookie critic','cook','One day I will bake the perfect biscuit.','The secret ingredient might actually be patience.','I made this recipe especially for our family.'],
 ['flower','Garden artist','farm','A single flower can brighten a whole cottage.','I have been planning a garden just for you.','Our island is the most beautiful thing we made together.'],
 ['herbaltea','Bookish gardener','farm','I found a story about a forgotten valley.','Perhaps we can give that story a happier ending.','Someday someone will write a story about us.'],
 ['tofu','Thoughtful chef','cook','Good food begins with a little care.','I am learning everyone’s favourite meals.','There will always be a place for you at my table.'],
 ['strawberry','Picnic planner','haul','Shall we have a picnic when the crops are ready?','I invited all our neighbours this time.','Our family keeps growing, and so does my picnic blanket.'],
 ['carrot','Curious helper','farm','Look! Tiny footprints in the rabbit garden.','I helped our smallest neighbours settle in.','You taught me that little kindnesses make a big home.'],
 ['coconut','Coastal cook','cook','The sea breeze reminds me of faraway kitchens.','I brought a little coastal flavour to our café.','I do not need to travel far to find my favourite people.']
];
OUTFITS.friend_ribbon={name:'Friendship ribbon',cost:0,level:101,slot:'neck',style:'bowTie',color:'pink'};
OUTFITS.friend_crown={name:'Best-friend crown',cost:0,level:101,slot:'head',style:'flowerCrown',color:'yellow'};
const CUSTOMER_STORIES={
 Poppy:{role:'Orchard keeper',titles:['A basket for a neighbour','An orchard picnic','The opening day'],lines:['My orchard needs a fresh start. Your first deliveries gave me hope.','The neighbours are coming to see the new trees. Shall we share a picnic?','The orchard is open! I saved this little garden sign for your farm.'],needs:[{wheat:6},{apple:3,bread:2},{pie:1,flower:6}],levels:[1,6,17],decor:'orchardsign'},
 Boba:{role:'Aspiring baker',titles:['A first batch','The honey-bun experiment','A bakery of my own'],lines:['I have a tiny oven and a very big dream. Will you help with my first batch?','My new honey buns need a taste test. I trust your farm ingredients.','My bakery finally has a sign above the door. Thank you for believing in me.'],needs:[{wheat:6},{bread:3,honey:2},{honeybun:2,cookies:1}],levels:[1,6,18],decor:'bakerysign'},
 Pip:{role:'River guide',titles:['A riverside lunch','Learning the current','A welcome on the shore'],lines:['I am learning to guide visitors along the river. A packed lunch would help.','I know where the golden fish gather now. Let us celebrate a good catch.','The new river trail is ready. This lantern is a little thank-you.'],needs:[{wheat:6},{perch:3,bread:1},{grilledfish:2,rope:2}],levels:[1,5,11],decor:'riverlantern'},
 Maple:{role:'Village gardener',titles:['Seeds of friendship','Flowers for everyone','A village in bloom'],lines:['I want every cottage to have a little green corner.','Could we make flowers for the village gathering?','Our garden walk is finished. I made a keepsake planter for you.'],needs:[{wheat:6},{flower:8},{bouquet:2,herb:3}],levels:[1,3,25],decor:'memoryplanter'},
 Kuma:{role:'Helpful carpenter',titles:['A sturdy start','Benches for the square','The gathering place'],lines:['The village square needs a little repair. I can help with the building.','A village needs places to sit and talk, not just places to work.','The square is ready! Here is a bench for the friend who made it possible.'],needs:[{wood:8},{plank:6,iron:2},{brick:8,rope:3}],levels:[1,3,8],decor:'friendbench'},
 Nala:{role:'Festival organiser',titles:['A small celebration','A sweeter gathering','Our first grand fair'],lines:['We should celebrate the little things. Even a first harvest.','More neighbours are coming this year. Could you help with the treats?','The fair brought the whole island together. These flags belong on your farm.'],needs:[{wheat:6},{bread:2,honey:2},{cake:1,flower:8}],levels:[1,6,17],decor:'memoryflags'}
};
for(const [key,name,art]of [['orchardsign','Orchard keepsake sign','market-4'],['bakerysign','Bakery keepsake sign','market-4'],['riverlantern','River friendship lantern','market-1'],['memoryplanter','Neighbourhood planter','market-0'],['friendbench','Friendship bench','resource-7'],['memoryflags','Village keepsake flags','market-5']]){
 DECOR_SHOP[key]={name,art,size:1,cost:350,category:'garden',description:'A keepsake from a returning neighbour’s story.'};ITEMS[key]={name,icon:'💛',value:60};
}
DECOR_SHOP.festivalstall={name:'Festival market stall',art:'building-0',size:2,cost:450,category:'seasonal',description:'A cheerful seasonal stall. Place one to join the market decoration challenge.'};
ITEMS.festivalstall={name:'Festival market stall',icon:'🎪',value:90};
const SEASONS=[
 {id:'spring',name:'Blossom Spring',icon:'🌸',color:'#e7a6bf',recipe:'springbiscuit',text:'Petals, honey biscuits and fresh garden colours.'},
 {id:'summer',name:'Seaside Summer',icon:'☀️',color:'#f3cd69',recipe:'summerfloat',text:'Coastal picnics, fruit floats and warm evenings.'},
 {id:'autumn',name:'Amber Autumn',icon:'🍂',color:'#cc8d4b',recipe:'autumntart',text:'Golden leaves, apple tarts and a cosy harvest market.'},
 {id:'winter',name:'Lantern Winter',icon:'❄️',color:'#b6d8ed',recipe:'wintertea',text:'Soft snow, warm tea and lantern-lit village paths.'}
];
Object.assign(ITEMS,{springbiscuit:{name:'Blossom biscuits',icon:'🌸',value:180},summerfloat:{name:'Summer fruit float',icon:'🥤',value:240},autumntart:{name:'Autumn apple tart',icon:'🥧',value:280},wintertea:{name:'Winter honey tea',icon:'🍵',value:220}});
Object.assign(RECIPES,{springbiscuit:{at:'bakery',level:6,need:{wheat:3,honey:1,flower:1},time:180,festival:true},summerfloat:{at:'mixer',level:18,need:{mango:2,milk:1,honey:1},time:240,festival:true},autumntart:{at:'cakeoven',level:18,need:{apple:3,wheat:2,butter:1},time:300,festival:true},wintertea:{at:'mixer',level:14,need:{herb:2,honey:2},time:180,festival:true}});
const VALLEY_PROJECTS={
 bridge:{name:'Sunrise trail',level:50,need:{plank:12,brick:8,rope:4},coins:1200,requires:null,clear:3,text:'Restore the old trail and reveal the valley’s first golden crop.',reward:{compost:6}},
 greenhouse:{name:'Moonberry greenhouse',level:60,need:{plank:18,brick:12,sunstone:6},coins:2200,requires:'bridge',clear:6,text:'Bring the abandoned glasshouse back to life and discover moonberries.',reward:{bait:8}},
 orchard:{name:'Starfruit orchard',level:70,need:{woodenbeam:8,brick:16,valleywood:12},coins:3200,requires:'greenhouse',clear:9,text:'Restore a sheltered orchard and cultivate starfruit and mountain tea.',reward:{compost:10}},
 observatory:{name:'Aurora garden',level:80,need:{brick:24,iron:12,gem:4},coins:4500,requires:'orchard',clear:12,text:'Light the old garden observatory and grow luminous aurora flowers.',reward:{flower:12}},
 sanctuary:{name:'Sunrise sanctuary',level:100,need:{sunrisehamper:2,aurorabouquet:2,rope:12},coins:8000,requires:'observatory',clear:15,text:'Complete a sanctuary for every neighbour. The whole valley celebrates your journey.',reward:{friendbench:1,compost:20}}
};
Object.assign(CROPS,{sungrain:{name:'Sunrise grain',icon:'🌾',level:55,seconds:900,cost:45,value:180,sprite:0,valley:'bridge'},moonberry:{name:'Moonberry',icon:'🫐',level:65,seconds:1800,cost:60,value:250,sprite:6,valley:'greenhouse'},mountaintea:{name:'Mountain tea',icon:'🍃',level:75,seconds:2400,cost:70,value:320,sprite:15,valley:'orchard'},auroraflower:{name:'Aurora flower',icon:'✨',level:85,seconds:3000,cost:90,value:420,sprite:12,valley:'observatory'}});
Object.assign(ITEMS,CROPS,{sunstone:{name:'Sunstone',icon:'🔶',value:85},valleywood:{name:'Valley hardwood',icon:'🪵',value:45},starfruit:{name:'Starfruit',icon:'⭐',value:270},sunloaf:{name:'Sunrise loaf',icon:'🍞',value:650},moonpreserve:{name:'Moonberry preserve',icon:'🫙',value:850},mountainteacup:{name:'Mountain tea cup',icon:'🍵',value:980},aurorabouquet:{name:'Aurora bouquet',icon:'💐',value:1600},sunrisehamper:{name:'Sunrise celebration hamper',icon:'🎁',value:3000}});
TREES.starfruit={name:'Starfruit tree',icon:'⭐',level:70,cost:1800,time:1800,valley:'orchard'};
Object.assign(RECIPES,{sunloaf:{at:'bakery',level:60,need:{sungrain:4,honey:2},time:480},moonpreserve:{at:'pot',level:70,need:{moonberry:4,honey:1},time:600},mountainteacup:{at:'mixer',level:80,need:{mountaintea:3,honey:2},time:540},aurorabouquet:{at:'florist',level:90,need:{auroraflower:4,rope:2},time:720},sunrisehamper:{at:'florist',level:95,need:{sunloaf:2,moonpreserve:1,mountainteacup:1,starfruit:3},time:900}});
const MARKET_TASKS=[{id:'harvest',name:'Harvest 10 fields',target:10,tokens:3},{id:'served',name:'Serve 4 neighbours',target:4,tokens:3},{id:'cooked',name:'Cook 3 products',target:3,tokens:3},{id:'fishCaught',name:'Catch 2 fish',target:2,tokens:3},{id:'decorate',name:'Place a seasonal decoration',target:1,tokens:2}];
const MARKET_PRIZES={festivalflags:{cost:5,count:1},festival_lanterns:{cost:6,count:1},festivalgarland:{cost:6,count:1},festivalstall:{cost:9,count:1},bait:{cost:2,count:5},compost:{cost:2,count:4}};
function validateJourneySave(a){
 const j=a.journey;if(j===undefined)return true;
 const obj=v=>!!v&&typeof v==='object'&&!Array.isArray(v),int=(v,max=1000000000)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
 const unique=(v,max,test)=>Array.isArray(v)&&v.length<=max&&new Set(v).size===v.length&&v.every(test);
 if(!obj(j)||j.revision!==1||!obj(j.cats)||!obj(j.customers)||!obj(j.audio)||!obj(j.market)||!int(j.nextLayout)||!unique(j.projects,5,k=>Object.hasOwn(VALLEY_PROJECTS,k))||!unique(j.learned,4,k=>RECIPES[k]?.festival)||!unique(j.pins,12,k=>Object.hasOwn(ITEMS,k))||!unique(j.reserved,30,n=>int(n))||!(j.goal===null||typeof j.goal==='string'&&j.goal.length<=90))return false;
 if(Object.entries(j.cats).some(([id,c])=>!a.cats.some(x=>String(x.id)===id)||!obj(c)||!unique(c.memories,3,n=>[1,2,3].includes(n))||!(c.giftDay===null||typeof c.giftDay==='string'&&c.giftDay.length<=20)))return false;
 if(Object.entries(j.customers).some(([name,c])=>!Object.hasOwn(CUSTOMER_STORIES,name)||!obj(c)||!int(c.visits)||!int(c.chapter,3)))return false;
 if(!['music','ambience','effects'].every(k=>Number.isFinite(j.audio[k])&&j.audio[k]>=0&&j.audio[k]<=1)||Object.keys(j.audio).length!==3)return false;
  const m=j.market;if(typeof m.day!=='string'||m.day.length>20||!obj(m.base)||!['harvest','served','cooked','fishCaught'].every(k=>int(m.base[k]))||(m.base.decorate!==undefined&&!int(m.base.decorate))||!int(m.tokens)||!unique(m.claimed,5,k=>MARKET_TASKS.some(t=>t.id===k)))return false;
 if(!Array.isArray(j.layouts)||j.layouts.length>3||new Set(j.layouts.map(l=>l?.id)).size!==j.layouts.length)return false;
  const entry=e=>obj(e)&&int(e.id)&&['fields','trees','buildings','decor'].includes(e.kind)&&typeof e.type==='string'&&(e.kind==='fields'?e.type==='field':e.kind==='trees'?Object.hasOwn(TREES,e.type):e.kind==='buildings'?Object.hasOwn(BUILDINGS,e.type):['path','bench',...Object.keys(DECOR_SHOP)].includes(e.type))&&Number.isInteger(e.x)&&Number.isInteger(e.y)&&e.x>=FARM_GREEN_BOUNDS.x1&&e.x<=SUNRISE_MAP.x+SUNRISE_MAP.size+8&&e.y>=FARM_GREEN_BOUNDS.y1&&e.y<=Math.max(FARM_GREEN_BOUNDS.y2,SUNRISE_MAP.y+SUNRISE_MAP.size+8)&&typeof e.flip==='boolean';
 return j.layouts.every(l=>obj(l)&&int(l.id)&&l.id<j.nextLayout&&typeof l.name==='string'&&l.name.trim().length>0&&l.name.length<=32&&Number.isFinite(l.created)&&l.created>=0&&Array.isArray(l.entries)&&l.entries.length<=1000&&new Set(l.entries.map(e=>e.id)).size===l.entries.length&&l.entries.every(entry));
}
