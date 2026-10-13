'use strict';
const SeedExchange=(()=>{
 const today=()=>Math.floor(now()/86400000);
 function offers(){
  const crops=Object.keys(CROPS).filter(k=>CROPS[k].level<=level()).sort((a,b)=>CROPS[a].level-CROPS[b].level||a.localeCompare(b));
  if(crops.length<2)return [];
  return crops.slice(1).sort((a,b)=>((crops.indexOf(a)+today())%crops.length)-((crops.indexOf(b)+today())%crops.length)).slice(0,3).map(to=>{
   const from=crops[(today()+crops.indexOf(to))%crops.indexOf(to)];
   return {from,to,count:Math.max(2,Math.ceil(CROPS[to].cost/CROPS[from].cost)+1),key:today()+':'+from+':'+to};
  });
 }
 function claimed(key){return S.seedExchange?.claimed?.includes(key)||false;}
 function trade(key){
  const offer=offers().find(o=>o.key===key);
  // Monotonic saved day rejects rollback of a previously completed trading day.
  if(!offer||(S.seedExchange?.day===today()&&S.seedExchange.claimed.length>=3)||S.seedExchange?.day>today()||claimed(key)||(S.seeds?.[offer.from]||0)<offer.count)return false;
  if(!S.seedExchange||S.seedExchange.day!==today())S.seedExchange={day:today(),claimed:[]};
  S.seeds[offer.from]-=offer.count;S.seeds[offer.to]=(S.seeds[offer.to]||0)+1;S.seedExchange.claimed.push(key);change();return true;
 }
 actions.seedExchange=trade;
 const before=renderPanel;
 renderPanel=function(){before();if(panel!=='boutique'||shopTab!=='seeds')return;
  $('sheetBody').insertAdjacentHTML('beforeend','<div class="card"><h2>Seed exchange</h2><p>Trade owned seed packets for different unlocked crops. Three offers at most, each once per UTC day. Coins and harvested crops stay in your barn.</p>'+ (offers().map(o=>'<p>'+o.count+' '+ITEMS[o.from].name+' packets → 1 '+ITEMS[o.to].name+' packet</p>'+btn(claimed(o.key)?'Traded today':'Exchange packets','seedExchange',o.key,claimed(o.key)||(S.seedExchange?.day===today()&&S.seedExchange.claimed.length>=3)||S.seedExchange?.day>today()||(S.seeds?.[o.from]||0)<o.count)).join('')||'<p>Unlock a second crop to start exchanging seeds.</p>')+'</div>');
 };
 return {offers,trade};
})();
