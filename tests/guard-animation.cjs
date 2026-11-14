// Real block/break/shock clocks, silhouette readability and presentation-only recovery.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs'),ctx=vm.createContext({console,assert});
vm.runInContext(['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
vm.runInContext(`
let timelines=0,silhouettes=0;const samples=new Map();
const overlap=(a,b)=>{let both=0,union=0;for(let i=3;i<a.data.length;i+=4){both+=!!a.data[i]&&!!b.data[i];union+=!!a.data[i]||!!b.data[i];}return both/union;};
for(let ch=0;ch<15;ch++)for(const alt of [false,true])for(const seq of [
  ['guard','blockhit','blockre','blocksettle','guard'],['guard','breakopen','breakfold','stun','stunbrace','stunrise','idle']]) {
  for(let n=1;n<seq.length;n++){assert(overlap(pxSprite(ch,seq[n-1],alt),pxSprite(ch,seq[n],alt))<.94,'indistinct '+ch+' '+seq[n]);silhouettes++;}
}
for(let ch=0;ch<15;ch++)for(let owner=0;owner<2;owner++)for(const kind of ['block','break','shock']) {
  const S=newMatch(ch,ch,977);S.phase='fight';S.stage='gallery';S.t=120;S.f[0].x=400;S.f[1].x=850;
  const f=S.f[owner],by=1-owner;f.face=owner?-1:1;f.st=kind==='shock'?'idle':'guard';f.guardHp=kind==='break'?1:100;
  const initialHp=f.hp;
  hit(S,by,f,S.f[by].x,{dmg:30,kb:4,...(kind==='shock'?{shock:30}: {})});
  assert(S.ev.some(e=>e.k===(kind==='shock'?'hit':kind)));assert.equal(f.st,kind==='block'?'block':'stun');
  assert.equal(f.stT,kind==='block'?10:kind==='break'?55:30);assert(f.hp<initialHp);
  const control=JSON.parse(JSON.stringify(S)),seen=new Set();let ticks=0,paused=false;
  const input=owner?[0,BTN.G]:[BTN.G,0];
  while(['block','stun'].includes(f.st)&&ticks<100) {
    const pose=pxPose(S,f),before=JSON.stringify(S),clone=JSON.parse(before);seen.add(pose);
    const sprite=pxFighterFrame(ch,pose,!!owner).sprite;
    assert.deepEqual(sprite.data,pxFighterFrame(ch,pxPose(clone,clone.f[owner]),!!owner).sprite.data);
    if(ticks%13===0)pxWorldSurface(S,{});assert.equal(JSON.stringify(S),before,'drawing mutates simulation');
    if(!samples.has(ch+':'+kind+':'+pose))samples.set(ch+':'+kind+':'+pose,clone);
    if(!paused&&S.hitstop===0) {
      paused=true;const clock=f.stT;
      for(const pause of ['hitstop','freeze','stop']) {
        if(pause==='stop')S.stop=control.stop={o:by,t:3};else S[pause]=control[pause]=3;
        // Separate the two stop objects, since step mutates their countdowns.
        if(pause==='stop')control.stop={...S.stop};
        for(let n=0;n<3;n++) {step(S,input);step(control,input);assert.equal(f.stT,clock);assert.equal(pxPose(S,f),pose);}
      }
    }
    step(S,input);step(control,input);ticks++;
    assert.equal(JSON.stringify(S),JSON.stringify(control),'rendered outcomes diverge');
  }
  assert(ticks<100);assert.equal(f.st,kind==='block'?'guard':'idle');
  const required=kind==='block'?['blockhit','blockre','blocksettle']:kind==='break'?['breakopen','breakfold','stun','stunbrace','stunrise']:['stun','stunbrace','stunrise'];
  for(const pose of required)assert(seen.has(pose),'missing '+kind+' '+pose);timelines++;
  // A second contact resets the existing block clock and its compressed pose.
  f.st='block';f.stT=2;f.guardHp=100;hit(S,by,f,S.f[by].x,{dmg:20,kb:2});assert.equal(pxPose(S,f),'blockhit');
  f.st='ko';f.y=GROUND;assert.equal(pxPose(S,f),'down');newRound(S);assert.equal(S.f[owner].st,'idle');assert(['idle','breathe'].includes(pxPose(S,S.f[owner])));
}
globalThis.sheet=new PixelSurface(1440,1580);sheet.rect(0,0,1440,1580,'#171f30');
globalThis.flat=new PixelSurface(1440,1580);flat.rect(0,0,1440,1580,'#d1d5d1');
pxText(sheet,'V22 / GUARD IMPACT AND STUN RECOVERY',18,16,PX_LIGHT,2);
pxText(flat,'V22 / GUARD AND RECOVERY AS FLAT SILHOUETTES',18,16,PX_INK,2);
for(let row=0;row<6;row++) {
  const ch=[0,4,14,0,4,14][row],alt=row%2===1;
  const poses=row<3?['guard','blockhit','blockre','blocksettle','guard']:['breakopen','breakfold','stun','stunbrace','stunrise'];
  poses.forEach((pose,n)=>{
    const x=n*288,y=48+row*254;sheet.rect(x+4,y,280,248,'#28364a');sheet.rect(x+5,y+218,278,1,'#576075');
    for(const [s,col]of [[sheet,''],[flat,PX_INK]]) {
      const f=pxFighterFrame(ch,pose,alt,col);s.blit(f.sprite,x+144-f.ox*2,y+218-f.oy*2,2,alt);
      pxText(s,CH[ch].name+(alt?' / MIRROR':''),x+12,y+230,col||PX_LIGHT);pxText(s,pose,x+12,y+242,col||'#b4c2ce');
    }
  });
}
globalThis.scene=new PixelSurface(1280,720);
for(const [panel,ch,kind,pose]of [[0,0,'block','blockhit'],[1,14,'block','blockre'],[2,4,'break','breakfold'],[3,14,'break','stunrise']]) {
  const S=samples.get(ch+':'+kind+':'+pose),view=pxWorldSurface(S,{});
  pxText(view,CH[ch].name+' / '+pose,12,16,PX_LIGHT);pxText(view,'ACTUAL CONTACT TIMELINE / EXISTING COUNTDOWN',12,30,'#b4c2ce');
  scene.blit(view,panel%2*640,Math.floor(panel/2)*360);
}
console.log('PASS',timelines,'real block/break/shock timelines;',silhouettes,'silhouette comparisons; repeated blocks, hit-stop/global/time-stop holds, snapshots, KO/rematch and unchanged outcomes');
`,ctx);
if(process.argv[2])for(const [name,key]of [['v22-guard-phases.png','sheet'],['v22-guard-silhouettes.png','flat'],['v22-guard-scene.png','scene']])writePNG(path.join(process.argv[2],name),ctx[key]);
