// A deliberately late source-read model, not native Canvas/WebKit behavior.
// Flush after each frame; this does not model frames queued indefinitely.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {context,root}=require('./mobile.cjs');
context.legacyPresentation=vm.runInContext('(function(){'+fs.readFileSync(path.join(root,'src/pixel-world.js'),'utf8')+';return {world:pxDrawWorld,present:pxPresent};})()',context);
context.presentationPNG=require('./png.cjs');
context.presentationOut=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
vm.runInContext(`
const currentWorld=drawWorld,currentHUD=drawHUD;
const immediateDraw=ctx.drawImage,immediateFill=ctx.fillRect;
let pending=[],deferred=false,skipWorld=false,fills=0,comparisons=0;
ctx.drawImage=function(image,...args) {
  if(skipWorld&&image!==MOBILE_PRESENT.get('hud').canvas)return;
  const copy=()=>immediateDraw.call(this,image,...args);
  if(deferred)pending.push(copy);else copy();
};
ctx.fillRect=function(...args) {
  const color=this.fillStyle;fills++;
  const fill=()=>{const saved=this.fillStyle;this.fillStyle=color;immediateFill.apply(this,args);this.fillStyle=saved;};
  if(deferred)pending.push(fill);else fill();
};
function flush(){for(const command of pending)command();pending=[];}
function resetPresentation() {
  fresh('ai',3);G.paused=true;G.last=now;G.acc=0;G.S.seed=122;
  G.S.f[0].x=480;G.S.f[1].x=780;
  for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];
  FX.banner=FX.impact=FX.bf=null;FX.flash=FX.shake=0;FX.nope=[0,0];FX.clock=0;FX.silent=true;
  cv.pixels().fill(0);
}
function expectedFrame(worldOnly=false,blankWorld=false) {
  let s=blankWorld?new PixelSurface(640,360):pxWorldSurface(G.S);
  if(blankWorld)s.rect(0,0,640,360,PX_INK);
  const shake=Math.min(5,Math.round(FX.shake/3));
  if(shake&&!blankWorld){const shifted=new PixelSurface(640,360);shifted.rect(0,0,640,360,PX_INK);shifted.blit(s,Math.round(Math.sin(FX.clock*13)*shake),Math.round(Math.cos(FX.clock*7)*shake));s=shifted;}
  if(!worldOnly)s.blit(mobileHUDSurface(G.S,labels()),0,0);
  return s;
}
function equalFrame(expected) {
  const actual=cv.pixels();
  for(let y=0;y<720;y++)for(let x=0;x<1280;x++) {
    const a=(y*1280+x)*4,b=((y>>1)*640+(x>>1))*4;
    for(let k=0;k<4;k++)assert.equal(actual[a+k],expected.data[b+k],'frame pixel '+x+','+y+' channel '+k);
  }
  comparisons++;
}
function capture(){return {w:1280,h:720,data:new Uint8ClampedArray(cv.pixels())};}
// The old shared source is correct with immediate copying, and loses the
// world when both queued reads see the final transparent HUD upload instead.
resetPresentation();
drawWorld=legacyPresentation.world;
drawHUD=(c,S,lab)=>{mobileUpdateControls(S);legacyPresentation.present(c,mobileHUDSurface(S,lab));};
advance();equalFrame(expectedFrame());const initial=capture();
G.S.f[1].x-=180;G.S.f[1].hp-=25;G.S.f[0].st='atk';G.S.f[0].move='a0';G.S.f[0].mt=12;
deferred=true;advance();assert.equal(pending.length,2);flush();
const broken=capture(),wanted=expectedFrame();let stale=0;
for(let y=80;y<620;y++)for(let x=0;x<1280;x++) {
  const a=(y*1280+x)*4,b=((y>>1)*640+(x>>1))*4;
  if(broken.data[a]===initial.data[a]&&broken.data[a+1]===initial.data[a+1]&&broken.data[a+2]===initial.data[a+2]&&
    (broken.data[a]!==wanted.data[b]||broken.data[a+1]!==wanted.data[b+1]||broken.data[a+2]!==wanted.data[b+2]))stale++;
}
assert(stale>100,'late-read shared-source model did not retain stale world/tag pixels');
assert.equal($('mobileErrorText').textContent,'');
console.log('PASS deferred-copy baseline: original shared canvas loses world, retains '+stale+' stale world/tag pixels with moving HUD and no JS error (synthetic fault, not iPhone reproduction)');
// The same frame, camera clock and canvas contents through the new adapter.
drawWorld=currentWorld;drawHUD=currentHUD;FX.clock--;cv.pixels().set(initial.data);
advance();assert.equal(pending.length,3);flush();equalFrame(wanted);const repaired=capture();
assert.equal(fills,1,'each world must begin with an opaque arena fill');
// Same expected output with immediate and deferred copies in both phone
// orientations/DPR 3, all fifteen Domains, moving actors and screen shake.
globalThis.devicePixelRatio=3;
for(const late of [false,true])for(const [w,h] of [[812,375],[375,812]]) {
  deferred=late;innerWidth=w;innerHeight=h;mobileResize();
  for(let ch=0;ch<15;ch++) {
    G.S=newMatch(ch,(ch+1)%15,122);G.S.phase='fight';G.S.intro=0;G.S.freeze=0;G.S.dom=null;G.paused=true;
    G.S.f[ch%2].gauge=GAUGE_MAX;startDomain(G.S,G.S.f[ch%2],G.S.f[1-ch%2]);G.S.freeze=0;G.S.dom.t=48;
    G.S.ev=[];G.S.f[1].x=600+ch*9;G.S.f[1].hp-=ch;FX.shake=ch%2?9:0;
    const state=JSON.stringify(G.S),beforeFill=fills;advance();flush();equalFrame(expectedFrame());
    assert.equal(JSON.stringify(G.S),state,'presentation changes simulation');assert.equal(fills,beforeFill+1);
  }
}
assert.equal(MOBILE_PRESENT.size,3);
for(const field of ['canvas','context','image'])assert.equal(new Set(Array.from(MOBILE_PRESENT.values(),u=>u[field])).size,3,field+' shared by two layers');
assert.equal(new Set(Array.from(MOBILE_PRESENT.values(),u=>u.image.data.buffer)).size,3);
for(const u of MOBILE_PRESENT.values()){assert.equal(u.canvas.width,640);assert.equal(u.canvas.height,360);assert.equal(u.image.data.byteLength,921600);}
assert.equal(PX_SCREEN,null,'mobile must not initialize the desktop scratch');
// Alternating shifted/plain world and HUD must allocate nothing after warmup.
let created=0;const create=document.createElement;
document.createElement=function(tag){if(tag==='canvas')created++;return create.call(this,tag);};
for(let n=0;n<6;n++){FX.shake=n%2?9:0;advance();flush();equalFrame(expectedFrame());}
assert.equal(created,0);document.createElement=create;
// A genuinely missed world copy now leaves an opaque background and ONLY
// current HUD; neither the prior fighter nor any old moving label survives.
for(const shake of [0,9]) {
  FX.shake=shake;advance();flush();G.S.f[1].x-=80;G.S.f[1].hp-=10;
  skipWorld=true;advance();flush();equalFrame(expectedFrame(false,true));skipWorld=false;
  advance();flush();equalFrame(expectedFrame());
}
// Title has a world but no HUD; transitions must not depend on a HUD flush.
const stateBeforeMenu=G.S;toMenu();advance();flush();G.S=G.demo;equalFrame(expectedFrame(true));G.S=stateBeforeMenu;
assert.equal($('mobileErrorText').textContent,'');
ctx.drawImage=immediateDraw;ctx.fillRect=immediateFill;
console.log('PASS mobile independent presentation: '+comparisons+' full 1280x720 comparisons, normal/deferred, fifteen Domains, both orientations/DPR 3, shake/plain/HUD separation, opaque skipped-copy recovery, title and no per-frame canvas allocation');
if(presentationOut){presentationPNG(presentationOut+'/v122-deferred-before.png',broken);presentationPNG(presentationOut+'/v122-deferred-after.png',repaired);}
`,context,{filename:'mobile-presentation-audit.js'});
