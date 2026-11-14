// Actual two-/three-press chains, far-arm and rising-punch returns. No human play claim.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs'),ctx=vm.createContext({console,assert});
vm.runInContext(['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
vm.runInContext(`
let timelines=0,silhouettes=0,contacts=0,thirdContacts=0,returns=0,crossReturns=0,grounded=0,chainChecks=0;const samples=new Map();
const crossPhases=['crosspull','crossfold','crosssettle'];
for(let ch=0;ch<15;ch++)for(const alt of [false,true]) {
  for(const [first,second]of [['punch2','crosspull'],['crosspull','crossfold'],['crossfold','crosssettle']]) {
    const a=pxSprite(ch,first,alt),b=pxSprite(ch,second,alt);let both=0,union=0;
    for(let p=3;p<a.data.length;p+=4){both+=!!a.data[p]&&!!b.data[p];union+=!!a.data[p]||!!b.data[p];}
    assert(both/union<.94,'indistinct second-punch return '+ch+' '+first+' '+second);crossReturns++;
  }
  for(const pose of crossPhases) {
    const f=pxFighterFrame(ch,pose,alt),s=f.sprite;let bottom=-1;
    for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++)if(s.data[(y*s.w+x)*4+3])bottom=Math.max(bottom,y);
    assert.equal(bottom,f.oy,'floating/sunken second-punch return '+ch+' '+pose);
    for(const sole of [-29,35])assert(s.data[(f.oy*s.w+f.ox+sole)*4+3],'support moved '+ch+' '+pose);
    grounded++;
  }
}
for(let ch=0;ch<15;ch++)for(const alt of [false,true])for(const [first,second]of [['wind','punch2w'],['punchload','punch2load'],['punch2w','punch2load']]) {
  const a=pxSprite(ch,first,alt),b=pxSprite(ch,second,alt);let both=0,union=0;
  for(let p=3;p<a.data.length;p+=4){both+=!!a.data[p]&&!!b.data[p];union+=!!a.data[p]||!!b.data[p];}
  assert(both/union<.87,'indistinct punch loads '+ch+' '+first+' '+second);silhouettes++;
}
for(let ch=0;ch<15;ch++)for(const alt of [false,true])for(const [first,second]of [['hook','hookfollow'],['hookfollow','hookre'],['hookre','hooksettle']]) {
  const a=pxSprite(ch,first,alt),b=pxSprite(ch,second,alt);let both=0,union=0;
  for(let p=3;p<a.data.length;p+=4){both+=!!a.data[p]&&!!b.data[p];union+=!!a.data[p]||!!b.data[p];}
  assert(both/union<.94,'indistinct third-punch return '+ch+' '+first+' '+second);returns++;
}
for(let ch=0;ch<15;ch++)for(let owner=0;owner<2;owner++)for(const face of [-1,1])for(const scenario of ['whiff','hit','block'])for(const third of [false,true]) {
  const S=newMatch(ch,ch,947);S.phase='fight';S.t=120;S.stage=['courtyard','gallery','observatory'][ch%3];
  const f=S.f[owner],o=S.f[1-owner];f.x=640;o.x=f.x+face*(scenario==='whiff'?500:48);f.face=face;o.face=-face;
  const control=JSON.parse(JSON.stringify(S)),seen=new Set(),paused=new Set(),hits=new Set(),recovery=new Set();let ticks=0,sentSecond=false,sentThird=false;
  while(ticks<300) {
    const pulse=ticks===0 || !sentSecond&&f.move==='p1'&&f.mt===6 || third&&!sentThird&&f.move==='p2'&&f.mt===6;
    if(pulse&&f.move==='p1')sentSecond=true;if(pulse&&f.move==='p2')sentThird=true;
    const inp=owner?[scenario==='block'?BTN.G:0,pulse?BTN.P<<INPUT_SHIFT:0]:[pulse?BTN.P<<INPUT_SHIFT:0,scenario==='block'?BTN.G:0];
    S.ev=[];control.ev=[];
    step(S,inp);step(control,inp);assert.equal(JSON.stringify(S),JSON.stringify(control),'drawing changes chain outcome');
    const move=f.move,pose=pxPose(S,f);
    for(const e of S.ev)if(e.k===(scenario==='block'?'block':'hit')&&move==='p2') {hits.add(move);contacts++;}
    for(const e of S.ev)if(e.k===(scenario==='block'?'block':'hit')&&move==='p3') {hits.add(move);thirdContacts++;}
    if(move==='p2'||move==='p3') {
      const m=BASIC[move],elapsed=f.mt-m.su;
      const expected=move==='p2'?(f.mt<2?'punch2w':f.mt<4?'punch2load':elapsed<3?'punch2':elapsed<6?'crosspull':elapsed<9?'crossfold':'crosssettle'):
        f.mt<4?'hookw':f.mt<7?'hookload':elapsed<4?'hook':elapsed<8?'hookfollow':elapsed<13?'hookre':'hooksettle';
      assert.equal(pose,expected,move+' boundary');
      seen.add(pose);
      if(move==='p2'&&S.hitstop===0)recovery.add(f.mt);
      if(!paused.has(pose)) {
        const before=JSON.stringify(S),clone=JSON.parse(before);assert.equal(pxPose(clone,clone.f[owner]),pose);
        pxWorldSurface(S,{});assert.equal(JSON.stringify(S),before,'drawing mutates chain');
        if(owner===0&&face===1&&scenario==='hit'&&(move==='p3'||!third))samples.set(ch+':'+pose,clone);
        paused.add(pose);const mt=f.mt;
        for(const pause of ['hitstop','freeze','stop']) {
          if(pause==='stop'){S.stop={o:1-owner,t:3};control.stop={...S.stop};}else S[pause]=control[pause]=3;
          for(let n=0;n<3;n++){step(S,[0,0]);step(control,[0,0]);assert.equal(f.mt,mt);assert.equal(pxPose(S,f),pose);}
        }
      }
    }
    ticks++;
    if(ticks>1&&f.st==='idle')break;
  }
  assert(ticks<300);assert(sentSecond);assert(seen.has('punch2w'));assert(seen.has('punch2load'));assert(seen.has('punch2'));
  if(third){assert(sentThird);for(const p of ['hookw','hookload','hook','hookfollow','hookre','hooksettle'])assert(seen.has(p),'missing '+p);}
  else {
    for(const p of crossPhases)assert(seen.has(p));
    assert.equal(f.mt,16,'second-punch recovery duration changed');
    for(let t=7;t<16;t++)assert(recovery.has(t),'skipped second-punch recovery tick '+t);
  }
  if(scenario!=='whiff')assert(hits.has('p2'),'missing actual second-punch '+scenario+' '+ch+' '+owner+' '+face);
  if(third&&scenario!=='whiff')assert(hits.has('p3'),'missing actual third-punch '+scenario+' '+ch+' '+owner+' '+face);
  // A held punch after recovery does not restart the combo.
  step(S,owner?[0,BTN.P]:[BTN.P,0]);for(let n=0;n<50;n++)step(S,owner?[0,BTN.P]:[BTN.P,0]);assert.notEqual(f.st,'atk');
  newRound(S);assert(!['punch2w','punch2load','hookfollow','hooksettle',...crossPhases].includes(pxPose(S,S.f[owner])));timelines++;
}
// A third press remains immediate from every original second-punch recovery tick.
for(let ch=0;ch<15;ch++)for(let owner=0;owner<2;owner++)for(let at=7;at<16;at++) {
  const S=newMatch(ch,ch,947);S.phase='fight';const f=S.f[owner];
  const input=pulse=>owner?[0,pulse?BTN.P<<INPUT_SHIFT:0]:[pulse?BTN.P<<INPUT_SHIFT:0,0];
  step(S,input(true));while(f.mt<6)step(S,[0,0]);step(S,input(true));assert.equal(f.move,'p2');
  while(f.mt<at)step(S,[0,0]);
  step(S,input(true));assert.equal(f.move,'p3','return delayed third punch');assert.equal(pxPose(S,f),'hookw');chainChecks++;
}
// An actual hit during either punch's authored return immediately replaces its drawing.
for(const pose of ['hookfollow','hooksettle',...crossPhases])for(let owner=0;owner<2;owner++)for(const lethal of [false,true]) {
  const S=JSON.parse(JSON.stringify(samples.get('0:'+pose))),f=S.f[0];
  if(owner){S.f.reverse();S.f.forEach((f,i)=>f.i=i);}
  const victim=S.f[owner];assert.equal(victim,f);if(lethal)victim.hp=1;
  hit(S,1-owner,victim,S.f[1-owner].x,{dmg:60,kb:5,lift:8,stun:24});
  assert.equal(victim.st,lethal?'ko':'hit');assert(!['hookfollow','hooksettle',...crossPhases].includes(pxPose(S,victim)));
}
globalThis.sheet=new PixelSurface(1440,1360);sheet.rect(0,0,sheet.w,sheet.h,'#171f30');
pxText(sheet,'V33 / SECOND PUNCH: WITHDRAW, FOLD, GUARD',18,16,PX_LIGHT,2);
for(let row=0;row<5;row++)['punch2load','punch2','crosspull','crossfold','crosssettle'].forEach((pose,n)=>{
  const ch=[0,14,7,4,11][row],x=n*288,y=48+row*260,f=pxFighterFrame(ch,pose,row%2===1);
  sheet.rect(x+4,y,280,253,'#28364a');sheet.rect(x+5,y+218,278,1,'#576075');
  const flip=row%2===1;sheet.blit(f.sprite,x+144-(flip?f.sprite.w-1-f.ox:f.ox)*2,y+218-f.oy*2,2,flip);
  pxText(sheet,CH[ch].name+' / '+(flip?'MIRROR < LEFT':'MAIN RIGHT >'),x+10,y+231,PX_LIGHT);pxText(sheet,pose,x+10,y+244,'#b4c2ce');
});
globalThis.flat=new PixelSurface(1500,1210);flat.rect(0,0,flat.w,flat.h,'#d1d5d1');
pxText(flat,'V33 / FIFTEEN SECOND PUNCH RETURNS: BOTH COSTUMES > RIGHT',18,16,PX_INK,2);
for(let ch=0;ch<15;ch++) {
  const x=ch%3*500,y=48+Math.floor(ch/3)*230;pxText(flat,CH[ch].name,x+5,y,PX_INK);
  [false,true].forEach((alt,row)=>['punch2','crosspull','crossfold','crosssettle'].forEach((pose,n)=>{
    const f=pxFighterFrame(ch,pose,alt,PX_INK);flat.blit(f.sprite,x+n*122+60-f.ox,y+105+row*108-f.oy);
  }));
}
globalThis.scene=new PixelSurface(1280,720);
for(const [n,ch,pose]of [[0,0,'crosspull'],[1,14,'crossfold'],[2,7,'crossfold'],[3,4,'crosssettle']]) {
  const S=samples.get(ch+':'+pose);assert(S,'missing actual scene '+ch+' '+pose);const view=pxWorldSurface(S,{});
  pxOutlinedText(view,CH[ch].name+' / '+pose,12,16,PX_LIGHT);pxOutlinedText(view,'ACTUAL PUNCH INPUTS / ORIGINAL TIMING',12,30,'#b4c2ce');
  scene.blit(view,n%2*640,Math.floor(n/2)*360);
}
console.log('PASS',timelines,'actual whiff/hit/block chains, both slots/facings, optional third press;',silhouettes,'load /',returns,'third /',crossReturns,'second return silhouettes;',grounded,'grounded returns;',chainChecks,'immediate third-press transitions;',contacts,'second /',thirdContacts,'third-punch contacts; phase boundaries, freezes, snapshots, hit/KO interruptions, read-only drawing, rematch and identical outcomes');
`,ctx);
if(process.argv[2])for(const [name,key]of [['v33-cross-phases.png','sheet'],['v33-cross-silhouettes.png','flat'],['v33-cross-scene.png','scene']])writePNG(path.join(process.argv[2],name),ctx[key]);
