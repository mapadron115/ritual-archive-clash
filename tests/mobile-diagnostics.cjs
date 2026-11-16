// Phone diagnostics and real mobile frame audit. Memory canvas/event delivery
// is a model; this cannot reproduce WebKit GPU/compositor or iOS memory limits.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'mobile/index.html'),'utf8');
const source=fs.readFileSync(path.join(root,'mobile/diagnostics.js'),'utf8');
const css=fs.readFileSync(path.join(root,'mobile/mobile.css'),'utf8');
assert(html.includes('<aside id="mobileError" role="alert" hidden>'));
assert(html.indexOf('src="diagnostics.js?')<html.indexOf('src="../src/sim.js?'));
assert(/#mobileError\[hidden\]\s*\{\s*display:\s*none/.test(css));
assert(/#mobileError\s*\{[^}]*z-index:\s*100/.test(css));
assert(/#mobileError pre\s*\{[^}]*white-space:\s*pre-wrap/.test(css));
assert(!fs.readFileSync(path.join(root,'index.html'),'utf8').includes('diagnostics.js'));
function fixture() {
  const nodes={mobileError:{hidden:true},mobileErrorText:{textContent:''},cv:{width:1280,height:720}},listeners={};
  const context=vm.createContext({document:{getElementById:id=>nodes[id]},innerWidth:812,innerHeight:375,devicePixelRatio:3,
    addEventListener(k,fn,capture){(listeners[k]??=[]).push({fn,capture});}});
  vm.runInContext(source,context,{filename:'mobile/diagnostics.js'});
  return {nodes,context,emit(k,e){for(const {fn} of listeners[k]||[])fn(e);},listeners};
}
let count=0;
for(const sample of [
  {type:'error',event:{error:{message:'Upload failed',stack:'Error: Upload failed\n    at pxPresent (pixel-world.js:1259:3)\n    at frame (main.js:354:3)'}},message:'Upload failed',frame:'at pxPresent (pixel-world.js:1259:3)'},
  {type:'error',event:{error:{message:'Canvas unavailable',stack:'pxPresent@https://local.test/src/pixel-world.js:1259:3\nframe@https://local.test/src/main.js:354:3'}},message:'Canvas unavailable',frame:'pxPresent@https://local.test/src/pixel-world.js:1259:3'},
  {type:'error',event:{message:'Syntax error',filename:'broken.js',lineno:5,colno:9},message:'Syntax error',frame:'broken.js:5:9'},
  {type:'error',event:{target:{src:'https://local.test/src/missing.js'}},message:'Could not load https://local.test/src/missing.js'},
  {type:'unhandledrejection',event:{reason:{message:'Rejected upload',stack:'Error: Rejected upload\n at upload (mobile.js:8:2)'}},message:'Rejected upload',frame:'at upload (mobile.js:8:2)'},
  {type:'unhandledrejection',event:{reason:'<img src=x onerror=bad()>'},message:'<img src=x onerror=bad()>'},
  ...[0,false,null].map(reason=>({type:'unhandledrejection',event:{reason},message:reason===null?'Unknown error':String(reason)})),
]) {
  const f=fixture();assert.equal(f.nodes.mobileError.hidden,true);assert.equal(f.nodes.mobileErrorText.textContent,'');
  assert.equal(f.listeners.error[0].capture,true,'script resource failures need capture');
  f.emit('error',{target:{}});assert.equal(f.nodes.mobileError.hidden,true);
  f.emit(sample.type,sample.event);assert.equal(f.nodes.mobileError.hidden,false);
  const text=f.nodes.mobileErrorText.textContent;assert(text.includes(sample.message));if(sample.frame)assert(text.includes(sample.frame));
  assert(!text.includes('at frame'));assert(text.includes('812x375 / DPR 3 / arena 1280x720'));
  f.emit('error',{message:'Later error'});f.emit('unhandledrejection',{reason:'Later rejection'});
  assert.equal(f.nodes.mobileErrorText.textContent,text,'first error must survive subsequent frames/rejections');
  assert.equal(f.nodes.mobileErrorText.innerHTML,undefined,'untrusted error text must never become markup');count++;
}
{
  const f=fixture();f.emit('error',{error:{message:'x'.repeat(10000),stack:'Error: x\n'+ 'at '+ 'y'.repeat(10000)}});
  assert(f.nodes.mobileErrorText.textContent.length<1650,'keep the first error bounded');
  const boot=fixture();const error=vm.runInContext('new Error("Before sim boot")',boot.context,{filename:'early-fixture.js'});
  boot.emit('error',{error});assert(boot.nodes.mobileErrorText.textContent.includes('early-fixture.js'));
}
console.log('PASS mobile diagnostics:',count,'error/rejection forms, early boot, Chrome/WebKit stacks, first failure retained, safe bounded text, viewport/DPR, clean hidden panel and mobile-only markup');

const {context}=require('./mobile.cjs');
context.auditAssert=assert;
vm.runInContext(`
globalThis.devicePixelRatio=3;
let auditedFrames=0,uploaded=0,painted=0,created=0;
const beforeCreate=document.createElement;
document.createElement=function(tag){if(tag==='canvas')created++;return beforeCreate.call(this,tag);};
const nativeDraw=ctx.drawImage;
ctx.drawImage=function(image,x,y,w,h){
  assert.equal(image.width,640);assert.equal(image.height,360);assert.equal(w,1280);assert.equal(h,720);
  painted++;return nativeDraw.call(this,image,x,y,w,h);
};
function compareFrame(S,worldOnly=false) {
  let expected=pxWorldSurface(S);
  const shake=Math.min(5,Math.round(FX.shake/3));
  if(shake>0){const shifted=new PixelSurface(640,360);shifted.rect(0,0,640,360,PX_INK);shifted.blit(expected,Math.round(Math.sin(FX.clock*13)*shake),Math.round(Math.cos(FX.clock*7)*shake));expected=shifted;}
  const hud=worldOnly?null:mobileHUDSurface(S,labels());
  if(hud)expected.blit(hud,0,0);
  const pixels=cv.pixels();
  // Compare every displayed pixel, including all old actor-tag positions.
  for(let y=0;y<720;y++)for(let x=0;x<1280;x++) {
    const p=(y*1280+x)*4,q=((y>>1)*640+(x>>1))*4;
    if(pixels[p]!==expected.data[q]||pixels[p+1]!==expected.data[q+1]||pixels[p+2]!==expected.data[q+2]||pixels[p+3]!==255)
      throw new Error('stale world/tag pixel at '+x+','+y);
  }
  assert.equal(cv.width,1280);assert.equal(cv.height,720);
  for(const upload of MOBILE_PRESENT.values()) {
    assert.equal(upload.canvas.width,640);assert.equal(upload.canvas.height,360);
    assert.equal(upload.image.data.byteLength,640*360*4);
  }
  const saved=JSON.stringify(S);pxWorldSurface(S);mobileHUDSurface(S,labels());assert.equal(JSON.stringify(S),saved);
  auditedFrames++;
}
// Native upload dimensions never depend on the CSS viewport or DPR.
FX.shake=3;advance();FX.shake=0;advance();
const uploadHooks=Array.from(MOBILE_PRESENT.values(),upload=>({context:upload.context,native:upload.context.putImageData}));
for(const hook of uploadHooks)hook.context.putImageData=function(image,x,y){
  assert.equal(image.width,640);assert.equal(image.height,360);assert.equal(image.data.byteLength,921600);
  uploaded++;return hook.native.call(this,image,x,y);
};
const uploadContext=MOBILE_PRESENT.get('world').context,nativeUpload=uploadContext.putImageData;
for(const [width,height] of [[812,375],[375,812],[812,375]]) {
  innerWidth=width;innerHeight=height;win.dispatch('resize');
  toMenu();G.last=now;advance();compareFrame(G.demo,true);
  pickMode('ai');G.pick=[3,14];startFight();G.S.phase='fight';G.S.intro=0;G.S.freeze=0;FX.banner=null;
  const paused=MOBILE.portrait;G.paused=paused;
  G.S.f[0].x=500;G.S.f[1].x=660;
  const canvasesBeforeFrames=created;
  for(let n=0;n<18;n++) {
    // Cover each new pose through the actual frame path and both tag positions.
    const f=G.S.f[0];f.st=n<9?'hit':'atk';f.stT=[15,8,3][n%3];f.move=['a0','a1','a2'][n%3];f.mt=n<9?0:n-3;
    G.S.f[1].x=660+n*5;G.S.f[1].st='idle';G.S.f[1].stT=0;
    advance();compareFrame(G.S);
  }
  document.visibilityState='hidden';document.dispatch('visibilitychange');win.dispatch('pagehide');
  advance();compareFrame(G.S);
  document.visibilityState='visible';document.dispatch('visibilitychange');win.dispatch('pageshow');
  if(G.paused&&!MOBILE.portrait)togglePause();advance();compareFrame(G.S);
  // Real touch delivery after a return/resize must not suppress world painting.
  if(!MOBILE.portrait){pointer('pointerdown','R',61);pointer('pointerdown','P',62);advance();pointer('pointerup','P',62);pointer('pointerup','R',61);compareFrame(G.S);}
  assert.equal(created,canvasesBeforeFrames,'world/HUD, resize and visibility must reuse existing canvases');
}
for(let ch=0;ch<15;ch++) {
  G.S=newMatch(ch,(ch+1)%15,121);G.S.phase='fight';G.S.intro=0;
  G.S.f[ch%2].gauge=GAUGE_MAX;startDomain(G.S,G.S.f[ch%2],G.S.f[1-ch%2]);
  for(const e of G.S.ev)fxEvent(G.S,e);G.S.ev=[];G.S.freeze=0;G.S.dom.t=48;
  advance();compareFrame(G.S);
}
assert.equal($('mobileErrorText').textContent,'','clean game must not reveal diagnostics');
ctx.drawImage=nativeDraw;for(const hook of uploadHooks)hook.context.putImageData=hook.native;document.createElement=beforeCreate;
console.log('PASS mobile phone frame audit:',auditedFrames,'complete 1280x720 pixel comparisons;',uploaded,'native uploads;',painted,'world/HUD draws; DPR 3, 812x375 / 375x812, menus, new poses, fifteen Domains, moving CPU tags, touch, rotate and visibility, no per-frame canvases');

// Deliberately ignore only world arena copies while retaining actual HUD uploads.
// This models the reported symptoms and validates the pixel oracle; it is
// NOT a reproduction of the phone's cause or evidence of a WebKit defect.
G.paused=true;FX.shake=0;advance();
const faultDraw=ctx.drawImage,worldCanvas=MOBILE_PRESENT.get('world').canvas;
ctx.drawImage=function(image,...args){if(image!==worldCanvas)return faultDraw.call(this,image,...args);};
G.S.f[1].x-=100;G.S.f[1].hp-=10;advance();
assert.throws(()=>compareFrame(G.S),/stale world/);
assert.equal($('mobileErrorText').textContent,'','silent native upload failure cannot produce a JS error overlay');
ctx.drawImage=faultDraw;advance();compareFrame(G.S);
console.log('PASS deliberate silent-world-upload model: missing world/moving HUD detected by pixel oracle; clean error overlay stays hidden; restored copy repaints correctly (not a device reproduction)');

// Inject a real throw into the actual world upload. Browser event dispatch is
// explicitly modeled; it proves diagnostics wiring, not an iPhone failure.
const hudBase=drawHUD;let hudAfterThrow=0;drawHUD=function(...args){hudAfterThrow++;return hudBase(...args);};
uploadContext.putImageData=function(){throw new Error('Injected world upload failure');};
let caught=false;
try{advance();}catch(error){caught=true;win.dispatch('error',{error,message:error.message});}
assert(caught);assert.equal(hudAfterThrow,0,'a throwing world aborts HUD in the same frame');
assert.equal($('mobileError').hidden,false);assert($('mobileErrorText').textContent.includes('Injected world upload failure'));
const firstError=$('mobileErrorText').textContent;
win.dispatch('unhandledrejection',{reason:new Error('Later failure')});assert.equal($('mobileErrorText').textContent,firstError);
uploadContext.putImageData=nativeUpload;drawHUD=hudBase;advance();
assert.equal($('mobileErrorText').textContent,firstError);
console.log('PASS real source upload fault injection: first error visible, HUD does not run after a world throw, subsequent recovered frame draws, first failure retained');
`,context,{filename:'phone-frame-audit.js'});

// Optional review models: exact game bitmap plus approximate overlay text.
// Native CSS/fonts and Safari screenshots remain unverified.
const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
if(out) {
  const png=require('./png.cjs'),{pxText,pxTextWidth}=vm.runInContext('({pxText,pxTextWidth})',context);
  for(const [w,h] of [[812,375],[375,812]]) {
    const f=fixture();f.context.innerWidth=w;f.context.innerHeight=h;
    f.emit('error',{error:{message:'Injected world upload failure',stack:'pxPresent@https://local.test/src/pixel-world.js:1259:3\nframe@https://local.test/src/main.js:354:3'}});
    const surface=context.makePreview(w,h),lines=['CLASH MOBILE ERROR (V121)'];
    for(const paragraph of f.nodes.mobileErrorText.textContent.split('\n')) {
      let line='';for(const char of paragraph){if(pxTextWidth(line+char)>w-40){lines.push(line);line='';}line+=char;}lines.push(line);
    }
    const bh=22+lines.length*12;surface.rect(8,8,w-16,bh,'#f1ad91');surface.rect(10,10,w-20,bh-4,'#111623');
    lines.forEach((line,i)=>pxText(surface,line,18,18+i*12,i?'#fff0ca':'#f1ad91'));
    surface.rect(0,h-22,w,22,'#111623');pxText(surface,'GENERATED ERROR LAYOUT MODEL',12,h-16,'#b5dce5');
    png(path.join(out,'v121-error-model-'+w+'x'+h+'.png'),surface);
  }
}
