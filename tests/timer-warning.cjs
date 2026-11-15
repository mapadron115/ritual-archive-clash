// Active-clock warning, native scenes and actual time-up transitions. Never played.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,prefix=process.argv[3]||'timer';
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','ai','render','main'];
const read=n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8').split('// ---------- boot')[0];
const old=n=>require('node:child_process').execFileSync('git',['show','5472545:src/'+n+'.js'],{cwd:root,encoding:'utf8'}).split('// ---------- boot')[0];
const shell=[()=>{},{},{getElementById(){return {getContext(){return {};}};},querySelectorAll(){return [];}}];
const oldHUD=Function('addEventListener','window','document',names.map(n=>n==='pixel-hud'?old(n):read(n)).join('\n')+'\nreturn pxHUDSurface;')(...shell);
Function('assert','writePNG','output','prefix','previewOnly','oldHUD','addEventListener','window','document',names.map(n=>baseline&&n==='pixel-hud'?old(n):read(n)).join('\n')+'\n'+`
function reset(){for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];FX.nope=[0,0];FX.impact=FX.bf=FX.banner=null;FX.flash=FX.shake=0;FX.silent=true;}
const modes=['ai','local','watch','host','guest'];
const region={x:280,y:17,w:80,h:33};
function crop(s){const a=[];for(let y=region.y;y<region.y+region.h;y++)a.push(...s.data.subarray((y*640+region.x)*4,(y*640+region.x+region.w)*4));return a;}
let frames=0,unchanged=0,minChange=Infinity,timelines=0,ticks=0,holds=0;
function check(S,mode){
  G.mode=mode;const before=JSON.stringify(S),effects=JSON.stringify(FX),lab=labels(),texts=[],paint=pxText;
  pxText=function(s,t,x,y,c,z=1){texts.push({t:String(t),x,y,c,z});return paint(s,t,x,y,c,z);};
  let hud;try{hud=pxHUDSurface(S,lab);}finally{pxText=paint;}
  if(!previewOnly){
    const prior=oldHUD(S,lab,FX),hurry=S.phase==='fight'&&S.timer>0&&S.timer<=600;
    const time=texts.find(t=>t.y===25&&t.z===2);
    assert(time);assert.equal(time.t,String(Math.ceil(S.timer/60)),'changed displayed seconds');
    assert.equal(time.x,320-pxTextWidth(time.t,2)/2,'timer lost centering');
    assert.equal(JSON.stringify(S),before,'HUD mutated match');assert.equal(JSON.stringify(FX),effects,'HUD mutated FX');
    assert.deepEqual(hud.data,pxHUDSurface(JSON.parse(before),lab,JSON.parse(effects)).data,'snapshot needs event history');
    let changed=0;
    for(let y=0;y<360;y++)for(let x=0;x<640;x++){
      const p=(y*640+x)*4;
      assert(hud.data[p+3]===0||hud.data[p+3]===255,'soft alpha');
      const differs=hud.data[p]!==prior.data[p]||hud.data[p+1]!==prior.data[p+1]||hud.data[p+2]!==prior.data[p+2]||hud.data[p+3]!==prior.data[p+3];
      if(differs){assert(hurry,'ordinary or ended timer changed');assert(x>=region.x&&x<region.x+region.w&&y>=region.y&&y<region.y+region.h,'warning overwrites another HUD area');changed++;}
    }
    if(hurry){assert(changed>=1500,'last ten seconds lack a conspicuous timer warning: '+changed);minChange=Math.min(minChange,changed);
      for(const t of texts)if(t!==time)assert(t.x+pxTextWidth(t.t,t.z)<=region.x||t.x>=region.x+region.w||t.y+7*t.z<=region.y||t.y>=region.y+region.h,'warning overlaps '+t.t);
    }else{assert.deepEqual(hud.data,prior.data);unchanged++;}
    frames++;
  }
  return hud;
}
// Same fighter pair, five control/identity modes, every arena and a real deadline.
for(const [ch,other] of [[0,14],[7,7],[14,0]])for(const outcome of ['p1','p2','draw']){
  reset();const S=newMatch(ch,other,103);S.phase='fight';S.t=120;S.timer=661;S.f[0].x=300;S.f[1].x=980;
  if(outcome==='p1')S.f[1].hp=maxHp(S.f[1])*.25;
  if(outcome==='p2')S.f[0].hp=maxHp(S.f[0])*.25;
  const control=JSON.parse(JSON.stringify(S));
  while(S.phase==='fight'){
    if([661,660,601,600,599,541,540,61,60,1].includes(S.timer)){
      for(const mode of modes)check(S,mode);
      if(output&&outcome==='p1'&&[0,7].includes(ch)&&[601,600,540,60,1].includes(S.timer))for(const stage of PX_STAGES){
        S.stage=stage.id;G.mode='local';const scene=pxWorldSurface(S);scene.blit(pxHUDSurface(S,labels()),0,0);
        writePNG(output+'/'+prefix+'-'+stage.id+'-ch'+ch+'-ticks'+S.timer+'.png',scene);
      }
      // Exports must not affect the independently stepped control.
      control.stage=S.stage;
    }
    S.ev=[];control.ev=[];step(S,[0,0]);step(control,[0,0]);ticks++;
    for(const e of S.ev)fxEvent(S,e);fxTick();
    assert.equal(JSON.stringify(S),JSON.stringify(control),'drawing changed deadline or outcome');
  }
  assert.equal(S.timer,0);assert.equal(S.winner,outcome==='draw'?-1:outcome==='p1'?0:1);
  for(const mode of modes)check(S,mode);
  while(S.phaseT<30){S.ev=[];step(S,[0,0]);for(const e of S.ev)fxEvent(S,e);fxTick();}
  assert.equal(pxRoundResultLayout(S).title,outcome==='draw'?'DRAW':'TIME UP');
  for(const mode of modes)check(S,mode);
  if(output&&ch===0&&outcome==='p1'){G.mode='local';const scene=pxWorldSurface(S);scene.blit(pxHUDSurface(S,labels()),0,0);writePNG(output+'/'+prefix+'-time-up.png',scene);}
  timelines++;
}
// All builds, stacked status, active Domain/stop, every arena, both phase edges.
reset();
for(let ch=0;ch<15;ch++)for(const stage of PX_STAGES){
  const S=newMatch(ch,ch,103);S.stage=stage.id;S.phase='fight';S.timer=600;S.stop={o:1,t:90};
  S.f[0].zone=200;S.f[0].nails=3;S.f[0].guardHp=12;S.f[1].st='stun';
  S.dom={o:0,k:CH[ch].dom.kind,t:120};
  for(const mode of modes)check(S,mode);
  S.phase='intro';check(S,'local');S.phase='ko';check(S,'guest');S.phase='over';check(S,'watch');
}
// The clock is authoritative: hit-stop/freeze hold it; time stop does not.
for(const start of [601,600,1])for(const pause of ['hitstop','freeze']){
  reset();const S=newMatch(0,14,103);S.phase='fight';S.timer=start;S[pause]=4;
  const expected=crop(check(S,'guest'));
  for(let n=0;n<4;n++){S.ev=[];step(S,[0,0]);assert.equal(S.timer,start);assert.deepEqual(crop(check(S,'guest')),expected,'warning advanced in pause');holds++;}
  step(S,[0,0]);assert.equal(S.timer,start-1);check(S,'guest');
}
reset();const stopped=newMatch(12,0,103);stopped.phase='fight';stopped.timer=601;stopped.stop={o:0,t:90};
step(stopped,[0,0]);assert.equal(stopped.timer,600);check(stopped,'host');
if(previewOnly)console.log('EXPORTED baseline scenes; warning appearance assertions skipped');
else console.log('PASS',timelines,'actual timeout/draw timelines;',ticks,'parallel ticks;',frames,'read-only native HUD/snapshot checks;',unchanged,'byte-identical ordinary/result HUDs;',holds,'pause holds; minimum warning change',minChange,'pixels');
`)(assert,writePNG,output,prefix,previewOnly,oldHUD,...shell);
