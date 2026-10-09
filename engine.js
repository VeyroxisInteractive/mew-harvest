'use strict';
const now=()=>Date.now(),day=()=>new Date().toLocaleDateString('en-CA');
function freshGame(){let state={version:1,progression:{revision:31,recipes:[]},newVillage:true,coins:250,xp:0,nextId:20,size:16,landRevision:2,seed:'wheat',storeLevel:0,buildings:[{id:1,type:'house',x:2,y:3,ready:0,queue:[]},{id:2,type:'store',x:8,y:7,ready:0,queue:[]},{id:3,type:'hen',x:2,y:7,ready:0,queue:[],animals:0,fed:0}],fields:[],trees:[],cats:[0,1,2].map((id)=>({id,name:CAT_NAMES[id],x:5+id*.5,y:6,job:null})),inventory:{wheat:8},orders:[],stats:{harvest:0,served:0,cooked:0,animals:0},daily:{day:day(),claimed:[],gift:false},tutorial:0,sound:false};for(let i=0;i<6;i++)state.fields.push({id:10+i,x:5+i%3,y:3+Math.floor(i/3),crop:null,end:0});return state;}
function validateVillageSave(v){const finite=n=>Number.isFinite(n)&&n>=0;if(!v||v.rev!==1||!Array.isArray(v.cargo)||v.cargo.length>500||!Array.isArray(v.trips)||v.trips.length>12||!Array.isArray(v.discovered)||!v.merchant)return false;if(v.tractor&&(typeof v.tractor.enabled!=='boolean'||!Number.isFinite(v.tractor.x)||!Number.isFinite(v.tractor.y)||!finite(v.tractor.deliveries)))return false;if(v.cargo.some(q=>q.vehicle!==undefined&&q.vehicle!=='tractor'||q.route?.board!==undefined&&(!finite(q.route.board)||q.route.board>q.route.pickup)))return false;if(v.camp&&(!Number.isFinite(v.camp.x)||!Number.isFinite(v.camp.y)))return false;if(v.discovered.some(k=>!ITEMS[k]))return false;if(v.cargo.some(q=>!q||!ITEMS[q.item]||!Number.isInteger(q.count)||q.count<1||!finite(q.start)||!finite(q.end)||!Number.isFinite(q.x)||!Number.isFinite(q.y)))return false;if(v.trips.some(t=>!t||!EXPEDITIONS[t.where]||!finite(t.end)||typeof t.claimed!=='boolean'))return false;if(v.fishing&&(!finite(v.fishing.end)||!ITEMS[v.fishing.item]||!Number.isInteger(v.fishing.cat)))return false;return finite(v.merchant.arrives)&&finite(v.deliveries)&&finite(v.fishCaught)&&finite(v.restoration)&&v.restoration<=2&&finite(v.rod)&&v.rod<=3&&finite(v.merchant.serial);}
function validateLifeSave(v){if(v?.coastVisits&&(typeof v.coastVisits!=='object'||Object.entries(v.coastVisits).some(([k,n])=>!['0','1','2'].includes(k)||!Number.isFinite(n)||n<0)))return false;if(v?.valleyClaims&&(!Array.isArray(v.valleyClaims)||v.valleyClaims.some(i=>!Number.isInteger(i)||i<0||i>3)))return false;if(v?.contract&&(!ITEMS[v.contract.item]||!Number.isInteger(v.contract.count)||v.contract.count<1||!Number.isFinite(v.contract.coins)||v.contract.coins<0||!Number.isFinite(v.contract.xp)||v.contract.xp<0||v.contract.xp>300||typeof v.contract.done!=='boolean'))return false;if(!v||v.version!==1||!v.tools||!['axe','pickaxe','can'].every(k=>Number.isInteger(v.tools[k])&&v.tools[k]>=0&&v.tools[k]<=3)||!Array.isArray(v.milestones)||!Number.isFinite(v.explored)||v.explored<0||!Number.isInteger(v.furniture)||v.furniture<0||v.furniture>3||!v.zones)return false;if(v.chapters!==undefined&&(!Array.isArray(v.chapters)||v.chapters.length>CHAPTERS.length||v.chapters.some((n,i)=>n!==i)))return false;if(v.room!==undefined&&(!v.room||!Array.isArray(v.room.owned)||v.room.owned.some(k=>!ROOM_ITEMS[k])||!v.room.slots||Object.entries(v.room.slots).some(([s,k])=>!['left','centre','right'].includes(s)||!v.room.owned.includes(k))))return false;if(v.crafting!==undefined&&(!Array.isArray(v.crafting)||v.crafting.length>3||v.crafting.some(j=>!j||!CRAFT_DURATIONS[j.key]||!Number.isInteger(j.id)||!Number.isInteger(j.cat)||!Number.isFinite(j.start)||!Number.isFinite(j.end)||j.end<j.start)))return false;if(v.discoveryClaims!==undefined&&(!Array.isArray(v.discoveryClaims)||v.discoveryClaims.some(n=>![10,20,35,50].includes(n))))return false;for(const[k,nodes]of Object.entries(v.zones))if(!EXPEDITIONS[k]||!Array.isArray(nodes)||nodes.length>20||nodes.some(n=>!Number.isInteger(n.id)||!Number.isFinite(n.x)||!Number.isFinite(n.y)||!Number.isFinite(n.ready)))return false;if(v.visit&&(!EXPEDITIONS[v.visit.zone]||!Number.isInteger(v.visit.cat)||!v.visit.loot||Object.entries(v.visit.loot).some(([k,n])=>!ITEMS[k]||!Number.isInteger(n)||n<0)))return false;return true;}
function validate(a){try{if(a?.hatCollection!==undefined&&(!Array.isArray(a.hatCollection)||a.hatCollection.some(k=>!['straw','cowboy','cap','bucket','beanie','chef'].includes(k))||new Set(a.hatCollection).size!==a.hatCollection.length))return false;if(a?.cats?.some(c=>c.shopHat!==undefined&&(!a.hatCollection?.includes(c.shopHat))))return false;return validateState(a)}catch{return false}}
function validateState(a){if(a?.eastValley!==undefined&&typeof a.eastValley!=='boolean'||a?.valleyMapRevision!==undefined&&![1,SUNRISE_MAP.revision].includes(a.valleyMapRevision)||a?.valleyGeometryRevision!==undefined&&a.valleyGeometryRevision!==SUNRISE_MAP.geometryRevision)return false;if(!a||a.version!==1||!Number.isFinite(a.coins)||a.coins<0||!Number.isFinite(a.xp)||a.xp<0||!Number.isInteger(a.nextId)||![12,14,16,18,20,22,24].includes(a.size)||!CROPS[a.seed])return false;for(let k of ['buildings','fields','trees','cats','orders'])if(!Array.isArray(a[k])||a[k].length>250)return false;const point=o=>Number.isFinite(o.x)&&Number.isFinite(o.y)&&o.x>=FARM_GREEN_BOUNDS.x1&&o.y>=FARM_GREEN_BOUNDS.y1&&o.x<=(a.eastValley?SUNRISE_MAP.x+SUNRISE_MAP.size+8:FARM_GREEN_BOUNDS.x2)&&o.y<=(a.eastValley?Math.max(40,SUNRISE_MAP.y+SUNRISE_MAP.size+8):FARM_GREEN_BOUNDS.y2);
if(a.progression!==undefined&&(!a.progression||a.progression.revision!==31||!Array.isArray(a.progression.recipes)||a.progression.recipes.some(k=>!RECIPES[k])))return false;
if(typeof validateJourneySave==='function'&&!validateJourneySave(a)||!validateRuntimeValues(a))return false;
if(a.orders.some(o=>!Number.isInteger(o.id))||new Set(a.orders.map(o=>o.id)).size!==a.orders.length)return false;
if(a.buildings.some(b=>b.penLevel!==undefined&&(!Number.isInteger(b.penLevel)||b.penLevel<0||b.penLevel>2)))return false;if(a.buildings.some(b=>!BUILDINGS[b.type]||!point(b)||!Number.isFinite(b.ready)||!Array.isArray(b.queue)||b.queue.length>5||b.queue.some(j=>!RECIPES[j.item]||RECIPES[j.item].at!==b.type||!Number.isFinite(j.start)||!Number.isFinite(j.end))))return false;if(a.fields.some(f=>!point(f)||f.crop&&!CROPS[f.crop]||!Number.isFinite(f.end)))return false;if(a.trees.some(t=>!TREES[t.type]||!point(t)||!Number.isFinite(t.end)))return false;if(!a.cats.length||a.cats.length>12||a.cats.some(c=>!point(c)||typeof c.name!=='string'||c.job&&(!Number.isFinite(c.job.end)||!Number.isFinite(c.job.x)||!Number.isFinite(c.job.y))))return false;if(!a.inventory||Object.entries(a.inventory).some(([k,v])=>!ITEMS[k]||!Number.isInteger(v)||v<0))return false;if(a.orders.some(o=>!o.need||Object.entries(o.need).some(([k,v])=>!ITEMS[k]||!Number.isInteger(v)||v<1)||!Number.isFinite(o.reward)||!Number.isFinite(o.xp)||!Number.isFinite(o.arrives)))return false;if(!a.stats||!a.daily||!Array.isArray(a.daily.claimed)||typeof a.daily.day!=='string'||typeof a.daily.gift!=='boolean'||!Number.isInteger(a.storeLevel)||a.storeLevel<0||a.storeLevel>3||a.nextId<1)return false;
if(['harvest','served','cooked','animals'].some(k=>!Number.isInteger(a.stats[k])||a.stats[k]<0))return false;
if(!a.buildings.some(b=>b.type==='house')||!a.buildings.some(b=>b.type==='store'))return false;
if(a.buildings.some(b=>BUILDINGS[b.type].animal&&(!Number.isInteger(b.animals)||b.animals<0||b.animals>4||!Number.isFinite(b.fed)||b.fed<0)))return false;
 if(a.resources&&(!Array.isArray(a.resources)||a.resources.length>750||a.resources.some(r=>!r||!['oak','pine','birch','palm','rock','ironrock','grass'].includes(r.type)||!Number.isFinite(r.x)||!Number.isFinite(r.y)||r.x<FARM_GREEN_BOUNDS.x1||r.y<FARM_GREEN_BOUNDS.y1||r.x>=(a.eastValley?SUNRISE_MAP.x+SUNRISE_MAP.size+8:FARM_GREEN_BOUNDS.x2)||r.y>=(a.eastValley?SUNRISE_MAP.y+SUNRISE_MAP.size+8:FARM_GREEN_BOUNDS.y2)||!Number.isFinite(r.hits)||!Number.isFinite(r.end)||!Number.isFinite(r.respawn))))return false;if(a.decor&&(!Array.isArray(a.decor)||a.decor.length>500||a.decor.some(d=>!d||!['bench','path',...Object.keys(DECOR_SHOP)].includes(d.type)||!point(d)||d.end!==undefined&&(!Number.isFinite(d.end)||d.end<0))))return false;
if(a.departures&&(!Array.isArray(a.departures)||a.departures.length>250||a.departures.some(o=>!o||!Number.isInteger(o.id)||!Number.isFinite(o.end))))return false;if(a.cats.some(c=>c.job&&(c.job.crop&&!CROPS[c.job.crop]||c.job.fields&&(!Array.isArray(c.job.fields)||!c.job.fields.every(Number.isInteger)))))return false;
 if(a.parcels&&(!Array.isArray(a.parcels)||a.parcels.length>100||a.parcels.some(k=>typeof k!=='string'||!/^(-?\d+),(-?\d+)$/.test(k))))return false;if(a.houseLevel!==undefined&&(!Number.isInteger(a.houseLevel)||a.houseLevel<0||a.houseLevel>3))return false;if(a.cats.some(c=>c.dailyRequest&&(!ITEMS[c.dailyRequest.item]||!Number.isInteger(c.dailyRequest.count)||c.dailyRequest.count<1||c.dailyRequest.count>3||typeof c.dailyRequest.day!=='string')||c.bondClaims&&(!Array.isArray(c.bondClaims)||c.bondClaims.some(n=>![1,2,3].includes(n)))))return false;if(a.cats.some(c=>c.wardrobe&&(!Array.isArray(c.wardrobe)||c.wardrobe.some(k=>!OUTFITS[k]))||c.hat&&!OUTFITS[c.hat]||c.vest&&!OUTFITS[c.vest]||c.outfit&&Object.entries(c.outfit).some(([slot,k])=>!['head','body','neck','back','accessory'].includes(slot)||k!==null&&!OUTFITS[k])||c.outfitColors&&(typeof c.outfitColors!=='object'||Object.values(c.outfitColors).some(k=>!OUTFIT_COLORS.includes(k)))))return false;if(a.seeds&&(typeof a.seeds!=='object'||Object.entries(a.seeds).some(([k,v])=>!CROPS[k]||!Number.isInteger(v)||v<0))||a.saplings&&(typeof a.saplings!=='object'||Object.entries(a.saplings).some(([k,v])=>!TREES[k]||!Number.isInteger(v)||v<0)))return false;
const objects=[...(a.resources||[]),...(a.decor||[]),...a.fields,...a.trees,...a.buildings];if(objects.some(o=>!Number.isInteger(o.id))||new Set(objects.map(o=>o.id)).size!==objects.length)return false;if(a.life&&!validateLifeSave(a.life))return false;if(a.village&&!validateVillageSave(a.village))return false;return true;}
function validateRuntimeValues(a){
 const obj=v=>!!v&&typeof v==='object'&&!Array.isArray(v),int=(n,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(n)&&n>=0&&n<=max,finite=n=>Number.isFinite(n)&&n>=0;
 if(!int(a.nextId)||!obj(a.inventory)||!obj(a.stats)||!obj(a.daily))return false;
 if(Object.keys(a.inventory).some(k=>!Object.hasOwn(ITEMS,k)))return false;
 if(a.cats.some(c=>!obj(c)||!int(c.id,11)||c.name.length>80||c.role!==undefined&&!['all','farm','cook','haul'].includes(c.role)||['affection','friendship','experience'].some(k=>c[k]!==undefined&&!finite(c[k]))||c.skills!==undefined&&(!obj(c.skills)||!['farm','cook','haul'].every(k=>int(c.skills[k])))||c.job&&(!obj(c.job)||!finite(c.job.end)||c.job.workStart!==undefined&&!finite(c.job.workStart))))return false;
 if(new Set(a.cats.map(c=>c.id)).size!==a.cats.length)return false;
 if(a.buildings.some(b=>!Object.hasOwn(BUILDINGS,b.type)||b.upgrade!==undefined&&!int(b.upgrade,2)||!finite(b.ready)||b.lifeEnd!==undefined&&(!LIFE_BUILDINGS[b.type]?.output||!finite(b.lifeEnd))||b.queue.some(q=>!Object.hasOwn(RECIPES,q.item)||!finite(q.start)||!finite(q.end)||q.end<q.start)))return false;
 if(a.fields.some(f=>f.crop&&!Object.hasOwn(CROPS,f.crop)||!finite(f.end))||a.trees.some(t=>!Object.hasOwn(TREES,t.type)||!finite(t.end)))return false;
 if(a.orders.some(o=>!int(o.id)||typeof o.name!=='string'||o.name.length>80||!obj(o.need)||!Object.keys(o.need).length||Object.keys(o.need).some(k=>!Object.hasOwn(ITEMS,k))||!finite(o.reward)||!finite(o.xp)||!finite(o.arrives)))return false;
 if(a.life){const v=a.life;if(v.festival!==undefined&&v.festival!==null&&(!obj(v.festival)||typeof v.festival.day!=='string'||!finite(v.festival.base)||typeof v.festival.claimed!=='boolean'))return false;}
 if(a.village){
  const v=a.village;if(!int(v.restoration,2)||!int(v.rod,3)||!int(v.deliveries)||!int(v.fishCaught)||!int(v.merchant?.serial))return false;
  if(v.cargo.some(q=>!int(q.id)||q.end&&q.end<q.start||q.cat!==null&&q.cat!==undefined&&!a.cats.some(c=>c.id===q.cat)||q.route!==undefined&&q.route!==null&&(!obj(q.route)||!finite(q.route.distance)||!finite(q.route.pickup)||q.route.pickup>q.route.distance||!Array.isArray(q.route.points)||q.route.points.length<2||q.route.points.length>5000||q.route.points.some(p=>!obj(p)||!Number.isFinite(p.x)||!Number.isFinite(p.y)))))return false;
  if(new Set(v.cargo.map(q=>q.id)).size!==v.cargo.length||v.trips.some(t=>!int(t.id)||!a.cats.some(c=>c.id===t.cat))||new Set(v.trips.map(t=>t.id)).size!==v.trips.length)return false;
  if(v.fishing&&!a.cats.some(c=>c.id===v.fishing.cat))return false;
 }
 return true;
}
let recoveryBackup=null;
function loadStoredGame(){
 let raw=null;try{recoveryBackup=localStorage.getItem(SAVE_KEY+'-recovery');raw=localStorage.getItem(SAVE_KEY);const a=JSON.parse(raw);if(validate(a))return a;}catch{}
 // Preserve an unreadable farm before a fresh game writes to the normal key.
 if(raw){recoveryBackup=raw;try{localStorage.setItem(SAVE_KEY+'-recovery',raw);}catch{}}
 return freshGame();
}
let S=loadStoredGame();
migrateProgression();
function migrateWardrobe(){for(const c of S.cats){c.wardrobe ||= [];c.outfit ||= {head:null,body:null,neck:null,back:null,accessory:null};c.outfitColors ||= {};if(c.hat&&OUTFITS[c.hat])c.outfit.head ||= c.hat;if(c.vest&&OUTFITS[c.vest])c.outfit.body ||= c.vest;}S.seeds ||= {};S.saplings ||= {};}
migrateWardrobe();
function migrateBaseState(){if(!S.landRevision){S.size=Math.min(24,S.size+4);S.landRevision=2;}if(typeof S.details!=='boolean')S.details=true;if(!S.daily.base)S.daily.base={...S.stats};}
migrateBaseState();
function migrateValleyMap(){
  if(!S.eastValley||S.valleyMapRevision===SUNRISE_MAP.revision&&S.valleyGeometryRevision===SUNRISE_MAP.geometryRevision)return;
  // Backups written before the old valley migration have no map revision and
  // still use the legacy x=24 anchor. Current v3.2 saves already use x=40;
  // never shift those placements a second time.
  const oldAnchor=S.valleyMapRevision===undefined?SUNRISE_MAP.legacyX:SUNRISE_MAP.previousX,shift=SUNRISE_MAP.x-oldAnchor,move=o=>{if(o&&o.x>=oldAnchor)o.x+=shift;};
 for(const kind of ['fields','trees','buildings','decor','resources'])for(const o of S[kind]||[])move(o);
 move(S.village?.camp);
 for(const c of S.cats){move(c);if(c.job?.kind!=='visit')move(c.job);}
 for(const q of S.village?.cargo||[]){move(q);if(q.route||q.end){q.route=null;q.start=0;q.end=0;q.cat=null;q.blocked=false;for(const c of S.cats)if(c.job?.cargo===q.id)c.job=null;}}
 for(const l of S.journey?.layouts||[])for(const e of l.entries)move(e);
  S.valleyMapRevision=SUNRISE_MAP.revision;S.valleyGeometryRevision=SUNRISE_MAP.geometryRevision;
}
migrateValleyMap();
const awayDuration=Math.max(0,Date.now()-(S.lastSeen||Date.now()));
let gameNotice=()=>{},onChange=()=>{},saveError=false,changeDepth=0;
function saveGame(){S.lastSeen=Date.now();try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));saveError=false;}catch{saveError=true;}}
function change(){if(changeDepth)return;saveGame();onChange();}
function batchChange(work){changeDepth++;try{return work();}finally{changeDepth--;if(!changeDepth)change();}}
function costXP(l){return 90+30*(l-1)+8*(l-1)**2;}
function level(){let rest=S.xp,l=1;while(l<100&&rest>=costXP(l)){rest-=costXP(l);l++;}return l;}
function levelProgress(){let rest=S.xp;for(let l=1;l<level();l++)rest-=costXP(l);return level()===100?1:rest/costXP(level());}
function migrateProgression(){
 if(!S.progression){
  const owned=new Set(S.buildings.map(b=>b.type)),l=level();
  S.progression={revision:31,recipes:Object.keys(LEGACY_RECIPE_LEVELS).filter(k=>owned.has(RECIPES[k].at)&&(LEGACY_RECIPE_LEVELS[k]<=l||S.buildings.some(b=>b.queue.some(j=>j.item===k))||S.inventory[k]>0||S.village?.discovered.includes(k)))};
 }
 // Preserve all IDs but ensure subsequent orders/objects can never reuse one.
 S.nextId=Math.max(S.nextId,...[...S.buildings,...S.fields,...S.trees,...(S.resources||[]),...(S.decor||[]),...S.orders,...(S.departures||[]),...(S.village?.cargo||[]),...(S.village?.trips||[]),...(S.life?.crafting||[])].map(o=>o.id+1));
}
function recipeUnlocked(k){const r=RECIPES[k];return !!r&&(!r.festival||S.journey?.learned.includes(k))&&(level()>=Math.max(r.level,BUILDINGS[r.at].level)||S.progression?.recipes.includes(k));}
function gainXP(n){const old=level();S.xp+=n;if(level()>old){S.coins+=40*(level()-old);gameNotice('Level '+level()+'! New things to discover.');}}
const quantity=k=>S.inventory[k]||0,has=(need,owner=null)=>Object.entries(need).every(([k,n])=>(typeof usableQuantity==='function'?usableQuantity(k,owner):quantity(k))>=n);
const availableQuantity=k=>typeof usableQuantity==='function'?usableQuantity(k):quantity(k);
function take(need){for(const[k,n]of Object.entries(need))S.inventory[k]-=n;}
function give(k,n=1){S.inventory[k]=quantity(k)+n;if(n>0&&S.village&&!S.village.discovered.includes(k))S.village.discovered.push(k);}
function freeCat(){return S.cats.find(c=>!c.job||c.job.end<=now());}
function workPositions(target,kind){
 if(target.workPoints)return target.workPoints;
 const n=BUILDINGS[target.type]?.size||DECOR_SHOP[target.type]?.size||target.size||1;
 return n>1?[{x:target.x+n+.2,y:target.y+n-.65},{x:target.x+n-.6,y:target.y+n+.2},{x:target.x-.2,y:target.y+.6},{x:target.x+.6,y:target.y-.2}]:
  [{x:target.x+1.15,y:target.y+.65},{x:target.x+.5,y:target.y+1.15},{x:target.x-.15,y:target.y+.6},{x:target.x+.5,y:target.y-.15}];
}
function assign(label,target,end,kind='work'){
 const preferred=['crop','water','feed'].includes(kind)?'farm':['cook','produce'].includes(kind)?'cook':'all';
 const cat=S.cats.find(c=>(!c.job||c.job.end<=now())&&c.role===preferred)||freeCat();
 if(!cat){gameNotice('Your cats are busy. Wait a moment or recruit a helper.');return null;}
 const approach=typeof World!=='undefined'&&World.workApproach?World.workApproach(cat,target,kind):{...workPositions(target,kind)[0],travel:0};
 if(!approach){gameNotice('Clear a path beside this workstation so a cat can reach it.');return null;}
 const travel=approach.travel||0;
 cat.job={label,target:target.id,x:approach.x,y:approach.y,workStart:now()+travel,end:end+travel,kind};
 if(typeof catProfile==='function'&&catProfile(cat).work===preferred&&typeof reactCat==='function')reactCat(cat,'♪');return cat;
}
function tick(){if(typeof lifeTick==='function'&&S.life)lifeTick();if(typeof villageTick==='function'&&S.village)villageTick();if(S.departures)S.departures=S.departures.filter(o=>o.end>now());if(typeof resourceTick==='function')resourceTick();let dirty=false;for(const c of S.cats)if(c.job&&c.job.end<=now()){c.x=c.job.x;c.y=c.job.y;if(S.life){c.skills ||= {farm:0,cook:0,haul:0};const skill=c.job.kind==='crop'?'farm':c.job.kind==='cook'?'cook':null;if(skill)c.skills[skill]++;}c.job=null;dirty=true;}if(S.daily.day!==day()){S.daily={day:day(),claimed:[],gift:false,base:{...S.stats}};dirty=true;}if(typeof journeyTick==='function')journeyTick();if(dirty)change();}
function fieldAction(id){
 const f=S.fields.find(f=>f.id===id);if(!f)return false;
 if(f.crop){
  if(f.end>now()){gameNotice(ITEMS[f.crop].name+' is still growing.');return false;}
  const harvested=f.crop;if(typeof queueCargo==='function'&&S.village)queueCargo(harvested,2,f);else give(harvested,2);
  gainXP(3);S.stats.harvest++;f.crop=null;f.end=0;
  if(!S.fields.some(p=>p.crop===harvested))for(const c of S.cats)if(c.job?.crop===harvested)c.job.end=now();
  if(typeof feedbackEvent==='function')feedbackEvent('harvest',f,'+2 '+ITEMS[harvested].icon);change();return true;
 }
 const c=CROPS[S.seed],growth=S.life?(1-(S.life.tools.can||0)*.04)*(1-S.buildings.filter(b=>b.type==='water'&&b.ready<=now()).reduce((n,b)=>Math.max(n,.1+(b.upgrade||0)*.05),0))*(quantity('sprinkler')?0.95:1)*(quantity('irrigation_parts')?0.95:1):1;
 if(typeof cropAccess==='function'){const access=cropAccess(S.seed,f);if(!access.ok){gameNotice(access.reason);return false;}}else if(c.level>level())return false;
 const seedOnly=!!c.seedOnly,seedTray=quantity('seed_tray')>0;
 if(seedOnly){if(!S.seeds?.[S.seed]&&!seedTray){gameNotice('Buy a seed pack in the Shop first.');return false;}}
 else if(S.coins<c.cost){gameNotice('Not enough coins. Serve an order or sell goods.');return false;}
 let worker=S.cats.find(c=>c.job?.crop===S.seed&&c.job.end>now()),arrival;
  if(worker&&typeof World!=='undefined'&&World.workApproach){const approach=World.workApproach(worker,f,'crop');if(!approach){gameNotice('Clear a path so your farming cat can reach this field.');return false;}arrival=now()+(approach.travel||0);worker.job.target=f.id;worker.job.x=approach.x;worker.job.y=approach.y;}
 if(!worker)worker=assign('Growing '+c.name,f,now()+c.seconds*1000*growth,'crop');if(!worker)return false;
 arrival=Math.max(arrival||now(),worker.job.workStart||0);
 if(S.life){worker.skills ||= {farm:0,cook:0,haul:0};worker.skills.farm++;}
 worker.job.crop=S.seed;worker.job.end=Math.max(worker.job.end,now()+c.seconds*1000*growth);worker.job.fields=[...new Set([...(worker.job.fields||[]),id])];
 if(seedOnly&&!seedTray)S.seeds[S.seed]--;else if(!seedOnly)S.coins-=c.cost;
 f.crop=S.seed;f.fertilized=false;f.end=arrival+c.seconds*1000*growth*(1-Math.min(.1,(worker.skills?.farm||0)*.002))*(typeof bondSpeed==='function'?bondSpeed(worker):1);
 worker.job.end=Math.max(f.end,...S.fields.filter(p=>p.crop===S.seed).map(p=>p.end));change();return true;
}
function harvestAll(){let n=0;for(const f of S.fields)if(f.crop&&f.end<=now()){fieldAction(f.id);n++;}gameNotice(n?'Harvested '+n+' fields.':'Nothing ready to harvest.');}
function riverBlocked(x,y){if(channelTile(x,S,y))return !sunriseBridgeTile(x,y,S);if(S.eastValley&&(x>=SUNRISE_MAP.x||inValley(Math.floor(x),Math.floor(y))))return !inValley(Math.floor(x),Math.floor(y))||sunriseRiverTile(x,y);return y>=10&&y<12&&!(x>=8&&x<9);}
function occupied(x,y,size=1,ignore=-1,unowned=false){const camp=S.village?.camp;if(camp&&x<camp.x+2&&x+size>camp.x&&y<camp.y+2&&y+size>camp.y)return true;for(let dx=0;dx<size;dx++)for(let dy=0;dy<size;dy++)if(riverBlocked(x+dx,y+dy)||S.eastValley&&sunriseRiverTile(x+dx,y+dy))return true;if(!Number.isInteger(x)||!Number.isInteger(y))return true;for(let dx=0;dx<size;dx++)for(let dy=0;dy<size;dy++)if(!unowned&&!ownedTile(x+dx,y+dy))return true;return [...(S.resources||[]).filter(o=>!o.cleared&&o.type!=='grass').map(o=>({...o,size:1})),...(S.decor||[]).filter(o=>o.type!=='path').map(o=>({...o,size:DECOR_SHOP[o.type]?.size||1})),...S.fields.map(o=>({...o,size:1})),...S.trees.map(o=>({...o,size:1})),...S.buildings.map(o=>({...o,size:BUILDINGS[o.type].size}))].some(o=>o.id!==ignore&&x<o.x+o.size&&x+size>o.x&&y<o.y+o.size&&y+size>o.y);}
function fieldLimit(){return Math.min(100,6+Math.max(0,level()-1)*4);}
function place(type,x,y){
 if(TREES[type]?.valley&&typeof cropAccess==='function'){const access=cropAccess(type,{x,y});if(!access.ok){gameNotice(access.reason);return false;}}
 if(typeof RESOURCES!=='undefined'&&RESOURCES[type]&&(!TREES[type]||x<0||y<0||x>=S.size||y>=S.size))return placeResource(type,x,y);
 if(['path','bench',...Object.keys(DECOR_SHOP)].includes(type))return placeDecor(type,x,y);
 let info=type==='field'?{size:1,cost:10,level:1,time:0}:TREES[type]?{...TREES[type],size:1}:BUILDINGS[type];const sapling=TREES[type]&&(S.saplings?.[type]>0||availableQuantity('sapling_'+type)>0);
 if(!info||info.level>level()||(S.coins<(sapling?0:info.cost))||occupied(x,y,info.size))return false;
 if(type==='field'&&S.fields.length>=fieldLimit()){gameNotice('More fields unlock as you level up.');return false;}
 if(BUILDINGS[type]&&S.buildings.some(b=>b.type===type)){gameNotice('You already own this building.');return false;}
 const lifeNeed=LIFE_BUILDINGS[type]?.need,lifeKit=type==='water'?'water_tank':null;if(lifeNeed&&!has(lifeNeed)&&!availableQuantity(lifeKit))return false;
 const id=S.nextId,o={id,type,x,y},worker=BUILDINGS[type]?assign('Building',o,now()+info.time*1000,'build'):null;if(BUILDINGS[type]&&!worker)return false;S.nextId++;
 if(sapling){if(S.saplings?.[type])S.saplings[type]--;else take({['sapling_'+type]:1});}else S.coins-=info.cost;
 if(lifeNeed){if(has(lifeNeed))take(lifeNeed);else take({[lifeKit]:1});}
 if(type==='field')S.fields.push({id,x,y,crop:null,end:0});else if(TREES[type])S.trees.push({...o,end:0});else S.buildings.push({...o,ready:worker.job.end,queue:[],...(info.animal?{animals:0,fed:0}:{})});
 if(typeof feedbackEvent==='function')feedbackEvent('build',o,'🏡');change();return true;
}
function objectBusy(o){return o.ready>now()||o.fed>now()||o.lifeEnd>now()||o.end>now()||o.queue?.some(q=>q.end>now())||S.cats.some(c=>c.job?.end>now()&&(c.job.target===o.id||c.job.fields?.includes(o.id)));}
function moveObject(id,x,y){
 const o=[...S.fields,...S.trees,...S.buildings,...(S.decor||[]),...(S.resources||[])].find(o=>o.id===id);if(!o)return false;
 if(objectBusy(o)){gameNotice('Wait until this object finishes its work.');return false;}
 const size=BUILDINGS[o.type]?.size||DECOR_SHOP[o.type]?.size||1;
 if(S.resources?.includes(o)){if(!forestSpot(x,y,id)||occupied(x,y,1,id,true))return false;}else if(occupied(x,y,size,id))return false;
 if(S.village?.cargo.some(q=>q.end>now()&&(o.type==='store'||q.x===o.x&&q.y===o.y))){gameNotice('Wait until active deliveries finish before moving their source or barn.');return false;}
 const oldX=o.x,oldY=o.y;if(typeof rememberMove==='function'&&!S.resources?.includes(o))rememberMove(o,oldX,oldY);o.x=x;o.y=y;
 for(const q of S.village?.cargo||[])if(!q.end&&q.x===oldX&&q.y===oldY){q.x=x;q.y=y;q.blocked=false;}change();return true;
}
function readyBuilding(id){const b=S.buildings.find(b=>b.id===id);if(!b||b.ready>now())return null;return b;}
function buyAnimal(id){const b=readyBuilding(id),d=b&&BUILDINGS[b.type];if(!d?.animal||b.animals>=4||b.fed>0)return false;const price=d.animalCost*(1+b.animals);if(S.coins<price)return false;S.coins-=price;b.animals++;change();return true;}
function feedAnimal(id){const b=readyBuilding(id),d=b&&BUILDINGS[b.type];if(!d?.animal||!b.animals)return false;if(b.fed){if(b.fed>now())return false;const bonus=b.premiumFeed?2:0,count=b.animals+(b.happiness>=60?1:0)+(b.penLevel||0)+bonus;if(typeof queueCargo==='function'&&S.village)queueCargo(d.product,count,b);else give(d.product,count);S.stats.animals+=b.animals;gainXP(b.animals*3);b.fed=0;b.premiumFeed=false;change();return true;}const cropNeed={[d.feed]:b.animals},need=has(cropNeed)?cropNeed:{hay_bale:b.animals};if(!has(need)){gameNotice('Need '+b.animals+' '+ITEMS[d.feed].name+' or hay bales to feed this pen.');return false;}const cat=assign('Feeding',b,now()+5000,'feed');if(!cat)return false;take(need);b.fed=Math.max(now(),cat.job.workStart||0)+d.cycle*1000/(1+(b.penLevel||0)*.15);change();return true;}
function premiumFeedAnimal(id){const b=readyBuilding(id),d=b&&BUILDINGS[b.type];if(!d?.animal||!b.animals||b.fed||!has({premium_feed:b.animals}))return false;const cat=assign('Feeding with premium feed',b,now()+5000,'feed');if(!cat)return false;take({premium_feed:b.animals});b.premiumFeed=true;b.fed=Math.max(now(),cat.job.workStart||0)+d.cycle*1000/(1+(b.penLevel||0)*.2);change();return true;}
function cook(id,item){
 const b=readyBuilding(id),r=RECIPES[item];if(!b||!r||r.at!==b.type||!recipeUnlocked(item)||b.queue.length>=3+(b.upgrade||0)||!has(r.need))return false;
 let start=Math.max(now(),b.queue.at(-1)?.end||0),duration=r.time*1000/(1+(b.upgrade||0)*.15);
 let cat=S.cats.find(c=>c.job?.kind==='cook'&&c.job.target===id&&c.job.end>now());if(!cat)cat=assign('Cooking',b,start+duration,'cook');if(!cat)return false;
 start=Math.max(start,cat.job.workStart||0);
 if(S.life){cat.skills ||= {farm:0,cook:0,haul:0};duration*=1-Math.min(.1,cat.skills.cook*.002);cat.skills.cook++;if(typeof catTrait==='function'&&catTrait(cat)==='Thoughtful')duration*=.95;}
 if(typeof bondSpeed==='function')duration*=bondSpeed(cat);const end=start+duration;
 cat.job.end=end;take(r.need);b.queue.push({item,start,end});change();return true;
}
function collectKitchen(id){const b=readyBuilding(id);if(!b)return false;let n=0;b.queue=b.queue.filter(j=>{if(j.end<=now()){if(typeof queueCargo==='function'&&S.village)queueCargo(j.item,1,b);else give(j.item);n++;return false;}return true;});if(!n)return false;gainXP(n*8);S.stats.cooked+=n;change();return true;}
function treeAction(id){const t=S.trees.find(t=>t.id===id);if(!t)return false;if(!t.end){const cat=assign('Watering',t,now()+5000,'water');if(!cat)return false;t.end=Math.max(now(),cat.job.workStart||0)+TREES[t.type].time*1000;}else if(t.end<=now()){if(typeof queueCargo==='function'&&S.village)queueCargo(t.type,3,t);else give(t.type,3);gainXP(5);t.end=0;}else return false;change();return true;}
function canMake(k,depth=0){if(k==='flower')return (S.decor||[]).some(d=>['planter','flowercorner'].includes(d.type));if(['fiber','rope','wood'].includes(k))return quantity(k)>0||!!S.village;const producer=Object.entries(LIFE_BUILDINGS).find(([id,d])=>d.output===k);if(producer)return S.buildings.some(b=>b.type===producer[0]&&b.ready<=now());if(['perch','carp','pearl'].includes(k))return !!S.village?.pier;if(depth>6)return false;if(CROPS[k])return CROPS[k].level<=level();if(TREES[k])return S.trees.some(t=>t.type===k);if(RECIPES[k]){const r=RECIPES[k];return recipeUnlocked(k)&&S.buildings.some(b=>b.type===r.at&&b.ready<=now())&&Object.keys(r.need).every(k=>canMake(k,depth+1));}return S.buildings.some(b=>BUILDINGS[b.type].product===k&&b.animals>0&&b.ready<=now());}
function makeOrder(delay=0){const pool=Object.keys(ITEMS).filter(k=>canMake(k));const id=S.nextId++,k=pool[id%pool.length]||'wheat',n=RECIPES[k]?1:2+id%3;const need={[k]:n};if(level()>4&&id%3===0){const k2=pool[(id+3)%pool.length];if(k2&&k2!==k)need[k2]=1;}const special=id%6===0;return{id,special,name:['Poppy','Boba','Pip','Maple','Kuma','Nala'][id%6],need,reward:Math.round(Object.entries(need).reduce((v,[k,n])=>v+ITEMS[k].value*n,0)*1.6*(special?1.25:1)),xp:Math.round((15+Object.keys(need).length*5)*(1+Math.max(0,level()-20)*.2)),arrives:now()+delay};}
while(S.orders.length<5+S.storeLevel*2)S.orders.push(makeOrder());
function serve(id){
 const i=S.orders.findIndex(o=>o.id===id),o=S.orders[i];
  if(!o||o.arrives>now()||!has(o.need,o.id))return false;
 const payout=typeof orderPayment==='function'?orderPayment(o):o.reward;
 const slot=S.orders.filter(q=>q.arrives<=now()).findIndex(q=>q.id===id);
 // Retire the order before callbacks/rewards; a repeated or stale ID cannot pay twice.
  take(o.need);S.orders[i]=makeOrder(20000);S.coins+=payout;S.stats.served++;
  if(typeof retireOrderReservation==='function')retireOrderReservation(o.id);
 S.departures ||= [];S.departures.push({id:o.id,start:now(),end:now()+13500,slot,serviceEnd:now()+3500});
 if(freeCat())assign('Serving',S.buildings.find(b=>b.type==='store'),now()+3500,'carry');
  if(typeof customerVisit==='function')customerVisit(o);
  if(typeof feedbackEvent==='function')feedbackEvent('order',S.buildings.find(b=>b.type==='store'),'+'+payout+' 🪙');
  gainXP(o.xp);change();return true;
}
function dismiss(id){const i=S.orders.findIndex(o=>o.id===id);if(i<0||S.orders[i].arrives>now())return false;S.orders[i]=makeOrder(300000);if(typeof retireOrderReservation==='function')retireOrderReservation(id);change();return true;}
function recruit(){const n=S.cats.length,cost=100*(n-2)**2;if(n>=houseCapacity()||level()<n-1||S.coins<cost)return false;const id=CAT_NAMES.findIndex((_,i)=>!S.cats.some(c=>c.id===i));if(id<0)return false;S.coins-=cost;S.cats.push({id,name:CAT_NAMES[id],x:3,y:5,job:null,wardrobe:[],outfit:{head:null,body:null,neck:null,back:null,accessory:null},outfitColors:{},skills:{farm:0,cook:0,haul:0},role:'all'});if(typeof initJourney==='function')initJourney();change();return true;}
function expansionInfo(){return {price:S.size<20?800:2500,level:S.size<20?6:12,max:S.size>=24};}
function expandIsland(){const d=expansionInfo();if(d.max||level()<d.level||S.coins<d.price)return false;S.coins-=d.price;S.size+=2;change();return true;}
function upgradeStore(){const cost=[1000,5000,15000][S.storeLevel];if(!cost||S.coins<cost)return false;S.coins-=cost;S.storeLevel++;while(S.orders.length<5+S.storeLevel*2)S.orders.push(makeOrder());change();return true;}
function sellItem(k,n=1){if(!ITEMS[k]||!Number.isInteger(n)||n<1||!has({[k]:n}))return false;take({[k]:n});S.coins+=ITEMS[k].value*n;change();return true;}
function dailyGift(){if(S.daily.gift)return false;S.daily.gift=true;S.coins+=50;give('wheat',3);change();return true;}
function goal(){if(S.stats.harvest<3)return {text:'Plant wheat and harvest 3 fields',n:S.stats.harvest,total:3};if(S.stats.served<3)return {text:'Serve 3 customers at the store',n:S.stats.served,total:3};if(S.stats.animals<4)return {text:'Feed hens and collect 4 eggs',n:S.stats.animals,total:4};if(!S.buildings.some(b=>b.type==='bakery'))return {text:'Reach level 5 and build your bakery',n:level(),total:5};if(S.stats.cooked<5)return {text:'Cook 5 products in your bakery',n:S.stats.cooked,total:5};return {text:'Grow your island · next unlock at level '+Math.min(100,level()+1),n:levelProgress(),total:1};}
saveGame();

