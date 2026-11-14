// Real round-end clocks and winner eligibility. Script checks, not human play.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs'),ctx=vm.createContext({console,assert});
vm.runInContext(['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
vm.runInContext(`
let timelines=0,contacts=0,silhouettes=0;const samples=new Map(),poses=['idle','winready','winraise','win','winsettle'];
for(let ch=0;ch<15;ch++)for(const alt of [false,true]) {
  for(const pose of poses.slice(1)) {
    const f=pxFighterFrame(ch,pose,alt);let bottom=-1;
    for(let y=0;y<f.sprite.h;y++)for(let x=0;x<f.sprite.w;x++)if(f.sprite.data[(y*f.sprite.w+x)*4+3])bottom=y;
    assert.equal(bottom-f.oy,0,'victory sole floats/sinks '+ch+' '+pose);contacts++;
  }
  for(let n=1;n<poses.length;n++) {
    const a=pxSprite(ch,poses[n-1],alt),b=pxSprite(ch,poses[n],alt);let union=0,both=0;
    for(let p=3;p<a.data.length;p+=4){union+=!!a.data[p]||!!b.data[p];both+=!!a.data[p]&&!!b.data[p];}
    assert(both/union<.9,'indistinct victory phase '+ch+' '+poses[n]);silhouettes++;
  }
}
for(let ch=0;ch<15;ch++)for(let owner=0;owner<2;owner++)for(const kind of ['punch','timeout','air'])for(const final of [false,true]) {
  const S=newMatch(ch,ch,123);S.phase='fight';S.stage=['courtyard','gallery','observatory'][ch%3];S.t=120;S.wins[owner]=final?1:0;
  const f=S.f[owner],o=S.f[1-owner];S.f[0].x=500;S.f[1].x=580;
  if(kind==='punch') {
    o.hp=1;step(S,owner?[0,BTN.P]:[BTN.P,0]);
    for(let n=0;S.phase==='fight'&&n<20;n++)step(S,[0,0]);
  } else if(kind==='timeout') {o.hp=1;S.timer=1;step(S,[0,0]);}
  else {
    step(S,owner?[0,BTN.U]:[BTN.U,0]);for(let n=0;n<5;n++)step(S,[0,0]);
    o.hp=1;hit(S,owner,o,f.x,{dmg:10,kb:3});assert(f.y<GROUND);
  }
  assert.equal(S.phase,'ko');assert.equal(S.winner,owner);assert.equal(S.wins[owner],final?2:1);
  const control=JSON.parse(JSON.stringify(S)),seen=new Set(),paused=new Set();let ticks=0;
  while(S.phase==='ko'&&ticks<260) {
    const before=JSON.stringify(S),pose=pxPose(S,f),snapshot=JSON.parse(before),eligible=f.st==='idle'&&f.y>=GROUND&&f.hp>0;
    assert.equal(pxPose(snapshot,snapshot.f[owner]),pose,'snapshot changes victory');
    assert(!pxPose(S,o).startsWith('win'),'loser celebrates');
    if(!eligible)assert(!pose.startsWith('win'),'recovery/air covered by victory');
    if(eligible) {
      const t=S.phaseT,expected=t>=64?'winsettle':t>=42?'win':t>=30?'winraise':t>=18?'winready':null;
      if(expected)assert.equal(pose,expected);else assert(!pose.startsWith('win'));
    }
    if(!seen.has(pose)) {
      pxWorldSurface(S,{});assert.equal(JSON.stringify(S),before,'drawing mutates round end');
      if(owner===0&&final&&kind==='punch')samples.set(ch+':'+pose,snapshot);
    }
    seen.add(pose);
    if(pose.startsWith('win')&&!paused.has(pose)) {
      paused.add(pose);const clock=S.phaseT;
      for(const pause of ['freeze','hitstop']) {
        S[pause]=control[pause]=3;
        for(let n=0;n<3;n++){step(S,[0,0]);step(control,[0,0]);assert.equal(S.phaseT,clock);assert.equal(pxPose(S,f),pose);}
      }
    }
    step(S,[BTN.P|BTN.U,BTN.P|BTN.U]);step(control,[BTN.P|BTN.U,BTN.P|BTN.U]);ticks++;
    assert.equal(JSON.stringify(S),JSON.stringify(control),'rendered result diverges');
  }
  // Airborne winners join the current round phase after landing; never replay a delayed wind-up.
  assert(ticks<260);for(const pose of (kind==='air'?['win','winsettle']:poses.slice(1)))assert(seen.has(pose),'missing '+kind+' '+pose);
  if(final) {
    assert.equal(S.phase,'over');assert.equal(pxPose(S,f),'winsettle');
    for(let n=0;n<10;n++){step(S,[0,0]);assert.equal(pxPose(S,f),'winsettle');}
    newRound(S);
  } else assert.equal(S.phase,'intro');
  assert(!pxPose(S,S.f[owner]).startsWith('win'),'stale winner celebrates in new round');timelines++;
}
// Tied timeouts have no winner even if a previous round's winner remains in the snapshot.
for(let ch=0;ch<15;ch++) {
  const S=newMatch(ch,ch,1);S.phase='fight';S.timer=1;S.winner=0;step(S,[0,0]);assert.equal(S.winner,-1);
  for(let n=0;n<169;n++){for(const f of S.f)assert(!pxPose(S,f).startsWith('win'));step(S,[0,0]);}
}
globalThis.sheet=new PixelSurface(1440,830);sheet.rect(0,0,sheet.w,sheet.h,'#171f30');
pxText(sheet,'V26 / ROUND WINNER: LOWER, LIFT, PEAK, SETTLE',18,16,PX_LIGHT,2);
for(let row=0;row<3;row++)poses.forEach((pose,n)=>{
  const ch=[0,7,14][row],x=n*288,y=48+row*256,f=pxFighterFrame(ch,pose,row===1);
  sheet.rect(x+4,y,280,250,'#28364a');sheet.rect(x+5,y+218,278,1,'#576075');
  sheet.blit(f.sprite,x+144-f.ox*2,y+218-f.oy*2,2,row===1);
  pxText(sheet,CH[ch].name,x+12,y+231,PX_LIGHT);pxText(sheet,pose,x+12,y+244,'#b4c2ce');
});
globalThis.flat=new PixelSurface(1500,820);flat.rect(0,0,flat.w,flat.h,'#d1d5d1');
pxText(flat,'V26 / ALL FIFTEEN WINNER SILHOUETTES',18,16,PX_INK,2);
for(let ch=0;ch<15;ch++) {
  const x=ch%3*500,y=48+Math.floor(ch/3)*152;pxText(flat,CH[ch].name,x+5,y,PX_INK);
  poses.forEach((pose,n)=>{const f=pxFighterFrame(ch,pose,false,PX_INK);flat.blit(f.sprite,x+n*100+48-f.ox,y+130-f.oy);});
}
globalThis.scene=new PixelSurface(1280,720);
for(const [n,ch,pose]of [[0,0,'winready'],[1,7,'winraise'],[2,14,'win'],[3,4,'winsettle']]) {
  const S=samples.get(ch+':'+pose),view=pxWorldSurface(S,{});
  pxOutlinedText(view,CH[ch].name+' / '+pose,12,16,PX_LIGHT);
  pxOutlinedText(view,'ACTUAL KO / ROUND CLOCK '+S.phaseT,12,30,'#b4c2ce');scene.blit(view,n%2*640,Math.floor(n/2)*360);
}
console.log('PASS',timelines,'KO/timeout/airborne winner timelines;',contacts,'grounded costume frames;',silhouettes,'phase silhouettes; ties, recovery eligibility, impact/global holds, snapshots, round/rematch and unchanged outcomes');
`,ctx);
if(process.argv[2])for(const [name,key]of [['v26-victory-phases.png','sheet'],['v26-victory-silhouettes.png','flat'],['v26-victory-scene.png','scene']])writePNG(path.join(process.argv[2],name),ctx[key]);
