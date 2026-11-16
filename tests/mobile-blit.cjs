// Exact byte replacement semantics, including nonzero partial alpha. This is
// CPU raster testing; Canvas source-over, upload and phone timing are separate.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),baseline=process.argv.includes('--baseline');
let source=['sim','fighters','fighters2','pixel'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
source+='\nconst oldBlit=PixelSurface.prototype.blit;\n';
if(!baseline)source+=fs.readFileSync(path.join(root,'mobile/raster.js'),'utf8');
Function('assert',source+`
const newBlit=PixelSurface.prototype.blit;let cases=0,seed=124;
function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
function fill(s){for(let n=0;n<s.data.length;n++)s.data[n]=n%4===3?[0,1,127,255][(n>>>2)%4]:random()>>>24;return s;}
function compare(w,h,x,y,scale,flip,alias=false,unaligned=false){
  const input=fill(new PixelSurface(w,h)),dest=fill(new PixelSurface(19,13));
  function run(method){
    const a=new PixelSurface(w,h),b=alias?a:new PixelSurface(19,13);
    a.data.set(input.data);if(!alias)b.data.set(dest.data);
    if(unaligned)for(const s of [a,b]){const bytes=new Uint8ClampedArray(new ArrayBuffer(s.data.length+1),1);bytes.set(s.data);s.data=bytes;}
    method.call(b,a,x,y,scale,flip);return b.data;
  }
  assert.deepEqual(run(newBlit),run(oldBlit),'blit bytes '+[w,h,x,y,scale,flip,alias,unaligned]);cases++;
}
for(const w of [0,1,7,23])for(const h of [0,1,5,17])
for(const x of [-25,-7.5,-.5,0,.5,4.49,18,20])for(const y of [-19,-3.5,-.5,0,.5,12,15])
for(const scale of [-1,0,.25,.5,1,1.25,2,3])for(const flip of [false,true])compare(w,h,x,y,scale,flip);
for(let n=0;n<2000;n++)compare(random()%40,random()%30,(random()%100-50)/2,(random()%80-40)/2,[.75,1,1,1,1.5][random()%5],!!(random()%2));
// Forward in-place traversal must retain the original overlapping-copy order.
for(const x of [-5,-1,0,1,5])for(const y of [-3,-1,0,1,3])for(const flip of [false,true])compare(19,13,x,y,1,flip,true);
for(const flip of [false,true])for(const alias of [false,true])compare(7,5,-.5,1.5,1,flip,alias,true);
// Distinct objects can still share an aligned backing allocation.
for(const offset of [0,4,28])for(const flip of [false,true]){
  const initial=fill(new PixelSurface(12,10)).data;
  function overlap(method){const bytes=new Uint8ClampedArray(initial);const a=new PixelSurface(7,5),b=new PixelSurface(12,10);a.data=new Uint8ClampedArray(bytes.buffer,offset,140);b.data=bytes;method.call(b,a,2,1,1,flip);return bytes;}
  assert.deepEqual(overlap(newBlit),overlap(oldBlit));cases++;
}
console.log('PASS mobile blit: '+cases+' scale/flip/clip/round/alpha/overwrite/alias/unaligned cases byte-identical');
function reused(method){
  const a=fill(new PixelSurface(7,5)),b=fill(new PixelSurface(19,13));
  method.call(b,a,0,0);a.data.fill(255);method.call(b,a,2,1);
  a.data=new Uint8ClampedArray(a.data.length);a.data.fill(101);
  b.data=new Uint8ClampedArray(b.data);method.call(b,a,4,3,1,true);return b.data;
}
const savedSeed=seed;const reusedNew=reused(newBlit);seed=savedSeed;
assert.deepEqual(reusedNew,reused(oldBlit),'weak views retained stale or replaced data');
console.log('PASS mobile blit: reused, mutated and replaced source/target arrays');
let floors=0;const floor=Math.floor;
try{Math.floor=function(n){floors++;return floor(n);};newBlit.call(new PixelSurface(640,360),fill(new PixelSurface(640,360)),0,0);}
finally{Math.floor=floor;}
assert.equal(floors,0,'native-size blit still calculates scaled source coordinates per pixel');
console.log('PASS mobile blit cost regression: native-size full screen eliminates 460800 Math.floor calls');
`)(assert);
