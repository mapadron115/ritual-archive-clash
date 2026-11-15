// Real jump inputs and native takeoff scenes. Script evidence, never play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,prefix=process.argv[3]||'takeoff';
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'];
const read=n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8');
const old=n=>require('node:child_process').execFileSync('git',['show','bbf19d0:src/'+n+'.js'],{cwd:root,encoding:'utf8'});
const oldStep=Function(['sim','fighters','fighters2'].map(old).join('\n')+'\nreturn step;')();
const oldWorld=Function(names.map(n=>n==='pixel-world'?old(n):read(n)).join('\n')+'\nreturn pxWorldSurface;')();
Function('assert','writePNG','output','prefix','previewOnly','oldStep','oldWorld',names.map(n=>baseline&&n==='pixel-world'?old(n):read(n)).join('\n')+'\n'+`
function reset(){for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];FX.nope=[0,0];FX.impact=FX.bf=FX.banner=null;FX.shake=FX.flash=0;FX.silent=true;}
const pixels=s=>new Uint32Array(s.data.buffer,s.data.byteOffset,s.w*s.h);
let timelines=0,ticks=0,frames=0,minVisible=Infinity,revealed=0;
for(let ch=0;ch<15;ch++)for(const owner of [0,1])for(const travel of [-1,0,1]) {
  reset();const S=newMatch(ch,ch,983);S.phase='fight';S.t=140;
  const f=S.f[owner],o=S.f[1-owner];f.x=640;o.x=owner?100:1180;
  const B=JSON.parse(JSON.stringify(S));let landed=false;
  for(let age=1;age<=90;age++) {
    const input=[0,0];input[owner]=(age===1?BTN.U<<INPUT_SHIFT:0)|(travel<0?BTN.L:travel>0?BTN.R:0);
    S.ev=[];B.ev=[];step(S,input);oldStep(B,input);ticks++;
    assert.equal(JSON.stringify(S),JSON.stringify(B),'jump combat changed');
    for(const e of S.ev)fxEvent(S,e);fxTick();
    if(age===1){assert(S.ev.some(e=>e.k==='jump'));assert.equal(FX.dust[0].life,12);assert.equal(FX.dust[0].kind,'jump');}
    if([1,3,6,11,12].includes(age))for(const stage of [0,14].includes(ch)?PX_STAGES:[PX_STAGES[ch%3]]) {
      S.stage=B.stage=stage.id;const state=JSON.stringify(S),effects=JSON.stringify(FX);
      const view=pxWorldSurface(S,FX),plain=pxWorldSurface(S,{...FX,dust:[]}),before=oldWorld(S,FX);
      const hud=pxHUDSurface(S,[null,null],FX);view.blit(hud,0,0);plain.blit(hud,0,0);before.blit(hud,0,0);
      if(!previewOnly) {
        assert.equal(JSON.stringify(S),state);assert.equal(JSON.stringify(FX),effects);
        const snap=pxWorldSurface(JSON.parse(state),JSON.parse(effects));snap.blit(hud,0,0);assert.deepEqual(snap.data,view.data,'snapshot changes takeoff');
        const a=pixels(view),b=pixels(plain),c=pixels(before),bodies=new PixelSurface(640,360);
        for(const actor of S.f)pxPaintFighter(bodies,S,actor,null);
        const body=pixels(bodies);let visible=0;
        for(let p=0;p<a.length;p++) {
          if(body[p])assert.equal(a[p],b[p],'takeoff hides fighter');
          if(a[p]!==b[p])visible++;
          if(a[p]!==c[p])revealed++;
        }
        if(age<=3){assert(visible>=220,'takeoff disappears at native size: '+[ch,owner,travel,age,visible]);minVisible=Math.min(minVisible,visible);}
        if(age===12)assert.equal(visible,0,'takeoff survives expiry');frames++;
      }
      if(output&&[0,14].includes(ch)&&travel===0&&age<12)writePNG(output+'/'+prefix+'-ch'+ch+'-'+stage.id+'-p'+(owner+1)+'-t'+age+'.png',view);
    }
    if(S.ev.some(e=>e.k==='land')){landed=true;break;}
  }
  assert(landed,'incomplete jump lifecycle');timelines++;
}
if(!previewOnly) {
  assert(revealed>10000,'no reproduced takeoff difference');
  let lastOuter=0,initialArea=0,finalArea=0;
  for(let t=0;t<12;t++) {
    const cell=new PixelSurface(192,96);pxDust(cell,{x:192,y:160,kind:'jump',t});let area=0,bright=0,outer=0;
    for(let y=0;y<96;y++)for(let x=0;x<192;x++) {
      const p=(y*192+x)*4,a=cell.data[p+3];assert(a===0||a===255,'soft alpha');
      if(a){area++;outer=Math.max(outer,Math.abs(x-96));assert(x>0&&x<191&&y>0&&y<=80,'clipped or below floor');if(cell.data[p]>200&&cell.data[p+1]>180)bright++;}
      if(x>0)assert.deepEqual(cell.data.subarray(p,p+4),cell.data.subarray((y*192+192-x)*4,(y*192+192-x)*4+4),'asymmetric takeoff');
    }
    if(t<4)assert(bright>=100,'takeoff lacks bright material');
    if(t<8){assert(outer>=lastOuter,'takeoff jumps inward');lastOuter=outer;}
    if(t===0)initialArea=area;if(t===11)finalArea=area;
    for(const x of [LEFT,LEFT+.5,640,RIGHT-.5,RIGHT]) {
      const actual=new PixelSurface(640,360),expected=new PixelSurface(640,360);
      pxDust(actual,{x,y:GROUND,kind:'jump',t});expected.blit(cell,Math.round(x/2)-96,GROUND/2-80);assert.deepEqual(actual.data,expected.data,'edge crop');
    }
  }
  assert(finalArea<initialArea/4,'takeoff fails to disperse');
  reset();const S=newMatch(0,14,983);S.phase='fight';S.t=140;
  for(const kind of ['land','thud'])for(let t=0;t<(kind==='land'?18:24);t++)for(const stage of PX_STAGES) {
    S.stage=stage.id;const fx={dust:[{x:640,y:GROUND,kind,t}]};assert.deepEqual(pxWorldSurface(S,fx).data,oldWorld(S,fx).data,'other floor effect changed');
  }
  console.log('PASS 126 unchanged landing/thud scenes; hard alpha, floor bounds, exact symmetry, outward travel, contraction and 60 fractional/edge crops');
}
console.log(previewOnly?'PREVIEW':'PASS',timelines,'real jump/landing timelines;',ticks,'v101 state comparisons;',frames,'native scene/snapshot checks; minimum initial visibility',minVisible,'pixels;',revealed,'changed takeoff pixels');
`)(assert,writePNG,output,prefix,previewOnly,oldStep,oldWorld);
