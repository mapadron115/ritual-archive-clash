// Input-driven air normals, real contacts and presentation-only state. Not human play.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs'),ctx=vm.createContext({console,assert});
vm.runInContext(['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
vm.runInContext(`
let timelines=0,silhouettes=0,contacts=0;const samples=new Map();
const families={jp:['jpunchw','jpunchload','jpunch','jpunchre','jpunchsettle'],jk:['jkickw','jkickload','jkick','jkickre','jkicksettle']};
for(let ch=0;ch<15;ch++)for(const alt of [false,true])for(const poses of Object.values(families))for(let n=1;n<poses.length;n++) {
  const a=pxSprite(ch,poses[n-1],alt),b=pxSprite(ch,poses[n],alt);let both=0,union=0;
  for(let p=3;p<a.data.length;p+=4){both+=!!a.data[p]&&!!b.data[p];union+=!!a.data[p]||!!b.data[p];}
  assert(both/union<.87,'air attack silhouettes too similar '+ch+' '+poses[n]);silhouettes++;
}
// Early, crest and late inputs include startup interrupted by landing and recovery held until landing.
for(let ch=0;ch<15;ch++)for(let owner=0;owner<2;owner++)for(const move of ['jp','jk'])for(const delay of [0,15,29])for(const slow of [false,true]) {
  const S=newMatch(ch,ch,927);S.phase='fight';S.stage=['courtyard','gallery','observatory'][ch%3];S.t=120;
  const f=S.f[owner],o=S.f[1-owner];f.x=640;o.x=owner?80:1200;
  if(slow){S.dom={k:'garden',o:1-owner,t:90,dur:600};o.domUsed=1;}
  step(S,owner?[0,BTN.U]:[BTN.U,0]);for(let n=0;n<delay;n++)step(S,[0,0]);assert(f.y<GROUND);
  const key=move==='jp'?BTN.P:BTN.K,inp=owner?[0,key]:[key,0];step(S,inp);assert.equal(f.move,move);
  const control=JSON.parse(JSON.stringify(S)),m=moveDef(f),seen=new Set(),paused=new Set();let ticks=0;
  while(f.st==='atk'&&ticks<200) {
    const before=JSON.stringify(S),pose=pxPose(S,f),elapsed=f.mt-m.su,phases=families[move];
    const expected=f.mt<m.su?phases[f.mt<Math.ceil(m.su/2)?0:1]:elapsed<m.ac?phases[2]:elapsed<m.ac+Math.ceil(m.re/2)?phases[3]:phases[4];
    assert.equal(pose,expected,'wrong phase boundary');seen.add(pose);
    const snapshot=JSON.parse(before);assert.equal(pxPose(snapshot,snapshot.f[owner]),pose);
    if(!paused.has(pose)) {
      const frame=pxFighterFrame(ch,pose,!!owner);let bottom=-1;
      for(let y=0;y<frame.sprite.h;y++)for(let x=0;x<frame.sprite.w;x++)if(frame.sprite.data[(y*frame.sprite.w+x)*4+3])bottom=y;
      assert(Math.round(f.y/2)+bottom-frame.oy<=GROUND/2,'sole below floor '+ch+' '+pose);
      pxWorldSurface(S,{});assert.equal(JSON.stringify(S),before,'renderer mutates state');
      if(delay===0&&!slow&&owner===0)samples.set(ch+':'+pose,snapshot);
      paused.add(pose);const mt=f.mt,y=f.y,vy=f.vy;
      for(const pause of ['hitstop','freeze','stop']) {
        if(pause==='stop'){S.stop={o:1-owner,t:3};control.stop={...S.stop};}else S[pause]=control[pause]=3;
        for(let n=0;n<3;n++){step(S,inp);step(control,inp);assert.equal(f.mt,mt);assert.equal(f.y,y);assert.equal(f.vy,vy);assert.equal(pxPose(S,f),pose);}
      }
    }
    step(S,inp);step(control,inp);assert.equal(JSON.stringify(S),JSON.stringify(control),'drawing changes outcome');ticks++;
  }
  assert(ticks<200);assert.equal(f.st,'idle');assert.equal(f.y,GROUND);
  if(delay===0)for(const pose of families[move])assert(seen.has(pose),'missing phase '+pose);
  step(S,inp);assert.notEqual(f.st,'atk','held attack repeats');
  newRound(S);assert(!Object.values(families).flat().includes(pxPose(S,S.f[owner])));timelines++;
}
// Contact is drawn during the actual active window in both facings, including opponent guard.
for(let ch=0;ch<15;ch++)for(let owner=0;owner<2;owner++)for(const move of ['jp','jk'])for(const guard of [false,true]) {
  const S=newMatch(ch,ch,391);S.phase='fight';S.t=120;const f=S.f[owner],o=S.f[1-owner];
  f.x=owner?670:610;o.x=owner?610:670;
  const jump=owner?[0,BTN.U]:[BTN.U,0];step(S,jump);const key=move==='jp'?BTN.P:BTN.K;
  // Descend into a grounded opponent; guard is only legal on the ground.
  for(let n=0;n<25;n++)step(S,owner?[guard?BTN.G:0,0]:[0,guard?BTN.G:0]);
  for(let n=0;n<20;n++) {
    const inp=owner?[guard?BTN.G:0,n===0?key:0]:[n===0?key:0,guard?BTN.G:0];step(S,inp);
    const e=S.ev.find(e=>e.k===(guard?'block':'hit'));
    if(e) {
      assert.equal(pxPose(S,f),families[move][2]);assert(f.mt>=BASIC[move].su&&f.mt<BASIC[move].su+BASIC[move].ac);
      if(!guard&&owner===0)samples.set(ch+':contact:'+move,JSON.parse(JSON.stringify(S)));
      contacts++;break;
    }
  }
  assert(S.ev.some(e=>e.k===(guard?'block':'hit')),'missing real contact '+ch+' '+move+' guard='+guard);
  hit(S,1-owner,f,o.x,{dmg:10,kb:3,lift:7});assert.equal(pxPose(S,f),pxAirHitPose(f));
  f.hp=1;hit(S,1-owner,f,o.x,{dmg:10,kb:3,lift:7});assert.equal(f.st,'ko');assert.equal(pxPose(S,f),pxAirHitPose(f));
}
globalThis.sheet=new PixelSurface(1440,1080);sheet.rect(0,0,sheet.w,sheet.h,'#171f30');
pxText(sheet,'V28 / AIR NORMALS: COIL, CONTACT, RECOIL, SUSPEND',18,16,PX_LIGHT,2);
for(let row=0;row<4;row++)families[row%2?'jk':'jp'].forEach((pose,n)=>{
  const ch=[0,0,14,14][row],x=n*288,y=48+row*256,f=pxFighterFrame(ch,pose,row>1);
  sheet.rect(x+4,y,280,250,'#28364a');sheet.rect(x+5,y+220,278,1,'#576075');
  sheet.blit(f.sprite,x+144-f.ox*2,y+218-f.oy*2,2,row>1);
  pxText(sheet,CH[ch].name,x+12,y+232,PX_LIGHT);pxText(sheet,pose,x+12,y+244,'#b4c2ce');
});
globalThis.flat=new PixelSurface(1500,1210);flat.rect(0,0,flat.w,flat.h,'#d1d5d1');
pxText(flat,'V28 / FIFTEEN AIR PUNCH AND KICK SILHOUETTES',18,16,PX_INK,2);
for(let ch=0;ch<15;ch++) {
  const x=ch%3*500,y=48+Math.floor(ch/3)*230;pxText(flat,CH[ch].name,x+5,y,PX_INK);
  Object.values(families).forEach((poses,row)=>poses.forEach((pose,n)=>{const f=pxFighterFrame(ch,pose,false,PX_INK);flat.blit(f.sprite,x+n*100+45-f.ox,y+105+row*108-f.oy);}));
}
globalThis.scene=new PixelSurface(1280,720);
for(const [n,ch,key]of [[0,0,'jpunchload'],[1,14,'jkickload'],[2,7,'contact:jp'],[3,4,'contact:jk']]) {
  const S=samples.get(ch+':'+key);assert(S,'missing scene '+key);const view=pxWorldSurface(S,{});
  pxOutlinedText(view,CH[ch].name+' / '+key,12,16,PX_LIGHT);pxOutlinedText(view,'ACTUAL INPUT / ORIGINAL TIMING AND CONTACT',12,30,'#b4c2ce');
  scene.blit(view,n%2*640,Math.floor(n/2)*360);
}
console.log('PASS',timelines,'actual early/crest/late/slow air attack timelines;',silhouettes,'costume phase silhouettes;',contacts,'real hit/block contacts; freezes, snapshots, floor clearance, hit/KO, landing/rematch and unchanged outcomes');
`,ctx);
if(process.argv[2])for(const [name,key]of [['v28-air-attack-phases.png','sheet'],['v28-air-attack-silhouettes.png','flat'],['v28-air-attack-scene.png','scene']])writePNG(path.join(process.argv[2],name),ctx[key]);
