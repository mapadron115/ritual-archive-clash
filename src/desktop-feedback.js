'use strict';
// Loaded only by index.html, after main.js. This is availability at the local
// input sample, not a cast/rejection acknowledgement from the simulation/host.
FX.domainNope=[null,null];
function desktopDomainState(f) {
  const used=f.domUsed,qualified=domReady(f),air=f.y<GROUND;
  return {used,ready:qualified&&!air,status:used?'USED 1/1':qualified?
    air?'LAND FIRST':f.hp<=maxHp(f)*DOM_HP?'HP READY':'FULL READY':'OR 30% HP'};
}
pxDomainCardState=function(S,f,F) {
  const state=desktopDomainState(f),cue=F.domainNope&&F.domainNope[f.i];
  return {...state,denied:!!(S.phase==='fight'&&!state.ready&&cue&&cue.t>0&&
    cue.round===S.round&&cue.ch===f.ch&&cue.status===state.status)};
};
function desktopClearDomainFeedback(){FX.domainNope=[null,null];}
const desktopReadKeysBase=readKeys;
readKeys=function(binding) {
  const input=desktopReadKeysBase(binding),S=G.S;
  if(((input>>>INPUT_SHIFT)&BTN.DOM)&&G.running&&!G.paused&&!G.over&&S&&S.phase==='fight'&&G.mode!=='watch') {
    const slot=G.mode==='guest'||G.mode==='local'&&binding===BIND.p2?1:0;
    const f=S.f[slot],state=desktopDomainState(f);
    FX.domainNope[slot]=state.ready?null:{t:18,round:S.round,ch:f.ch,status:state.status};
  }
  return input;
};
const desktopFxTickBase=fxTick;
fxTick=function() {
  desktopFxTickBase();
  for(let i=0;i<2;i++) {
    const cue=FX.domainNope[i],S=G.S;
    if(!cue)continue;
    const state=S&&desktopDomainState(S.f[i]);
    if(--cue.t<=0||!G.running||G.over||!S||S.phase!=='fight'||cue.round!==S.round||
      cue.ch!==S.f[i].ch||state.ready||cue.status!==state.status)FX.domainNope[i]=null;
  }
};
const desktopClearInputBase=clearInput;
clearInput=function(){desktopClearInputBase();desktopClearDomainFeedback();};
// The original blur listener captured clearInput before the adapter loaded.
addEventListener('blur',desktopClearDomainFeedback);
const desktopToSelectBase=toSelect;
toSelect=function(fromNet){desktopClearDomainFeedback();desktopToSelectBase(fromNet);};
