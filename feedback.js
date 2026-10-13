'use strict';
// Procedural audio needs no downloads and only unlocks after a player gesture.
const FarmAudio=(()=>{
 let context=null,river=null,riverGain=null,unlocked=false,nextMusic=0,lastEffect=0;
 function enabled(){return unlocked&&S.sound&&!document.hidden&&$('loading')?.hidden!==false;}
 function ensure(){if(context)return context;const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return null;audioContext ||= new Audio();context=audioContext;return context;}
 function note(frequency,time,duration,volume,channel='effects',type='sine'){
  if(!enabled()||!context||!volume)return;const amount=S.journey?.audio[channel]??.5;if(!amount)return;
  const o=context.createOscillator(),g=context.createGain();o.type=type;o.frequency.setValueAtTime(frequency,time);o.connect(g);g.connect(context.destination);
  g.gain.setValueAtTime(.0001,time);g.gain.exponentialRampToValueAtTime(Math.max(.0001,volume*amount),time+.025);g.gain.exponentialRampToValueAtTime(.0001,time+duration);o.start(time);o.stop(time+duration+.03);o.onended=()=>{o.disconnect();g.disconnect();};
 }
 function sync(){
  if(!context)return;
  // The loading presentation owns its short-lived ambience until it finishes.
  if($('loading')?.hidden===false)return;
  if(!enabled()){if(river){river.stop();river.disconnect();river=null;}context.suspend().catch(()=>{});return;}
  context.resume().catch(()=>{});
  const volume=S.journey?.audio.ambience??.25;
  if(!volume&&river){river.stop();river.disconnect();river=null;}
  if(volume&&!river){
   const buffer=context.createBuffer(1,context.sampleRate*2,context.sampleRate),samples=buffer.getChannelData(0);let smooth=0;
   for(let i=0;i<samples.length;i++){smooth=(smooth+(Math.random()*2-1)*.05)/1.05;samples[i]=smooth*3;}
   river=context.createBufferSource();river.buffer=buffer;river.loop=true;const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=900;
   const gain=context.createGain();riverGain=gain;river.connect(filter);filter.connect(gain);gain.connect(context.destination);river.start();
   river.onended=()=>{filter.disconnect();gain.disconnect();};
  }
  if(riverGain)riverGain.gain.setTargetAtTime(volume*.12,context.currentTime,.15);
 }
 function unlock(){if(!S.sound)return;try{if(!ensure())return;unlocked=true;sync();}catch{}}
 function play(kind='tap'){
  if(!enabled()||!context)return;const t=context.currentTime;if(t-lastEffect<.07)return;lastEffect=t;
  const melody={tap:[660],harvest:[523,784],order:[523,659,784],build:[392,523],gift:[440,554,659],story:[392,494,587,784],ready:[659,784]}[kind]||[660];
  melody.forEach((f,i)=>note(f,t+i*.075,.24,.065));
 }
 let farmBeat=0;
 setInterval(()=>{if(!enabled()||!context)return;const t=context.currentTime;farmBeat++;
  const tractor=typeof CargoTransport!=='undefined'&&CargoTransport.active();
  if(tractor&&CargoTransport.progress(tractor).driving){for(let i=0;i<4;i++)note(54+i%2*9,t+i*.18,.16,.024,'effects','triangle');}
  const job=S.cats.find(c=>c.job&&c.job.end>now()&&(!c.job.arrive||c.job.arrive<=now()))?.job;
  if(job&&farmBeat%2===0){const f={cook:280,build:105,clear:145,water:750,plant:190,harvest:420}[job.kind]||230;note(f,t,.09,.024,'effects','triangle');note(f*.7,t+.18,.08,.016,'effects','triangle');}
  if(farmBeat%12===0&&S.buildings.some(b=>b.animals>0)){note(620,t,.13,.02,'ambience');note(850,t+.17,.16,.016,'ambience');}
 },850);
 document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('keydown',unlock);document.addEventListener('visibilitychange',sync);window.addEventListener('pagehide',()=>{if(context)context.suspend().catch(()=>{});});
 setInterval(()=>{sync();if(!enabled()||!context)return;const t=context.currentTime;if(t<nextMusic)return;nextMusic=t+7;const notes=timeOfDay()==='Night'?[262,330,392,330]:[392,494,587,659];notes.forEach((f,i)=>note(f,t+i*.65,1.5,.04,'music'));},1000);
 return {play,sync:()=>{unlock();sync();},inspect:()=>({unlocked,state:context?.state||'not-started'})};
})();
function feedbackEvent(kind,target,text){
 FarmAudio.play(kind);if(target&&text&&typeof World!=='undefined'&&World.feedback)World.feedback(text,target);
 if(kind==='order'){const el=$('coins');el?.classList.add('coin-reward');setTimeout(()=>el?.classList.remove('coin-reward'),400);}
}
let knownProduction=new Map(),notificationsReady=false,lastReadyNotice=0;
function productionEnds(){
 const jobs=[];
 for(const f of S.fields)if(f.crop)jobs.push({id:'field:'+f.id+':'+f.end,end:f.end,name:ITEMS[f.crop].name});
 for(const b of S.buildings){for(const q of b.queue)jobs.push({id:'queue:'+b.id+':'+q.end+':'+q.item,end:q.end,name:ITEMS[q.item].name});if(b.lifeEnd)jobs.push({id:'life:'+b.id+':'+b.lifeEnd,end:b.lifeEnd,name:ITEMS[LIFE_BUILDINGS[b.type].output].name});if(b.fed)jobs.push({id:'pen:'+b.id+':'+b.fed,end:b.fed,name:ITEMS[BUILDINGS[b.type].product].name});}
 for(const t of S.trees)if(t.end)jobs.push({id:'tree:'+t.id+':'+t.end,end:t.end,name:ITEMS[t.type].name});
 for(const d of S.decor)if(d.end)jobs.push({id:'garden:'+d.id+':'+d.end,end:d.end,name:'Garden flowers'});
 for(const q of S.life.crafting||[])jobs.push({id:'craft:'+q.id,end:q.end,name:CRAFTS[q.key].name});return jobs;
}
function resetProductionNotifications(){knownProduction=new Map();notificationsReady=false;}
function productionNotifications(){
 const jobs=productionEnds(),ready=[];
 for(const j of jobs){const done=j.end<=now();if(notificationsReady&&done&&knownProduction.get(j.id)===false)ready.push(j);knownProduction.set(j.id,done);}
 const ids=new Set(jobs.map(j=>j.id));for(const id of knownProduction.keys())if(!ids.has(id))knownProduction.delete(id);
 notificationsReady=true;
 if(ready.length&&now()-lastReadyNotice>3500){lastReadyNotice=now();notice(ready.length===1?ready[0].name+' is ready to collect.':ready.length+' production batches are ready to collect.');FarmAudio.play('ready');}
}
