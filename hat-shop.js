'use strict';
const HatShop=(()=>{
 const catalog={straw:{name:'Woven Farmer Hat',cost:120,style:'straw'},cowboy:{name:'Trail Cowboy Hat',cost:220,style:'cowboy'},cap:{name:'Blue Work Cap',cost:90,style:'cap'},bucket:{name:'Olive Fishing Hat',cost:150,style:'bucket'},beanie:{name:'Cherry Knit Beanie',cost:130,style:'beanie'},chef:{name:'White Chef Hat',cost:180,style:'chef'}};
 let selected=0;
 const owned=k=>!!S.hatCollection?.includes(k);
 const equipped=c=>c&&owned(c.shopHat)&&catalog[c.shopHat]?catalog[c.shopHat].style:null;
 function buy(k){const h=catalog[k];if(!h||owned(k)||S.coins<h.cost)return false;S.coins-=h.cost;(S.hatCollection ||= []).push(k);change();gameNotice(h.name+' purchased. Choose a cat, then tap Wear.');return true;}
 function select(id){const c=S.cats.find(c=>c.id===+id);if(!c)return false;selected=c.id;renderPanel();return true;}
 function wear(args){const [id,k]=String(args).split(','),c=S.cats.find(c=>c.id===+id);if(!c||k!=='none'&&(!catalog[k]||!owned(k)))return false;if(k==='none')delete c.shopHat;else c.shopHat=k;change();return true;}
 function panel(){const c=S.cats.find(c=>c.id===selected)||S.cats[0];if(!c)return '';selected=c.id;
  return '<p class="intro">Buy a hat with farm coins, then choose which cat wears it. Buying never equips it automatically. Owned hats can be worn by any of your cats.</p><div class="tabs">'+S.cats.map(cat=>btn((cat.id===selected?'✓ ':'')+safe(cat.name),'hatCat',cat.id,false,true)).join('')+'</div><div class="card row"><div><h2>'+safe(c.name)+'</h2><p>'+(equipped(c)?catalog[c.shopHat].name:'No hat equipped')+'</p></div>'+btn('Remove hat','hatWear',c.id+',none',!equipped(c),true)+'</div><div class="grid">'+Object.entries(catalog).map(([k,h])=>'<div class="card"><canvas class="hat-preview" data-hat="'+k+'" width="200" height="110" aria-label="'+h.name+'"></canvas><h2>'+h.name+'</h2><p>'+(owned(k)?'Owned':'🪙 '+h.cost)+'</p>'+(!owned(k)?btn('Buy hat','hatBuy',k,S.coins<h.cost):btn(c.shopHat===k?'Wearing':'Wear on '+safe(c.name),'hatWear',c.id+','+k,c.shopHat===k))+'</div>').join('')+'</div>';
 }
 function previews(){if(typeof CatHatArt==='undefined')return;document.querySelectorAll('[data-hat]').forEach(c=>{const g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);CatHatArt.drawAt(g,100,76,115,catalog[c.dataset.hat].style);});}
 return {catalog,buy,select,wear,equipped,panel,previews};
})();
