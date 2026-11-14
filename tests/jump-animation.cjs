// Actual voluntary jumps, interruption priority and active-clock pose selection. Not human play.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs'),ctx=vm.createContext({console,assert});
vm.runInContext(['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
vm.runInContext(`
let timelines=0,silhouettes=0,interruptions=0;const samples=new Map(),poses=['jump','jumpcrest','jumpfall','jumpbrace'];
for(let ch=0;ch<15;ch++)for(const alt of [false,true])for(let n=1;n<poses.length;n++) {
  const a=pxSprite(ch,poses[n-1],alt),b=pxSprite(ch,poses[n],alt);let both=0,union=0;
  for(let p=3;p<a.data.length;p+=4){both+=!!a.data[p]&&!!b.data[p];union+=!!a.data[p]||!!b.data[p];}
  assert(both/union<.86,'jump silhouettes too similar '+ch+' '+poses[n]);silhouettes++;
}
for(let ch=0;ch<15;ch++)for(let owner=0;owner<2;owner++)for(const travel of [-1,0,1])for(const slow of [false,true]) {
  const S=newMatch(ch,ch,811);S.phase='fight';S.stage=['courtyard','gallery','observatory'][ch%3];S.t=120;
  const f=S.f[owner],o=S.f[1-owner];f.x=640;o.x=owner?80:1200;
  if(slow) {S.dom={k:'garden',o:1-owner,t:90,dur:600};o.domUsed=1;}
  const dir=travel===1?BTN.R:travel===-1?BTN.L:0,inp=owner?[0,BTN.U|dir]:[BTN.U|dir,0];
  const control=JSON.parse(JSON.stringify(S));step(S,inp);step(control,inp);assert.equal(f.st,'jump');
  const seen=new Set(),paused=new Set();let ticks=0,landed=0,highest=f.y;
  while(f.st==='jump'&&ticks<200) {
    const before=JSON.stringify(S),pose=pxPose(S,f),snapshot=JSON.parse(before);highest=Math.min(highest,f.y);
    assert.equal(pxPose(snapshot,snapshot.f[owner]),pose);assert(poses.includes(pose));
    if(!seen.has(pose)) {
      const frame=pxFighterFrame(ch,pose,!!owner);let bottom=-1;
      for(let y=0;y<frame.sprite.h;y++)for(let x=0;x<frame.sprite.w;x++)if(frame.sprite.data[(y*frame.sprite.w+x)*4+3])bottom=y;
      assert(Math.round(f.y/2)+bottom-frame.oy<=GROUND/2,'airborne sole below the floor');
      pxWorldSurface(S,{});assert.equal(JSON.stringify(S),before,'jump drawing mutates state');
      if(!slow&&owner===0&&travel===1)samples.set(ch+':'+pose,snapshot);
    }
    seen.add(pose);
    if(!paused.has(pose)) {
      paused.add(pose);const y=f.y,vy=f.vy;
      for(const pause of ['hitstop','freeze','stop']) {
        if(pause==='stop'){S.stop={o:1-owner,t:3};control.stop={...S.stop};}
        else S[pause]=control[pause]=3;
        for(let n=0;n<3;n++){step(S,inp);step(control,inp);assert.equal(f.y,y);assert.equal(f.vy,vy);assert.equal(pxPose(S,f),pose);}
      }
    }
    step(S,inp);step(control,inp);ticks++;
    if(f.y===GROUND)landed++;
    assert.equal(JSON.stringify(S),JSON.stringify(control),'rendering changes jump outcome');
  }
  assert(ticks<200);assert.equal(landed,1);assert.equal(f.st,'idle');assert(highest<GROUND-100);
  for(const pose of poses)assert(seen.has(pose),'missing jump phase '+pose+' slow='+slow);
  assert(S.ev.some(e=>e.k==='jump'));assert(S.ev.some(e=>e.k==='land'));
  assert(!poses.includes(pxPose(S,f)),'jump pose persists on landing');
  step(S,inp);assert.equal(f.st,travel?'walk':'idle','held jump repeats');
  newRound(S);assert.equal(S.f[owner].y,GROUND);assert(!poses.includes(pxPose(S,S.f[owner])));timelines++;
}
// Actual air punch/kick and hit interruptions supersede the travel drawing immediately.
for(let ch=0;ch<15;ch++)for(let owner=0;owner<2;owner++)for(const kind of ['punch','kick','hit','ko']) {
  const S=newMatch(ch,ch,123);S.phase='fight';S.t=120;const f=S.f[owner],o=S.f[1-owner];f.x=640;o.x=owner?80:1200;
  step(S,owner?[0,BTN.U]:[BTN.U,0]);for(let n=0;n<18;n++)step(S,[0,0]);
  assert.equal(pxPose(S,f),'jumpcrest');
  if(kind==='punch'||kind==='kick') {
    const key=kind==='punch'?BTN.P:BTN.K;step(S,owner?[0,key]:[key,0]);assert.equal(f.st,'atk');assert.equal(f.move,kind==='punch'?'jp':'jk');
    assert.equal(pxPose(S,f),kind==='punch'?'jpunchw':'jkickw');
  } else {
    if(kind==='ko')f.hp=1;
    hit(S,1-owner,f,o.x,{dmg:10,kb:3,lift:7});assert.equal(f.st,kind==='ko'?'ko':'hit');assert.equal(pxPose(S,f),pxAirHitPose(f));
  }
  f.portrait=true;assert.equal(pxPose(S,f),'idle');interruptions++;
}
globalThis.sheet=new PixelSurface(1152,830);sheet.rect(0,0,sheet.w,sheet.h,'#171f30');
pxText(sheet,'V27 / VOLUNTARY JUMP: RISE, CREST, FALL, REACH',18,16,PX_LIGHT,2);
for(let row=0;row<3;row++)poses.forEach((pose,n)=>{
  const ch=[0,7,14][row],x=n*288,y=48+row*256,f=pxFighterFrame(ch,pose,row===1);
  sheet.rect(x+4,y,280,250,'#28364a');sheet.rect(x+5,y+218,278,1,'#576075');
  sheet.blit(f.sprite,x+144-f.ox*2,y+218-f.oy*2,2,row===1);
  pxText(sheet,CH[ch].name,x+12,y+231,PX_LIGHT);pxText(sheet,pose,x+12,y+244,'#b4c2ce');
});
globalThis.flat=new PixelSurface(1320,820);flat.rect(0,0,flat.w,flat.h,'#d1d5d1');
pxText(flat,'V27 / FIFTEEN JUMP PHASE SILHOUETTES',18,16,PX_INK,2);
for(let ch=0;ch<15;ch++) {
  const x=ch%3*440,y=48+Math.floor(ch/3)*152;pxText(flat,CH[ch].name,x+5,y,PX_INK);
  poses.forEach((pose,n)=>{const f=pxFighterFrame(ch,pose,false,PX_INK);flat.blit(f.sprite,x+n*110+50-f.ox,y+130-f.oy);});
}
globalThis.scene=new PixelSurface(1280,720);
for(const [n,ch,pose]of [[0,0,'jump'],[1,7,'jumpcrest'],[2,14,'jumpfall'],[3,4,'jumpbrace']]) {
  const S=samples.get(ch+':'+pose),view=pxWorldSurface(S,{});pxOutlinedText(view,CH[ch].name+' / '+pose,12,16,PX_LIGHT);
  pxOutlinedText(view,'ACTUAL JUMP INPUT / VELOCITY AND HEIGHT',12,30,'#b4c2ce');scene.blit(view,n%2*640,Math.floor(n/2)*360);
}
console.log('PASS',timelines,'actual jump/slow/direction timelines;',silhouettes,'costume phase silhouettes;',interruptions,'air attack/hit/KO interruptions; freeze/time-stop holds, snapshots, landing/held-input/rematch and unchanged outcomes');
`,ctx);
if(process.argv[2])for(const [name,key]of [['v27-jump-phases.png','sheet'],['v27-jump-silhouettes.png','flat'],['v27-jump-scene.png','scene']])writePNG(path.join(process.argv[2],name),ctx[key]);
