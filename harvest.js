'use strict';
// Collections keep the existing once-only producer state and physical delivery.
function readyGoods(){
 return S.fields.filter(f=>f.crop&&f.end<=now()).length+
  S.trees.filter(t=>t.end&&t.end<=now()).length+
  S.buildings.reduce((n,b)=>n+(b.ready>now()?0:b.queue.filter(j=>j.end<=now()).length+(b.fed&&b.fed<=now()?1:0)+(b.lifeEnd&&b.lifeEnd<=now()?1:0)),0)+
  S.decor.filter(d=>['planter','flowercorner'].includes(d.type)&&d.end&&d.end<=now()).length+
  (S.life?.crafting||[]).filter(j=>j.end<=now()).length;
}
function collectAll(){
 const count=readyGoods();if(!count)return false;
 // Batch persistence/UI rendering without changing any producer's collection rules.
 batchChange(()=>{
  for(const f of S.fields)if(f.crop&&f.end<=now())fieldAction(f.id);
  for(const t of S.trees)if(t.end&&t.end<=now())treeAction(t.id);
  for(const b of S.buildings){
   if(b.queue.some(j=>j.end<=now()))collectKitchen(b.id);
   if(b.fed&&b.fed<=now())feedAnimal(b.id);
   if(b.lifeEnd&&b.lifeEnd<=now())collectLifeProduction(b.id);
  }
  for(const d of S.decor)if(['planter','flowercorner'].includes(d.type)&&d.end&&d.end<=now())useGarden(d.id);
  if(S.life?.crafting?.some(j=>j.end<=now()))collectCrafts();
 });
 gameNotice('Collected '+count+' ready batches. Cats will carry goods to your barn.');return true;
}
function materialsPanel(){
 return '<p class="intro">Gather or buy supplies, then use the cat crafting bench. Collected goods reach your barn after a helper delivers them.</p>'+
 '<div class="card"><h2>Flowers, from your own garden</h2><p>Shop → Garden → Flower planter (110 coins) or Flower corner (180 coins). Buy, tap Place, then tap your planter and Water. After 90 seconds collect 2 flowers (planter) or 4 (corner).</p><p>Flowers make bouquets, garlands, wreaths, floral orange tea and cat gifts. Supplies also sells 4 flowers for 72 coins.</p><button data-open="boutique">Open Shop → Garden</button></div>'+
 '<div class="card"><h2>Stone blocks & building materials</h2><p>Unlock meadow plots and tap rocks, trees or grass to gather stone, wood and fiber.</p><p>3 Stone → 2 Stone Blocks · 3 Wood → 2 Planks · 4 Fiber → 1 Rope. Stone blocks are the same blocks used by cottage and workshop upgrades.</p><button data-open="craft">Open crafting bench</button></div>'+
 '<div class="card"><h2>Bait & compost</h2><p>2 Fiber + 1 Wheat → 3 Bait. Build the fishing pier to use bait.</p><p>4 Fiber → 2 Compost. Tools & compost applies it once per growing field to shorten remaining growth by 20%.</p><button data-open="tools">Tools & compost</button></div>'+
 '<div class="menu-grid"><button data-open="supplies">Buy supplies</button><button data-open="logistics">Track deliveries</button></div>';
}

function unlockCatalogue(){
 return [
  ...Object.entries(BUILDINGS).filter(([k,d])=>d.cost).map(([k,d])=>({level:d.level,name:d.name,kind:'Building',owned:S.buildings.some(b=>b.type===k)})),
  ...Object.entries(RECIPES).map(([k,r])=>({level:Math.max(r.level,BUILDINGS[r.at].level),name:ITEMS[k].name,kind:BUILDINGS[r.at].name,owned:recipeUnlocked(k)})),
  ...Object.values(CROPS).map(d=>({level:d.level,name:d.name,kind:'Crop'})),
  ...Object.values(TREES).map(d=>({level:d.level,name:d.name,kind:'Fruit tree'})),
  {level:50,name:'Sunrise Valley',kind:'38 × 38 high-detail area · 25,000 coins · clearing & settlement goals',owned:!!S.eastValley}
 ].sort((a,b)=>a.level-b.level);
}
function upcomingPanel(){
 const future=unlockCatalogue().filter(d=>d.level>level());
 return '<p class="intro">Level '+level()+' · '+Math.floor(levelProgress()*100)+'% to the next level. Earn XP by growing, producing and serving customers. Previously owned buildings and compatible recipes remain usable.</p>'+
 future.map(d=>'<div class="card"><h2>Level '+d.level+' · '+d.name+'</h2><p>'+d.kind+(d.owned?' · Already available on this save':'')+'</p></div>').join('')+
 (!future.length?'<p>You have reached all currently listed unlocks.</p>':'')+'<button data-open="valley">Explore Sunrise Valley goals</button>';
}
