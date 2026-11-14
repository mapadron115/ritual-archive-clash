// Every original Domain space: raster materials, bounded cache, active clocks and stage floor.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs'),ctx=vm.createContext({console,assert});
vm.runInContext(['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
vm.runInContext(`
globalThis.sheet=new PixelSurface(1920,1800);sheet.rect(0,0,1920,1800,PX_INK);
globalThis.scene=new PixelSurface(1280,720);
globalThis.comparison=new PixelSurface(1280,720);
const distinct=new Set();let frames=0,floors=0,timelines=0;
for(let ch=0;ch<15;ch++) {
  const kind=CH[ch].dom.kind,palette=PX_DOMAIN_PALETTES[kind],bg=pxDomainBackdrop(kind);
  assert(palette,kind+' lacks scenery');assert.equal(bg.w,640);assert.equal(bg.h,283);
  assert.equal(pxDomainBackdrop(kind),bg,'static backdrop was rebuilt');
  const counts=new Map();
  for(let n=0;n<bg.data.length;n+=4) {
    assert.equal(bg.data[n+3],255,'soft/empty backdrop '+kind);
    const key=Array.from(bg.data.slice(n,n+3)).join(',');counts.set(key,(counts.get(key)||0)+1);
  }
  assert(counts.size<=6,'unbounded material palette '+kind);
  for(const col of palette)assert(counts.get(pxRGB(col).slice(0,3).join(','))>200,'missing broad tone '+kind+' '+col);
  distinct.add(bg.data.join(','));
  for(const stage of ['courtyard','gallery','observatory']) {
    const S=newMatch(ch,ch,1091);S.phase='fight';S.stage=stage;S.t=120;S.f[0].gauge=100;
    S.f[0].x=420;S.f[1].x=890;const control=JSON.parse(JSON.stringify(S));
    step(S,[BTN.DOM,0]);step(control,[BTN.DOM,0]);assert.equal(S.dom.k,kind);
    const start=JSON.stringify(S),direct=new PixelSurface(640,360);direct.data.set(pxBackdrop(0,stage).data);const floor=direct.data.slice(283*640*4);
    pxDomain(direct,S);assert.deepEqual(direct.data.slice(283*640*4),floor,'Domain paints fighting floor');floors++;
    const hold=direct.data.slice();
    for(let n=0;n<4;n++){step(S,[0,0]);step(control,[0,0]);const s=new PixelSurface(640,360);s.data.set(pxBackdrop(0,stage).data);pxDomain(s,S);assert.deepEqual(s.data,hold,'cinematic Domain scenery advances during freeze');}
    assert.equal(JSON.stringify(S),JSON.stringify(control));
    const probe=JSON.parse(start);probe.freeze=probe.hitstop=0;
    const hashes=new Set();
    for(let phase=0;phase<8;phase++) {
      probe.dom.t=phase*8+1;const before=JSON.stringify(probe),s=new PixelSurface(640,283);pxDomain(s,probe);
      assert.equal(JSON.stringify(probe),before,'scenery mutates state');
      for(let i=3;i<s.data.length;i+=4)assert.equal(s.data[i],255);hashes.add(s.data.join(','));frames++;
      const clone=JSON.parse(before),repeat=new PixelSurface(640,283);clone.dom.t+=64;clone.t+=99;pxDomain(repeat,clone);assert.deepEqual(s.data,repeat.data,'phase depends on wall/global clock');
    }
    assert.equal(hashes.size,8,'missing discrete mote phases');
    // Draw actual active timelines without imposing a new cast duration/effect clock.
    let ticks=0;while(S.dom&&ticks<800) {
      if(ticks%37===0) {const before=JSON.stringify(S);pxWorldSurface(S,{});assert.equal(JSON.stringify(S),before);}
      step(S,[0,0]);step(control,[0,0]);assert.equal(JSON.stringify(S),JSON.stringify(control));ticks++;
    }
    assert(ticks<800,'Domain fails to finish');timelines++;
  }
  // Native-resolution all-fifteen review, with the real fighter/Domain state after input.
  const D=newMatch(ch,ch,1091);D.phase='fight';D.stage=['courtyard','gallery','observatory'][ch%3];D.t=120;
  D.f[0].x=420;D.f[1].x=890;D.f[0].gauge=100;step(D,[BTN.DOM,0]);
  for(let n=0;n<40;n++)step(D,[0,0]);
  const frame=pxWorldSurface(D,{});pxOutlinedText(frame,CH[ch].name+' / '+CH[ch].dom.name,12,16,PX_LIGHT);
  pxOutlinedText(frame,'ORIGINAL PIXEL DOMAIN SCENERY',12,30,'#b4c2ce');
  sheet.blit(frame,ch%3*640,Math.floor(ch/3)*360);
  const panel=[0,1,3,8].indexOf(ch);if(panel>=0)scene.blit(frame,panel%2*640,Math.floor(panel/2)*360);
  if(kind==='absolute'||kind==='allout') {
    const x=kind==='absolute'?0:640;
    comparison.blit(bg,x,0);pxOutlinedText(comparison,CH[ch].dom.name,x+12,16,PX_LIGHT);
    comparison.blit(frame,x,360);
  }
}
assert.equal(distinct.size,15,'duplicate backdrop');assert.equal(PX_DOMAIN_BACKDROPS.size,15);
assert.equal(pxDomainBackdrop('unknown'),pxDomainBackdrop('void'));assert.equal(pxDomainBackdrop('__proto__'),pxDomainBackdrop('void'));assert.equal(PX_DOMAIN_BACKDROPS.size,15,'unbounded cache key');
const empty=new PixelSurface(640,360);pxDomain(empty,{dom:null});assert(!empty.data.some(Boolean));
console.log('PASS',frames,'hard-alpha animated Domain frames;',floors,'unchanged stage floors;',timelines,'actual Domain timelines; fifteen distinct three-tone spaces, bounded cache, freeze/snapshot stability and unchanged outcomes');
`,ctx);
if(process.argv[2]) {
  const version=process.argv[3]||'v23';
  for(const [name,key]of [['domain-backdrops','sheet'],['domain-scene','scene'],['domain-comparison','comparison']])writePNG(path.join(process.argv[2],version+'-'+name+'.png'),ctx[key]);
}
