// Actual round-end events and state-derived result presentation. Scripted, never played.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const writePNG=require('./png.cjs'),root=path.join(__dirname,'..');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','ai','render','main'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8').split('// ---------- boot')[0]).join('\n');
Function('assert','addEventListener','window','document','auditOnly',source+'\n'+`
function resetEffects(){for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];FX.banner=FX.impact=FX.bf=null;FX.flash=FX.shake=0;FX.silent=true;}
function advance(S){S.ev=[];step(S,[0,0]);for(const e of S.ev)fxEvent(S,e);fxTick();}
function result(ch,owner,kind,final=false,score=null){
  resetEffects();const S=newMatch(ch,ch,1000);S.phase='fight';S.t=120;S.stage=['courtyard','gallery','observatory'][ch%3];
  S.wins=score?score.slice():final?(owner?[0,1]:[1,0]):[0,0];S.round=1+S.wins[0]+S.wins[1];S.f[0].x=500;S.f[1].x=580;
  if(kind==='draw'){S.timer=1;advance(S);}
  else if(kind==='timeout'){S.timer=1;S.f[1-owner].hp=1;advance(S);}
  else {S.f[1-owner].hp=1;const input=[0,0];input[owner]=BTN.P<<INPUT_SHIFT;S.ev=[];step(S,input);for(const e of S.ev)fxEvent(S,e);fxTick();while(S.phase==='fight')advance(S);}
  assert.equal(S.phase,'ko');assert.equal(S.winner,kind==='draw'?-1:owner);return S;
}
globalThis.audit=new PixelSurface(1280,1128);audit.rect(0,0,audit.w,audit.h,PX_INK);
for(const [n,mode,ch,owner,kind,final,target]of [
  [0,'local',0,0,'ko',false,45],[1,'guest',7,1,'timeout',false,45],
  [2,'watch',14,0,'draw',false,45],[3,'ai',0,1,'ko',true,170],
  [4,'host',7,0,'timeout',true,170],[5,'local',14,0,'draw',false,160]
]){
  G.mode=mode;const S=result(ch,owner,kind,final,n===5?[1,1]:null);while(S.phase==='ko'&&S.phaseT<target)advance(S);
  FX.flash=FX.shake=0;const view=pxWorldSurface(S);view.blit(pxHUDSurface(S,labels()),0,0);
  const x=n%2*640,y=Math.floor(n/2)*376;pxText(audit,kind+' / '+mode+' / '+(final?'MATCH END':'ROUND END')+' / T'+target,x+8,y+4,PX_LIGHT);audit.blit(view,x,y+16);
}
if(!auditOnly){
let timelines=0,rasters=0;
for(let ch=0;ch<15;ch++)for(let owner=0;owner<2;owner++)for(const kind of ['ko','timeout','draw'])for(const final of [false,true]){
  const S=result(ch,owner,kind,final),control=JSON.parse(JSON.stringify(S)),sampled=new Set();
  assert.equal(FX.banner.txt,kind==='draw'?'DRAW':kind==='timeout'?'TIME UP':'K.O.');
  for(let ticks=0;S.phase==='ko'&&ticks<240;ticks++){
    const before=JSON.stringify(S),r=pxRoundResultLayout(S);
    assert.equal(!!r,S.phaseT>=30,'result must start at the active-clock boundary');
    if(r){assert.equal(r.title,kind==='draw'?'DRAW':kind==='timeout'?'TIME UP':'K.O.');assert.equal(r.final,final&&kind!=='draw');}
    if([0,29,30,120,169].includes(S.phaseT)&&!sampled.has(S.phaseT)){
    sampled.add(S.phaseT);for(const mode of ['ai','local','watch','host','guest']){
      G.mode=mode;const effects=JSON.stringify(FX),texts=[],paint=pxText;
      pxText=function(s,text,x,y,col,scale=1){texts.push({text:String(text).toUpperCase(),x,y,w:pxTextWidth(text,scale),h:7*scale});return paint(s,text,x,y,col,scale);};
      let hud;try{hud=pxHUDSurface(S,labels());}finally{pxText=paint;}
      assert.equal(JSON.stringify(S),before);assert.equal(JSON.stringify(FX),effects);
      assert.deepEqual(hud.data,pxHUDSurface(JSON.parse(before),labels()).data,'snapshot changed result');
      if(r){
        const ink=texts.filter(t=>t.y>=r.y&&t.y<r.y+r.h);
        for(const t of ink)assert(t.x>=r.x+6&&t.x+t.w<=r.x+r.w-6&&t.y+t.h<=r.y+r.h-4,'result text escaped: '+t.text);
        assert(ink.some(t=>t.text===(kind==='draw'?'NO ROUND AWARDED':pxResultRole(labels(),owner)+' / '+CH[ch].name.toUpperCase()+' WINS')));
        assert(ink.some(t=>t.text===pxResultRole(labels(),0)+' '+S.wins[0]+' - '+S.wins[1]+' '+pxResultRole(labels(),1)),'result omitted actual score');
        assert(ink.some(t=>t.text===(r.final?'MATCH COMPLETE':'ROUND '+(S.round+1)+' NEXT')));
        for(let a=0;a<ink.length;a++)for(let b=a+1;b<ink.length;b++){const p=ink[a],q=ink[b];assert(p.x+p.w<=q.x||q.x+q.w<=p.x||p.y+p.h<=q.y||q.y+q.h<=p.y,'overlapping result lines');}
      }
      for(let p=3;p<hud.data.length;p+=4)assert(hud.data[p]===0||hud.data[p]===255);rasters++;
    }
    }
    advance(S);control.ev=[];step(control,[0,0]);assert.equal(JSON.stringify(S),JSON.stringify(control),'presentation changed outcome');
  }
  assert.equal(S.phase,final&&kind!=='draw'?'over':'intro');
  if(S.phase==='intro')assert.equal(pxRoundResultLayout(S),null,'stale winner after new round');else assert(pxRoundResultLayout(S));
  timelines++;
}
// Reach every unfinished score through actual timed rounds, then draw three times.
// A draw advances the round number but awards neither side a win, even at 1-1.
let drawHistories=0,consecutiveDraws=0;
for(let ch=0;ch<15;ch++)for(const score of [[0,0],[1,0],[0,1],[1,1]]){
  resetEffects();const S=newMatch(ch,ch,1000);
  function fight(){while(S.phase==='intro')advance(S);assert.equal(S.phase,'fight');}
  function next(){while(S.phase==='ko')advance(S);assert.equal(S.phase,'intro');}
  for(let owner=0;owner<2;owner++)if(score[owner]){
    fight();S.timer=1;S.f[1-owner].hp=1;advance(S);assert.equal(S.winner,owner);next();
  }
  assert.deepEqual(S.wins,score);assert.equal(S.round,1+score[0]+score[1]);
  for(let n=0;n<3;n++){
    fight();const round=S.round;S.timer=1;advance(S);
    assert.equal(S.phase,'ko');assert.equal(S.winner,-1);assert.deepEqual(S.wins,score,'draw awarded a round');
    while(S.phaseT<30)advance(S);
    assert.equal(pxRoundResultLayout(S).final,false,'draw ended an unfinished match');
    next();assert.deepEqual(S.wins,score);assert.equal(S.round,round+1);consecutiveDraws++;
  }
  drawHistories++;
}
console.log('PASS',drawHistories,'actual prior-round score histories and',consecutiveDraws,'consecutive draws: no wins awarded, next round continues');
// Result clocks pause with the existing phase clock, and snapshots need no event history.
for(const pause of ['hitstop','freeze']){
  const S=result(0,0,'ko');while(S.phaseT<30)advance(S);const expected=pxRoundResultLayout(S);S[pause]=3;
  for(let n=0;n<3;n++){advance(S);assert.deepEqual(pxRoundResultLayout(S),expected);}
  FX.banner=null;G.mode='local';assert.deepEqual(pxHUDSurface(S,labels()).data,pxHUDSurface(JSON.parse(JSON.stringify(S)),labels(),{}).data);
}
// Different max health still uses the simulation's percentage-based timeout result.
for(const [a,b,winner]of [[.5,.25,0],[.25,.5,1],[.5,.5,-1]]){
  const S=newMatch(0,14,1000);S.phase='fight';S.timer=1;S.f[0].hp=maxHp(S.f[0])*a;S.f[1].hp=maxHp(S.f[1])*b;advance(S);
  assert.equal(S.winner,winner);while(S.phaseT<30)advance(S);assert.equal(pxRoundResultLayout(S).title,winner<0?'DRAW':'TIME UP');
}
// Long-lived/remote damage snapshots reserve the persistent result panel too.
for(const ch of [0,7,14]){
  const S=result(ch,0,'ko');while(S.phaseT<30)advance(S);const r=pxRoundResultLayout(S);
  const values=pxDamageLayout(S,[{x:640,y:300,dir:1,txt:128,bf:1,t:20,life:60}],FX);
  assert.equal(values.length,1);const p=values[0];assert(!p.hidden);assert(p.x+p.w<=r.x||r.x+r.w<=p.x||p.y+p.h<=r.y||r.y+r.h<=p.y,'damage overlaps persistent result');
}
console.log('PASS',timelines,'actual knockout/timeout/draw timelines; '+rasters+' all-mode read-only result rasters/snapshots; active boundaries, score progression, freeze holds and unchanged outcomes');
}
`)(assert,()=>{},{},{getElementById(){return {getContext(){return {};}};}},process.argv.includes('--preview-only'));
if(process.argv[2])writePNG(path.join(process.argv[2],process.argv[3]||'round-results.png'),globalThis.audit);
