'use strict';
// Mobile-only adapter. Held bits and latched taps enter main.js's real readKeys
// path; simulation, keyboard encoding, AI and host/guest transport stay shared.
function mobileLayout(width,height,safe={top:0,right:0,bottom:0,left:0}) {
  const x=safe.left,y=safe.top,w=width-x-safe.right,h=height-y-safe.bottom;
  const deck=112,gap=6,bw=52,bh=48,dy=y+h-deck+6;
  const sw=Math.floor(Math.min(w,Math.max(0,h-deck)*16/9));
  const sh=Math.floor(sw*9/16),buttons={};
  const put=(k,bx,by,bwidth=bw)=>buttons[k]={x:bx,y:by,w:bwidth,h:bh};
  put('U',x+8+bw+gap,dy);put('L',x+8,dy+bh+gap);put('G',x+8+bw+gap,dy+bh+gap);put('R',x+8+2*(bw+gap),dy+bh+gap);
  const rx=x+w-8-3*bw-2*gap;
  ['P','K','DOM','A1','A2','A3'].forEach((k,n)=>put(k,rx+(n%3)*(bw+gap),dy+Math.floor(n/3)*(bh+gap)));
  put('pause',Math.floor(x+w/2)-56,dy+bh+gap);put('mute',Math.floor(x+w/2)+4,dy+bh+gap);
  return {portrait:height>width,canvas:{x:Math.floor(x+(w-sw)/2),y:Math.floor(y+(h-deck-sh)/2),w:sw,h:sh},buttons};
}
const MOBILE={pointers:new Map(),portrait:false};
const mobileButtons=Array.from(document.querySelectorAll('[data-input]'));
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
    const me=G.mode==='guest'?1:0;
    $('domainButton').textContent=CH[G.S.f[me].ch].dom.maximum?'MAXIMUM':'DOMAIN';
  }
};
// Labels describe the touch surface in HUD cards and all shared move lists.
Object.assign(BIND.solo.lab,{move:'L / R',U:'UP',G:'HOLD',P:'P',K:'K',A1:'1',A2:'2',A3:'3',DOM:'D'});
// Replace the keyboard-only shortcut in the mobile raster, leaving desktop HUD
// source and pixels untouched. Short card badges map to numbered touch buttons.
drawHUD=function(c,S,lab) {
  const s=pxHUDSurface(S,lab);
  // The desktop keyboard sentence is wider with touch labels. Keep its row
  // clear and point at the physical deck instead of letting hints overlap.
  s.data.fill(0,307*s.w*4,317*s.w*4);
  for(let i=0;i<2;i++)pxOutlinedText(s,lab[i]?'TOUCH CONTROLS BELOW':G.mode==='watch'?'CPU'+(i+1):G.mode==='ai'?'COMPUTER':'ONLINE FOE',i?331:14,309,'#e2d6bb');
  if(S.phase!=='over') {
    s.rect(271,1,98,15,PX_INK);pxPanel(s,273,3,94,11,'#243448','#b1a08a');
    pxText(s,'TAP MOVES',296,5,PX_LIGHT);
  }
  pxPresent(c,s);
};
basics=function() {return '<p>Hold LEFT / RIGHT to move, JUMP to jump, GUARD to defend. Tap PUNCH or KICK; tap ART 1, ART 2 or ART 3 for your fighter\'s arts. DOMAIN / MAX is once per round at full gauge or 30% health. MOVES opens this list; MUTE toggles sound. You can hold movement and attack together. Online fights continue while the list is open.</p>';};
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
