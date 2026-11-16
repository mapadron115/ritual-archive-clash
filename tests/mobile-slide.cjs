// Synthetic captured thumb slides in the real mobile HTML/main loop. No phone.
const vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {context,root}=require('./mobile.cjs'),writePNG=require('./png.cjs');
vm.runInContext(`
// Client rectangles follow the placed CSS boxes. This shell is not a CSS engine.
for(const b of buttons)b.getBoundingClientRect=()=>({left:parseFloat(b.style.left),top:parseFloat(b.style.top),right:parseFloat(b.style.left)+parseFloat(b.style.width),bottom:parseFloat(b.style.top)+parseFloat(b.style.height)});
const slideFailures=[];
const slideCase=(name,run)=>{try{toMenu();fresh();run();console.log('PASS slide: '+name);}catch(e){slideFailures.push(name+': '+e.message);}};
function drag(owner,to,id=1,extra={}) {
  const r=typeof to==='string'?button(to).getBoundingClientRect():to;
  let prevented=false;
  button(owner).dispatch('pointermove',{pointerId:id,pointerType:'touch',clientX:(r.left+r.right)/2,clientY:(r.top+r.bottom)/2,preventDefault(){prevented=true;},...extra});
}
const heldBits=()=>input()&((1<<INPUT_SHIFT)-1);
slideCase('one captured thumb reverses and guards without lifting at phone sizes',()=>{
  for(const [w,h,safe] of [[667,375,{}],[844,390,{}],[844,390,{left:44,right:44,bottom:21}]]) {
    innerWidth=w;innerHeight=h;getComputedStyle=()=>({paddingLeft:safe.left||0,paddingRight:safe.right||0,paddingBottom:safe.bottom||0});mobileResize();fresh();
    pointer('pointerdown','L');assert.equal(heldBits(),BTN.L);
    drag('L','G');assert.equal(heldBits(),BTN.G,'thumb remains LEFT over GUARD');
    drag('L','R');assert.equal(heldBits(),BTN.R,'thumb remains LEFT over RIGHT');
    assert(button('L').hasPointerCapture(1));assert(!button('R').hasPointerCapture(1));
    assert.equal(button('L').dataset.pressed,'false');assert.equal(button('R').dataset.pressed,'true');
    pointer('pointerup','L');assert.equal(input(),0);assert.equal(MOBILE.pointers.size,0);
  }
  getComputedStyle=()=>({});
});
slideCase('leaving the row and its six-pixel gaps is neutral; reentry works',()=>{
  pointer('pointerdown','R');input();
  const l=button('L').getBoundingClientRect(),g=button('G').getBoundingClientRect();
  drag('R',{left:l.right,right:g.left,top:l.top,bottom:l.bottom});assert.equal(input(),0,'gap must release');
  for(const key of ['U','P','K','A1','A2','A3','DOM']){drag('R',key);assert.equal(input(),0,'slide activated '+key);}
  drag('R',{left:-100,right:-100,top:-100,bottom:-100});assert.equal(input(),0);
  drag('R','L');assert.equal(heldBits(),BTN.L);pointer('pointerup','R');assert.equal(input(),0);
});
slideCase('captured up/cancel/loss and lifecycle clear the current button and neutral contact',()=>{
  for(const end of ['pointerup','pointercancel','lostpointercapture'])for(const destination of ['G','R','P']) {
    fresh();pointer('pointerdown','L');input();drag('L',destination);input();pointer(end,'L');
    assert.equal(input(),0);assert.equal(MOBILE.pointers.size,0);assert(!button('L').hasPointerCapture(1));
  }
  for(const stop of [()=>togglePause(),()=>win.dispatch('blur'),()=>show('online'),()=>startFight(),()=>mobileResize(),()=>toSelect()]) {
    fresh();pointer('pointerdown','L');drag('L','P');stop();assert.equal(MOBILE.pointers.size,0);assert(!button('L').hasPointerCapture(1));
    drag('L','R');assert.equal(input(),0,'stale move revived input');
  }
});
slideCase('two thumbs share buttons without releasing or replaying each other',()=>{
  pointer('pointerdown','L',1);pointer('pointerdown','R',2);input();drag('L','R',1);
  assert.equal(input(),BTN.R,'already-held RIGHT gained an edge');
  pointer('pointerup','R',2);assert.equal(input(),BTN.R);pointer('pointerup','L',1);assert.equal(input(),0);
  fresh();pointer('pointerdown','L',1);pointer('pointerdown','L',2);input();drag('L','R',1);
  assert.equal(heldBits(),BTN.L|BTN.R);pointer('pointercancel','L',1);assert.equal(input(),BTN.L);pointer('pointerup','L',2);assert.equal(input(),0);
});
slideCase('same-cell moves do not repeat edges; slides before a tick discard old direction',()=>{
  pointer('pointerdown','L');input();for(let n=0;n<15;n++){drag('L','L');assert.equal(input(),BTN.L);}
  fresh();pointer('pointerdown','L');drag('L','R');assert.equal(input(),BTN.R|(BTN.R<<INPUT_SHIFT));
  drag('L','G');assert.equal(input(),BTN.G|(BTN.G<<INPUT_SHIFT));
  drag('L','G');assert.equal(input(),BTN.G);
});
slideCase('late capture-loss cannot release a recaptured thumb; freeze keeps a separate punch tap',()=>{
  pointer('pointerdown','L');drag('L','R');input();
  pointer('pointerdown','L');input();
  button('L').dispatch('lostpointercapture',{pointerId:1,preventDefault(){}});
  assert.equal(input(),BTN.L);assert(button('L').hasPointerCapture(1));
  fresh();G.S.freeze=5;pointer('pointerdown','L');drag('L','G');
  pointer('pointerdown','P',2);pointer('pointerup','P',2);drag('L','R');advance(9);
  assert.equal(G.S.f[0].move,'p1');assert.equal(G.S.f[0].prev&BTN.R,BTN.R);
  pointer('pointercancel','L');assert.equal(input(),0);
});
slideCase('independent attack/jump contacts and mouse clicks retain original holds',()=>{
  pointer('pointerdown','R');pointer('pointerdown','P',2);drag('R','L');advance(2);
  assert.equal(G.S.f[0].move,'p1');assert.equal(G.S.f[0].prev&BTN.L,BTN.L);assert.equal(G.S.f[0].prev&BTN.R,0);
  pointer('pointerup','R');assert.equal(heldBits(),BTN.P);pointer('pointerup','P',2);
  fresh();pointer('pointerdown','L');pointer('pointerdown','U',2);drag('L','R');advance(2);assert(G.S.f[0].y<GROUND);assert.equal(G.S.f[0].prev&BTN.R,BTN.R);
  for(const key of ['P','K','U','A1','A2','A3','DOM']){fresh();pointer('pointerdown',key);input();drag(key,'R');assert.equal(input(),BTN[key]);}
  fresh();pointer('pointerdown','L',1,{pointerType:'mouse'});input();drag('L','R',1,{pointerType:'mouse'});assert.equal(input(),BTN.L);
});
slideCase('real main-loop reversal and guard plus guest packet use the new held bit',()=>{
  const world=drawWorld,hud=drawHUD;drawWorld=()=>{};drawHUD=()=>{};
  try {
    pointer('pointerdown','L');const x=G.S.f[0].x;advance(4);assert(G.S.f[0].x<x);
    drag('L','R');const y=G.S.f[0].x;advance(4);assert(G.S.f[0].x>y,'reversal never reached simulation');
    drag('L','G');advance(2);assert.equal(G.S.f[0].st,'guard');
    const packets=[],handlers={},connection={open:true,send(m){packets.push(JSON.parse(JSON.stringify(m)));},on(k,f){handlers[k]=f;}};
    netWire(connection,'guest');handlers.open();fresh('guest');packets.length=0;
    pointer('pointerdown','L');advance();drag('L','R');advance();
    const mask=packets.filter(m=>m.t==='in').at(-1).b;assert.equal(mask,BTN.R|(BTN.R<<INPUT_SHIFT));
    pointer('pointerup','L');advance();assert.equal(packets.filter(m=>m.t==='in').at(-1).b,0);
  } finally {drawWorld=world;drawHUD=hud;}
});
globalThis.slideAuditFailures=slideFailures;
globalThis.slidePreview=(w,h)=>makePreview(w,h,undefined,0,100,{key:'L',held:true,run(){drag('L','R');}});
`,context);
console.log('Slide audit findings:',context.slideAuditFailures);
if(!process.argv.includes('--preview-only'))assert.deepEqual(Array.from(context.slideAuditFailures),[]);
const css=fs.readFileSync(path.join(root,'mobile/mobile.css'),'utf8');
assert(!css.includes('#touchControls button:active'),'native :active would light the original capture button throughout a slide');
assert(css.includes('#touchControls button:not([data-input]):active'),'MOVES and MUTE retain native touch feedback');
console.log('PASS static slide CSS: fight contact follows JS held state; menu controls retain native active styling (browser behavior unverified)');
const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6),kind=process.argv.includes('--slide-baseline')?'before':'after';
if(out){for(const [w,h] of [[667,375],[844,390]])writePNG(path.join(out,`v126-${kind}-slide-${w}x${h}.png`),context.slidePreview(w,h));writePNG(path.join(out,`v126-${kind}-portrait.png`),context.makePreview(390,844));}
