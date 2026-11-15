// Actual mobile scripts/menu/lifecycle, mocked Web Audio. This is not listening
// or a browser autoplay-policy test. Dispatch gesture capture explicitly: the
// memory DOM does not implement event bubbling or trusted user activation.
require('./mobile-lifecycle.cjs');
const {context}=require('./mobile.cjs'),vm=require('node:vm');
vm.runInContext(`
class AudioParamMock {
  constructor(){this.value=0;this.events=[];}
  cancelScheduledValues(){} setValueAtTime(v,t){this.value=v;this.events.push([v,t]);}
  linearRampToValueAtTime(v,t){this.events.push([v,t]);}
  exponentialRampToValueAtTime(v,t){this.events.push([v,t]);}
  setTargetAtTime(v,t){this.value=v;this.events.push([v,t]);}
}
class AudioNodeMock {
  constructor(kind){this.kind=kind;this.links=[];for(const p of ['gain','frequency','Q','threshold','knee','ratio','attack','release'])this[p]=new AudioParamMock();}
  connect(n){this.links.push(n);} disconnect(){this.disconnected=true;}
  start(){this.started=true;} stop(){this.stopped=true;}
}
class MobileAudioMock {
  constructor(){this.state='suspended';this.currentTime=2;this.sampleRate=8000;this.destination={};this.nodes=[];this.handlers={};this.resumes=0;this.allow=true;}
  node(k){const n=new AudioNodeMock(k);this.nodes.push(n);return n;}
  createGain(){return this.node('gain');} createDynamicsCompressor(){return this.node('compressor');}
  createOscillator(){return this.node('osc');} createBufferSource(){return this.node('noise');} createBiquadFilter(){return this.node('filter');}
  createBuffer(c,n){return {getChannelData:()=>new Float32Array(n)};}
  addEventListener(k,f){(this.handlers[k]??=[]).push(f);}
  change(state){this.state=state;for(const f of this.handlers.statechange||[])f();}
  resume(){this.resumes++;if(this.throwResume)throw Error('resume unavailable');if(this.rejectResume)return Promise.reject(Error('gesture rejected'));if(this.allow)this.change('running');return Promise.resolve();}
}
window.AudioContext=MobileAudioMock;
const failures=[];
function audioCase(name,run){
  try {
    toMenu();document.visibilityState='visible';win.dispatch('focus');
    if(typeof mobileAudioStop==='function')mobileAudioStop();
    Object.assign(AUDIO,{ctx:null,master:null,bus:null,noise:null,voices:0,recent:{},mute:false});
    win.dispatch('click',{button:0});run();console.log('PASS audio: '+name);
  } catch(e){failures.push(name+': '+e.message);}
}
audioCase('first menu click unlocks before watch/start',()=>{
  assert(AUDIO.ctx,'first menu click did not create audio');assert.equal(AUDIO.ctx.state,'running');
  tapMenu('watchMode');tapMenu('start');const a=AUDIO.ctx;assert.equal(G.mode,'watch');
  sfx({k:'round'});assert(a.nodes.some(n=>n.started));
});
audioCase('unmute resumes suspended context and updates visible button',()=>{
  initAudio();const a=AUDIO.ctx;setMute(true);a.change('suspended');const count=a.resumes;
  tapMenu('touchMute');assert.equal(a.resumes,count+1);assert.equal(a.state,'running');
  assert.equal($('touchMute').textContent,'MUTE');
  win.dispatch('keydown',{code:'KeyM',repeat:false});assert(AUDIO.mute);
  assert.equal($('touchMute').textContent,'UNMUTE');assert.equal($('touchMute').attributes['aria-pressed'],'true');
  const n=a.nodes.length;sfx({k:'boom'});assert.equal(a.nodes.length,n);
  tapMenu('touchMute');assert(!AUDIO.mute);assert.equal($('touchMute').textContent,'MUTE');
});
audioCase('interrupted context retries on release gesture',()=>{
  initAudio();const a=AUDIO.ctx;a.change('interrupted');const count=a.resumes;
  win.dispatch('pointerup',{pointerType:'touch',button:0});assert.equal(a.resumes,count+1);assert.equal(a.state,'running');
});
audioCase('suspended audio drops effects instead of queuing a return burst',()=>{
  initAudio();const a=AUDIO.ctx;a.allow=false;a.change('suspended');const n=a.nodes.length;
  for(let i=0;i<60;i++)sfx({k:'boom'});assert.equal(a.nodes.length,n);assert.equal(AUDIO.voices,0);
});
audioCase('background silences tails and online events until a fresh gesture',()=>{
  initAudio();const a=AUDIO.ctx;sfx({k:'domain'});const sources=a.nodes.filter(n=>n.started);assert(sources.length);
  G.mode='host';G.running=true;win.dispatch('blur');assert(!G.paused);assert.equal(AUDIO.master.gain.value,0);
  assert(sources.every(n=>n.stopped&&n.disconnected));assert.equal(AUDIO.voices,0);
  const n=a.nodes.length;sfx({k:'boom'});tone(100,60,.1);assert.equal(a.nodes.length,n);
  win.dispatch('focus');sfx({k:'round'});assert.equal(a.nodes.length,n);
  win.dispatch('click',{button:0});sfx({k:'round'});assert(a.nodes.length>n);assert.equal(AUDIO.master.gain.value,.65);
  // Late browser onended must never decrement the voice count twice.
  const active=AUDIO.voices;for(const s of sources)s.onended();assert.equal(AUDIO.voices,active);
});
audioCase('offline Resume and muted return preserve input and sound choices',()=>{
  fresh();initAudio();setMute(true);const a=AUDIO.ctx;
  document.visibilityState='hidden';document.dispatch('visibilitychange');assert(G.paused);
  a.change('suspended');const count=a.resumes;document.visibilityState='visible';document.dispatch('visibilitychange');
  win.dispatch('click',{button:0});tapMenu('resumeBtn');assert(!G.paused);assert(AUDIO.mute);assert.equal(a.resumes,count);
  assert.equal(input(),0);tapMenu('touchMute');assert.equal(a.state,'running');assert(!AUDIO.mute);
  pointer('pointerdown','P');advance(2);assert.equal(G.S.f[0].move,'p1');pointer('pointerup','P');
});
audioCase('OS interruption disposes active voices and pending resume stays silent',()=>{
  initAudio();const a=AUDIO.ctx;sfx({k:'domain'});const old=a.nodes.filter(n=>n.started);
  a.allow=false;a.change('interrupted');assert.equal(AUDIO.voices,0);assert(old.every(n=>n.stopped&&n.disconnected));
  const n=a.nodes.length;win.dispatch('click',{button:0});sfx({k:'hit',a:50});assert.equal(a.nodes.length,n);
  a.allow=true;win.dispatch('pointerup',{pointerType:'touch',button:0});sfx({k:'hit',a:50});assert(AUDIO.voices>0);
  mobileAudioStop();assert.equal(AUDIO.voices,0);for(const s of old)s.onended();assert.equal(AUDIO.voices,0);
});
audioCase('no audio API and failed resume stay optional and retryable',()=>{
  initAudio();const a=AUDIO.ctx;a.change('suspended');a.throwResume=true;
  assert.doesNotThrow(()=>win.dispatch('click',{button:0}));a.throwResume=false;a.rejectResume=true;
  assert.doesNotThrow(()=>win.dispatch('pointerup',{pointerType:'touch',button:0}));a.rejectResume=false;
  win.dispatch('click',{button:0});assert.equal(a.state,'running');
  Object.assign(AUDIO,{ctx:null,master:null,bus:null});delete window.AudioContext;
  assert.doesNotThrow(()=>win.dispatch('click',{button:0}));assert.doesNotThrow(()=>setMute(false));
  window.AudioContext=MobileAudioMock;
});
assert.deepEqual(failures,[],'mobile audio audit failures:\\n'+failures.join('\\n'));
console.log('PASS mobile audio: gesture routes, suspended/interrupted retries, visible mute state, no suspended queue, background voice disposal and optional API failures');
`,context);

const preview=process.argv.find(a=>a.startsWith('--preview-dir='));
if(preview){
  const dir=preview.slice('--preview-dir='.length),path=require('node:path'),fs=require('node:fs'),png=require('./png.cjs');
  fs.mkdirSync(dir,{recursive:true});
  for(const [w,h] of [[667,375],[844,390],[390,844]])for(const muted of [false,true]){
    vm.runInContext(`setMute(${muted});`,context);
    const surface=context.makePreview(w,h);
    png(path.join(dir,`v111-${muted?'muted':'sound'}-${w}x${h}.png`),surface);
  }
}
