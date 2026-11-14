// Remaining cast families: actual effect ticks, frozen clocks and flat silhouettes.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs'),ctx=vm.createContext({console,assert});
vm.runInContext(['sim','fighters','fighters2','pixel','pixel-stage','pixel-world','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
vm.runInContext(`
const words=new Set(['dontmove','blastaway','crushed']);let silhouettes=0,timelines=0;
const overlap=(a,b)=>{let common=0,union=0;for(let i=3;i<a.data.length;i+=4){common+=!!a.data[i]&&!!b.data[i];union+=!!a.data[i]||!!b.data[i];}return common/union;};
for(let ch=0;ch<15;ch++)for(const family of ['cast1','speech'])for(const alt of [false,true]) {
  const seq=PX_ATTACKS[family],poses=[seq[0],seq[1],family,seq[2],seq[3]];
  for(let n=0;n<4;n++) {
    assert(overlap(pxSprite(ch,poses[n],alt),pxSprite(ch,poses[n+1],alt))<.94,'indistinct '+ch+' '+family+' '+n);silhouettes++;
  }
  assert(overlap(pxSprite(ch,'cast1',alt),pxSprite(ch,'speech',alt))<.8,'speech reads as a palm cast');
}
for(let ch=0;ch<15;ch++)for(let slot=0;slot<3;slot++) {
  const m=CH[ch].arts[slot];
  assert.equal(pxArtPose(m),words.has(m.id)?'speech':m.pose==='slashw'?'slash':m.pose,'incorrect visual routing '+m.id);
  if(m.pose!=='cast1')continue;
  for(let owner=0;owner<2;owner++) {
    const S=newMatch(ch,ch,619);S.phase='fight';S.f[0].x=350;S.f[1].x=650;
    const f=S.f[owner];f.face=owner?-1:1;startMove(f,'a'+slot);
    const family=words.has(m.id)?'speech':'cast1',control=JSON.parse(JSON.stringify(S));
    let fired=false,ticks=0;
    while(f.st==='atk'&&ticks<160) {
      const before=JSON.stringify(S),pose=pxPose(S,f),frame=pxFighterFrame(ch,pose,!!owner).sprite;
      const clone=JSON.parse(before);assert.deepEqual(pxFighterFrame(ch,pxPose(clone,clone.f[owner]),!!owner).sprite.data,frame.data);
      assert.equal(JSON.stringify(S),before,'render mutates state');
      if(f.mt===1) {
        for(const kind of ['hitstop','freeze','stop']) {
          if(kind==='stop'){S.stop={o:1-owner,t:3};control.stop={o:1-owner,t:3};}else S[kind]=control[kind]=3;
          const mt=f.mt;
          for(let n=0;n<3;n++){step(S,[0,0]);step(control,[0,0]);assert.equal(f.mt,mt);assert.equal(pxPose(S,f),pose);}
          assert.equal(JSON.stringify(S),JSON.stringify(control));
        }
      }
      const release=f.mt===m.su-1;
      step(S,[0,0]);step(control,[0,0]);assert.equal(JSON.stringify(S),JSON.stringify(control));
      if(release) {
        fired=true;
        if(m.id==='blastdash')assert.equal(f.st,'jump','dash must keep its immediate airborne transition');
        else assert.equal(pxPose(S,f),family,'release frame misses actual art tick');
        if(words.has(m.id))assert(S.ev.some(e=>e.k==='word'),'word event missing');
        if(m.id==='red'||m.id==='paper') {
          const shot=S.proj.find(p=>p.o===owner);assert(shot,'no real projectile');
          const palm=PX_POSES.cast1.a[1];
          assert(Math.abs((shot.y-f.y)/2-palm[1]*PX_KITS[ch].height)<6,'palm is above projectile');
          assert(Math.abs(Math.abs(shot.x-f.x)/2-palm[0])<16,'palm detached horizontally');
        }
      }
      ticks++;
    }
    assert(fired&&ticks<160,'cast did not release and finish');timelines++;
  }
}
globalThis.sheet=new PixelSurface(1440,1330);sheet.rect(0,0,sheet.w,sheet.h,'#171f30');
globalThis.silhouetteSheet=new PixelSurface(1440,1330);silhouetteSheet.rect(0,0,1440,1330,'#d1d5d1');
pxText(sheet,'V20 / PALM CASTS AND SPOKEN ARTS',18,15,PX_LIGHT,2);
pxText(silhouetteSheet,'V20 / CAST PHASES AS FLAT SILHOUETTES',18,15,PX_INK,2);
const rows=[[0,'cast1'],[6,'speech'],[10,'cast1'],[12,'cast1'],[6,'speech']];
rows.forEach(([ch,family],row)=>{
  const seq=PX_ATTACKS[family];[seq[0],seq[1],family,seq[2],seq[3]].forEach((pose,n)=>{
    const x=n*288,y=46+row*254,alt=row===4;
    sheet.rect(x+4,y,280,248,'#28364a');sheet.rect(x+5,y+218,278,1,'#576075');
    const f=pxFighterFrame(ch,pose,alt),flat=pxFighterFrame(ch,pose,alt,PX_INK);
    sheet.blit(f.sprite,x+144-f.ox*2,y+218-f.oy*2,2,alt);
    silhouetteSheet.blit(flat.sprite,x+144-flat.ox*2,y+218-flat.oy*2,2,alt);
    for(const s of [sheet,silhouetteSheet]) {
      pxText(s,CH[ch].name+(alt?' / MIRROR':''),x+12,y+229,s===sheet?PX_LIGHT:PX_INK);
      pxText(s,pose,x+12,y+241,s===sheet?'#b4c2ce':PX_INK);
    }
  });
});
globalThis.scene=new PixelSurface(1280,720);
for(const [panel,ch,slot,owner]of [[0,0,1,0],[1,6,1,0],[2,12,1,1],[3,6,2,1]]) {
  const S=newMatch(ch,ch,619);S.phase='fight';S.stage='gallery';S.t=60;S.f[0].x=350;S.f[1].x=ch===6?650:850;
  const f=S.f[owner];f.face=owner?-1:1;startMove(f,'a'+slot);f.mt=moveDef(f).su-1;step(S,[0,0]);
  const words=S.ev.filter(e=>e.k==='word').map(e=>({x:e.x,y:e.y,txt:e.a,t:0,life:50}));
  const view=pxWorldSurface(S,{words});pxText(view,CH[ch].name+' / '+CH[ch].arts[slot].name,12,16,PX_LIGHT);
  pxText(view,'ACTUAL FIRST EFFECT TICK / P'+(owner+1),12,30,'#b4c2ce');scene.blit(view,panel%2*640,Math.floor(panel/2)*360);
}
console.log('PASS',timelines,'cast/owner timelines and actual effects;',silhouettes,'phase silhouettes; family routing, projectile palms, dash transition, global/time-stop holds, snapshots and unchanged outcomes');
`,ctx);
if(process.argv[2])for(const [name,key]of [['v20-cast-phases.png','sheet'],['v20-cast-silhouettes.png','silhouetteSheet'],['v20-cast-scene.png','scene']])writePNG(path.join(process.argv[2],name),ctx[key]);
