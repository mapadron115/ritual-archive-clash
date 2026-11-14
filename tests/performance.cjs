// CPU raster timing in Node; this does not measure browser display, audio or input latency.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),{performance}=require('node:perf_hooks');
const root=path.join(__dirname,'..');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-world','pixel-hud','ai','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
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
`)(performance);
