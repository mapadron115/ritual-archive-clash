// Actual mobile HTML/script order in the ordinary V8 realm. Timings are CPU
// work only: canvas uploads and DOM writes are counted, not browser/GPU costs.
// --blit-cost retains fast rectangles in both variants, comparing only blit.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {performance}=require('node:perf_hooks'),os=require('node:os');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'mobile/index.html'),'utf8');
const baseline=process.argv.includes('--baseline'),out=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
const animationCost=process.argv.includes('--animation-cost');
const quakeCost=process.argv.includes('--quake-cost');
const convergenceCost=process.argv.includes('--convergence-cost');
const maximumCost=process.argv.includes('--maximum-cost');
const blitCost=process.argv.includes('--blit-cost');
if(out)fs.mkdirSync(out,{recursive:true});
function node(id){return {id,style:{setProperty(k,v){this[k]=v;}},dataset:{},children:[],attributes:{},textContent:'',classList:{add(){},remove(){}},set innerHTML(v){this._html=v;this.children=[];},get innerHTML(){return this._html||'';},setAttribute(k,v){this.attributes[k]=v;},appendChild(n){this.children.push(n);},addEventListener(){},focus(){},setPointerCapture(){},hasPointerCapture(){return false;}};}
let uploads=0,draws=0;
function canvas(){const c=node('canvas');c.width=1280;c.height=720;c.getContext=()=>ctx;const ctx={canvas:c,save(){},restore(){},fillRect(){},createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(){uploads++;},drawImage(){draws++;}};return c;}
const nodes=new Map(),buttons=[...html.matchAll(/<button data-input="(\w+)"[^>]*>/g)].map(m=>Object.assign(node(m[1]),{dataset:{input:m[1]}}));
nodes.set('domainButton',buttons.find(b=>b.dataset.input==='DOM'));nodes.set('cv',canvas());
const document=Object.assign(node('document'),{visibilityState:'visible',getElementById(id){if(!nodes.has(id))nodes.set(id,node(id));return nodes.get(id);},querySelectorAll(s){return s==='[data-input]'?buttons:['title','select','online','pause','over'].map(id=>this.getElementById(id));},createElement(tag){return tag==='canvas'?canvas():node(tag);},head:node('head')});
const scripts=[...html.matchAll(/<script src="([^?]+)\?v=(\d+)"><\/script>/g)];
let source='';
for(const m of scripts){if(baseline&&m[1]==='raster.js')continue;if(m[1]==='../src/desktop-quake.js')source+='const preQuakePose=pxPose;\n';if(m[1]==='../src/desktop-convergence.js')source+='const preConvergenceDomainPose=pxDomainPose;\n';if(m[1]==='../src/desktop-maximum.js')source+='const unadaptedDomainPose=pxDomainPose;\n';source+=fs.readFileSync(path.resolve(root,'mobile',m[1]),'utf8')+'\n';if(m[1]==='../src/pixel.js')source+='const originalRect=PixelSurface.prototype.rect,originalBlit=PixelSurface.prototype.blit,unadaptedPose=pxPose;\n';}
const run=Function('document','performance','assert','writePNG','out','report',`
const window={},innerWidth=844,innerHeight=390,getComputedStyle=()=>({}),requestAnimationFrame=()=>{},addEventListener=()=>{},setTimeout=()=>{};
${source}
const candidateRect=PixelSurface.prototype.rect,adaptedPose=pxPose;
const candidateBlit=PixelSurface.prototype.blit;
const adaptedDomainPose=pxDomainPose;
const quakeCost=${quakeCost},animationCost=${animationCost},blitCost=${blitCost},maximumCost=${maximumCost},convergenceCost=${convergenceCost};let reaction=null,maximum=null,quake=null;
const artifactPrefix=quakeCost?'v132':convergenceCost?'v130':maximumCost?'v128':blitCost?'v124':animationCost?'v120':'v118';
G.mode='host';G.running=true;FX.silent=true;
let randomSeed=118;Math.random=()=>{randomSeed=(Math.imul(randomSeed,1664525)+1013904223)>>>0;return randomSeed/4294967296;};
function setup(ch=0,owner=0,clash=false,busy=true,domain=true,mirror=false){
  const S=newMatch(ch,mirror?ch:(ch+1)%15,118);S.phase='fight';S.intro=0;S.stage='gallery';S.t=136;
  S.f[0].x=510;S.f[1].x=720;S.f[owner].gauge=GAUGE_MAX;
  for(const k of ['parts','rings','lines','contacts','dust','stars','puffs','nums','words'])FX[k]=[];
  FX.banner=FX.bf=FX.impact=null;FX.flash=0;FX.shake=0;FX.nope=[0,0];
  if(domain)startDomain(S,S.f[owner],S.f[1-owner]);
  if(clash){S.f[1-owner].gauge=GAUGE_MAX;startDomain(S,S.f[1-owner],S.f[owner]);}
  for(const e of S.ev)fxEvent(S,e);S.ev=[];
  // Retain real Domain/clash state. Add a bounded presentation stress load via
  // actual event handlers; this is not claimed as one naturally played match.
  if(busy)for(const e of [
    {k:'hit',x:720,y:570,a:32,b:1},{k:'block',x:510,y:570,b:-1},
    {k:'jump',x:510},{k:'land',x:720},{k:'thud',x:850},
    {k:'dash',x:200,y:570,a:530,b:570},{k:'slash',x:720,y:570,a:1,b:-1},
    {k:'swap',x:400,y:530,a:850,b:530},{k:'boom',x:650,y:500,a:48}
  ])fxEvent(S,e);
  if(!clash){S.freeze=0;if(S.dom)S.dom.t=48;}
  G.S=S;return S;
}
function percent(times){times.sort((a,b)=>a-b);return {medianMs:+times[Math.floor(times.length*.5)].toFixed(3),p95Ms:+times[Math.floor(times.length*.95)].toFixed(3)};}
function render(){drawWorld(ctx,G.S);drawHUD(ctx,G.S,labels());}
function age(n){FX.clock=n;G.S.t=136+n;if(G.S.dom)G.S.dom.t=48+n;for(const key of ['parts','rings','lines','contacts','dust','stars','puffs','nums','words'])for(const e of FX[key])e.t=n%6;
  if(maximum){G.S.dom.t=maximum[n%maximum.length];G.S.f[G.S.dom.o].st='cast';}
  if(quake){const f=G.S.f[quake.owner||0];startMove(f,'a'+CH[f.ch].arts.findIndex(a=>a.id==='quake'));f.mt=quake.ages[n%quake.ages.length];assert.equal(moveDef(f).id,'quake');assert(CH[f.ch].arts.some(a=>a.id==='quake'));}
  if(reaction==='hit'){G.S.f[0].st='hit';G.S.f[0].stT=15-n%15;}
  if(reaction==='summon'){G.S.f[0].ch=3;startMove(G.S.f[0],'a0');G.S.f[0].mt=[1,6,11,12,14,15,20][n%7];}
}
// Measure the complete mobile renderer CPU path, with both presentations per
// frame. Interleave baseline/candidate blocks to reduce ordering bias.
const scenarios=[{name:'quiet-fight',ch:0,busy:false,domain:false},{name:'p1-domain-busy',ch:0,owner:0},{name:'p2-domain-busy',ch:1,owner:1},{name:'both-domain-clash-busy',ch:0,clash:true}];
if(blitCost)scenarios.push({name:'busy-domain-shake',ch:0,shake:9});
if(animationCost)scenarios.push({name:'busy-ground-hit',ch:0,reaction:'hit'},{name:'busy-summon',ch:3,reaction:'summon'});
if(quakeCost)for(const owner of [0,1])scenarios.push({name:'busy-quake-p'+(owner+1),ch:CH.findIndex(c=>c.arts.some(a=>a.id==='quake')),owner,mirror:true,domain:false,quake:{owner,ages:[10,19,20,23,35,41]}});
if(convergenceCost)scenarios.push({name:'busy-convergence-body',ch:CH.findIndex(c=>c.dom.kind==='bloodsweep'),maximum:[20,25,31,32,35,39]},{name:'busy-convergence-mirror',ch:CH.findIndex(c=>c.dom.kind==='bloodsweep'),owner:1,mirror:true,maximum:[20,25,31,32,35,39]});
if(maximumCost)scenarios.push({name:'busy-nuclear-body',ch:4,maximum:[36,48,59,60,65,71]},{name:'busy-allout-body',ch:12,maximum:[12,18,23,24,30,34]},{name:'busy-voice-body',ch:6,maximum:[12,16,19,20,22,23]});
for(const scenario of scenarios){
  reaction=scenario.reaction;maximum=scenario.maximum;quake=scenario.quake;
  setup(scenario.ch,scenario.owner||0,scenario.clash,scenario.busy!==false,scenario.domain!==false,scenario.mirror);
  if(convergenceCost&&scenario.maximum)assert.equal(G.S.dom.k,'bloodsweep','timed caster must be Convergence');
  FX.shake=scenario.shake||0;
  const times={before:[],after:[]};
  for(let block=0;block<6;block++)for(const kind of block%2?['after','before']:['before','after']){
    PixelSurface.prototype.rect=animationCost||blitCost||maximumCost||convergenceCost||quakeCost?candidateRect:kind==='before'?originalRect:candidateRect;
    PixelSurface.prototype.blit=blitCost&&kind==='before'?originalBlit:candidateBlit;
    pxPose=quakeCost&&kind==='before'?preQuakePose:animationCost&&kind==='before'?unadaptedPose:adaptedPose;
    pxDomainPose=convergenceCost&&kind==='before'?preConvergenceDomainPose:maximumCost&&kind==='before'?unadaptedDomainPose:adaptedDomainPose;
    for(let n=0;n<24;n++){age(n);render();}
    for(let n=0;n<20;n++){age(n);const t=performance.now();render();times[kind].push(performance.now()-t);}
  }
  report({scenario:scenario.name,framesPerVariant:120,before:percent(times.before),after:percent(times.after)});
}
pxPose=adaptedPose;pxDomainPose=adaptedDomainPose;reaction=null;maximum=null;quake=null;
// Instrument only the profiling pass; nested dot work is included in rect.
PixelSurface.prototype.rect=blitCost?candidateRect:originalRect;
PixelSurface.prototype.blit=blitCost?originalBlit:candidateBlit;
setup(0);const profile={};
const primitives={};
for(const key of ['rect','blit','ellipse']){
  const base=primitives[key]=PixelSurface.prototype[key];PixelSurface.prototype[key]=function(...args){const t=performance.now();try{return base.apply(this,args);}finally{const p=profile[key]??={calls:0,ms:0};p.calls++;p.ms+=performance.now()-t;}};
}
for(let n=0;n<20;n++)render();report({profileBaseline20Frames:profile,note:'inclusive primitive CPU times; profiling overhead excluded from frame samples; blit-cost baseline retains fast rectangle fills'});
Object.assign(PixelSurface.prototype,primitives);
PixelSurface.prototype.rect=candidateRect;
PixelSurface.prototype.blit=candidateBlit;
let checks=0;
function same(paint){
  PixelSurface.prototype.rect=originalRect;const a=paint();
  PixelSurface.prototype.rect=candidateRect;const b=paint();
  assert.deepEqual(b.data,a.data,'row fill changed raster '+checks);checks++;return b;
}
function sameAsset(paint){
  if(!blitCost)return same(paint);
  PixelSurface.prototype.blit=originalBlit;const a=paint();
  PixelSurface.prototype.blit=candidateBlit;const b=paint();
  assert.deepEqual(b.data,a.data,'blit changed asset or complete scene');return b;
}
// Clip/round at half pixels, reversed and empty dimensions, off-screen bounds,
// colour syntaxes, existing pixels, replacement data and unaligned origins.
const coords=[-70,-1.5,-.5,0,.49,.5,1.5,17.5,70];
for(const x of coords)for(const y of coords)for(const w of [-2,0,.49,.5,1,2.5,80])for(const h of [-1,0,.5,3,80]){
  same(()=>{const s=new PixelSurface(19,13);s.data.fill(73);s.rect(x,y,w,h,['#abc','#112233','rgba(255,60,60,.5)'][checks%3]);return s;});
}
for(let n=0;n<3000;n++)same(()=>{const s=new PixelSurface(31,17);s.data.fill(n%256);s.rect((n*7%90-20)/2,(n*11%50-10)/2,(n*13%100-5)/2,(n*17%60-4)/2,'#ed7480');return s;});
console.log('PASS mobile raster: '+checks+' rectangle boundaries/colours/overwrites');
let sprites=0;
for(let ch=0;ch<15;ch++)for(const pose of Object.keys(PX_POSES))for(const alt of [false,true]){sameAsset(()=>pixelSprite(ch,pose,alt));sprites++;}
console.log('PASS mobile raster: '+sprites+' uncached build/pose/costume sprites byte-identical');
for(const stage of PX_STAGES)for(let t=0;t<PX_STAGE_FRAMES;t++)sameAsset(()=>{PX_BACKDROPS.clear();return pxBackdrop(t,stage.id);});
for(const ch of CH)sameAsset(()=>{PX_DOMAIN_BACKDROPS.clear();return pxDomainBackdrop(ch.dom.kind);});
console.log('PASS mobile raster: all stage motion cells and fifteen uncached Domain backdrops byte-identical');
let scenes=0;
for(let ch=0;ch<15;ch++)for(const owner of [0,1])for(const clash of [false,true]){
  setup(ch,owner,clash);const before=JSON.stringify(G.S);
  for(const t of [0,2,5,8,16,32]){
    age(t);
    const world=sameAsset(()=>pxWorldSurface(G.S)),hud=sameAsset(()=>mobileHUDSurface(G.S,labels()));
    if(out&&ch<2&&owner===0&&t===2){world.blit(hud,0,0);writePNG(out+'/'+artifactPrefix+'-'+(clash?'clash':'domain')+'-ch'+ch+'.png',world);}
    scenes++;
  }
  // Rendering is read-only; only the explicit snapshot-age sweep changes ticks.
  G.S.t=136;if(G.S.dom)G.S.dom.t=48;assert.equal(JSON.stringify(G.S),before);
}
console.log('PASS mobile raster: '+scenes+' busy Domain/clash scenes and HUDs, both owners, read-only simulation');
let dotCalls=0;const baseDot=PixelSurface.prototype.dot;
PixelSurface.prototype.dot=function(...args){dotCalls++;return baseDot.apply(this,args);};
new PixelSurface(640,360).rect(0,0,640,360,'#111623');
PixelSurface.prototype.dot=baseDot;
assert.equal(dotCalls,0,'wide mobile rectangle still dispatches one dot per pixel');
console.log('PASS mobile cost regression: full-screen rectangle eliminates 230400 dot dispatches');
return {originalRect,originalBlit};
`);
const reports=[],savedRandom=Math.random;let methods;
try{methods=run(document,performance,assert,require('./png.cjs'),out,r=>{reports.push(r);console.log(JSON.stringify(r));});}finally{Math.random=savedRandom;}
const environment={environment:{node:process.version,platform:process.platform,arch:process.arch,cpu:os.cpus()[0].model},uploads,draws,note:'Node CPU raster/control work; no browser layout, canvas upload, GPU, phone FPS or input latency measured'};
console.log(JSON.stringify(environment));reports.push(environment);
if(out){
  fs.writeFileSync(path.join(out,(quakeCost?'v132-quake':convergenceCost?'v130-convergence':maximumCost?'v128-maximum':blitCost?'v124-blit':animationCost?'v120-animation':'v118-'+(baseline?'baseline':'candidate'))+'-timings.json'),JSON.stringify(reports,null,2)+'\n');
  if(animationCost||maximumCost||convergenceCost||quakeCost){console.log('Animation cost: both variants keep the fast raster; only fighter pose selection differs.');process.exit(0);}
  // Existing real-pointer harness supplies its phone layout model. Compare
  // complete models, including touch labels, using each selected primitive.
  const vm=require('node:vm'),{context}=require('./mobile.cjs'),png=require('./png.cjs');
  context.oldRectSource=methods.originalRect.toString();
  context.oldBlitSource=methods.originalBlit.toString();
  vm.runInContext('const fastRect=PixelSurface.prototype.rect,slowRect=({'+context.oldRectSource+'}).rect,fastBlit=PixelSurface.prototype.blit,slowBlit=({'+context.oldBlitSource+'}).blit;',context);
  for(const [w,h] of [[667,375],[844,390],[390,844]]){
    context.pw=w;context.ph=h;
    const images=[];
    for(const kind of ['before','after']){
      context.kind=kind;
      const s=vm.runInContext(`
        PixelSurface.prototype.rect=${blitCost} ? fastRect : kind==='before'?slowRect:fastRect;
        PixelSurface.prototype.blit=${blitCost}&&kind==='before'?slowBlit:fastBlit;
        makePreview(pw,ph,undefined,0,100,{key:'G',held:true,prepare(S){
          G.mode='host';FX.clock=0;S.stage='gallery';S.f[0].gauge=GAUGE_MAX;
          startDomain(S,S.f[0],S.f[1]);S.freeze=0;S.dom.t=48;
          for(const e of [{k:'hit',x:780,y:570,a:32,b:1},{k:'land',x:780},{k:'jump',x:400},{k:'dash',x:200,y:570,a:530,b:570}])fxEvent(S,e);
        },run(){}})
      `,context);
      images.push(s);png(path.join(out,(blitCost?'v124':'v118')+'-'+kind+'-'+w+'x'+h+'.png'),s);
    }
    assert.deepEqual(images[0].data,images[1].data,'phone layout model changed');
  }
  console.log('PASS byte-identical before/after phone-size layout models at 667x375, 844x390 and portrait 390x844');
}
