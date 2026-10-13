'use strict';
// Portable layouts share positions and object types, never player saves or ownership.
const FarmBlueprints=(()=>{
 function exportData(){const counts={};return{app:'MEW HARVEST Blueprint',version:1,name:'My farm layout',entries:layoutEntries().map(e=>{const key=e.kind+':'+e.type,index=counts[key]||0;counts[key]=index+1;return{kind:e.kind,type:e.type,index,x:e.x,y:e.y,flip:e.flip};})};}
 function prepare(raw){
  if(!raw||raw.app!=='MEW HARVEST Blueprint'||raw.version!==1||!Array.isArray(raw.entries)||!raw.entries.length||raw.entries.length>1000)return{ok:false,reason:'Not a supported farm blueprint.'};
  const objects=layoutEntries(),groups={},seen=new Set(),entries=[];
  for(const e of objects)(groups[e.kind+':'+e.type]||=[]).push(e);
  for(const e of raw.entries){
   if(!e||!['buildings','fields','trees','decor'].includes(e.kind)||typeof e.type!=='string'||!Number.isInteger(e.index)||e.index<0||!Number.isInteger(e.x)||!Number.isInteger(e.y)||Math.abs(e.x)>200||Math.abs(e.y)>200||typeof e.flip!=='boolean')return{ok:false,reason:'Blueprint contains invalid positions.'};
   const ref=e.kind+':'+e.type+':'+e.index;if(seen.has(ref))return{ok:false,reason:'Blueprint repeats an object.'};seen.add(ref);
   const owned=groups[e.kind+':'+e.type]?.[e.index];if(!owned)return{ok:false,reason:'You must already own all objects in this blueprint.'};
   entries.push({...owned,x:e.x,y:e.y,flip:e.flip});
  }
  const check=layoutCheck(entries);if(!check.ok)return check;
  return{ok:true,entries,name:(typeof raw.name==='string'?raw.name:'Imported blueprint').trim().slice(0,32)||'Imported blueprint'};
 }
 function importData(raw){const p=prepare(raw);if(!p.ok){gameNotice(p.reason);return false;}if(S.journey.layouts.length>=3){gameNotice('Delete one saved preset to make room.');return false;}
  const equivalent=l=>l.entries.length===p.entries.length&&l.entries.every(e=>p.entries.some(n=>n.id===e.id&&n.x===e.x&&n.y===e.y&&n.flip===e.flip));
  if(S.journey.layouts.some(equivalent)){gameNotice('This layout is already saved.');return false;}
  S.journey.layouts.push({id:S.journey.nextLayout++,name:p.name,created:now(),entries:p.entries});change();gameNotice('Blueprint saved. Preview and apply it from Layouts.');return true;
 }
 function download(){const url=URL.createObjectURL(new Blob([JSON.stringify(exportData(),null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='MEW-HARVEST-blueprint.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return true;}
 actions.blueprintExport=download;
 document.addEventListener('change',async e=>{if(e.target.id!=='blueprintFile')return;const file=e.target.files?.[0];e.target.value='';if(!file)return;if(file.size>250000){gameNotice('Blueprint must be smaller than 250 KB.');return;}try{importData(JSON.parse(await file.text()));}catch{gameNotice('Could not read this blueprint JSON.');}});
 const oldRender=renderPanel;renderPanel=function(){oldRender();if(panel==='layouts')$('sheetBody').insertAdjacentHTML('beforeend','<div class="card"><h2>Share a farm blueprint</h2><p>Share placement only. Coins, inventory and cat details stay private. Imports use objects you already own and remain a preview until you apply them.</p>'+btn('Download blueprint','blueprintExport')+'<label class="input-label">Import blueprint<input id="blueprintFile" type="file" accept=".json,application/json"></label></div>');};
 return{exportData,prepare,importData};
})();