const DAILY_TASKS=[{id:'harvest',name:'Harvest 12 fields',total:12,reward:60},{id:'served',name:'Serve 5 customers',total:5,reward:90},{id:'animals',name:'Collect 6 animal goods',total:6,reward:75},{id:'cooked',name:'Cook 3 products',total:3,reward:100}];
function taskProgress(t){return Math.max(0,S.stats[t.id]-(S.daily.base?.[t.id]||0));}
function claimTask(id){tick();const t=DAILY_TASKS.find(t=>t.id===id);if(!t||S.daily.claimed.includes(id)||taskProgress(t)<t.total)return false;S.daily.claimed.push(id);S.coins+=t.reward;change();gameNotice('Task complete! +'+t.reward+' coins');return true;}

function shopRoadRow(){const b=S.buildings.find(b=>b.type==='store');if(!b)return 7;const candidates=b.y>=12?[b.y,b.y+1,Math.max(13,b.y-1)]:[Math.min(7,b.y),Math.max(0,b.y-1),Math.max(0,b.y-2),Math.max(0,b.y-3)];return candidates.find(y=>![...S.buildings,...S.fields,...S.trees].some(o=>{const n=BUILDINGS[o.type]?.size||1;return o.x+n>b.x+2&&o.y<=y&&o.y+n>y}))??candidates[0];}
