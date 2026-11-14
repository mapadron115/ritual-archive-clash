// Web Audio scheduling/graph checks. Mocked nodes do not constitute listening.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),main=fs.readFileSync(path.join(root,'src/main.js'),'utf8');
const source=main.slice(main.indexOf('const AUDIO ='),main.indexOf('// ---------- menus'));
class Param {
  constructor(value=0){this.value=value;this.events=[];}
  setValueAtTime(v,t){assert(Number.isFinite(v)&&Number.isFinite(t));this.events.push(['set',v,t]);}
  exponentialRampToValueAtTime(v,t){assert(v>0);this.events.push(['exp',v,t]);}
  linearRampToValueAtTime(v,t){this.events.push(['linear',v,t]);}
  cancelScheduledValues(t){this.events=this.events.filter(e=>e[2]<t);}
  setTargetAtTime(v,t,c){this.events.push(['target',v,t,c]);}
}
class Node {
  constructor(kind){this.kind=kind;this.links=[];for(const p of ['gain','frequency','Q','threshold','knee','ratio','attack','release'])this[p]=new Param();}
  connect(node){this.links.push(node);return node;}
  disconnect(){this.links=[];this.disconnected=true;}
  start(t){this.startTime=t;}
  stop(t){this.stopTime=t;}
}
class Audio {
  constructor(){this.currentTime=0;this.sampleRate=48000;this.state='suspended';this.nodes=[];this.destination={};this.buffers=0;}
  node(k){const n=new Node(k);this.nodes.push(n);return n;}
  createGain(){return this.node('gain');}createDynamicsCompressor(){return this.node('compressor');}
  createOscillator(){return this.node('osc');}createBufferSource(){return this.node('noise');}createBiquadFilter(){return this.node('filter');}
  createBuffer(c,n){this.buffers++;const data=new Float32Array(n);return {getChannelData(){return data;}};}
  resume(){this.resumed=true;this.state='running';return Promise.resolve();}
}
const context=vm.createContext({console,assert,window:{AudioContext:Audio}});
vm.runInContext('function clamp(v,a,b){return Math.max(a,Math.min(b,v));}\n'+source,context);
vm.runInContext(`
initAudio();assert(AUDIO.ctx.resumed);const a=AUDIO.ctx;
assert.equal(AUDIO.bus.links[0],AUDIO.master);assert.equal(AUDIO.master.links[0],a.destination);
assert.equal(AUDIO.master.gain.value,.65);assert.equal(AUDIO.bus.ratio.value,6);
function finish(){for(const n of a.nodes)if(n.onended&&!n.finished){n.finished=true;n.onended();assert(n.disconnected);}}
function capture(k,damage){a.currentTime+=2;const n=a.nodes.length;sfx({k,a:damage});const out=a.nodes.slice(n);finish();return out;}
const light=capture('hit',32),heavy=capture('hit',110),block=capture('block',0);
assert(heavy.find(n=>n.kind==='osc').frequency.events[0][1]<light.find(n=>n.kind==='osc').frequency.events[0][1]);
assert(heavy.filter(n=>n.kind==='gain')[1].gain.events.at(-1)[2]-heavy[0].startTime>light.filter(n=>n.kind==='gain')[1].gain.events.at(-1)[2]-light[0].startTime);
assert(block.find(n=>n.kind==='osc').frequency.events[0][1]>700);
assert.equal(a.buffers,1,'noise buffer should be reused');
const cases=['hit','blackflash','block','break','whoosh','clap','slash','rain','blast','beam','nuke','charge','boom','hum','summon','zap','inf','jump','land','thud','wall','ko','round','fight','domain','clash','nope','word','counter','stop','dash','cuts'];
for(const k of cases){const out=capture(k,80);assert(out.some(n=>n.kind==='osc'||n.kind==='noise'),'silent '+k);}
for(const n of a.nodes.filter(n=>n.startTime!==undefined)){
  assert(n.stopTime>n.startTime&&n.stopTime-n.startTime<=1.21);
  assert(n.disconnected); // ended nodes, filters and envelopes all release
}
assert.equal(AUDIO.voices,0);
a.currentTime+=2;sfx({k:'hit',a:50});const count=a.nodes.length;sfx({k:'hit',a:50});assert.equal(a.nodes.length,count,'duplicate burst should coalesce');
setMute(true);assert.equal(AUDIO.master.gain.events.at(-1)[1],0);sfx({k:'boom'});assert.equal(a.nodes.length,count,'mute should prevent new voices');
setMute(false);assert.equal(AUDIO.master.gain.events.at(-1)[1],.65);finish();
for(let n=0;n<200;n++)tone(100,40,.1,'sine',.1);assert.equal(AUDIO.voices,48);finish();assert.equal(AUDIO.voices,0);
assert.equal(a.buffers,1);
globalThis.previewLayers=[light,heavy,block].map(nodes=>nodes.filter(n=>n.kind==='gain').map(n=>n.gain.events));
console.log('PASS 32 sound event families; damage-dependent layers, graph/compressor, attack envelopes, cached noise, mute tails, resume, coalescing, 48-voice cap and node disposal');
`,context);
const unavailable=vm.createContext({window:{}});vm.runInContext(source+'\ninitAudio();sfx({k:"hit",a:32});setMute(true);',unavailable);
const rejected=class extends Audio {resume(){return Promise.reject(new Error('gesture required'));}};
const denied=vm.createContext({window:{AudioContext:rejected}});vm.runInContext(source+'\ninitAudio();',denied);
console.log('PASS missing Web Audio and rejected resume remain nonfatal');
if(process.argv[2]) {
  const out=process.argv[2],writePNG=require('./png.cjs');
  const pix=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(root,'src/pixel.js'),'utf8'),pix);
  pix.layers=context.previewLayers;
  vm.runInContext(`
  globalThis.sheet=new PixelSurface(1200,620);sheet.rect(0,0,1200,620,'#171f30');
  pxText(sheet,'V13 / SOUND LAYER ENVELOPES',22,18,PX_LIGHT,2);
  pxText(sheet,'MOCK SCHEDULE / NOT A BROWSER AUDIO CAPTURE',22,43,'#8ed9e1');
  ['LIGHT HIT / 32','HEAVY HIT / 110','GUARD BLOCK'].forEach((title,row)=>{
    const y=80+row*175;pxText(sheet,title,22,y,PX_LIGHT,2);
    sheet.line([24,y+128],[1170,y+128],'#526278');
    pxText(sheet,'0 MS',24,y+139,PX_LIGHT);pxText(sheet,'250 MS',1100,y+139,PX_LIGHT);
    layers[row].forEach((events,n)=>{
      const peak=events.find(e=>e[0]==='linear'),end=events.at(-1),start=events[0][2],dur=end[2]-start;
      let prev=[24,y+128];
      for(let i=0;i<=250;i++){
        const t=i/1000,v=t>.25||t>dur?0:t<.002?.0001+(peak[1]-.0001)*t/.002:peak[1]*Math.pow(.0001/peak[1],(t-.002)/(dur-.002));
        const pt=[24+i*4.5,y+128-v*290];sheet.line(prev,pt,['#edaa67','#8ed9e1','#d7b2ce'][n%3],2);prev=pt;
      }
    });
  });`,pix);
  writePNG(path.join(out,'v13-sound-envelopes.png'),pix.sheet);
  const html='<!doctype html><meta charset="utf-8"><title>Clash v13 sound review</title><style>body{background:#171f30;color:#f8edce;font:18px monospace;max-width:850px;margin:40px auto}button{font:inherit;padding:12px;margin:6px;background:#28364a;color:#f8edce;border:2px solid #8ed9e1}</style><h1>Clash v13 sound review</h1><p>Actual game synthesizer, isolated for browser listening. No sound has been judged by a person yet. Click a button to activate audio.</p><div id="buttons"></div><p><button onclick="setMute(!AUDIO.mute);this.textContent=AUDIO.mute?\'Unmute\':\'Mute\'">Mute</button></p><script>function clamp(v,a,b){return Math.max(a,Math.min(b,v));}\n'+source+'\n'+`for(const [title,k,a]of [['Light hit','hit',32],['Heavy hit','hit',110],['Block','block',0],['Guard break','break',0],['Black Flash','blackflash',0],['Landing','land',0],['Knockdown','thud',0],['Wall impact','wall',0],['Domain','domain',0]]){const b=document.createElement('button');b.textContent=title;b.onclick=()=>{initAudio();sfx({k,a});};document.getElementById('buttons').appendChild(b);}`+'</script>';
  fs.writeFileSync(path.join(out,'v13-sound-preview.html'),html);
}
