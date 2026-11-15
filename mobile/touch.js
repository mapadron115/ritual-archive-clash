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
const MOBILE={pointers:new Map(),portrait:false,views:new Map()};
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
};
for(const button of mobileButtons) {
  button.addEventListener('pointerdown',e=>{
    e.preventDefault();
    if((e.pointerType==='mouse'&&e.button!==0)||!G.running||G.paused||G.over||MOBILE.portrait||G.mode==='watch')return;
    mobileRelease(e.pointerId);
    const code=BIND.solo[button.dataset.input][0];
    if(!G.keys[code])G.taps[code]=true;
    G.keys[code]=true;MOBILE.pointers.set(e.pointerId,button);
    button.classList.add('held');button.setPointerCapture(e.pointerId);initAudio();
  });
  for(const name of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,e=>{e.preventDefault();mobileRelease(e.pointerId,name!=='pointerup');});
  button.addEventListener('contextmenu',e=>e.preventDefault());
}
// These listeners call the new clear function (the shared blur listener captured
// the original), so a returning finger must make a fresh press.
addEventListener('blur',()=>clearInput());
document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible')clearInput();});
const mobileShowBase=show;
show=function(id) {
  clearInput();mobileShowBase(id);
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
basics=function() {return '<p>Hold LEFT / RIGHT to move, JUMP to jump, GUARD to defend. Tap PUNCH or KICK; your three named arts are along the bottom right. Each art shows its CE cost, readiness and cooldown fill. DOMAIN / MAXIMUM is above them, once per round at full gauge or 30% health. MOVES opens this list; MUTE toggles sound. You can hold movement and attack together. Online fights continue while the list is open.</p>';};
const mobilePauseBase=togglePause;
togglePause=function() {
  mobilePauseBase();
  if(G.paused)$('resumeBtn').textContent=G.mode==='host'||G.mode==='guest'?'Close list':'Resume';
};
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
