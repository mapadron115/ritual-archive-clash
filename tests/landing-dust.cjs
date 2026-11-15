// Actual jump inputs and event-driven landing effects. Scripted, never played.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,prefix=process.argv[3]||'landing';
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'];
const oldWorld=require('node:child_process').execFileSync('git',['show','8445875:src/pixel-world.js'],{cwd:root,encoding:'utf8'});
const read=n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8');
const source=names.map(n=>baseline&&n==='pixel-world'?oldWorld:read(n)).join('\n');
const oldDust=Function(names.map(n=>n==='pixel-world'?oldWorld:read(n)).join('\n')+'\nreturn e=>{const s=new PixelSurface(192,96);pxDust(s,e);return s.data;};')();
Function('assert','writePNG','output','prefix','previewOnly','oldDust',source+'\n'+`
function reset(){for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];FX.nope=[0,0];FX.impact=FX.bf=FX.banner=null;FX.shake=FX.flash=0;FX.silent=true;}
let timelines=0,ticks=0,rasters=0,minVisible=Infinity;
for(let ch=0;ch<15;ch++)for(const owner of [0,1])for(const travel of [-1,0,1]) {
  if(previewOnly&&(![0,14].includes(ch)||travel!==0))continue;
  reset();const S=newMatch(ch,ch,983);S.phase='fight';S.t=140;
  const f=S.f[owner],o=S.f[1-owner];f.x=640;o.x=owner?100:1180;
  const B=JSON.parse(JSON.stringify(S)),input=[0,0];input[owner]=BTN.U<<INPUT_SHIFT|(travel<0?BTN.L:travel>0?BTN.R:0);
  let landed=false;
  for(let n=0;n<100;n++) {
    S.ev=[];B.ev=[];step(S,input);step(B,input);ticks++;
    assert.equal(JSON.stringify(S),JSON.stringify(B));for(const e of S.ev)fxEvent(S,e);fxTick();
    input[owner]=travel<0?BTN.L:travel>0?BTN.R:0;
    if(S.ev.some(e=>e.k==='land')){landed=true;break;}
  }
  assert(landed,'jump never landed');assert.equal(f.y,GROUND);assert.equal(FX.dust.length,1);
  assert.equal(FX.dust[0].kind,'land');assert.equal(FX.dust[0].t,1);assert.equal(FX.dust[0].life,18);
  for(let age=1;age<=18;age++) {
    if([1,3,5,9,17,18].includes(age))for(const stage of [0,14].includes(ch)?PX_STAGES:[PX_STAGES[ch%3]]) {
      S.stage=B.stage=stage.id;const before=JSON.stringify(S),effects=JSON.stringify(FX);
      const view=pxWorldSurface(S,FX),plain=pxWorldSurface(S,{...FX,dust:[]}),hud=pxHUDSurface(S,[null,null],FX);view.blit(hud,0,0);plain.blit(hud,0,0);
      if(!previewOnly) {
        assert.equal(JSON.stringify(S),before);assert.equal(JSON.stringify(FX),effects);
        const snap=pxWorldSurface(JSON.parse(before),JSON.parse(effects));snap.blit(hud,0,0);assert.deepEqual(view.data,snap.data);rasters++;
        const pixels=s=>new Uint32Array(s.data.buffer,s.data.byteOffset,s.w*s.h),full=pixels(view),empty=pixels(plain);
        let visible=0;for(let p=0;p<full.length;p++)if(full[p]!==empty[p])visible++;
        if(age<=5){assert(visible>=(age<5?180:120),'landing cue disappears at native size: '+[ch,owner,travel,age,visible]);minVisible=Math.min(minVisible,visible);}
        if(age===18)assert.equal(visible,0,'dust survives expiry');
        const bodies=new PixelSurface(640,360);for(const actor of S.f)pxPaintFighter(bodies,S,actor,null);
        const body=pixels(bodies);for(let p=0;p<body.length;p++)if(body[p])assert.equal(full[p],empty[p],'dust over body');
      }
      if(output&&[0,14].includes(ch)&&travel===0&&[1,3,5,9,17].includes(age))writePNG(output+'/'+prefix+'-ch'+ch+'-'+stage.id+'-'+(owner?'p2':'p1')+'-t'+age+'.png',view);
    }
    S.ev=[];B.ev=[];step(S,[0,0]);step(B,[0,0]);ticks++;
    assert.equal(JSON.stringify(S),JSON.stringify(B));for(const e of S.ev)fxEvent(S,e);fxTick();
  }
  assert.equal(FX.dust.length,0);timelines++;
}
if(!previewOnly) {
  let previousOuter=0;
  for(const kind of ['jump','land','thud'])for(let t=0;t<(kind==='jump'?12:kind==='land'?18:24);t++) {
    const e={x:192,y:160,kind,t},s=new PixelSurface(192,96);pxDust(s,e);
    // Takeoff has its own v102 regression; retain the fixed v95 thud check.
    if(kind==='thud')assert.deepEqual(s.data,oldDust(e),'unrelated floor effect changed');
    let bright=0,area=0,outer=0;
    for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++) {
      const p=(y*s.w+x)*4,a=s.data[p+3];assert(a===0||a===255);
      if(a){area++;assert(x>0&&x<s.w-1&&y>0&&y<=80,'clipped/below floor');outer=Math.max(outer,Math.abs(x-96));if(s.data[p]>200&&s.data[p+1]>180)bright++;}
      if(kind==='land'&&x>0)assert.deepEqual(s.data.subarray(p,p+4),s.data.subarray((y*192+192-x)*4,(y*192+192-x)*4+4),'asymmetric puffs');
    }
    if(kind==='land') {
      if(t<6)assert(bright>=100,'landing lacks pale caps: '+[t,bright]);
      if(t<9){assert(outer>=previousOuter,'dust jumps inward');previousOuter=outer;}
      if(t===17)assert(area<80,'late dust does not disperse: '+area);
    }
  }
  for(let t=0;t<18;t++)for(const x of [LEFT,LEFT+.5,640,RIGHT-.5,RIGHT]) {
    const cell=new PixelSurface(192,96);pxDust(cell,{x:192,y:160,kind:'land',t});
    const actual=new PixelSurface(640,360),expected=new PixelSurface(640,360);pxDust(actual,{x,y:GROUND,kind:'land',t});expected.blit(cell,Math.round(x/2)-96,GROUND/2-80);assert.deepEqual(actual.data,expected.data);
  }
}
if(previewOnly)console.log('PREVIEW',timelines,'actual jump/landing timelines; native scenes exported; full assertions skipped');
else console.log('PASS',timelines,'actual jump/landing timelines;',ticks,'parallel-state ticks;',rasters,'native scene/snapshot checks; minimum initial visible dust',minVisible,'pixels; hard alpha, floor bounds, body clearance, outward travel, expiry, 90 edge/fractional crops and unchanged thud');
`)(assert,writePNG,output,prefix,previewOnly,oldDust);
