// Exact stage-loop rasters and simulation integration; not browser motion or play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
Function('assert','writePNG','output','prefix','previewOnly',source+'\n'+`
const count=typeof PX_STAGE_FRAMES==='undefined'?8:PX_STAGE_FRAMES;
const centroid=(s,col,box)=>{
  const rgb=pxRGB(col);let x=0,y=0,n=0;
  for(let j=box[1];j<box[3];j++)for(let i=box[0];i<box[2];i++) {
    const p=(j*s.w+i)*4;
    if(s.data[p]===rgb[0]&&s.data[p+1]===rgb[1]&&s.data[p+2]===rgb[2]){x+=i;y+=j;n++;}
  }
  assert(n,'missing motion sample '+col);return [x/n,y/n];
};
if(!previewOnly) {
  let frames=0,timelines=0;const diagnostics=[];
  for(const stage of PX_STAGES) {
    const rasters=Array.from({length:count},(_,n)=>pxBackdrop(n,stage.id)),floor=rasters[0].data.slice(282*640*4);
    const colors=new Set();
    for(let n=0;n<count;n++) {
      const s=rasters[n];assert.strictEqual(pxBackdrop(n+count*91,stage.id),s,'loop rebuild');
      assert.deepEqual(s.data.slice(282*640*4),floor,'moving fighting floor '+stage.id);
      for(let p=3;p<s.data.length;p+=4)assert.equal(s.data[p],255,'stage soft/empty alpha');
      let hash=2166136261;for(const byte of s.data)hash=Math.imul(hash^byte,16777619);
      colors.add(hash);frames++;
    }
    assert.equal(colors.size,count,'missing stage phases');
    if(stage.id!=='gallery') {
      const cloud=stage.id==='courtyard',centers=rasters.map(s=>centroid(s,cloud?'#d4a098':'#aa8c99',cloud?[0,70,300,125]:[100,95,250,110]));
      const jumps=centers.map((p,n)=>Math.abs(p[0]-centers[(n+1)%count][0]));
      assert(Math.max(...jumps)<=(cloud?3:5),'cloud jumps at a phase/loop boundary '+stage.id+' '+jumps);
      diagnostics.push({stage:stage.id,maxCloudStep:Math.max(...jumps)});
    }
    if(stage.id==='observatory') {
      const centers=rasters.map(s=>centroid(s,'#e4cda2',[330,150,455,205]));
      const jumps=centers.map((p,n)=>Math.hypot(p[0]-centers[(n+1)%count][0],p[1]-centers[(n+1)%count][1]));
      assert(Math.max(...jumps)<12,'brass pointer leaps');
      diagnostics.push({stage:'pointer',maxCentroidStep:+Math.max(...jumps).toFixed(2)});
    }
    for(const owner of [0,1]) {
      const A=newMatch(owner?14:0,owner?0:14,193),B=JSON.parse(JSON.stringify(A));A.stage=B.stage=stage.id;A.phase=B.phase='fight';
      for(let tick=0;tick<count*8*2+3;tick++) {
        const before=JSON.stringify(A);
        if(tick%8===0||tick%128>125) {
          const raster=pxWorldSurface(A,{});assert.equal(JSON.stringify(A),before,'render mutates simulation');
          assert.deepEqual(pxWorldSurface(JSON.parse(before),{}).data,raster.data,'snapshot changes scenery');
          // World painting must select the current backdrop at the actual clock boundary.
          assert.deepEqual(raster.data.slice(110*640*4,111*640*4),pxBackdrop(Math.floor(A.t/8),stage.id).data.slice(110*640*4,111*640*4));
        }
        const inputs=[tick%47===0?BTN.P:BTN.R,tick%61===0?BTN.K:BTN.G];
        step(A,inputs);step(B,inputs);assert.equal(JSON.stringify(A),JSON.stringify(B),'scenery changes outcomes');
        A.ev.length=B.ev.length=0;
      }
      // Preserve the existing global-clock behavior during impact and cinematic pauses.
      for(const kind of ['hitstop','freeze']) {
        const F=JSON.parse(JSON.stringify(A));F[kind]=18;F.t=126;
        for(let n=0;n<18;n++){const t=F.t;step(F,[0,0]);assert.equal(F.t,t+1);const before=JSON.stringify(F);pxWorldSurface(F,{});assert.equal(JSON.stringify(F),before);}
      }
      timelines++;
    }
  }
  // Clip rain to its aperture at BOTH ends, and retain the stonework in front.
  const base=pxStageVariant('gallery'),allowed=new Set(['23,43,65','38,61,80','48,73,89','62,88,99','36,55,71','68,97,108']);
  let rain=0;
  for(let n=0;n<count;n++) {
    const s=pxBackdrop(n,'gallery');
    for(let y=0;y<282;y++)for(let x=0;x<640;x++) {
      const p=(y*640+x)*4;if(s.data[p]===base.data[p]&&s.data[p+1]===base.data[p+1]&&s.data[p+2]===base.data[p+2])continue;
      if((x>=61&&x<69||x>=570&&x<578)&&y===192)continue; // lamp filament
      assert(y>=113&&y<261,'rain leaks through sill');
      assert(allowed.has(Array.from(base.data.slice(p,p+3)).join(',')),'rain paints stonework');rain++;
    }
  }
  assert(rain>3000,'rain missing');
  // At an unobstructed pane column, the SAME drop advances 9/10 pixels at every
  // boundary, including the wrap. This catches the old final-frame backward jump.
  const ys=Array.from({length:count},(_,n)=>{
    const s=pxBackdrop(n,'gallery'),ys=[];
    for(let y=113;y<261;y++)for(let x=100;x<104;x++) {
      const p=(y*640+x)*4;if(s.data[p]===163&&s.data[p+1]===184&&s.data[p+2]===194)ys.push(y);
    }
    return ys;
  });
  // Other drops can enter this narrow strip, so require forward support for all
  // pixels not hidden by a mullion, city block or end-of-aperture clipping.
  let tracked=0;
  for(let n=0;n<count;n++) {
    const step=Math.floor((n+1)*148/count)-Math.floor(n*148/count);
    for(const y of ys[n])if(y>120&&y<140) {
      assert(ys[(n+1)%count].some(next=>Math.abs(next-((y-113+step)%148+113))<=1),'rain teleports at seam');tracked++;
    }
  }
  assert(tracked>5,'rain movement probe missed drops');
  assert(PX_BACKDROPS.size<=24);assert.equal(PX_LIFE.size,count);
  // Menu visits must not evict the currently playing stage's complete loop.
  for(let n=0;n<count;n++)pxBackdrop(n,'gallery');
  const retained=Array.from({length:count},(_,n)=>pxBackdrop(n,'gallery'));
  pxBackdrop(0,'courtyard');pxBackdrop(0,'observatory');
  for(let cycle=0;cycle<3;cycle++)for(let n=0;n<count;n++)assert.strictEqual(pxBackdrop(n,'gallery'),retained[n],'current stage cache churn');
  assert(PX_BACKDROPS.size<=24);
  console.log('PASS',frames,'opaque loop frames / fixed floors;',timelines,'two-cycle input timelines / snapshots / identical outcomes;',rain,'masked rain pixels;',tracked,'forward rain probes; bounded caches, world-clock routing and pause behavior');
  console.log(JSON.stringify(diagnostics));
}
if(output) {
  const seams=new PixelSurface(1152,756),scenes=new PixelSurface(1280,1080);seams.rect(0,0,seams.w,seams.h,PX_INK);
  for(const [row,stage]of PX_STAGES.entries()) {
    pxText(seams,stage.name.toUpperCase()+' / LOOP BOUNDARY / NATIVE PIXELS X2',12,row*252+10,PX_LIGHT);
    for(const [col,n]of [count-2,count-1,0,1].entries()) {
      const bg=pxBackdrop(n,stage.id),crop=new PixelSurface(140,100),[x,y]=stage.id==='courtyard'?[28,72]:stage.id==='gallery'?[90,110]:[323,122];
      for(let j=0;j<100;j++)crop.data.set(bg.data.subarray(((y+j)*640+x)*4,((y+j)*640+x+140)*4),j*140*4);
      seams.blit(crop,col*288,row*252+30,2);pxText(seams,'PHASE '+n,col*288+8,row*252+234,PX_LIGHT);
    }
    for(const [col,t]of [count*8-1,0].entries()) {
      const S=newMatch(0,14,193);S.stage=stage.id;S.phase='fight';S.t=t;
      const frame=pxWorldSurface(S,{});frame.blit(pxHUDSurface(S,[null,null]),0,0);
      pxOutlinedText(frame,stage.name.toUpperCase()+' / '+(col?'LOOP START':'LOOP END'),12,88,PX_LIGHT);
      scenes.blit(frame,col*640,row*360);
    }
  }
  writePNG(output+'/'+prefix+'-stage-seams.png',seams);writePNG(output+'/'+prefix+'-stage-scenes.png',scenes);
}
`)(assert,writePNG,process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,process.argv[3]||'v43',process.argv.includes('--preview-only'));
