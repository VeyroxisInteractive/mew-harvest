'use strict';
// Extend the existing work board and skill counters; no parallel XP economy.
function careerRank(cat,role){return cat?.careers?.[role]||0;}
function careerSpeed(cat,role){return 1-careerRank(cat,role)*.03;}
function careerPoints(cat,role){return role==='haul'?(cat.experience||0):(cat.skills?.[role]||0);}
function promoteCat(value){
 const [id,role,expected]=String(value).split(','),cat=S.cats.find(c=>c.id===+id);
 if(!cat||!['farm','cook','haul'].includes(role))return false;
 const rank=careerRank(cat,role),cost=[100,300,700][rank],need=[20,80,200][rank];
 // A stale or double-tapped button must not purchase the next promotion.
 if(+expected!==rank||rank>=3||cat.job?.end>now()||careerPoints(cat,role)<need||S.coins<cost)return false;
 S.coins-=cost;cat.careers ||= {};cat.careers[role]=rank+1;change();return true;
}
actions.careerPromote=promoteCat;
const workBoardBeforeCareers=lifePanel;
lifePanel=function(kind,id){
 if(kind!=='workboard')return workBoardBeforeCareers(kind,id);
 return '<p class="intro">Choose preferred work and promote experienced helpers. Each rank shortens new tasks in that career by 3%, up to 9%. Active work keeps its current timer.</p>'+S.cats.map(c=>'<div class="card"><h2>'+safe(c.name)+'</h2><p>'+safe(c.job?.end>now()?c.job.label:'Free')+'</p><div class="tabs">'+['all','farm','cook','haul'].map(k=>btn((k===c.role?'✓ ':'')+k,'role',c.id+','+k,false,true)).join('')+'</div>'+['farm','cook','haul'].map(role=>{
  const rank=careerRank(c,role),points=careerPoints(c,role),need=[20,80,200][rank],cost=[100,300,700][rank];
  return '<p>'+{farm:'Farming',cook:'Cooking',haul:'Delivery'}[role]+' · '+['Apprentice','Skilled','Expert','Master'][rank]+' · '+points+' experience'+(rank<3?' / '+need+' needed':'')+'</p>'+btn(rank===3?'Master rank':'Promote · 🪙 '+cost,'careerPromote',c.id+','+role+','+rank,rank===3||points<need||S.coins<cost||c.job?.end>now());
 }).join('')+'</div>').join('');
};
