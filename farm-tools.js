'use strict';
/* MEW HARVEST farm tools v88: non-destructive, local-only player utilities. */
(()=>{
 const init=()=>{
  const trigger=document.getElementById('farmToolsButton');
  if(!trigger)return;
  const dialog=document.createElement('dialog');dialog.id='farmToolsDialog';dialog.className='farm-tools-dialog';
  dialog.innerHTML=`<div class="ft-head"><h2>🌾 Farm Toolkit</h2><button type="button" id="ftClose" aria-label="Close Farm Toolkit">✕</button></div>
  <div class="ft-body"><p id="ftNetwork" role="status"></p><div id="ftStats" class="ft-stats"></div>
  <h3>🏆 Farm milestones</h3><div id="ftMilestones"></div>
  <h3>💾 Keep your progress safe</h3><p>Export a private backup to your device. Import restores a backup only after you confirm. Nothing is uploaded to a server.</p>
  <div class="ft-actions"><button type="button" id="ftExport">Download backup</button><button type="button" id="ftImport">Restore backup</button></div>
  <input id="ftFile" type="file" accept=".json,application/json" hidden><p id="ftMessage" role="status"></p></div>`;
  document.body.append(dialog);
  const $=id=>dialog.querySelector('#'+id);
  const message=s=>{$('ftMessage').textContent=s;};
  const safeNumber=n=>Number.isFinite(n)?n.toLocaleString(): '0';
  const progress=()=>{
   const stats=S.stats||{},milestones=[
    ['First harvest',stats.harvest||0,1],['Green thumb',stats.harvest||0,50],
    ['First customer',stats.served||0,1],['Village favorite',stats.served||0,25],
    ['Home cooking',stats.cooked||0,10],['Animal caretaker',stats.animals||0,10]
   ];
   $('ftNetwork').textContent=navigator.onLine?'🟢 Connected — offline play may be available after caching':'🟠 Offline — your farm is stored on this device';
   $('ftStats').innerHTML=[['Level',level()],['Coins',safeNumber(S.coins)],['XP',safeNumber(S.xp)],['Buildings',S.buildings.length],['Fields',S.fields.length],['Cats',S.cats.length],['Orders served',safeNumber(stats.served||0)],['Crops harvested',safeNumber(stats.harvest||0)]].map(([k,v])=>`<div><span>${k}</span><strong>${v}</strong></div>`).join('');
   $('ftMilestones').innerHTML=milestones.map(([label,current,goal])=>`<div class="ft-milestone"><span>${current>=goal?'🏅':'🔒'} ${label}</span><span>${Math.min(current,goal)} / ${goal}</span><progress value="${Math.min(current,goal)}" max="${goal}"></progress></div>`).join('');
  };
  trigger.addEventListener('click',()=>{message('');progress();dialog.showModal();});
  $('ftClose').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  window.addEventListener('online',()=>{if(dialog.open)progress();});
  window.addEventListener('offline',()=>{if(dialog.open)progress();});
  $('ftExport').addEventListener('click',()=>{
   try{
    exportBackup();message('Backup download started. Keep this file safe.');
   }catch(e){message('Could not export backup: '+e.message);}
  });
  $('ftImport').addEventListener('click',()=>$('ftFile').click());
  $('ftFile').addEventListener('change',async()=>{
   const file=$('ftFile').files[0];$('ftFile').value='';if(!file)return;
   if(file.size>3*1024*1024){message('Backup is too large. Maximum 3 MB.');return;}
   try{
    const raw=JSON.parse(await file.text());const restored=decodeFarmBackup(raw);
    if(!restored)throw Error('Invalid or incompatible MEW HARVEST backup');
    if(!window.confirm('Restore this farm? Your current progress will be replaced. A safety copy will be kept on this device.')){message('Restore cancelled.');return;}
    const old=localStorage.getItem(SAVE_KEY);
    if(old)localStorage.setItem(SAVE_KEY+'-before-import',old);
    localStorage.setItem(SAVE_KEY,JSON.stringify(restored));
    window.location.reload();
   }catch(e){message('Restore stopped: '+e.message);}
  });
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
