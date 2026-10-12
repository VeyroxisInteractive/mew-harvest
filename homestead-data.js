'use strict';
// Load before engine.js: saves containing these goods must validate on startup.
const HOMESTEAD_FEATURES=[
 ['garden','Crop crossing','Cross wheat and corn into hybrid seed for a higher-yield nursery bed.'],
 ['garden','Seed bank','Deposit and withdraw crop seed packets without losing stock.'],
 ['garden','Soil testing','Inspect the previous crop and the current rotation/mulch benefits of every field.'],
 ['garden','Crop rotation','Alternate crop families for a ten-percent growth-time reduction.'],
 ['garden','Field mulch','Apply compost to an empty field for one extra item at its next harvest.'],
 ['garden','Beeswax harvest','Gather wax from your existing bee garden after a timed flower-fed cycle.'],
 ['garden','Candle making','Turn beeswax and fiber into saleable candles.'],
 ['garden','Bee pollination','Use flowers to pollinate a growing field for one bonus crop.'],
 ['garden','Cutting nursery','Grow an apple sapling from fruit and compost for the existing tree system.'],
 ['garden','Fruit grafting','Graft a fruit tree for one bonus fruit at its next harvest.'],
 ['shore','Tidal shoreline','An island-clock tide changes every five minutes and reveals gathering windows.'],
 ['shore','Beachcombing','Search the low-tide beach for shells and an occasional pearl.'],
 ['shore','Beach cleanup','Collect litter and improve a persistent beach cleanliness score.'],
 ['shore','Material recycling','Sort recovered litter into usable fiber and compost.'],
 ['shore','Rock-pool rescue','At low tide, return stranded crabs to the water and earn conservation tokens.'],
 ['cellar','Cheese cellar','Age existing goat cheese into a higher-value artisan cheese.'],
 ['cellar','Pickling jars','Preserve carrots and herbs into jars of pickles.'],
 ['cellar','Jam preserving','Cook apples and honey into shelf-stable jam.'],
 ['cellar','Maturation choice','Collect cheese young or leave it longer for a reserve batch.'],
 ['cellar','Tasting board','Fulfil rotating preserved-food tasting orders for coins.'],
 ['guests','Guest bookings','Welcome a named visitor to an existing guest cottage.'],
 ['guests','Guest comfort','Install bedding to upgrade the quality of future visits.'],
 ['guests','Guest meals','Choose and serve a meal; matching visitor tastes raises satisfaction.'],
 ['guests','Postcard collection','Collect visitor postcards after successful stays.'],
 ['guests','Guest preferences','Choose activities suited to each visitor for a larger checkout reward.'],
 ['mine','Mine grid','Choose adjacent chambers on a persistent four-by-four mine map.'],
 ['mine','Lantern fuel','Craft and spend oil to explore deeper chambers.'],
 ['mine','Support braces','Build supports to enter unstable chambers safely.'],
 ['mine','Ore refining','Refine mine ore into iron for existing construction recipes.'],
 ['mine','Mineral exhibits','Donate distinct minerals to unlock a one-time museum reward.'],
 ['sanctuary','Wildlife admissions','Admit a hedgehog, rabbit or owl into your wildlife sanctuary.'],
 ['sanctuary','Rescue feeding','Provide food suited to the current rescued animal.'],
 ['sanctuary','Wildlife treatment','Use herbs and time to nurse an animal back to health.'],
 ['sanctuary','Wildlife release','Release a fed, recovered animal for conservation tokens.'],
 ['sanctuary','Habitat upgrades','Spend conservation tokens on safer habitats that shorten recovery.'],
 ['nature','Butterfly lures','Choose a flower or fruit lure that attracts different species.'],
 ['nature','Quiet observation','Watch a timed visit without disturbing it to record a species.'],
 ['nature','Butterfly collection','Complete a recorded species set for a one-time reward.'],
 ['nature','Firefly watch','Record fireflies during the island-clock night window.'],
 ['nature','Nature commissions','Turn conservation tokens into rewards through repeatable ecology requests.'],
 ['treasure','Map assembly','Combine beach map scraps into a treasure map.'],
 ['treasure','Clue solving','Read a directional clue and choose its matching landmark.'],
 ['treasure','Treasure digging','Dig at the solved landmark for coins and a relic.'],
 ['treasure','Relic restoration','Clean and restore recovered fragments with a timed workshop action.'],
 ['treasure','Relic gallery','Exhibit three restored relics for a permanent completion reward.'],
 ['play','Music sequencer','Compose, save and play an eight-note tune locally.'],
 ['play','Cooking rhythm','Follow a three-step cooking sequence to earn a skill-based bonus.'],
 ['play','Farm contests','Submit a crop sample and compete against local NPC scores.'],
 ['play','Valley hot springs','Send an idle cat to unlocked Sunrise Valley for a friendship boost.'],
 ['play','Village council choices','Choose a permanent farming, trade or conservation policy with a real effect.']
];
const HOMESTEAD_GOODS={hybridseed:['Hybrid seed','🌱',8],hybridgrain:['Hybrid grain','🌾',30],beeswax:['Beeswax','🟨',14],waxcandle:['Wax candle','🕯️',48],seashell:['Seashell','🐚',8],beachlitter:['Recovered litter','♻️',0],youngcheese:['Artisan cheese','🧀',155],reservecheese:['Reserve cheese','🧀',190],pickles:['Garden pickles','🥒',65],applejam:['Apple jam','🫙',85],mineore:['Mine ore','⛏️',12],amberstone:['Amber specimen','🟠',35],quartzstone:['Quartz specimen','💎',35],basaltstone:['Basalt specimen','🪨',35],lanternoil:['Lantern oil','🏮',6],minebrace:['Mine brace','🪵',14],mapscrap:['Map scrap','🗺️',0],treasuremap:['Assembled map','🗺️',0],relicfragment:['Relic fragment','🏺',15],restoredrelic:['Restored relic','🏺',65]};
for(const[k,[name,icon,value]]of Object.entries(HOMESTEAD_GOODS))ITEMS[k]={name,icon,value};
const HOMESTEAD_RECIPES={
 cross:{name:'Cross crop seeds',group:'garden',need:{wheat:2,corn:2},out:{hybridseed:2},seconds:60,level:3},
 hybrid:{name:'Grow hybrid seed bed',group:'garden',need:{hybridseed:1,compost:1},out:{hybridgrain:3},seconds:120,level:3},
 wax:{name:'Gather beeswax',group:'garden',need:{flower:2},out:{beeswax:2},seconds:90,level:3,building:'bees'},
 candle:{name:'Make candles',group:'garden',need:{beeswax:2,fiber:1},out:{waxcandle:1},seconds:60,level:3},
 cutting:{name:'Grow apple cutting',group:'garden',need:{apple:2,compost:1},out:{},seconds:120,level:4},
 cheese:{name:'Age goat cheese',group:'cellar',need:{goatcheese:1},out:{youngcheese:1},seconds:120,level:8},
 pickle:{name:'Pickle vegetables',group:'cellar',need:{carrot:3,herb:1},out:{pickles:2},seconds:90,level:5},
 jam:{name:'Preserve apple jam',group:'cellar',need:{apple:3,honey:1},out:{applejam:2},seconds:100,level:5},
 recycle:{name:'Sort beach litter',group:'shore',need:{beachlitter:3},out:{fiber:2,compost:1},seconds:30,level:2},
 refine:{name:'Refine mine ore',group:'mine',need:{mineore:3,wood:1},out:{iron:2},seconds:90,level:5},
 restore:{name:'Restore a relic',group:'treasure',need:{relicfragment:1,herb:1},out:{restoredrelic:1},seconds:90,level:5}
};
const HOMESTEAD_GROUPS={garden:['🌱','Field laboratory'],shore:['🌊','Living shoreline'],cellar:['🧀','Preserving cellar'],guests:['🏡','Guest cottage'],mine:['⛏️','Crystal mine'],sanctuary:['🐾','Wildlife sanctuary'],nature:['🦋','Nature observatory'],treasure:['🗺️','Treasure trail'],play:['🎵','Village leisure']};
const HOMESTEAD_GUESTS=[{name:'Pip',food:'bread',activity:'garden',card:'Garden notes'},{name:'Luna',food:'apple',activity:'music',card:'Moonlight melody'},{name:'Basil',food:'carrot',activity:'shore',card:'Seashell sketches'}];
function newHomesteadState(){return {version:1,jobs:{},bank:{},fields:{},grafts:[],shore:{serial:0,next:0,clean:0,rescues:0,tokens:0},guest:null,guestSerial:0,comfort:0,postcards:[],mine:null,mineSerial:0,minerals:[],mineralClaim:false,rescue:null,rescueSerial:0,habitat:0,nature:null,species:[],butterflyClaim:false,nightNext:0,fireflies:0,commissionNext:0,treasure:null,treasureSerial:0,exhibits:0,relicClaim:false,tasting:0,tune:[0,2,4,2,0,2,4,7],cooking:null,contest:null,contestSerial:0,spring:null,policy:null,policyVotes:0};}
function validateHomesteadSave(a){
 if(a.homestead===undefined)return true;
 try{const h=a.homestead,obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x),n=(x,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(x)&&x>=0&&x<=max,keys=(x,allowed)=>obj(x)&&Object.keys(x).every(k=>allowed.includes(k)),ints=(x,allowed,max)=>keys(x,allowed)&&Object.values(x).every(v=>n(v,max)),uniq=x=>Array.isArray(x)&&new Set(x).size===x.length;
 if(!obj(h)||h.version!==1||!keys(h.jobs,Object.keys(HOMESTEAD_RECIPES))||Object.values(h.jobs).some(j=>!obj(j)||!n(j.start)||!n(j.end)||j.end<j.start))return false;
 if(!ints(h.bank,Object.keys(CROPS),100000)||!obj(h.fields)||Object.keys(h.fields).length>250||Object.entries(h.fields).some(([id,f])=>!a.fields.some(p=>String(p.id)===id)||!obj(f)||f.last!==null&&!Object.hasOwn(CROPS,f.last)||typeof f.mulch!=='boolean'||typeof f.pollinated!=='boolean'))return false;
 if(!uniq(h.grafts)||h.grafts.some(id=>!a.trees.some(t=>t.id===id))||!obj(h.shore)||!['serial','next','clean','rescues','tokens'].every(k=>n(h.shore[k]))||h.shore.clean>100)return false;
 if(!['guestSerial','mineSerial','rescueSerial','nightNext','fireflies','commissionNext','treasureSerial','tasting','contestSerial','policyVotes'].every(k=>n(h[k]))||!n(h.comfort,3)||!n(h.habitat,3)||!n(h.exhibits,3)||h.policyVotes>1)return false;
 if(!uniq(h.postcards)||h.postcards.some(k=>!n(k,2))||!uniq(h.minerals)||h.minerals.some(k=>!['amberstone','quartzstone','basaltstone'].includes(k))||!uniq(h.species)||h.species.some(k=>!n(k,2)))return false;
 if(!['mineralClaim','butterflyClaim','relicClaim'].every(k=>typeof h[k]==='boolean')||!Array.isArray(h.tune)||h.tune.length!==8||h.tune.some(k=>!n(k,7))||h.policy!==null&&!['farm','trade','wildlife'].includes(h.policy))return false;
 if(h.guest&&(!n(h.guest.type,2)||!n(h.guest.end)||!n(h.guest.score,3)||typeof h.guest.fed!=='boolean'||typeof h.guest.activity!=='boolean'))return false;
 if(h.mine&&(!n(h.mine.pos,15)||!uniq(h.mine.visited)||h.mine.visited.some(k=>!n(k,15))||!h.mine.visited.includes(h.mine.pos)))return false;
 if(h.rescue&&(!n(h.rescue.type,2)||!n(h.rescue.end)||typeof h.rescue.fed!=='boolean'||typeof h.rescue.treated!=='boolean'))return false;
 if(h.nature&&(!n(h.nature.type,2)||!n(h.nature.end)))return false;
 if(h.treasure&&(!n(h.treasure.answer,3)||typeof h.treasure.solved!=='boolean'))return false;
 if(h.cooking&&(!n(h.cooking.start)||!n(h.cooking.step,3)||!n(h.cooking.errors,3)||!Array.isArray(h.cooking.sequence)||h.cooking.sequence.length!==3||h.cooking.sequence.some(k=>!n(k,2))))return false;
 if(h.contest&&(!Object.hasOwn(CROPS,h.contest.item)||!n(h.contest.end)||!n(h.contest.score,100)))return false;
 if(h.spring&&(!a.cats.some(c=>c.id===h.spring.cat)||!n(h.spring.end)))return false;
 return true;}catch{return false;}
}
