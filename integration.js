'use strict';
// One destination per activity. Island Life remains a directory of these destinations.
const VillageIntegration=(()=>{
 const destinations={garden:'overview',shore:'coast',cellar:'workshops',guests:'coast',mine:'exploration',sanctuary:'villagebuild',nature:'collection',treasure:'exploration',play:'villageLeisure'};
 const previousRender=renderPanel;
 renderPanel=function(){previousRender();if(panel==='homestead'){$('sheetTitle').textContent='Island Life';$('sheetBody').innerHTML='<p>Activities now live with their related farm systems. Your existing progress is preserved.</p><div class="menu-grid">'+Object.entries(HOMESTEAD_GROUPS).map(([k,[icon,name]])=>btn(icon+' '+name,'hsTab',k)).join('')+'</div>';return;}if(panel==='villageLeisure'){$('sheetTitle').textContent='Village leisure';$('sheetBody').innerHTML='';}for(const[k,p]of Object.entries(destinations))if(p===panel)$('sheetBody').insertAdjacentHTML('beforeend','<div class="integrated-activity" id="activity-'+k+'">'+Homestead.section(k)+'</div>');};
 actions.hsTab=k=>{if(!Object.hasOwn(destinations,k))return false;openPanel(destinations[k]);document.getElementById('activity-'+k)?.scrollIntoView?.({block:'start'});return true;};
 FarmNavigation.entries.push(['villageLeisure','stories','Village leisure','गाँव की गतिविधियाँ']);
 // Existing clay goods remain valid in old backups; new work uses the original material.
 RECIPES.ceramic.need={rawclay:4,wood:1};
 delete SHOP_CATALOG.pottery_clay;
 function migrate(){
  let changed=S.integratedRevision!==90;
  const merge=bag=>{if(bag&&Object.hasOwn(bag,'clay')){bag.rawclay=(bag.rawclay||0)+bag.clay;delete bag.clay;changed=true;}};
  merge(S.inventory);
  for(const q of S.village?.cargo||[])if(q.item==='clay'){q.item='rawclay';changed=true;}
  for(const o of S.orders||[])merge(o.need);
  for(const list of [S.village?.discovered,S.journey?.pins])if(list?.includes('clay')){const updated=[...new Set(list.map(k=>k==='clay'?'rawclay':k))];list.splice(0,list.length,...updated);changed=true;}
  S.integratedRevision=90;return changed;
 }
 const oldGive=give;give=function(k,n=1){return oldGive(k==='clay'?'rawclay':k,n);};
 const oldValidate=validate;validate=function(a){return (a?.integratedRevision===undefined||a.integratedRevision===90)&&oldValidate(a);};
 if(migrate())saveGame();return {destinations,migrate};
})();
