'use strict';
(()=>{
 const DURATION=35000, reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const root=document.createElement('section');root.id='mew-intro';root.setAttribute('role','dialog');root.setAttribute('aria-label','Welcome to MEW HARVEST');root.setAttribute('aria-modal','true');
 const img=(name,cls)=>`<img draggable="false" alt="" class="${cls}" src="art/${name}.webp">`;
 root.innerHTML=`<div class="intro-sky"></div><div class="intro-sun"></div><div class="intro-cloud cloud-one"></div><div class="intro-cloud cloud-two"></div><div class="intro-land"></div><div class="intro-water"></div><div class="intro-stage">
 <div class="intro-shot" data-shot="0">${img('island','intro-island')}<span class="intro-birds">⌁　⌁　⌁</span></div>
 <div class="intro-shot" data-shot="1"><div class="intro-bridge"></div>${img('biped-0','intro-cat arriving')}${img('resource-0','intro-tree')}</div>
 <div class="intro-shot" data-shot="2">${img('soil','intro-field')}${img('crop-0','intro-crop crop-one')}${img('crop-0','intro-crop crop-two')}${img('biped-1','intro-cat working')}${img('biped-2','intro-cat helper')}<div class="intro-drops">· · ·</div></div>
 <div class="intro-shot" data-shot="3">${img('upgrade-0','intro-bakery')}${img('building-4','intro-animal-home')}${img('biped-0','intro-cat chef')}${img('biped-3','intro-cat customer')}<span class="intro-steam">~ ~ ~</span>${img('crop-0','intro-goods')}</div>
 <div class="intro-shot" data-shot="4">${img('source-mountain','intro-mountain')}<div class="intro-mist"></div></div>
 <div class="intro-shot" data-shot="5"><img class="intro-logo" src="farmer-icon-512-v86.png" alt="MEW HARVEST"><p class="intro-credit">Created by <strong>Veyroxis Interactive</strong></p></div></div>
 <div class="intro-controls"><button type="button" id="intro-sound" aria-pressed="false">Sound off</button><button type="button" id="intro-skip">Skip intro</button></div><div class="intro-bottom"><p id="intro-caption" aria-live="polite"></p><div class="intro-timeline" aria-hidden="true"><i></i></div><small id="intro-status"></small><button type="button" id="intro-play" hidden>Play</button></div>`;
 document.body.append(root);
 const loading=document.getElementById('loading'),play=root.querySelector('#intro-play'),skip=root.querySelector('#intro-skip'),sound=root.querySelector('#intro-sound'),status=root.querySelector('#intro-status'),caption=root.querySelector('#intro-caption');
 const scenes=[0,5000,12000,20000,27000,32000],captions=['Every village begins with a little hope.','A new path. A place to call home.','Grow together. Harvest a little happiness.','Made with care. Shared with friends.','Beyond the farm, an island awaits.','Welcome to MEW HARVEST.'];
 let elapsed=0,last=0,frame=0,active=false,ready=!!loading?.hidden,wantExit=false,audio=null,notes=null,priorFocus=null,inertStates=[];
 function musicOff(){clearInterval(notes);notes=null;if(audio){audio.close().catch(()=>{});audio=null;}sound.textContent='Sound off';sound.setAttribute('aria-pressed','false');}
 function musicOn(){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio=new AC();audio.resume();let n=0;const tune=[261.63,329.63,392,523.25,440,392,329.63,293.66];const tick=()=>{if(!audio)return;const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=tune[n++%tune.length];g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.055,t+.04);g.gain.exponentialRampToValueAtTime(.001,t+.7);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.8);};tick();notes=setInterval(tick,750);sound.textContent='Sound on';sound.setAttribute('aria-pressed','true');}catch{musicOff();}}
 function refresh(){play.disabled=!ready;status.textContent=ready?'Your farm is ready':wantExit?'Preparing your farm…':'Game loads while the story plays';if(ready&&wantExit)close();}
 function close(){active=false;cancelAnimationFrame(frame);musicOff();root.hidden=true;inertStates.forEach(([el,v])=>el.inert=v);inertStates=[];try{localStorage.setItem('mew-intro-seen-100','1');}catch{}(priorFocus?.isConnected?priorFocus:document.getElementById('island'))?.focus();}
 function draw(){let shot=0;for(let i=0;i<scenes.length;i++)if(elapsed>=scenes[i])shot=i;root.dataset.scene=shot;root.style.setProperty('--intro-progress',Math.min(1,elapsed/DURATION));if(caption.textContent!==captions[shot])caption.textContent=captions[shot];play.hidden=elapsed<DURATION;}
 function step(t){if(!active)return;if(last&&!document.hidden)elapsed=Math.min(DURATION,elapsed+t-last);last=t;draw();if(elapsed<DURATION)frame=requestAnimationFrame(step);}
 function start(){if(active)return;priorFocus=document.activeElement;const dialog=document.getElementById('sheet');if(dialog?.open)dialog.close();active=true;wantExit=false;elapsed=0;last=0;root.hidden=false;root.classList.toggle('intro-reduced',reduced);inertStates=[...document.body.children].filter(el=>el!==root&&el.tagName!=='SCRIPT').map(el=>[el,el.inert]);inertStates.forEach(([el])=>el.inert=true);draw();refresh();skip.focus();frame=requestAnimationFrame(step);}
 skip.onclick=()=>close();play.onclick=()=>close();sound.onclick=()=>audio?musicOff():musicOn();
 root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const b=[...root.querySelectorAll('button')].filter(x=>!x.hidden&&!x.disabled),i=b.indexOf(document.activeElement);e.preventDefault();b[(i+(e.shiftKey?-1:1)+b.length)%b.length].focus();}});
 document.addEventListener('visibilitychange',()=>{last=0;root.classList.toggle('intro-paused',document.hidden);if(document.hidden)musicOff();});window.addEventListener('pagehide',musicOff);
 if(loading)new MutationObserver(()=>{ready=loading.hidden;refresh();}).observe(loading,{attributes:true,attributeFilter:['hidden']});
 document.addEventListener('click',e=>{if(e.target.closest('[data-intro-replay]'))start();});
 const sheet=document.getElementById('sheetBody');if(sheet)new MutationObserver(()=>{const title=document.getElementById('sheetTitle')?.textContent;if(!/^(Menu|Settings)$/.test(title)||sheet.querySelector('[data-intro-replay]'))return;const b=document.createElement('button');b.type='button';b.className='action secondary';b.dataset.introReplay='';b.textContent='Replay opening story';sheet.append(b);}).observe(sheet,{childList:true});
 let seen=false;try{seen=localStorage.getItem('mew-intro-seen-100')==='1';}catch{}
 if(!seen)start();else root.hidden=true;
})();
