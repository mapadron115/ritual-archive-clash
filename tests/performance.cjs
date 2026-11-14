// CPU raster timing in Node; this does not measure browser display, audio or input latency.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),{performance}=require('node:perf_hooks');
const root=path.join(__dirname,'..');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','ai','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
// Use the ordinary V8 realm: vm's contextified Math calls distort per-pixel CPU timings.
Function('performance',source+'\n'+`
const S=newMatch(0,14,1000);S.phase='fight';const labs=[{P:'J',K:'K',G:'S',A1:'U',A2:'I',A3:'O',DOM:'L',move:'A/D',U:'W'},null];labs.other='Computer';
for(const stage of PX_STAGES) {
S.stage=stage.id;
for(let n=0;n<24;n++){S.t=n;pxWorldSurface(S);pxHUDSurface(S,labs);}
const times=[];
for(let n=0;n<120;n++){S.t=n+24;const begin=performance.now();pxWorldSurface(S);pxHUDSurface(S,labs);times.push(performance.now()-begin);}
times.sort((a,b)=>a-b);
console.log(JSON.stringify({kind:'Node CPU raster only',stage:stage.id,frames:120,medianMs:+times[60].toFixed(2),p95Ms:+times[114].toFixed(2)}));
}
for(let ch=0;ch<15;ch++) {
  const begin=performance.now();pxDomainBackdrop(CH[ch].dom.kind);const buildMs=performance.now()-begin;
  const D=newMatch(ch,ch,1000);D.phase='fight';D.stage='gallery';D.f[0].gauge=100;startDomain(D,D.f[0],D.f[1]);D.freeze=0;D.dom.t=32;
  for(let n=0;n<4;n++){D.dom.t=32+n;pxWorldSurface(D);pxHUDSurface(D,labs);}
  const times=[];
  for(let n=0;n<24;n++){D.dom.t=36+n;const start=performance.now();pxWorldSurface(D);pxHUDSurface(D,labs);times.push(performance.now()-start);}
  times.sort((a,b)=>a-b);
  console.log(JSON.stringify({kind:'Node CPU Domain raster only',domain:CH[ch].dom.kind,frames:24,preRoundBuildMs:+buildMs.toFixed(2),medianMs:+times[12].toFixed(2),p95Ms:+times[22].toFixed(2)}));
}
// Contact-loaded raster samples include the damage layout and simultaneous values.
for(const count of [1,8,24]) {
  const C=newMatch(0,14,1000);C.phase='fight';C.t=130;C.stage='gallery';C.f[0].x=580;C.f[1].x=650;
  for(const key of ['parts','rings','lines','contacts','dust','stars','puffs','nums','words'])FX[key]=[];
  FX.banner=FX.bf=FX.impact=null;FX.flash=0;FX.silent=true;
  for(let n=0;n<count;n++){C.ev=[];hit(C,0,C.f[1],C.f[0].x,{dmg:24,kb:0});for(const e of C.ev)fxEvent(C,e);}
  for(let n=0;n<24;n++){pxWorldSurface(C);pxHUDSurface(C,labs);}
  const times=[];
  for(let n=0;n<120;n++){const begin=performance.now();pxWorldSurface(C);pxHUDSurface(C,labs);times.push(performance.now()-begin);}
  times.sort((a,b)=>a-b);
  console.log(JSON.stringify({kind:'Node CPU contact raster only',damageValues:FX.nums.length,frames:120,medianMs:+times[60].toFixed(2),p95Ms:+times[114].toFixed(2)}));
}
`)(performance);
