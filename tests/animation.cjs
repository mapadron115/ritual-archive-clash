// Actual move/state timelines, sprite origins and read-only animation selection. No human play claim.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const writePNG=require('./png.cjs'),root=path.join(__dirname,'..'),ctx=vm.createContext({console,assert});
vm.runInContext(['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
vm.runInContext(`
let timelines=0,groundFrames=0;
for(let ch=0;ch<15;ch++) for(const move of [...Object.keys(BASIC),'a0','a1','a2']) {
  const S=newMatch(ch,(ch+1)%15,173);S.phase='fight';S.f[0].x=100;S.f[1].x=1180;
  const f=S.f[0];startMove(f,move);const m=moveDef(f);
  if(m.air) {f.y=GROUND-240;f.vy=-2;}
  let seenRecovery=false,frames=0;
  while(f.st==='atk' && frames<240) {
    const before=JSON.stringify(S),pose=pxPose(S,f);
    assert(PX_POSES[pose],ch+' '+move+' unknown '+pose);
    assert.notEqual(pose,'idle','idle implies control before recovery ends');
    pxFighterFrame(ch,pose);assert.equal(JSON.stringify(S),before,'renderer mutated simulation');
    if(f.mt>=m.su+(m.ac||0))seenRecovery=true;
    // Rendering during global impact pause must keep the same attack frame.
    if(frames===2) {S.hitstop=4;const mt=f.mt;for(let n=0;n<4;n++){step(S,[0,0]);assert.equal(f.mt,mt);assert.equal(pxPose(S,f),pose);}}
    step(S,[0,0]);frames++;
  }
  assert(frames<240,'move did not finish '+ch+' '+move);if(BASIC[move])assert(seenRecovery,'missing basic recovery '+ch+' '+move);timelines++;
}
for(let ch=0;ch<15;ch++)for(const alt of [false,true])for(const pose of ['collapse','down']) {
  const frame=pxFighterFrame(ch,pose,alt);let bottom=-1,count=0;
  for(let y=0;y<frame.sprite.h;y++)for(let x=0;x<frame.sprite.w;x++)if(frame.sprite.data[(y*frame.sprite.w+x)*4+3]){bottom=y;count++;}
  assert(count>800);assert.equal(bottom-frame.oy,0,'grounded body floats or sinks');groundFrames++;
}
const K=newMatch(0,14,777);K.phase='fight';const victim=K.f[1];
hit(K,0,victim,K.f[0].x,{dmg:60,kb:5,lift:8,stun:24});const history=new Set();
for(let n=0;n<160 && victim.st!=='idle';n++) {history.add(pxPose(K,victim));step(K,[0,0]);}
for(const p of ['launch','fall','collapse','down','rise1','rise2'])assert(history.has(p),'missing actual knockdown phase '+p);
assert.equal(victim.st,'idle');
const down=victim;down.st='down';down.stT=10;const hold=pxPose(K,down);K.freeze=10;
for(let n=0;n<10;n++){step(K,[0,0]);assert.equal(pxPose(K,down),hold);}
down.st='ko';down.y=GROUND;down.air=0;assert.equal(pxPose(K,down),'down');K.t+=100;assert.equal(pxPose(K,down),'down');
console.log('PASS',timelines,'actual move timelines;',groundFrames,'grounded main/mirror frames; launch/fall/collapse/down/get-up; freeze-safe selection; read-only rendering');

globalThis.sheet=new PixelSurface(1440,1000);sheet.rect(0,0,sheet.w,sheet.h,'#171f30');
pxText(sheet,'ATTACKS / STARTUP, CONTACT, RECOIL AND SETTLE',18,15,PX_LIGHT,2);
const rows=[['PUNCH',['wind','punchload','punch','punchre','ready']],['HEAVY PUNCH',['hookw','hookload','hook','hookre','ready']],['KICK',['kickw','kickload','kick','kickre','kickplant']],['THROW',['throww','wind','throw','castre','ready']]];
rows.forEach(([name,poses],row)=>poses.forEach((pose,n)=>{
  const x=n*288,y=45+row*236;sheet.rect(x+4,y+3,280,229,'#202c40');sheet.rect(x+6,y+199,276,1,'#576075');
  const ch=[0,2,14,7][row],frame=pxFighterFrame(ch,pose);sheet.blit(frame.sprite,x+144-frame.ox*2,y+199-frame.oy*2,2);
  pxText(sheet,name+' / '+pose,x+12,y+215,PX_LIGHT);
}));
globalThis.downSheet=new PixelSurface(1440,780);downSheet.rect(0,0,1440,780,'#171f30');
pxText(downSheet,'KNOCKDOWN / LAUNCH, FALL, IMPACT, GROUND AND GET-UP',18,16,PX_LIGHT,2);
for(let row=0;row<3;row++)['launch','fall','collapse','down','rise1','rise2'].forEach((pose,n)=>{
  const x=n*240,y=50+row*240,ch=[0,7,14][row],f=pxFighterFrame(ch,pose,row===1);
  downSheet.rect(x+3,y,234,230,'#202c40');downSheet.rect(x+4,y+202,232,1,'#576075');
  downSheet.blit(f.sprite,x+126-f.ox*2,y+202-f.oy*2,2);pxText(downSheet,CH[ch].name,x+10,y+212,PX_LIGHT);pxText(downSheet,pose,x+10,y+224,'#8cc6d2');
});
globalThis.rosterSheet=new PixelSurface(1440,960);rosterSheet.rect(0,0,1440,960,'#171f30');
pxText(rosterSheet,'FIFTEEN GROUND CONTACTS AND GET-UP POSES',18,16,PX_LIGHT,2);
CH.forEach((c,ch)=>{
  const x=(ch%5)*288,y=55+Math.floor(ch/5)*300;
  rosterSheet.rect(x+3,y,282,290,'#202c40');
  const down=pxFighterFrame(ch,'down'),up=pxFighterFrame(ch,'rise2',true);
  rosterSheet.blit(down.sprite,x+150-down.ox*2,y+91-down.oy*2,2);
  rosterSheet.blit(up.sprite,x+144-up.ox*2,y+263-up.oy*2,2);
  pxText(rosterSheet,c.name,x+12,y+277,PX_LIGHT,2);
});
globalThis.windups=new PixelSurface(1440,1360);windups.rect(0,0,1440,1360,'#171f30');
pxText(windups,'V11 / REARWARD SHOULDER, FIST AND WEIGHT TRANSFER',18,15,PX_LIGHT,2);
for(let row=0;row<5;row++) {
  const ch=[0,2,14,7,11][row];
  ['idle','wind','punchload','punch','punchre'].forEach((pose,n)=>{
    const x=n*288,y=45+row*260;windups.rect(x+4,y+3,280,254,'#202c40');
    windups.rect(x+5,y+220,278,1,'#576075');
    const f=pxFighterFrame(ch,pose,row%2===1);windups.blit(f.sprite,x+144-f.ox*2,y+220-f.oy*2,2);
    pxText(windups,CH[ch].name,x+10,y+234,PX_LIGHT);pxText(windups,pose,x+10,y+247,'#8cc6d2');
  });
}
`,ctx);
if(process.argv[2]) {
  const prefix=process.argv[3]||'v9';
  for(const [name,key]of [['attack-frames.png','sheet'],['knockdown-frames.png','downSheet'],['roster-ground-contact.png','rosterSheet']])writePNG(path.join(process.argv[2],prefix+'-'+name),ctx[key]);
  if(prefix==='v11')writePNG(path.join(process.argv[2],'v11-windups.png'),ctx.windups);
}
