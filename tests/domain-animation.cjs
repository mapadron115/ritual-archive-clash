// Domain presentation sampled from actual input-driven casts, not invented move clocks.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs'),ctx=vm.createContext({console,assert});
vm.runInContext(['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
vm.runInContext(`
const samples=new Map();let timelines=0,events=0,effects=0,silhouettes=0;
const save=(key,S,owner)=>{if(!samples.has(key))samples.set(key,{S:JSON.parse(JSON.stringify(S)),owner});};
const release={nuclear:[72],bloodsweep:[40],megaphone:[24],howitzer:[46],web:[14,38,62],jce:[8,16,24,32,40,48,56],effigy:[10,24,38,60],ovation:[1,15,29,43,57,71]};
const expected={nuclear:'cannon',bloodsweep:'cannon',megaphone:'speech',howitzer:'ultimpact',web:'clap',jce:'slash',effigy:'throw',ovation:'clap'};
const effect={nuclear:'nuke',bloodsweep:'nuke',megaphone:'word',howitzer:'nuke',web:'slash',jce:'rain',ovation:'clap'};
for(let ch=0;ch<15;ch++)for(let owner=0;owner<2;owner++) {
  const S=newMatch(ch,ch,817);S.phase='fight';S.stage='gallery';
  const f=S.f[owner],o=S.f[1-owner];f.gauge=100;f.hp=f.ghost=o.hp=o.ghost=100000;
  const control=JSON.parse(JSON.stringify(S)),input=owner?[0,BTN.DOM]:[BTN.DOM,0];
  step(S,input);step(control,input);
  assert.equal(S.dom.t,1,'real input advances Domain before freeze');assert.equal(S.freeze,60);assert.equal(f.st,'cast');
  assert(S.ev.some(e=>e.k==='domain'));assert.equal(f.domUsed,1);
  const kind=S.dom.k,seen=new Set();let ticks=0,checkedHold=false;
  if(kind==='ovation'){assert(S.ev.some(e=>e.k==='clap'));effects++;}
  while(S.dom&&ticks<800) {
    const d=S.dom,pose=pxPose(S,f),before=JSON.stringify(S);seen.add(pose);
    assert(PX_POSES[pose],'invalid Domain frame '+kind);
    if(f.st==='cast')assert.notEqual(pose,'idle');
    if(S.freeze>0&&d.t===1) {
      const phase=S.freeze>40?0:S.freeze>20?1:2;
      if(!CH[ch].dom.maximum)assert.equal(pose,['domgather','domseal','domopen'][phase]);
      else if(phase<2)assert.equal(pose,['maxcoil','maxcharge'][phase]);
      if(kind==='nuclear'&&phase===2)assert.equal(pose,'cannonload','cinematic implies premature firing');
      if([60,40,20].includes(S.freeze))save(ch+':f'+S.freeze,S,owner);
    }
    if(!S.freeze) {
      save(ch+':t'+d.t,S,owner);
      if(release[kind]?.includes(d.t)) {assert.equal(pose,expected[kind],kind+' misses actual effect tick');events++;}
      if(kind==='allout'&&d.done&&d.t<40) {assert.equal(pose,'punch');save(ch+':contact',S,owner);}
      if(f.st==='cast'&&d.t===5&&!checkedHold) {
        checkedHold=true;
        // Additional global pauses at active time hold the pose and active Domain clock.
        for(const pause of ['hitstop','freeze']) {
          S[pause]=control[pause]=3;
          for(let n=0;n<3;n++){step(S,[0,0]);step(control,[0,0]);assert.equal(S.dom.t,5);assert.equal(pxPose(S,f),pose);}
        }
      }
    }
    if(ticks%7===0) {
      const clone=JSON.parse(JSON.stringify(S));
      assert.deepEqual(pxFighterFrame(ch,pose,!!owner).sprite.data,pxFighterFrame(ch,pxPose(clone,clone.f[owner]),!!owner).sprite.data,'snapshot changes drawing');
    }
    // Use real pixels as well as frame selection; drawing never writes simulation data.
    if(ticks%31===0)pxWorldSurface(S,{});
    // Pause probes advance the simulation intentionally; compare against their matching control.
    if(!(checkedHold&&d.t===5))assert.equal(JSON.stringify(S),before,'drawing mutates state');
    assert.equal(JSON.stringify(S),JSON.stringify(control),'rendered and unrendered timelines diverge');
    const tickBefore=S.dom.t,eventsBefore=S.ev.length;
    step(S,[0,0]);step(control,[0,0]);ticks++;
    if(S.dom&&S.dom.t!==tickBefore&&release[kind]?.includes(S.dom.t)) {
      const key=kind==='effigy'?(S.dom.t===60?'boom':'rain'):effect[kind];
      assert(S.ev.slice(eventsBefore).some(e=>e.k===key),'missing actual effect '+kind+' '+S.dom.t);effects++;
    }
  }
  assert(ticks<800,'Domain fails to expire');assert(seen.size>=4,'static Domain '+kind);
  assert.equal(JSON.stringify(S),JSON.stringify(control));timelines++;
}
// Silhouettes must change even with palette detail removed, on every build/costume.
const overlap=(a,b)=>{let both=0,union=0;for(let i=3;i<a.data.length;i+=4){both+=!!a.data[i]&&!!b.data[i];union+=!!a.data[i]||!!b.data[i];}return both/union;};
for(let ch=0;ch<15;ch++)for(const alt of [false,true])for(const seq of [
  ['domgather','domseal','domopen','domhold','domsettle'],['maxcoil','maxcharge','maxopen'],['ultleap','ultdive','ultimpact']]) {
  for(let n=1;n<seq.length;n++){assert(overlap(pxSprite(ch,seq[n-1],alt),pxSprite(ch,seq[n],alt))<.9,'indistinct '+ch+' '+seq[n]);silhouettes++;}
}
// Interruptions, other-owner clocks, clash, KO, active attacks, and rematch take precedence.
for(let owner=0;owner<2;owner++) {
  const S=newMatch(4,4,19);S.phase='fight';const f=S.f[owner],o=S.f[1-owner];f.gauge=o.gauge=100;
  startDomain(S,f,o);S.freeze=0;S.dom.t=30;
  for(const [st,pose]of [['hit','hit'],['guard','guard'],['down','down']]) {
    f.st=st;f.stT=20;assert.equal(pxPose(S,f),pose);
  }
  startMove(f,'p1');assert.equal(pxPose(S,f),'wind');
  f.st='cast';f.stT=20;assert(startDomain(S,o,f));assert.equal(S.dom,null);assert.equal(pxPose(S,f),'hit');
  f.st='cast';S.dom={o:1-owner,k:'nuclear',t:72};assert.equal(pxPose(S,f),'domsettle');
  S.dom=null;f.st='ko';assert.equal(pxPose(S,f),'down');newRound(S);assert.equal(pxPose(S,S.f[owner]),'idle');
}
globalThis.sheet=new PixelSurface(1440,1580);sheet.rect(0,0,1440,1580,'#171f30');
globalThis.flat=new PixelSurface(1440,1580);flat.rect(0,0,1440,1580,'#d1d5d1');
pxText(sheet,'V21 / DOMAIN AND MAXIMUM: EXISTING CLOCKS',18,16,PX_LIGHT,2);
pxText(flat,'V21 / ACTUAL CAST PHASES AS FLAT SILHOUETTES',18,16,PX_INK,2);
const rows=[[0,['f60','f40','f20','t8','t17']],[4,['f60','f40','f20','t72','t86']],
  [6,['f60','f40','f20','t24','t43']],[10,['f60','t8','t32','t46','t53']],
  [12,['f60','t12','t24','contact','t44']],[13,['f60','f40','f20','t8','t58']]];
rows.forEach(([ch,keys],row)=>keys.forEach((key,n)=>{
  const {S,owner}=samples.get(ch+':'+key),f=S.f[owner],pose=pxPose(S,f),alt=row%2===1,x=n*288,y=48+row*254;
  sheet.rect(x+4,y+3,280,247,'#28364a');sheet.rect(x+5,y+218,278,1,'#576075');
  for(const [s,color]of [[sheet,''],[flat,PX_INK]]) {
    const frame=pxFighterFrame(ch,pose,alt,color);s.blit(frame.sprite,x+144-frame.ox*2,y+218-frame.oy*2,2,alt);
    pxText(s,CH[ch].name+' / '+key,x+12,y+229,color||PX_LIGHT);pxText(s,pose,x+12,y+240,color||'#b4c2ce');
  }
}));
globalThis.scene=new PixelSurface(1280,720);
for(const [panel,key]of [[0,'0:f20'],[1,'4:t72'],[2,'10:t46'],[3,'12:contact']]) {
  const {S}=samples.get(key),view=pxWorldSurface(S,{});pxText(view,CH[S.f[S.dom.o].ch].name+' / '+key,12,16,PX_LIGHT);
  pxText(view,'ACTUAL INPUT-DRIVEN DOMAIN TIMELINE',12,30,'#b4c2ce');scene.blit(view,panel%2*640,Math.floor(panel/2)*360);
}
console.log('PASS',timelines,'input-driven Domain/Maximum timelines;',effects,'actual effects;',events,'release-frame samples;',silhouettes,'silhouette comparisons; cinematic countdown, held clocks, snapshots, interruptions, clash, expiry and unchanged outcomes');
`,ctx);
if(process.argv[2])for(const [name,key]of [['v21-domain-phases.png','sheet'],['v21-domain-silhouettes.png','flat'],['v21-domain-scene.png','scene']])writePNG(path.join(process.argv[2],name),ctx[key]);
