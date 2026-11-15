// Exact landing-warning rasters and real Maximum inputs, never human play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>baseline&&n==='pixel-world'?require('node:child_process').execFileSync('git',['show','HEAD:src/pixel-world.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
Function('assert','writePNG','output','prefix','previewOnly','rulesOnly','timing','performance',source+'\n'+`
const ch=CH.findIndex(c=>c.dom.kind==='howitzer'),warningTicks=HOWITZER_IMPACT-HOWITZER_LOCK;
const ages=Array.from({length:6},(_,i)=>Math.floor((warningTicks-1)*i/5));
function begin(owner=0) {
  const S=newMatch(owner?2:ch,owner?ch:2,193);S.phase='fight';
  const f=S.f[owner],o=S.f[1-owner];f.x=owner?980:300;o.x=owner?480:800;f.face=owner?-1:1;f.gauge=100;
  const input=[0,0];input[owner]=BTN.DOM;step(S,input);return S;
}
function active(owner=0) {const S=begin(owner);for(let n=0;n<160&&!S.zones.length;n++)step(S,[0,0]);assert(S.zones[0]?.k==='target');return S;}
function layer(S) {const s=new PixelSurface(640,360);for(const z of S.zones)pxZone(s,S,z);return s;}
if(!previewOnly) {
  let frames=0,crops=0,timelines=0,holds=0;const S=active(),z=S.zones[0],phases=new Set(),brightAreas=[],nativeAreas=[];
  if(!rulesOnly) {
  for(let t=0;t<z.dur;t++) {
    const A=JSON.parse(JSON.stringify(S));A.zones[0]={...z,x:640,t};const before=JSON.stringify(A),s=layer(A);
    assert.equal(JSON.stringify(A),before,'warning mutates state');
    assert.deepEqual(layer({...A,t:A.t+991}).data,s.data,'warning uses global clock');
    assert.deepEqual(layer(JSON.parse(before)).data,s.data,'snapshot changes warning');
    const colors=new Set();let area=0,bright=0;
    for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++) {
      const p=(y*s.w+x)*4,a=s.data[p+3];assert(a===0||a===255,'soft alpha');
      if(a){area++;colors.add(s.data.slice(p,p+3).join(','));assert(x>=320-Math.round(z.r/2)-3&&x<=320+Math.round(z.r/2)+3&&y>=270&&y<=316,'warning outside floor lane');if(s.data[p]===240&&s.data[p+1]===209&&s.data[p+2]===155)bright++;}
      if(x>0)assert.deepEqual(s.data.subarray(p,p+4),s.data.subarray((y*s.w+640-x)*4,(y*s.w+640-x)*4+4),'asymmetric warning');
    }
    assert(area>200&&area<2600,'missing or excessive warning: '+area);assert(colors.size>=3&&colors.size<=6,'flat/noisy warning');
    assert(bright>=450,'warning lacks a substantial bright area at native size: '+bright);brightAreas.push(bright);
    // Fixed outer posts show the locked landing width throughout the countdown.
    for(const x of [320-Math.round(z.r/2),320+Math.round(z.r/2)])assert.equal(s.data[(306*s.w+x)*4+3],255,'landing boundary drifts');
    for(let y=180;y<270;y++)for(let x=295;x<=345;x++)assert.equal(s.data[(y*s.w+x)*4+3],0,'warning obscures upper body');
    if(ages.includes(t))phases.add(Buffer.from(s.data).toString('base64'));frames++;
  }
  // Judge visible area after the actual world/fighter/HUD composition, too.
  // These are native scenes from real inputs, across all stages and both slots.
  for(const owner of [0,1])for(const stage of PX_STAGES)for(const age of [1,Math.floor(warningTicks/2),warningTicks-1]) {
    const A=active(owner);while(A.zones[0].t<age)step(A,[0,0]);A.stage=stage.id;
    const mark=A.zones[0],raster=layer(A),frame=pxWorldSurface(A,{});frame.blit(pxHUDSurface(A,[null,null]),0,0);let bright=0;
    for(let y=270;y<=316;y++)for(let x=Math.round(mark.x/2)-Math.round(mark.r/2)-3;x<=Math.round(mark.x/2)+Math.round(mark.r/2)+3;x++) {
      const p=(y*640+x)*4;
      if(raster.data[p]===240&&raster.data[p+1]===209&&raster.data[p+2]===155&&frame.data[p]===240&&frame.data[p+1]===209&&frame.data[p+2]===155)bright++;
    }
    assert(bright>=350,'fighters/HUD hide the native warning: '+bright);nativeAreas.push(bright);
  }
  assert.equal(phases.size,ages.length,'missing countdown stages');
  const expired=new PixelSurface(640,360);pxZone(expired,S,{...z,t:z.dur});assert(expired.data.every(v=>v===0),'expired zone still painted');
  for(const x of [-90,0,61,1219,1280,1370])for(const y of [-40,0,612,720,770])for(const t of ages) {
    const a=new PixelSurface(640,360),b=new PixelSurface(840,560),q={...z,x:x+.5,y:y+.5,t};
    pxZone(a,S,q);pxZone(b,S,{...q,x:q.x+200,y:q.y+200});
    for(let row=0;row<a.h;row++)assert.deepEqual(a.data.subarray(row*640*4,(row+1)*640*4),b.data.subarray(((row+100)*840+100)*4,((row+100)*840+740)*4),'fractional/edge crop');crops++;
  }
  }
  for(const owner of [0,1])for(const mode of ['stand','escape','guard','jump','swap']) {
    const A=begin(owner),B=JSON.parse(JSON.stringify(A));let locked=null,saw=false,contact=false,expired=false,probed=false;
    const hp=A.f[1-owner].hp;
    for(let n=0;n<250;n++) {
      const z=A.zones.find(z=>z.k==='target'),before=JSON.stringify(A),f=A.f[1-owner];
      if(z) {
        if(!saw)locked=z.x;saw=true;assert.equal(z.x,locked,'target follows moving foe');
        const raster=layer(A);assert(raster.data.some(v=>v),'blank freeze probe');
        if(!probed) {
          for(const field of ['hitstop','freeze']) {
            const F=JSON.parse(before);F.freeze=F.hitstop=0;F[field]=3;
            for(let k=0;k<3;k++){step(F,[0,0]);assert.deepEqual(F.zones,A.zones);assert.equal(F.dom.t,A.dom.t);assert.deepEqual(layer(F).data,raster.data);holds++;}
          }
          const F=JSON.parse(before);F.freeze=F.hitstop=0;F.stop={o:1-owner,t:3};step(F,[0,0]);
          assert.equal(F.zones[0].t,z.t+1,'existing time-stop zone advance changed');probed=true;
        }
      } else if(saw){expired=true;assert(layer(A).data.every(v=>v===0),'stale landing cue');}
      if(A.dom?.t===46) {contact=true;assert(!z,'target remains on impact');assert(A.ev.some(e=>e.k==='nuke'),'missing real impact event');}
      if(n%7===0)pxWorldSurface(A,{});assert.equal(JSON.stringify(A),before,'drawing writes simulation');
      const input=[0,0];
      if(saw&&mode==='escape')input[1-owner]=owner?BTN.L:BTN.R;
      if(saw&&mode==='guard')input[1-owner]=BTN.G;
      if(z&&z.t===1&&mode==='jump')input[1-owner]=BTN.U;
      if(z&&z.t===1&&mode==='swap')input[1-owner]=BTN.A1;
      step(A,input);step(B,input);assert.equal(JSON.stringify(A),JSON.stringify(B),'painting changes outcome');
    }
    assert(saw&&expired&&contact,'missing warning/expiry/impact');
    const damage=hp-A.f[1-owner].hp;
    if(mode==='stand')assert.equal(damage,250,'standing blast damage changed');
    // The earlier lock now lets immediate retreat clear the unchanged blast.
    // Exact adjacent-tick reaction cutoffs live in dive-gap.cjs.
    if(mode==='escape')assert.equal(damage,0,'cue-time retreat no longer escapes');
    if(mode==='jump')assert.equal(damage,250,'existing vertical jump behavior changed');
    if(mode==='swap')assert.equal(damage,0,'real swap no longer escapes blast');
    if(mode==='guard')assert(damage>0&&damage<250,'guard behavior changed');
    timelines++;
  }
  console.log('PASS',frames,'hard-alpha landing ages / fixed boundaries, six countdown stages, symmetry, clear body lane, snapshots;',crops,'fractional/edge crops;',timelines,'real Maximum stand/run/guard/jump/swap timelines / locked target, exact impact, specified outcomes;',holds,'freeze holds; existing time-stop advance retained');
  if(nativeAreas.length)console.log('Bright pixel minima layer/native:',Math.min(...brightAreas),Math.min(...nativeAreas),'across',nativeAreas.length,'native composites');
}
if(timing) {
  const S=active(),z=S.zones[0];for(let n=0;n<40;n++){z.t=n%warningTicks;pxWorldSurface(S,{});}
  const times=[];for(let n=0;n<240;n++){z.t=n%warningTicks;const start=performance.now();pxWorldSurface(S,{});times.push(performance.now()-start);}
  times.sort((a,b)=>a-b);console.log(JSON.stringify({frames:240,medianMs:+times[120].toFixed(3),p95Ms:+times[228].toFixed(3)}));
}
if(output) {
  const sheet=new PixelSurface(1200,208);sheet.rect(0,0,sheet.w,sheet.h,PX_INK);pxText(sheet,'DIVING MAXIMUM / LOCKED LANDING WARNING / ACTIVE AGES',12,12,PX_LIGHT,2);
  const S=active(),z=S.zones[0];ages.forEach((t,col)=>{
    const cell=new PixelSurface(196,112),full=new PixelSurface(640,360);cell.rect(0,0,196,112,'#334053');pxZone(full,S,{...z,x:640,t});cell.blit(full,-222,-230);sheet.blit(cell,col*200,48);
    pxText(sheet,'T'+t+' / '+(warningTicks-t)+' TO IMPACT',col*200+6,178,PX_LIGHT);
  });writePNG(output+'/'+prefix+'-landing-phases.png',sheet);
  const scenes=new PixelSurface(1280,1080);scenes.rect(0,0,1280,1080,PX_INK);
  for(let i=0;i<6;i++) {
    const owner=i%2,S=active(owner),age=[1,Math.floor(warningTicks/2),warningTicks-1][Math.floor(i/2)];
    for(let n=0;n<100&&S.zones[0]?.t<age;n++) {const input=[0,0];if(i===3)input[1-owner]=owner?BTN.L:BTN.R;step(S,input);}
    S.stage=PX_STAGES[Math.floor(i/2)].id;const frame=pxWorldSurface(S,{});frame.blit(pxHUDSurface(S,[null,null]),0,0);
    pxOutlinedText(frame,'FACING '+(owner?'LEFT':'RIGHT')+' / T'+S.zones[0]?.t+(i===3?' / MOVING FOE':''),12,88,PX_LIGHT);
    scenes.blit(frame,i%2*640,Math.floor(i/2)*360);
  }writePNG(output+'/'+prefix+'-landing-scenes.png',scenes);
  for(const stage of PX_STAGES)for(const owner of [0,1]) {
    const strip=new PixelSurface(640,1080);
    [1,Math.floor(warningTicks/2),warningTicks-1].forEach((age,row)=>{
      const A=active(owner);while(A.zones[0].t<age)step(A,[0,0]);A.stage=stage.id;
      const frame=pxWorldSurface(A,{});frame.blit(pxHUDSurface(A,[null,null]),0,0);
      pxOutlinedText(frame,stage.id.toUpperCase()+' / FACING '+(owner?'LEFT':'RIGHT')+' / T'+age,12,88,PX_LIGHT);
      const name=prefix+'-'+stage.id+'-'+(owner?'left':'right');
      writePNG(output+'/'+name+'-t'+age+'.png',frame);strip.blit(frame,0,row*360);
    });writePNG(output+'/'+prefix+'-'+stage.id+'-'+(owner?'left':'right')+'-countdown.png',strip);
  }
}
`)(assert,writePNG,process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,process.argv[3]||'v47',previewOnly,process.argv.includes('--rules-only'),process.argv.includes('--timing'),require('node:perf_hooks').performance);
