// Native arena visibility and composition, not browser motion or owner play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,prefix=process.argv[3]||'observatory';
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const oldStage=require('node:child_process').execFileSync('git',['show','HEAD:src/pixel-stage.js'],{cwd:root,encoding:'utf8'});
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'];
const source=old=>names.map(n=>n==='pixel-stage'&&old?oldStage:fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
// Restore the old fixed hoop when HEAD already contains this version, so the
// scene visibility checks remain useful after the coordinator commits it.
const prior=Function(source(true)+`\n
if(typeof pxObservatoryHoop==='function')pxObservatoryHoop=(s)=>{
  pxStageRing(s,392,178,67,24,'#394858',6);pxStageRing(s,392,178,67,24,'#a58f77',3);
  s.line([352,126],[432,230],'#394858',6);s.line([352,126],[432,230],'#d5b98e',3);
};
return {backdrop:(n,id)=>pxBackdrop(n,id),world:S=>pxWorldSurface(S,{})};`)();
Function('assert','writePNG','output','prefix','previewOnly','prior',source(baseline)+'\n'+`
const changed=(a,b,box=[0,0,640,360])=>{
  let n=0;for(let y=box[1];y<box[3];y++)for(let x=box[0];x<box[2];x++) {
    const p=(y*a.w+x)*4;if(!a.data.subarray(p,p+4).every((v,k)=>v===b.data[p+k]))n++;
  }return n;
};
const box=[321,109,464,247],phases=PX_STAGE_FRAMES;
let frames=0,bodies=0,minVisible=Infinity;
if(!previewOnly) {
  const open=pxBackdrop(0,'observatory'),edge=pxBackdrop(8,'observatory');
  const turning=changed(open,edge,box);
  assert(turning>=1300,'the brass instrument still has only a moving pointer: '+turning);
  for(const stage of PX_STAGES)for(let phase=0;phase<phases;phase++) {
    const frame=pxBackdrop(phase,stage.id),old=prior.backdrop(phase,stage.id);
    assert.strictEqual(frame,pxBackdrop(phase+phases*5,stage.id),'cache/loop changed');
    for(let y=0;y<360;y++)for(let x=0;x<640;x++) {
      const p=(y*640+x)*4;assert.equal(frame.data[p+3],255,'soft/empty stage alpha');
      if(stage.id!=='observatory'||x<box[0]||x>=box[2]||y<box[1]||y>=box[3])
        assert.deepEqual(frame.data.subarray(p,p+4),old.data.subarray(p,p+4),'unrelated stage/floor changed');
    }
    frames++;
  }
  // Measure the moving rim itself in an unoccluded projection. Its width must
  // collapse at edge-on; the loop seam must be quieter than a mid-turn step.
  const hoops=Array.from({length:phases},(_,n)=>{const s=new PixelSurface(640,360);pxObservatoryHoop(s,n);return s;});
  const seam=changed(hoops[15],hoops[0],box),mid=changed(hoops[7],hoops[8],box);
  assert(seam<mid,'hoop snaps on reset');
  function litWidth(s) {
    let lo=640,hi=0;for(let y=110;y<247;y++)for(let x=321;x<464;x++) {
      const p=(y*640+x)*4;if(s.data[p]===237&&s.data[p+1]===209&&s.data[p+2]===160){lo=Math.min(lo,x);hi=Math.max(hi,x);}
    }return hi-lo;
  }
  assert(litWidth(hoops[0])>litWidth(hoops[8])*2,'hoop does not turn edge-on');
  // Every lit rim pixel has nearby support in the next phase, including wrap.
  // A broad turning hoop should not teleport even where its rim moves fastest.
  let maxStep=0;
  for(let n=0;n<phases;n++) {
    const a=hoops[n],b=hoops[(n+1)%phases],lit=[];
    for(let y=box[1];y<box[3];y++)for(let x=box[0];x<box[2];x++) {
      const p=(y*640+x)*4;if(b.data[p]===237&&b.data[p+1]===209&&b.data[p+2]===160)lit.push([x,y]);
    }
    for(let y=box[1];y<box[3];y++)for(let x=box[0];x<box[2];x++) {
      const p=(y*640+x)*4;if(a.data[p]!==237||a.data[p+1]!==209||a.data[p+2]!==160)continue;
      let nearest=Infinity;for(const [bx,by]of lit)nearest=Math.min(nearest,Math.hypot(x-bx,y-by));
      assert(nearest<=12,'lit rim jumps at phase '+n+': '+nearest);maxStep=Math.max(maxStep,nearest);
    }
  }
  console.log('Instrument open/edge changed pixels:',turning,'; loop seam/mid-turn:',seam,mid,'; maximum rim step:',maxStep.toFixed(2));
}
const labs=[{P:'F',K:'G',G:'S',A1:'R',A2:'T',A3:'Y',DOM:'H',move:'A/D',U:'W'},null];labs.other='Computer';
if(output) {
  const loop=new PixelSurface(640,640);loop.rect(0,0,640,640,PX_INK);
  for(let phase=0;phase<phases;phase++) {
    const bg=pxBackdrop(phase,'observatory'),crop=new PixelSurface(160,148),x=phase%4*160,y=Math.floor(phase/4)*160;
    for(let row=0;row<148;row++)crop.data.set(bg.data.subarray(((109+row)*640+312)*4,((109+row)*640+472)*4),row*160*4);
    loop.blit(crop,x,y);pxText(loop,'PHASE '+phase,x+4,y+150,PX_LIGHT);
  }
  writePNG(output+'/'+prefix+'-loop.png',loop);
}
for(let ch=0;ch<15;ch++)for(const dir of [-1,1])for(const kind of ['idle','air','guard']) {
  const S=newMatch(ch,ch,193);S.stage='observatory';S.phase='fight';
  const f=S.f[0],o=S.f[1];f.x=dir>0?670:900;o.x=dir>0?900:670;f.face=dir;o.face=-dir;
  if(kind==='air'){f.y=430;f.st='jump';}if(kind==='guard'){f.guard=true;f.st='guard';}
  for(const phase of [0,4,8,12,15]) {
    S.t=phase*8;const state=JSON.stringify(S),raster=pxWorldSurface(S,{}),old=prior.world(S);
    if(!previewOnly) {
      assert.equal(JSON.stringify(S),state,'stage mutates match');
      assert.deepEqual(raster.data,pxWorldSurface(JSON.parse(state),{}).data,'snapshot discrepancy');
      const mask=new PixelSurface(640,360);for(const actor of S.f)pxPaintFighter(mask,S,actor,null);
      for(let p=0;p<mask.data.length;p+=4)if(mask.data[p+3]) {
        assert.deepEqual(raster.data.subarray(p,p+4),old.data.subarray(p,p+4),'hoop paints over fighter');bodies++;
      }
      const visible=changed(raster,old);assert(visible>=500,'turning hoop hidden in scene '+[ch,dir,kind,phase,visible]);minVisible=Math.min(minVisible,visible);
    }
    if(output&&(ch===0||ch===14)) {
      raster.blit(pxHUDSurface(S,labs),0,0);
      writePNG(output+'/'+prefix+'-ch'+ch+'-'+kind+'-'+(dir>0?'right':'left')+'-p'+phase+'.png',raster);
    }
    frames++;
  }
}
if(!previewOnly)console.log('PASS',frames,'native stage/fight frames; read-only snapshots;',bodies,'clear fighter pixels; minimum scene difference',minVisible,'pixels; fixed floor/other stages/cache and loop seam');
`)(assert,writePNG,output,prefix,previewOnly,prior);
