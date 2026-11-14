// Actual grounded-kick inputs and existing recovery clocks. Script checks, not human play.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs'),ctx=vm.createContext({console,assert});
vm.runInContext(['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
vm.runInContext(`
let timelines=0,contacts=0,silhouettes=0,grounded=0;const samples=new Map();
const phases=['kickw','kickload','kick','kickre','kickfold','kicklower','kicksettle'];
for(let ch=0;ch<15;ch++)for(const alt of [false,true]) {
  for(const [a,b]of [['kick','kickre'],['kickre','kickfold'],['kickfold','kicklower'],['kicklower','kicksettle']]) {
    const A=pxSprite(ch,a,alt),B=pxSprite(ch,b,alt);let both=0,union=0;
    for(let p=3;p<A.data.length;p+=4){both+=!!A.data[p]&&!!B.data[p];union+=!!A.data[p]||!!B.data[p];}
    assert(both/union<.94,'indistinct kick return '+ch+' '+a+' '+b);silhouettes++;
  }
  for(const pose of phases) {
    const f=pxFighterFrame(ch,pose,alt),s=f.sprite;let bottom=-1;
    for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++)if(s.data[(y*s.w+x)*4+3])bottom=Math.max(bottom,y);
    assert.equal(bottom,f.oy,'floating/sunken grounded kick '+ch+' '+pose);
    if(['kickre','kickfold','kicklower','kicksettle'].includes(pose)) {
      assert(s.data[(f.oy*s.w+f.ox-18)*4+3],'rear support moved '+ch+' '+pose);
      assert.equal(!!s.data[(f.oy*s.w+f.ox+24)*4+3],pose==='kicksettle','front sole plants at wrong phase');
    }
    if(pose==='kick')assert(s.data[(Math.round(f.oy-48*PX_KITS[ch].height)*s.w+f.ox+58)*4+3],'contact boot must extend forward');
    grounded++;
  }
}
for(let ch=0;ch<15;ch++)for(let owner=0;owner<2;owner++)for(const face of [-1,1])for(const scenario of ['whiff','hit','block']) {
  const S=newMatch(ch,ch,947);S.phase='fight';S.t=120;S.stage=['courtyard','gallery','observatory'][ch%3];
  const f=S.f[owner],o=S.f[1-owner];f.x=640;o.x=f.x+face*(scenario==='whiff'?500:48);f.face=face;o.face=-face;
  const control=JSON.parse(JSON.stringify(S)),seen=new Set(),paused=new Set(),counts=new Map();let ticks=0,contact=false;
  while(ticks<180) {
    const inp=owner?[scenario==='block'?BTN.G:0,ticks===0?BTN.K<<INPUT_SHIFT:0]:[ticks===0?BTN.K<<INPUT_SHIFT:0,scenario==='block'?BTN.G:0];
    S.ev=[];control.ev=[];step(S,inp);step(control,inp);
    assert.equal(JSON.stringify(S),JSON.stringify(control),'drawing changes kick outcome');
    for(const e of S.ev)if(e.k===(scenario==='block'?'block':'hit')){contact=true;contacts++;}
    if(f.move==='k') {
      const pose=pxPose(S,f),t=f.mt;
      const expected=t<5?'kickw':t<10?'kickload':t<14?'kick':t<18?'kickre':t<22?'kickfold':t<26?'kicklower':'kicksettle';
      assert.equal(pose,expected,'kick boundary');seen.add(pose);
      if(S.hitstop===0)counts.set(t,(counts.get(t)||0)+1);
      if(!paused.has(pose)) {
        const before=JSON.stringify(S),clone=JSON.parse(before);assert.equal(pxPose(clone,clone.f[owner]),pose);
        pxWorldSurface(S,{});assert.equal(JSON.stringify(S),before,'drawing mutates kick');
        if(owner===0&&face===1&&scenario==='hit')samples.set(ch+':'+pose,clone);
        paused.add(pose);const mt=f.mt;
        for(const pause of ['hitstop','freeze','stop']) {
          if(pause==='stop'){S.stop={o:1-owner,t:3};control.stop={...S.stop};}else S[pause]=control[pause]=3;
          for(let n=0;n<3;n++){step(S,[0,0]);step(control,[0,0]);assert.equal(f.mt,mt);assert.equal(pxPose(S,f),pose);}
        }
      }
    }
    ticks++;if(ticks>1&&f.st==='idle')break;
  }
  assert(ticks<180);for(const p of phases)assert(seen.has(p),'missing '+p);
  assert.equal(f.mt,30,'kick recovery duration changed');
  for(let t=14;t<30;t++)assert(counts.has(t),'skipped recovery tick '+t);
  if(scenario!=='whiff')assert(contact,'missing actual '+scenario+' '+ch+' '+owner+' '+face);
  step(S,owner?[0,BTN.K]:[BTN.K,0]);for(let n=0;n<50;n++)step(S,owner?[0,BTN.K]:[BTN.K,0]);assert.notEqual(f.st,'atk');
  newRound(S);assert(!phases.slice(3).includes(pxPose(S,S.f[owner])));timelines++;
}
for(const pose of phases.slice(3))for(let owner=0;owner<2;owner++)for(const lethal of [false,true]) {
  const S=JSON.parse(JSON.stringify(samples.get('0:'+pose)));
  if(owner){S.f.reverse();S.f.forEach((f,i)=>f.i=i);}
  const victim=S.f[owner];if(lethal)victim.hp=1;
  hit(S,1-owner,victim,S.f[1-owner].x,{dmg:60,kb:5,lift:8,stun:24});
  assert.equal(victim.st,lethal?'ko':'hit');assert(!phases.slice(3).includes(pxPose(S,victim)));
}
globalThis.sheet=new PixelSurface(2016,1360);sheet.rect(0,0,sheet.w,sheet.h,'#171f30');
pxText(sheet,'V31 / GROUND KICK: EXTEND, RETRACT, FOLD, LOWER, PLANT',18,16,PX_LIGHT,2);
for(let row=0;row<5;row++)phases.forEach((pose,n)=>{
  const ch=[0,14,7,4,11][row],x=n*288,y=48+row*260,flip=row%2===1,f=pxFighterFrame(ch,pose,flip);
  sheet.rect(x+3,y,282,253,'#28364a');sheet.rect(x+4,y+218,280,1,'#576075');
  sheet.blit(f.sprite,x+144-(flip?f.sprite.w-1-f.ox:f.ox)*2,y+218-f.oy*2,2,flip);
  pxText(sheet,CH[ch].name+' / '+(flip?'MIRROR < LEFT':'MAIN RIGHT >'),x+8,y+231,PX_LIGHT);pxText(sheet,pose,x+8,y+244,'#b4c2ce');
});
globalThis.flat=new PixelSurface(1800,1210);flat.rect(0,0,flat.w,flat.h,'#d1d5d1');
pxText(flat,'V31 / FIFTEEN KICK RETURNS: BOTH COSTUMES, FACING RIGHT',18,16,PX_INK,2);
for(let ch=0;ch<15;ch++) {
  const x=ch%3*600,y=48+Math.floor(ch/3)*230;pxText(flat,CH[ch].name,x+5,y,PX_INK);
  [false,true].forEach((alt,row)=>['kick','kickre','kickfold','kicklower','kicksettle'].forEach((pose,n)=>{
    const f=pxFighterFrame(ch,pose,alt,PX_INK);flat.blit(f.sprite,x+n*120+55-f.ox,y+105+row*108-f.oy);
  }));
}
globalThis.scene=new PixelSurface(1280,720);
for(const [n,ch,pose]of [[0,0,'kickfold'],[1,14,'kickfold'],[2,7,'kicklower'],[3,4,'kicksettle']]) {
  const S=samples.get(ch+':'+pose);assert(S);const view=pxWorldSurface(S,{});
  pxOutlinedText(view,CH[ch].name+' / '+pose,12,16,PX_LIGHT);pxOutlinedText(view,'ACTUAL KICK INPUT / ORIGINAL TIMING',12,30,'#b4c2ce');
  scene.blit(view,n%2*640,Math.floor(n/2)*360);
}
console.log('PASS',timelines,'actual grounded whiff/hit/block kick timelines, both slots/facings;',contacts,'contacts;',silhouettes,'return silhouettes;',grounded,'grounded frames; stable rear sole, exact plant/boundaries, freezes, snapshots, 16 hit/KO interruptions, held input, rematch, read-only drawing and identical outcomes');
`,ctx);
if(process.argv[2])for(const [name,key]of [['v31-kick-phases.png','sheet'],['v31-kick-silhouettes.png','flat'],['v31-kick-scene.png','scene']])writePNG(path.join(process.argv[2],name),ctx[key]);
