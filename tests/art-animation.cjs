// Art-family presentation inside real move windows. No human play or browser claim.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs'),ctx=vm.createContext({console,assert});
vm.runInContext(['sim','fighters','fighters2','pixel','pixel-stage','pixel-world','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
vm.runInContext(`
const families=['slash','cannon','clap','sign','bow','throw'];
let timelines=0,silhouettes=0;
for(let ch=0;ch<15;ch++)for(const family of families) {
  const seq=PX_ATTACKS[family],poses=[family,seq[2],seq[3]],cells=poses.map(p=>pxSprite(ch,p));
  for(let n=0;n<2;n++) {
    let common=0,union=0;
    for(let i=3;i<cells[n].data.length;i+=4){const a=!!cells[n].data[i],b=!!cells[n+1].data[i];common+=a&&b;union+=a||b;}
    assert(common/union<.94,ch+' '+family+' indistinct contact/recovery '+n);silhouettes++;
  }
}
for(let ch=0;ch<15;ch++)for(let slot=0;slot<3;slot++)for(let owner=0;owner<2;owner++) {
  const S=newMatch(ch,ch,331);S.phase='fight';S.f[0].x=140;S.f[1].x=1140;
  const f=S.f[owner];f.face=owner?-1:1;startMove(f,'a'+slot);
  const m=moveDef(f),family=pxArtPose(m),seq=PX_ATTACKS[family]||PX_ATTACKS.cast1;
  // Check the boundaries against the existing definition, including very short recoveries.
  const at=t=>{f.mt=t;return pxPose(S,f);},contact=Math.min(3,Math.ceil(m.re/3)),settle=Math.ceil(m.re*.65);
  assert.equal(at(0),seq[0]);assert.equal(at(m.su-1),seq[1]);
  assert.equal(at(m.su),family in PX_POSES?family:'cast1');
  if(contact<settle)assert.equal(at(m.su+contact),seq[2]);
  if(settle<m.re)assert.equal(at(m.su+m.re-1),seq[3]);f.mt=0;
  const control=JSON.parse(JSON.stringify(S));let ticks=0;
  while(f.st==='atk'&&ticks<240) {
    const before=JSON.stringify(S),pose=pxPose(S,f);assert(PX_POSES[pose]);assert.notEqual(pose,'idle');
    if(ticks%5===0) {
      const a=pxFighterFrame(ch,pose,!!owner),clone=JSON.parse(before),b=pxFighterFrame(ch,pxPose(clone,clone.f[owner]),!!owner);
      assert.deepEqual(a.sprite.data,b.sprite.data,'snapshot changes art frame');
    }
    assert.equal(JSON.stringify(S),before,'drawing mutates simulation');
    if(ticks===2) {
      S.hitstop=control.hitstop=3;const mt=f.mt;
      for(let n=0;n<3;n++){step(S,[0,0]);step(control,[0,0]);assert.equal(f.mt,mt);assert.equal(pxPose(S,f),pose);}
    }
    step(S,[0,0]);step(control,[0,0]);assert.equal(JSON.stringify(S),JSON.stringify(control),'presentation changes art outcome');ticks++;
  }
  assert(ticks<240,'art never finishes');timelines++;
}
globalThis.sheet=new PixelSurface(1440,1575);sheet.rect(0,0,sheet.w,sheet.h,'#171f30');
pxText(sheet,'V19 / ART FAMILIES: LOAD, CONTACT AND FOLLOW-THROUGH',18,16,PX_LIGHT,2);
const rows=[['SLASH',1,'slash'],['CANNON',4,'cannon'],['CLAP',2,'clap'],['SIGN',3,'sign'],['BOW',1,'bow'],['THROW',7,'throw']];
rows.forEach(([name,ch,family],row)=>{
  const seq=PX_ATTACKS[family];[seq[0],seq[1],family,seq[2],seq[3]].forEach((pose,n)=>{
    const x=n*288,y=48+row*254;sheet.rect(x+4,y+3,280,247,'#28364a');sheet.rect(x+5,y+218,278,1,'#576075');
    const f=pxFighterFrame(ch,pose,row%2===1);sheet.blit(f.sprite,x+144-f.ox*2,y+218-f.oy*2,2);
    pxText(sheet,name+' / '+pose,x+12,y+229,PX_LIGHT);pxText(sheet,CH[ch].name,x+12,y+240,'#b4c2ce');
  });
});
globalThis.silhouetteSheet=new PixelSurface(1440,1575);silhouetteSheet.rect(0,0,1440,1575,'#d1d5d1');
pxText(silhouetteSheet,'V19 / SAME PHASES AS FLAT SILHOUETTES',18,16,PX_INK,2);
rows.forEach(([name,ch,family],row)=>{
  const seq=PX_ATTACKS[family];[seq[0],seq[1],family,seq[2],seq[3]].forEach((pose,n)=>{
    const x=n*288,y=48+row*254,f=pxFighterFrame(ch,pose,false,PX_INK);
    silhouetteSheet.blit(f.sprite,x+144-f.ox*2,y+218-f.oy*2,2);pxText(silhouetteSheet,name+' / '+pose,x+12,y+234,PX_INK);
  });
});
globalThis.scene=new PixelSurface(1280,360);
for(const [panel,ch,slot]of [[0,4,0],[1,1,2]]) {
  const demo=newMatch(ch,13,431);demo.phase='fight';demo.stage='gallery';demo.t=60;demo.f[0].x=380;demo.f[1].x=1000;
  const f=demo.f[0];startMove(f,'a'+slot);f.mt=moveDef(f).su-1;step(demo,[0,0]);
  assert.equal(pxPose(demo,f),panel?'bow':'cannon');
  const shot=panel?demo.proj[0]:demo.zones.find(z=>z.k==='beam');assert(shot,'missing actual firing tick');
  const palm=PX_POSES[panel?'bow':'cannon'].a[1];
  assert(Math.hypot((shot.x-f.x)/2-palm[0],(shot.y-f.y)/2-palm[1]*PX_KITS[ch].height)<14,'shot disconnected from release hand');
  const view=pxWorldSurface(demo,{});pxText(view,(panel?'BOW':'CANNON')+' / ACTUAL FIRST FIRING TICK',12,156,PX_LIGHT);
  scene.blit(view,panel*640,0);
}
console.log('PASS',timelines,'actual art/owner timelines and phase boundaries;',silhouettes,'palette-independent contact/recoil/settle comparisons; hit-stop, snapshots, read-only rendering and deterministic outcomes');
`,ctx);
if(process.argv[2])for(const [name,key]of [['v19-art-phases.png','sheet'],['v19-art-silhouettes.png','silhouetteSheet'],['v19-art-scene.png','scene']])writePNG(path.join(process.argv[2],name),ctx[key]);
