// Lifecycle callbacks use the actual mobile adapter and shared main loop.
// Connections are memory transports; no phone, browser or WebRTC is implied.
require('./mobile-menu.cjs');
const {context}=require('./mobile.cjs');
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
vm.runInContext(`
const lifecycleConns=[];
function lifecycleWire(mode) {
  netClose();G.running=false;G.paused=false;
  const c={open:true,sent:[],handlers:{},closed:false,
    on(k,f){(this.handlers[k]??=[]).push(f);},
    send(m){this.sent.push(JSON.parse(JSON.stringify(m)));},
    close(){this.closed=true;this.open=false;this.emit('close');},
    emit(k,m){for(const f of this.handlers[k]||[])f(m);}};
  lifecycleConns.push(c);netWire(c,mode);c.emit('open');fresh(mode);return c;
}
// No animation frame is allowed between backgrounding and this assertion.
let c=lifecycleWire('guest');pointer('pointerdown','R',1);pointer('pointerdown','P',2);advance();
assert(c.sent.at(-1).b&BTN.R);const beforeHide=c.sent.length;
document.visibilityState='hidden';document.dispatch('visibilitychange');
assert(c.sent.length>beforeHide,'backgrounding must send neutral input before another frame');
assert.deepEqual(c.sent.at(-1),{t:'in',b:0});assert.equal(MOBILE.pointers.size,0);assert.equal(input(),0);
assert(!button('R').hasPointerCapture(1));assert(!button('P').hasPointerCapture(2));
pointer('pointerdown','K',4);assert.equal(input(),0);assert.equal(MOBILE.pointers.size,0);
document.visibilityState='visible';document.dispatch('visibilitychange');
advance();assert.equal(c.sent.at(-1).b,0);
pointer('pointerup','R',1);pointer('pointerup','P',2);assert.equal(input(),0);
pointer('pointerdown','R',3);assert(input()&BTN.R);pointer('pointerup','R',3);
pointer('pointerdown','R',3);advance();const heartbeats=c.sent.length;advance(8);
assert(c.sent.length>heartbeats);assert.equal(c.sent.at(-1).b,BTN.R);pointer('pointerup','R',3);
pointer('pointerdown','R',5);clearInput();pointer('pointerdown','P',5);
button('R').dispatch('lostpointercapture',{pointerId:5,preventDefault(){}});
button('P').dispatch('lostpointercapture',{pointerId:5,preventDefault(){}});
assert(input()&BTN.P,'old capture-loss notifications must not cancel a fresh press');pointer('pointerup','P',5);
// Offline return always requires Resume, including page-cache restoration.
for(const event of ['blur','pagehide','freeze']) {
  toMenu();fresh();pointer('pointerdown','R');const tick=G.S.t;
  if(event==='freeze')document.dispatch(event);else win.dispatch(event);
  assert(G.paused,event+' must pause offline play');assert.equal($('stage').attributes['data-screen'],'pause');
  assert.equal(MOBILE.pointers.size,0);assert.equal(input(),0);advance(2);assert.equal(G.S.t,tick);
  win.dispatch('pageshow');win.dispatch('focus');document.dispatch('resume');assert(G.paused);
  togglePause();pointer('pointerdown','P');assert(input()&BTN.P);pointer('pointerup','P');
}
// Online lists and rotation release guest controls synchronously as well.
for(const action of [()=>togglePause(),()=>{innerWidth=390;innerHeight=844;mobileResize();},()=>toSelect()]) {
  c=lifecycleWire('guest');pointer('pointerdown','R');advance();action();
  assert.deepEqual(c.sent.filter(m=>m.t==='in').at(-1),{t:'in',b:0});assert.equal(input(),0);
  innerWidth=844;innerHeight=390;mobileResize();
}
// If a phone is killed before its neutral packet arrives, the host expires
// its held mask. Normal heartbeats refresh that lease; taps never repeat.
c=lifecycleWire('host');performance.now=()=>now;
c.emit('data',{t:'in',b:BTN.R|(BTN.P<<INPUT_SHIFT)});
assert.equal(readRemote(),BTN.R|(BTN.P<<INPUT_SHIFT));assert.equal(readRemote(),BTN.R);
now+=900;assert.equal(readRemote(),BTN.R);
c.emit('data',{t:'in',b:BTN.R});now+=900;assert.equal(readRemote(),BTN.R);
now+=101;assert.equal(readRemote(),0,'missing guest heartbeat must release held input');assert.equal(G.remoteTap,0);
c.emit('data',{t:'in',b:BTN.L|(BTN.K<<INPUT_SHIFT)});assert.equal(readRemote(),BTN.L|(BTN.K<<INPUT_SHIFT));
c.emit('data',{t:'in',b:BTN.R});advance(2);assert(G.S.f[1].prev&BTN.R);
now+=1001;advance(2);assert.equal(G.S.f[1].prev&INPUT_MASK,0);
// Local host backgrounding releases only the local slot. Guest play remains
// live, and remote data received while the host was hidden cannot latch taps.
pointer('pointerdown','R');win.dispatch('blur');assert(!G.paused);assert.equal(input(),0);
c.emit('data',{t:'in',b:BTN.L|(BTN.P<<INPUT_SHIFT)});win.dispatch('focus');
assert.equal(readRemote(),0);assert.equal(input(),0);
c.emit('data',{t:'in',b:BTN.L});assert.equal(readRemote(),BTN.L);
// Selection, disconnects, connection errors and retries invalidate old data,
// pending results and old opens. A second guest cannot take a live room.
for(const event of ['close','error']) {
  c=lifecycleWire('host');pointer('pointerdown','R');c.emit('data',{t:'in',b:BTN.L|(BTN.P<<INPUT_SHIFT)});
  G.S.phase='over';G.S.wins=[2,0];endMatch();c.emit(event,new Error('test transport failure'));
  assert(!G.running);assert.equal(NET.conn,null);assert.equal(input(),0);assert.equal(readRemote(),0);
  assert.equal($('stage').attributes['data-screen'],'online');assert($('netStatus').textContent.length>0);
  for(const t of timeouts.splice(0))t.f();assert.equal($('stage').attributes['data-screen'],'online');
  const next=lifecycleWire('guest');const screen=$('stage').attributes['data-screen'],match=G.S;
  for(const message of [{t:'start',p:[4,5],stage:'gallery'},{t:'select'},{t:'in',b:1023},{t:'s',s:match,e:[]}])c.emit('data',message);
  c.emit('open');c.emit('close');c.emit('error',new Error('stale'));
  assert.equal(NET.conn,next);assert.equal(G.S,match);assert.equal($('stage').attributes['data-screen'],screen);
}
c=lifecycleWire('host');c.emit('data',{t:'in',b:BTN.R});toSelect();assert.equal(readRemote(),0);
c.emit('data',{t:'in',b:BTN.R|(BTN.P<<INPUT_SHIFT)});assert.equal(readRemote(),0);
startFight();assert.equal(readRemote(),0);assert.equal(input(),0);
const intruder={open:true,on(){},close(){this.closed=true;}};netWire(intruder,'host');assert(intruder.closed);assert.equal(NET.conn,c);
toMenu();assert.equal(NET.conn,null);assert.equal(readRemote(),0);
// Use the actual host/join Peer callbacks from the menu harness. Retrying and
// leaving while still connecting must cancel the old attempt before G.mode
// has become an online mode.
G.mode='ai';show('online');hostGame();const abandoned=peers.at(-1);
toMenu();assert(abandoned.destroyed);abandoned.handlers.open();
abandoned.handlers.connection({on(){throw new Error('cancelled room accepted a connection');}});
assert.equal($('stage').attributes['data-screen'],'title');assert.equal(NET.peer,null);
show('online');$('code').value='AMDE';joinGame();const pendingJoin=peers.at(-1);
assert.equal($('netStatus').textContent,'Connecting...');
joinGame();const retryJoin=peers.at(-1);assert(pendingJoin.destroyed);
pendingJoin.handlers.open();pendingJoin.handlers.error({type:'peer-unavailable'});
assert.equal(NET.peer,retryJoin);retryJoin.handlers.open();NET.conn.handlers.open();
assert.equal(G.mode,'guest');assert.equal($('stage').attributes['data-screen'],'select');
NET.conn.handlers.data({t:'start',p:[2,3],stage:'gallery'});assert(G.running);assert.equal(input(),0);toMenu();
G.mode='ai';show('online');hostGame();assert.equal($('netStatus').textContent,'Opening a new room...');
const waiting=peers.at(-1),unopened={open:false,handlers:{},on(k,f){this.handlers[k]=f;}};
waiting.handlers.connection(unopened);unopened.handlers.close();
assert.equal(NET.conn,null);assert(waiting.destroyed);assert.equal($('stage').attributes['data-screen'],'online');
assert($('netStatus').textContent.includes('join again'));unopened.handlers.open();assert.equal(NET.conn,null);
console.log('PASS mobile lifecycle: synchronous guest neutral, offline background pause/resume, page cache, online lists/rotation, host input lease/heartbeat/taps, background host, selection/rematch, close/error/retry/stale callbacks and second-guest rejection');
`,context);

// Illustrative return-to-app views, using the existing fight/menu models.
// Before shows v108's continuing offline fight; after shows the actual pause
// route now required by the callback assertions above. No CSS engine used.
const previewArg=process.argv.find(a=>a.startsWith('--preview-dir='));
if(previewArg) {
  const dir=previewArg.slice('--preview-dir='.length),png=require('./png.cjs');
  fs.mkdirSync(dir,{recursive:true});
  vm.runInContext(`globalThis.lifecyclePreview=(w,h,after)=>{
    const s=after?menuPreview(w,h,'pause'):makePreview(w,h);
    s.rect(0,h-12,w,12,'#101927');
    pxText(s,'LAYOUT MODEL / '+(after?'V109 RETURN: PAUSED':'V108 RETURN: FIGHT CONTINUES'),10,h-10,'#b5dce5');
    return s;
  };`,context);
  for(const [w,h] of [[667,375],[844,390]])for(const after of [false,true])
    png(path.join(dir,`v109-${after?'after':'before'}-return-${w}x${h}.png`),context.lifecyclePreview(w,h,after));
  png(path.join(dir,'v109-after-390x844.png'),context.makePreview(390,844));
}
