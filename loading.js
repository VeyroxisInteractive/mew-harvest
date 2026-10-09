'use strict';
// A presentation layer for #loading, never a second bootstrap or save owner.
(()=>{
 const root=document.getElementById('loading');
 if(!root||root.hidden||window.MewLoading)return;
 const message=document.getElementById('loading-message'),detail=document.getElementById('loading-detail');
 const path=document.getElementById('loading-progress'),tip=document.getElementById('loading-tip'),sound=document.getElementById('loading-sound');
 const messages=['Preparing your island','Planting the fields','Waking the cats','Filling the river','Loading the harvest tractor',"Preparing today's harvest",'Checking the animal homes','Getting the kitchens ready'];
 const fun=['The cats are getting ready for work','The chickens are already hungry','Someone forgot the watering can','A butterfly found the farm first','The market cats are setting up','A tiny pawprint on every parcel'];
 // Verified against fieldAction, physical cargo delivery, serve, and the planner.
 const tips=['Tip: One cat can look after all fields growing the same crop.','Tip: Follow your cat-driven tractor in Menu → Tractor & deliveries.','Tip: You can serve any customer whose order is ready.','Tip: Orders → Plan combines ingredients for selected customers.','Tip: Hold a field or building, then drag to move it.'];
 let ended=false,configured=false,messageTimer=null,exitTimer=null,turn=0,wantsSound=false,audio=null;
 // During a cached-PWA upgrade, the previous world.js may still hide this same
 // canonical overlay directly. Tear down presentation in that case as well.
 const hiddenObserver=new MutationObserver(()=>{if(root.hidden)finish();});
 let seed=Date.now()>>>0;
 try{seed=crypto.getRandomValues(new Uint32Array(1))[0];}catch{}
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const pick=list=>list[Math.floor(random()*list.length)];

 function configure(){
  if(configured)return;
  // These are read-only existing APIs. Early script downloads may precede S.
  try{
   if(typeof S==='undefined'||!S.life)return;
   const effects=S.life.effects!==false;
   const time=effects&&typeof timeOfDay==='function'?timeOfDay():'Day';
   const sky=effects&&typeof weather==='function'?weather():'Clear';
   root.dataset.loadingTime=['Day','Evening','Night'].includes(time)?time.toLowerCase():'day';
   root.dataset.weather=sky==='Rain'?'rain':'clear';
   root.dataset.waterMotion=String(S.life.waterMotion!==false);
   const dark=time==='Night'||time==='Evening',rare=random();
   let accent=sky==='Rain'?pick(['quiet','leaf']):dark?pick(['fireflies','quiet','leaf']):pick(['butterflies','birds','leaf','cameo','quiet']);
   if(!dark&&sky!=='Rain'&&rare<.06)accent=rare<.03?'rainbow':'special-butterfly';
   root.dataset.accent=accent;
   root.dataset.pair=String(accent==='butterflies'&&random()<.4);
   if(accent==='cameo')root.querySelector('.loading-cameo').setAttribute('href','art/'+pick(['crop-12','coast-2'])+'.webp?v=31');
   sound.hidden=!S.sound;
   configured=true;
  }catch{/* Default daylight and silence are always usable. */}
 }
 function stopMessages(){clearTimeout(messageTimer);messageTimer=null;}
 function scheduleMessage(){
  if(ended||document.hidden||messageTimer!==null)return;
  messageTimer=setTimeout(()=>{
   messageTimer=null;
   if(ended||document.hidden)return;
   try{
    configure();turn++;
    message.textContent=random()<.27?pick(fun):messages[turn%messages.length];
    if(turn>=2)tip.textContent=tips[(turn-2)%tips.length];
    if(audio){if(soundAllowed())chirp(audio);else{wantsSound=false;stopAudio();sound.hidden=true;}}
   }catch{}
   scheduleMessage();
  },5200);
 }
 function progress(done,total){
  if(ended)return;
  configure();
  if(!Number.isFinite(done)||!Number.isFinite(total)||total<=0)return;
  const count=Math.max(0,Math.min(done,total));
  path.setAttribute('aria-label','Loading farm artwork');
  path.setAttribute('aria-valuemin','0');path.setAttribute('aria-valuemax',String(total));path.setAttribute('aria-valuenow',String(count));
  path.setAttribute('aria-valuetext',count+' of '+total+' artwork files checked; preparing the farm next');
  path.style.setProperty('--load-progress',count/total);
  detail.textContent=count===total?'Artwork checked · preparing the farm':'Farm artwork · '+count+' / '+total;
  if(count/total>=.9&&root.dataset.loadingTime==='day'&&root.dataset.weather!=='rain')root.classList.add('is-sunrise');
 }

 // Opt-in only, using the game's existing AudioContext and sound preference.
 // One looped, quiet river buffer + short bird notes; no audio timers or files.
 function soundAllowed(){try{return configured&&S.sound===true;}catch{return false;}}
 function stopAudio(){
  const old=audio;audio=null;
  if(old){for(const source of old.sources){try{source.stop();source.disconnect();}catch{}}old.bus?.disconnect();}
  sound.setAttribute('aria-pressed','false');sound.textContent='Listen to the farm';
 }
 function chirp(session){
  if(audio!==session||!session.bus||root.dataset.loadingTime==='night'||root.dataset.weather==='rain')return;
  const ctx=session.ctx,t=ctx.currentTime;
  const bird=ctx.createOscillator(),gain=ctx.createGain();
  bird.type='sine';bird.frequency.setValueAtTime(1550,t);bird.frequency.exponentialRampToValueAtTime(2400,t+.1);bird.frequency.exponentialRampToValueAtTime(1800,t+.24);
  gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.035,t+.03);gain.gain.exponentialRampToValueAtTime(.0001,t+.28);
  bird.connect(gain);gain.connect(session.bus);session.sources.add(bird);
  bird.onended=()=>{session.sources.delete(bird);bird.disconnect();gain.disconnect();};bird.start(t);bird.stop(t+.3);
 }
 async function startAudio(){
  if(ended||document.hidden||!wantsSound||!soundAllowed()||audio)return;
  const session={sources:new Set(),bus:null,ctx:null};audio=session;
  try{
   audioContext ||= new (window.AudioContext||window.webkitAudioContext)();
   session.ctx=audioContext;
   await audioContext.resume();
   if(audio!==session||ended||document.hidden||!soundAllowed()){if(audio===session)stopAudio();return;}
   if(audioContext.state!=='running'){stopAudio();return;}
   const ctx=audioContext,bus=ctx.createGain();session.bus=bus;
   bus.gain.setValueAtTime(.22,ctx.currentTime);bus.connect(ctx.destination);
   const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),data=buffer.getChannelData(0);
   let soft=0;for(let i=0;i<data.length;i++){soft=(soft+(random()*2-1)*.025)/1.025;data[i]=soft;}
   const river=ctx.createBufferSource();river.buffer=buffer;river.loop=true;river.connect(bus);session.sources.add(river);river.start();
   sound.setAttribute('aria-pressed','true');sound.textContent='Quiet, please';chirp(session);
  }catch{if(audio===session)stopAudio();}
 }
 function toggleSound(){wantsSound=!wantsSound;if(wantsSound)startAudio();else stopAudio();}
 function visibility(){
  root.classList.toggle('is-paused',document.hidden);
  if(document.hidden){stopMessages();stopAudio();}else if(!ended){configure();scheduleMessage();if(wantsSound)startAudio();}
 }
 function pagehide(){root.classList.add('is-paused');stopMessages();stopAudio();if(ended)hide();}
 function cleanup(){
  stopMessages();stopAudio();hiddenObserver.disconnect();
  document.removeEventListener('visibilitychange',visibility);
  window.removeEventListener('pagehide',pagehide);window.removeEventListener('pageshow',visibility);
  sound.removeEventListener('click',toggleSound);
 }
 function hide(){clearTimeout(exitTimer);exitTimer=null;if(!root.hidden)root.hidden=true;root.removeEventListener('transitionend',transitionEnd);}
 function transitionEnd(event){if(event.target===root&&event.propertyName==='opacity')hide();}
 function finish(){
  if(ended)return;
  ended=true;
  try{
   cleanup();root.setAttribute('aria-busy','false');root.classList.add('is-leaving');
   if(root.hidden||document.hidden||window.matchMedia('(prefers-reduced-motion: reduce)').matches){hide();return;}
   root.addEventListener('transitionend',transitionEnd);
   // A missing stylesheet or transitionend must never strand the overlay.
   exitTimer=setTimeout(hide,280);
  }catch{hide();}
 }
 window.MewLoading=Object.freeze({progress,finish});
 try{
  hiddenObserver.observe(root,{attributes:true,attributeFilter:['hidden']});
  sound.addEventListener('click',toggleSound);
  document.addEventListener('visibilitychange',visibility);
  window.addEventListener('pagehide',pagehide);window.addEventListener('pageshow',visibility);
  configure();visibility();
 }catch{cleanup();}
})();
