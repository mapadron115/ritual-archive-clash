'use strict';
// Mobile-only adapter. Held bits and latched taps enter main.js's real readKeys
// path; simulation, keyboard encoding, AI and host/guest transport stay shared.
function mobileLayout(width,height,safe={top:0,right:0,bottom:0,left:0}) {
  const x=safe.left,y=safe.top,w=width-x-safe.right,h=height-y-safe.bottom;
  const gap=6,bw=52,bh=48;
  const sw=Math.floor(Math.min(w,h*16/9));
  const sh=Math.floor(sw*9/16),buttons={};
  const canvas={x:Math.floor(x+(w-sw)/2),y:Math.floor(y+(h-sh)/2),w:sw,h:sh};
  const lx=canvas.x+8,bottom=canvas.y+sh-8,dy=bottom-2*bh-gap;
  const put=(k,bx,by,bwidth=bw,bheight=bh)=>buttons[k]={x:bx,y:by,w:bwidth,h:bheight};
  put('U',lx+bw+gap,dy);put('L',lx,bottom-bh);put('G',lx+bw+gap,bottom-bh);put('R',lx+2*(bw+gap),bottom-bh);
  const aw=82,ah=64,rx=canvas.x+sw-8-3*aw-2*gap;
  ['P','K','DOM','A1','A2','A3'].forEach((k,n)=>put(k,rx+(n%3)*(aw+gap),bottom-2*ah-gap+Math.floor(n/3)*(ah+gap),aw,ah));
  put('pause',Math.floor(canvas.x+sw/2)-56,bottom-bh);put('mute',Math.floor(canvas.x+sw/2)+4,bottom-bh);
  return {portrait:height>width,canvas,buttons};
}
const MOBILE={pointers:new Map(),portrait:false,views:new Map(),selectTab:0,away:false,remoteAt:null};
// Retry inside release/click gestures as well as fight presses. Menu-only
// players (including Watch) must be able to unlock audio after returning.
const mobileAudioSources=new Map(),mobileAudioContexts=new WeakSet();
let mobileAudioBlocked=false;
function mobileAudioReady() {
  return !AUDIO.mute&&!MOBILE.away&&!mobileAudioBlocked&&document.visibilityState==='visible'&&AUDIO.ctx&&AUDIO.ctx.state==='running';
}
function mobileAudioStop() {
  for(const [source,finish] of mobileAudioSources) {
    try{source.stop();}catch(e){}finish();
  }
  AUDIO.recent={};
}
function mobileAudioGain() {
  if(!AUDIO.master)return;
  const p=AUDIO.master.gain,t=AUDIO.ctx.currentTime;
  p.cancelScheduledValues(t);
  // Hide immediately; use the shared short ramp when enabling sound.
  if(mobileAudioReady())p.setTargetAtTime(.65,t,.008);else p.setValueAtTime(0,t);
}
const mobileInitAudioBase=initAudio;
initAudio=function() {
  if(AUDIO.mute||MOBILE.away||mobileAudioBlocked||document.visibilityState!=='visible')return;
  mobileInitAudioBase();
  const a=AUDIO.ctx;
  if(!a)return;
  if(!mobileAudioContexts.has(a)) {
    mobileAudioContexts.add(a);
    a.addEventListener('statechange',()=>{
      if(AUDIO.ctx!==a)return;
      if(a.state!=='running')mobileAudioStop();
      mobileAudioGain();
    });
  }
  // Shared initAudio already retries suspended. Safari also exposes interrupted.
  if(a.state==='interrupted')try{const p=a.resume();if(p&&p.catch)p.catch(()=>{});}catch(e){}
  mobileAudioGain();
};
function mobileAudioGesture(e) {
  if(e.button>0||MOBILE.away||document.visibilityState!=='visible')return;
  mobileAudioBlocked=false;initAudio();
}
for(const event of ['pointerup','click','keydown'])addEventListener(event,mobileAudioGesture,true);
const mobileSetMuteBase=setMute;
setMute=function(mute) {
  mobileSetMuteBase(mute);
  if(mute)mobileAudioStop();else {mobileAudioBlocked=false;initAudio();}
  mobileAudioGain();
  const b=$('touchMute');b.textContent=mute?'UNMUTE':'MUTE';
  b.setAttribute('aria-pressed',String(!!mute));
};
const mobileSoundVoiceBase=soundVoice;
soundVoice=function(source,...args) {
  if(!mobileAudioReady())return false;
  if(!mobileSoundVoiceBase(source,...args))return false;
  const ended=source.onended;
  const finish=()=>{
    if(!mobileAudioSources.delete(source))return;
    ended();
  };
  source.onended=finish;mobileAudioSources.set(source,finish);return true;
};
const mobileSfxBase=sfx,mobileToneBase=tone,mobileNoiseBase=noise;
sfx=function(e){if(mobileAudioReady())mobileSfxBase(e);};
tone=function(...args){if(mobileAudioReady())mobileToneBase(...args);};
noise=function(...args){if(mobileAudioReady())mobileNoiseBase(...args);};
const mobileButtons=Array.from(document.querySelectorAll('[data-input]'));
// Two short display names; full library names stay in the move list and each
// accessible label. The remaining names fit the two-line button heading whole.
const MOBILE_SHORT={applause:'Applause',garden:'Shadow Garden'};
function mobileArtStates(S,me) {
  const f=S.f[me],c=CH[f.ch],states={};
  for(let n=0;n<4;n++) {
    const dom=n===3,a=dom?c.dom:c.arts[n],art=dom?null:pxArtCardState(S,f,n);
    const ready=dom?domReady(f):art.ready,used=dom&&f.domUsed;
    const status=dom?(used?'USED 1/1':ready?(f.hp<=maxHp(f)*DOM_HP?'HP READY':'FULL READY'):'OR 30% HP'):
      art.status==='CE READY'?'READY':art.status;
    states[dom?'DOM':'A'+(n+1)]={name:a.name,short:MOBILE_SHORT[dom?a.kind:a.id]||a.name,
      detail:dom?(a.maximum?'MAXIMUM':'DOMAIN')+(used||ready?'':' '+Math.floor(clamp(f.gauge/GAUGE_MAX,0,1)*100)+'%'):art.cost+' CE',
      status,ready,denied:!!(FX.nope&&FX.nope[me]>0&&!ready),
      fill:clamp(dom?(used?0:f.gauge/GAUGE_MAX):1-f.cd[n]/a.cd,0,1)};
  }
  return states;
}
function mobileUpdateControls(S) {
  const states=mobileArtStates(S,G.mode==='guest'?1:0);
  for(const [key,state] of Object.entries(states)) {
    const b=mobileButtons.find(b=>b.dataset.input===key);
    let view=MOBILE.views.get(key);
    if(!view) {
      b.textContent='';view={};
      for(const part of ['name','detail','status']){const span=document.createElement('span');span.className='art-'+part;b.appendChild(span);view[part]=span;}
      MOBILE.views.set(key,view);
    }
    // No live region: cooldown frames must not flood assistive announcements.
    for(const part of ['name','detail','status']){const text=part==='name'?state.short:state[part];if(view[part].textContent!==text)view[part].textContent=text;}
    b.dataset.ready=String(!!state.ready);b.dataset.denied=String(state.denied);
    b.style.setProperty('--fill',(state.fill*100).toFixed(1)+'%');
    const label=state.name+', '+state.detail+', '+state.status;
    if(view.label!==label){b.setAttribute('aria-label',label);view.label=label;}
  }
}
function mobileRelease(id,cancelled=false) {
  const b=MOBILE.pointers.get(id);if(!b)return;
  MOBILE.pointers.delete(id);
  // Remove the contact first: releasing capture can synchronously notify us.
  if(b.hasPointerCapture&&b.hasPointerCapture(id))b.releasePointerCapture(id);
  if(!Array.from(MOBILE.pointers.values()).includes(b)) {
    const code=BIND.solo[b.dataset.input][0];G.keys[code]=false;
    if(cancelled)delete G.taps[code];
    b.classList.remove('held');
  }
}
const mobileClearBase=clearInput;
clearInput=function() {
  for(const id of Array.from(MOBILE.pointers.keys()))mobileRelease(id);
  mobileClearBase();
  // A hidden phone may never get another animation frame. Release the host's
  // copy now, including when opening a list, rotating or changing fighters.
  if(G.mode==='guest'&&NET.conn&&NET.conn.open) {
    try {netSend({t:'in',b:0});G.lastSent=0;G.sendT=0;} catch(e) { /* The close/error callback owns recovery. */ }
  }
};
for(const button of mobileButtons) {
  button.addEventListener('pointerdown',e=>{
    e.preventDefault();
    if((e.pointerType==='mouse'&&e.button!==0)||!G.running||G.paused||G.over||MOBILE.portrait||MOBILE.away||document.visibilityState!=='visible'||G.mode==='watch')return;
    mobileRelease(e.pointerId);
    const code=BIND.solo[button.dataset.input][0];
    if(!G.keys[code])G.taps[code]=true;
    G.keys[code]=true;MOBILE.pointers.set(e.pointerId,button);
    button.classList.add('held');button.setPointerCapture(e.pointerId);initAudio();
  });
  for(const name of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,e=>{
    e.preventDefault();
    if(MOBILE.pointers.get(e.pointerId)!==button)return;
    // An old capture-loss notification can arrive after a fresh capture.
    if(name==='lostpointercapture'&&button.hasPointerCapture&&button.hasPointerCapture(e.pointerId))return;
    mobileRelease(e.pointerId,name!=='pointerup');
  });
  button.addEventListener('contextmenu',e=>e.preventDefault());
}
function mobileResetRemote() {G.remoteIn=0;G.remoteTap=0;MOBILE.remoteAt=null;}
function mobileAway() {
  MOBILE.away=true;clearInput();G.acc=0;
  mobileAudioBlocked=true;mobileAudioGain();mobileAudioStop();
  if(G.running&&!G.paused&&!G.over&&G.mode!=='host'&&G.mode!=='guest')togglePause();
}
function mobileReturn() {
  MOBILE.away=document.visibilityState!=='visible';clearInput();mobileResetRemote();
  G.acc=0;G.last=performance.now();
  // Offline play stays paused until the player explicitly taps Resume.
}
addEventListener('blur',mobileAway);addEventListener('pagehide',mobileAway);
addEventListener('focus',mobileReturn);addEventListener('pageshow',mobileReturn);
document.addEventListener('freeze',mobileAway);document.addEventListener('resume',mobileReturn);
document.addEventListener('visibilitychange',()=>document.visibilityState==='visible'?mobileReturn():mobileAway());
const mobileReadKeysBase=readKeys;
readKeys=function(bind) {
  if(MOBILE.away||MOBILE.portrait||document.visibilityState!=='visible'){mobileClearBase();return 0;}
  return mobileReadKeysBase(bind);
};
// Guests already heartbeat every seven rendered frames. Give delayed packets
// a full second, then discard held controls if the phone vanished before its
// release could reach us. A fresh packet restores control without replaying taps.
const mobileReadRemoteBase=readRemote;
readRemote=function() {
  if(MOBILE.remoteAt!==null&&performance.now()-MOBILE.remoteAt>=1000)mobileResetRemote();
  return mobileReadRemoteBase();
};
const mobileNetCloseBase=netClose;
netClose=function() {
  clearInput();mobileResetRemote();G.netEv=[];G.running=false;G.paused=false;G.over=false;
  G.resultToken=(G.resultToken||0)+1;
  mobileNetCloseBase();
};
const mobileToMenuBase=toMenu;
toMenu=function(fromNet) {
  // Also cancel a pending host/join before its open callback sets G.mode.
  if(!fromNet&&G.mode!=='host'&&G.mode!=='guest')netClose();
  mobileToMenuBase(fromNet);
};
const mobileNetWireBase=netWire;
function mobileDisconnected(message) {
  toMenu(true);netClose();show('online');netStatus(message+' Host a new room or join again.');
}
netWire=function(conn,mode) {
  if(NET.conn&&NET.conn!==conn) {try{conn.close();}catch(e){}return;}
  const session=NET.session,active=()=>NET.session===session&&NET.conn===conn;
  // Decorate the shared callbacks as they register, retaining the real
  // connection identity and all existing session/stale-callback guards.
  const on=conn.on;
  conn.on=function(name,callback) {
    return on.call(conn,name,(...args)=>{
      if(!active())return;
      if(name==='close'){mobileDisconnected('The other player disconnected.');return;}
      if(name==='open'){G.running=false;G.paused=false;G.over=false;mobileResetRemote();}
      if(name==='data'&&args[0].t==='in') {
        if(!G.running||G.over)return;
        MOBILE.remoteAt=performance.now();
      }
      callback(...args);
    });
  };
  try{mobileNetWireBase(conn,mode);}finally{conn.on=on;}
  conn.on('error',()=>{
    if(!active())return;
    mobileDisconnected('Connection lost.');
  });
};
const mobileHostGameBase=hostGame,mobileJoinGameBase=joinGame;
hostGame=function(){netStatus('Opening a new room...');mobileHostGameBase();};
joinGame=function(){if($('code').value.trim().length===4)netStatus('Connecting...');mobileJoinGameBase();};
const mobileShowBase=show;
show=function(id) {
  clearInput();mobileShowBase(id);
  if(id==='select'){mobileResetRemote();G.resultToken=(G.resultToken||0)+1;}
  if(id==='none'&&G.S) {
    mobileUpdateControls(G.S);
  }
};
// Labels describe the touch surface in HUD cards and all shared move lists.
Object.assign(BIND.solo.lab,{move:'L / R',U:'UP',G:'HOLD',P:'P',K:'K',A1:'1',A2:'2',A3:'3',DOM:'D'});
// Mobile has the same upper meters, tags and result panels. Its lower card row
// and keyboard hints move onto the touch buttons, exposing the arena beneath.
function mobileHUDSurface(S,lab) {
  const s=pxHUDSurface(S,lab);
  s.data.fill(0,307*s.w*4);
  if(S.phase!=='over') {
    s.rect(271,1,98,15,PX_INK);pxPanel(s,273,3,94,11,'#243448','#b1a08a');
    pxText(s,'TAP MOVES',296,5,PX_LIGHT);
  }
  return s;
}
drawHUD=function(c,S,lab) {
  mobileUpdateControls(S);pxPresent(c,mobileHUDSurface(S,lab));
};
// Phone lists use the same names and descriptions as the shared fighters, in
// vertical entries rather than four narrow table columns or keyboard badges.
moveList=function(ch) {
  const c=CH[ch];
  const entry=(a,detail,desc)=>'<div class="moveEntry"><div class="moveHeading"><b>'+a.name+'</b><span>'+detail+'</span></div><p>'+desc+'</p></div>';
  return '<section class="moveList"><h3 style="color:'+c.look.accent+'">'+c.name+' / '+c.tech+'</h3><p>'+c.tag+(c.passive?'. '+c.passive+'.':'')+'</p>'+c.arts.map(a=>entry(a,a.cost+' CE / '+(a.cd/60).toFixed(1)+'s',a.desc)).join('')+
    entry(c.dom,c.dom.maximum?'MAXIMUM':'DOMAIN',c.dom.desc+'. Once per round, at full gauge or 30% health or less.')+'</section>';
};
basics=function() {return '<div class="mobileRules"><p>Hold LEFT / RIGHT to move, JUMP to jump, GUARD to defend (faces the foe). Hold movement and tap an attack together. Tap PUNCH three times for a combo; KICK wears guard down.</p><p>The three named arts are along the bottom right. Each shows its CE cost, readiness and cooldown fill. DOMAIN / MAXIMUM is above them: once per round at full gauge or 30% health or less. Two Domains cancel each other.</p><p>MOVES opens this list; MUTE toggles sound. Offline matches pause here; online matches continue with your controls released. First to two round wins, 99 seconds per round. A draw awards neither fighter a win.</p><p>Black Flash: a landed punch or kick has a 6% chance to deal 2.2 times the damage, launch the foe and give 25 CE. It grants eight seconds in the Zone, with a 20% chance.</p></div>';};
function mobileSelectTab(tab) {
  MOBILE.selectTab=tab;
  for(let i=0;i<3;i++) {
    $('selectPanel'+i).hidden=i!==tab;
    $('selectTab'+i).setAttribute('aria-pressed',String(i===tab));
  }
  $('selectionScroll').scrollTop=0;
}
const mobileSelectionBase=refreshSelection;
refreshSelection=function() {
  mobileSelectionBase();
  const names=selectionNames();
  for(let i=0;i<2;i++)$('selectTab'+i).textContent=names[i]+'\n'+CH[G.pick[i]].name;
  $('selectTab2').textContent='Arena / moves\n'+PX_STAGES.find(s=>s.id===G.stage).name;
};
const mobileBuildSelectBase=buildSelect;
buildSelect=function() {
  mobileBuildSelectBase();
  // Keep optional keyboard browsing aligned with the mobile grid as well.
  for(let i=0;i<2;i++) {
    const choices=Array.from($('col'+i).children).filter(b=>b.className.startsWith('fighter'));
    choices.forEach((b,n)=>{
      const base=b.onkeydown;
      b.onkeydown=e=>{
        if(e.code==='ArrowUp'||e.code==='ArrowDown') {
          e.preventDefault();const delta=(innerWidth<=599?3:5)*(e.code==='ArrowUp'?-1:1);
          choices[(n+delta+choices.length)%choices.length].focus();
        } else base(e);
      };
    });
  }
  mobileSelectTab(G.mode==='guest'?1:0);
  $('selectionMoves').open=false;$('selectionRules').open=false;
};
const mobilePauseBase=togglePause;
togglePause=function() {
  mobilePauseBase();
  if(G.paused){$('resumeBtn').textContent=G.mode==='host'||G.mode==='guest'?'Close list':'Resume';$('pauseList').scrollTop=0;}
};
// The guest waits for the host to rematch, but can still change fighters or
// leave the room by touch. The shared desktop result behavior stays intact.
const mobileEndMatchBase=endMatch;
endMatch=function() {
  mobileEndMatchBase();
  $('overBtns').style.display='';$('rematchBtn').hidden=G.mode==='guest';
  if(G.mode==='guest')$('overNote').textContent='Waiting for the host to rematch. You can change fighters or return to the main menu.';
};
// Typing a room code must not toggle MUTE on the letter M or latch fight keys.
$('code').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();joinGame();}});
$('code').addEventListener('keyup',e=>e.stopPropagation());
function mobileResize() {
  clearInput();
  const cs=getComputedStyle($('safeArea')),num=k=>parseFloat(cs[k])||0;
  const layout=mobileLayout(innerWidth,innerHeight,{top:num('paddingTop'),right:num('paddingRight'),bottom:num('paddingBottom'),left:num('paddingLeft')});
  MOBILE.portrait=layout.portrait;
  const place=(node,r)=>Object.assign(node.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px'});
  place(cv,layout.canvas);
  for(const b of mobileButtons)place(b,layout.buttons[b.dataset.input]);
  place($('touchPause'),layout.buttons.pause);place($('touchMute'),layout.buttons.mute);
  if(layout.portrait&&G.running&&!G.paused&&!G.over&&G.mode!=='host'&&G.mode!=='guest')togglePause();
  $('rotateNote').textContent=G.running&&(G.mode==='host'||G.mode==='guest')?'Online match continues while you turn.':G.paused?'Match paused. Turn back, then tap Resume.':'';
}
addEventListener('resize',mobileResize);
mobileResize();
