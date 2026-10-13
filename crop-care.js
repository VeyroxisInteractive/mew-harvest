'use strict';
// Optional farm challenge. Existing saves/crops remain unchanged until enabled.
function pestState(){return S.farmPests ||= {enabled:false,plantings:0,cleared:0};}
function togglePestChallenges(){if(level()<12)return false;const d=pestState();d.enabled=!d.enabled;change();return true;}
function tendPestField(id){
 const f=S.fields.find(f=>f.id===+id);if(!f?.pests||f.pestTask||!has({herb:1}))return false;
 const cat=assign('Brushing pests from crops',f,now()+10000,'care');if(!cat)return false;
 take({herb:1});f.pestTask={end:cat.job.end,cat:cat.id};change();return true;
}
function cropCareTick(){let dirty=false;for(const f of S.fields){if(!f.pestTask||f.pestTask.end>now())continue;delete f.pestTask;delete f.pests;pestState().cleared++;give('compost',1);dirty=true;}if(dirty)change();}
const pestPreviousTick=lifeTick;
lifeTick=function(){cropCareTick();pestPreviousTick();};
const pestPreviousField=fieldAction;
fieldAction=function(id){const f=S.fields.find(f=>f.id===id);if(f?.pests){if(!has({herb:1}))gameNotice('Use 1 garden herb and a free cat to clear these pests. Grow herbs in your Greenhouse.');return tendPestField(id);}
 const planting=f&&!f.crop,ok=pestPreviousField(id);if(ok&&planting&&f.crop&&S.farmPests?.enabled){const d=pestState();d.plantings++;if(d.plantings%5===0)f.pests=true;change();}return ok;
};
Object.assign(actions,{pestToggle:togglePestChallenges,pestTend:tendPestField});
const pestPreviousSection=Homestead.section;
Homestead.section=function(k){let html=pestPreviousSection(k);if(k!=='garden')return html;const d=S.farmPests,affected=S.fields.filter(f=>f.pests);return html+'<div class="card"><h2>Crop pest challenges · Level 12</h2><p>Optional: every fifth new planting attracts pests. Affected crops keep growing but must be treated before harvesting. Spend 1 garden herb and assign a free cat for ten seconds plus walking time. Successful care returns 1 compost. Disabling stops new pests; existing infestations still need care.</p>'+btn(d?.enabled?'Disable new pest challenges':'Enable pest challenges','pestToggle','',level()<12)+'<p>Cleared: '+(d?.cleared||0)+'</p>'+affected.map(f=>'<p>Field '+f.id+' · '+ITEMS[f.crop].name+(f.pestTask?' · '+remaining(f.pestTask.end):' · pests present')+'</p>'+btn('Treat · 1 herb','pestTend',f.id,!!f.pestTask||!has({herb:1}))).join('')+'</div>';};
function drawFieldPests(ctx,f,p,clock){if(!f.pests)return;ctx.save();ctx.fillStyle='#42532b';ctx.strokeStyle='#354826';ctx.lineWidth=1;for(let i=0;i<5;i++){const x=p.x-24+i*12+Math.sin(clock*2+i)*3,y=p.y-9+Math.cos(clock+i)*7;ctx.beginPath();ctx.ellipse(x,y,2.5,1.6,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(x-3,y-3);ctx.lineTo(x+3,y+3);ctx.moveTo(x+3,y-3);ctx.lineTo(x-3,y+3);ctx.stroke();}ctx.restore();}
