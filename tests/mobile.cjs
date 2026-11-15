// Actual mobile HTML/script order and pointer handlers in a memory DOM/canvas.
// Generated previews use the live layout function, not a browser CSS engine.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const writePNG=require('./png.cjs'),root=path.join(__dirname,'..');
const baseline=process.argv.includes('--baseline');
const baselineTouch=baseline?require('node:child_process').execFileSync('git',['show','55a25d1:mobile/touch.js'],{cwd:root,encoding:'utf8'}):null;
class Canvas {
  constructor(w=300,h=150){this.width=w;this.height=h;this.buffer=null;this.style={};this.context=new Context(this);}
  getContext(){return this.context;}setAttribute(){}
  pixels(){if(!this.buffer||this.buffer.length!==this.width*this.height*4)this.buffer=new Uint8ClampedArray(this.width*this.height*4);return this.buffer;}
}
class Context {
  constructor(canvas){this.canvas=canvas;}save(){}restore(){}
  createImageData(w,h){return {width:w,height:h,data:new Uint8ClampedArray(w*h*4)};}
  putImageData(im,x,y){for(let j=0;j<im.height;j++)this.canvas.pixels().set(im.data.subarray(j*im.width*4,(j+1)*im.width*4),((y+j)*this.canvas.width+x)*4);}
  drawImage(im,x,y,w=im.width,h=im.height){const out=this.canvas.pixels(),src=im.pixels();for(let j=0;j<h;j++)for(let i=0;i<w;i++){const a=(Math.floor(j*im.height/h)*im.width+Math.floor(i*im.width/w))*4,b=((y+j)*this.canvas.width+x+i)*4;if(src[a+3])for(let k=0;k<4;k++)out[b+k]=src[a+k];}}
}
function target(id){const handlers={},captures=new Set();return {id,handlers,style:{setProperty(k,v){this[k]=v;}},dataset:{},children:[],attributes:{},textContent:'',className:'',_html:'',classList:{add(){},remove(){}},set innerHTML(v){this._html=v;this.children=[];},get innerHTML(){return this._html;},setAttribute(k,v){this.attributes[k]=v;},appendChild(n){this.children.push(n);},focus(){document.activeElement=this;},setPointerCapture(id){captures.add(id);},hasPointerCapture(id){return captures.has(id);},releasePointerCapture(id){captures.delete(id);this.dispatch('lostpointercapture',{pointerId:id,preventDefault(){}});},addEventListener(k,fn){(handlers[k]??=[]).push(fn);},dispatch(k,e={}){for(const f of handlers[k]||[])f(e);}};}
const html=fs.readFileSync(path.join(root,'mobile/index.html'),'utf8'),nodes=new Map(),win=target('window'),doc=target('document'),timeouts=[];
const buttons=[...html.matchAll(/<button data-input="(\w+)"[^>]*>([^<]+)<\/button>/g)].map(m=>{const b=target(m[1]);b.dataset.input=m[1];b.textContent=m[2];return b;});
assert.equal(buttons.length,10);
for(const b of buttons)if(b.dataset.input==='DOM')nodes.set('domainButton',b);
const cv=new Canvas(1280,720);nodes.set('cv',cv);
const document=Object.assign(doc,{visibilityState:'visible',getElementById(id){if(!nodes.has(id))nodes.set(id,target(id));return nodes.get(id);},querySelectorAll(s){return s==='[data-input]'?buttons:['title','select','online','pause','over'].map(id=>this.getElementById(id));},createElement(tag){return tag==='canvas'?new Canvas():target(tag);},head:target('head')});
const context=vm.createContext({console,assert,document,window:{},performance:{now:()=>0},innerWidth:844,innerHeight:390,getComputedStyle(){return {};},requestAnimationFrame(){},addEventListener:(k,f)=>win.addEventListener(k,f),setTimeout(f,ms){timeouts.push({f,ms});}});
Object.assign(context,{win,buttons,timeouts,baseline});
const scripts=[...html.matchAll(/<script src="([^?]+)\?v=(\d+)"><\/script>/g)];
assert.equal(scripts.length,12);assert.equal(new Set(scripts.map(m=>m[2])).size,1);
for(const m of scripts)vm.runInContext(baseline&&m[1]==='touch.js'?baselineTouch:fs.readFileSync(path.resolve(root,'mobile',m[1]),'utf8'),context,{filename:m[1]});
vm.runInContext(`
let now=0;
performance.now=()=>now;
const advance=(n=1)=>{for(let t=0;t<n;t++)frame(now+=1000/60);};
const button=k=>buttons.find(b=>b.dataset.input===k);
const pointer=(type,k,id=1,extra={})=>{let prevented=false;if(type==='lostpointercapture')button(k).releasePointerCapture(id);button(k).dispatch(type,{pointerId:id,pointerType:'touch',button:0,preventDefault(){prevented=true;},...extra});assert(prevented);};
const fresh=(mode='ai',ch=0)=>{win.dispatch('focus');G.mode=mode;G.pick=[ch,1];startFight();G.S.phase='fight';G.S.intro=0;G.S.freeze=0;G.S.f[1].x=1050;};
const input=()=>readKeys(BIND.solo);
fresh();pointer('pointerdown','P');pointer('pointerup','P');assert.equal(input(),BTN.P<<INPUT_SHIFT);assert.equal(input(),0);
// Two contacts on one button cannot release each other or add repeated edges.
pointer('pointerdown','R',1);pointer('pointerdown','R',2);assert.equal(input(),BTN.R|(BTN.R<<INPUT_SHIFT));pointer('pointerup','R',1);assert.equal(input(),BTN.R);pointer('pointerup','R',2);assert.equal(input(),0);
// Real simultaneous move+attack reaches step through the shared main loop.
fresh();const startX=G.S.f[0].x;pointer('pointerdown','R',1);pointer('pointerdown','P',2);advance(2);assert.equal(G.S.f[0].move,'p1');assert.equal(G.S.f[0].prev&BTN.R,BTN.R);assert.equal(G.S.f[0].prev&BTN.P,BTN.P);
pointer('pointerup','P',2);advance(50);assert(G.S.f[0].x>startX);assert.equal(G.S.f[0].move,null);pointer('pointerup','R',1);
for(const k of Object.keys(BTN)){fresh();pointer('pointerdown',k);assert.equal(input(),BTN[k]|(BTN[k]<<INPUT_SHIFT));assert.equal(input(),BTN[k]);pointer('pointerup',k);assert.equal(input(),0);}
for(const k of ['U','G','P','K','A1','A2','A3','DOM']) {fresh();if(k==='DOM')G.S.f[0].gauge=GAUGE_MAX;pointer('pointerdown',k);advance(2);const f=G.S.f[0];if(k==='U')assert(f.y<GROUND);if(k==='G')assert.equal(f.st,'guard');if(k==='P')assert.equal(f.move,'p1');if(k==='K')assert.equal(f.move,'k');if(k.startsWith('A'))assert(f.cd[Number(k[1])-1]>0);if(k==='DOM')assert.equal(f.domUsed,1);pointer('pointerup',k);}
// Short presses survive an impact pause, without repeating a held attack.
fresh();G.S.freeze=5;pointer('pointerdown','P');pointer('pointerup','P');advance(9);assert.equal(G.S.f[0].move,'p1');advance(60);assert.equal(G.S.f[0].move,null);
for(const kind of ['pointercancel','lostpointercapture']){fresh();pointer('pointerdown','P');pointer(kind,'P');assert.equal(input(),0);}
fresh();pointer('pointerdown','R',1);pointer('pointerdown','P',2);pointer('pointercancel','P',2);assert.equal(input(),BTN.R|(BTN.R<<INPUT_SHIFT));pointer('pointerup','R',1);
fresh();pointer('pointerdown','P',1,{pointerType:'mouse',button:2});assert.equal(input(),0);
for(const stop of [()=>win.dispatch('blur'),()=>{document.visibilityState='hidden';document.dispatch('visibilitychange');document.visibilityState='visible';},()=>togglePause(),()=>show('online'),()=>startFight(),()=>toSelect()]){fresh();pointer('pointerdown','P');pointer('pointerdown','R',2);stop();assert.equal(input(),0);assert.equal(MOBILE.pointers.size,0);pointer('pointerup','P');assert.equal(input(),0);}
fresh();togglePause();pointer('pointerdown','P');assert.equal(input(),0);togglePause();G.over=true;pointer('pointerdown','P');assert.equal(input(),0);
fresh('watch');pointer('pointerdown','P');assert.equal(input(),0);advance(5);assert(G.S.t>0);
fresh();pointer('pointerdown','R');innerWidth=390;innerHeight=844;mobileResize();assert(MOBILE.portrait);assert(G.paused);assert.equal(input(),0);innerWidth=844;innerHeight=390;mobileResize();assert(G.paused);togglePause();assert(!G.paused);
// Host input still uses real transport encoding; guest taps cross the wire.
const sent=[],wire={},conn={open:true,send(m){sent.push(JSON.parse(JSON.stringify(m)));},on(k,f){wire[k]=f;}};
netWire(conn,'guest');wire.open();fresh('guest');pointer('pointerdown','R',1);pointer('pointerdown','P',2);advance();const packet=sent.filter(m=>m.t==='in').at(-1);assert.equal(packet.b,(BTN.R|BTN.P)|((BTN.R|BTN.P)<<INPUT_SHIFT));
pointer('pointerup','R',1);pointer('pointerup','P',2);advance();assert.equal(sent.filter(m=>m.t==='in').at(-1).b,0);
fresh('host');wire.data({t:'in',b:packet.b});assert.equal(readRemote(),packet.b);pointer('pointerdown','K');advance(2);assert.equal(G.S.f[0].move,'k');
innerWidth=390;innerHeight=844;mobileResize();assert(!G.paused);assert($('rotateNote').textContent.includes('continues'));innerWidth=844;innerHeight=390;mobileResize();
// All fifteen fighters keep their own arts, with honest Maximum labels.
for(let ch=0;ch<15;ch++){fresh('ai',ch);if(baseline)assert.equal($('domainButton').textContent,CH[ch].dom.maximum?'MAXIMUM':'DOMAIN');else assert(MOBILE.views.get('DOM').detail.textContent.startsWith(CH[ch].dom.maximum?'MAXIMUM':'DOMAIN'));}
if(!baseline) {
  // Every displayed card state is read-only and the lower HUD is transparent;
  // native upper health/CE/guard pixels stay exactly as the desktop renderer.
  for(let ch=0;ch<15;ch++) {
    fresh('ai',ch);const before=JSON.stringify(G.S),s=mobileHUDSurface(G.S,labels()),desktop=pxHUDSurface(G.S,labels());
    assert.equal(JSON.stringify(G.S),before);
    assert.deepEqual(s.data.subarray(78*640*4,307*640*4),desktop.data.subarray(78*640*4,307*640*4));
    for(const [x,w] of [[0,271],[369,271]])for(let y=0;y<78;y++)assert.deepEqual(s.data.subarray((y*640+x)*4,(y*640+x+w)*4),desktop.data.subarray((y*640+x)*4,(y*640+x+w)*4));
    assert(s.data.subarray(307*640*4).every(v=>v===0));
    const states=mobileArtStates(G.S,0);
    for(const [key,state] of Object.entries(states)) {
      assert(pxWrap(state.short,74).length<=2,state.short+' exceeds two button lines');
      assert(button(key).attributes['aria-label'].includes(state.name));
      assert.equal(MOBILE.views.get(key).status.textContent,state.status);
      assert.equal(MOBILE.views.get(key).detail.textContent,state.detail);
    }
  }
  fresh();pointer('pointerdown','A1');advance(2);pointer('pointerup','A1');
  assert(MOBILE.views.get('A1').status.textContent.startsWith('WAIT '));
  const earlyFill=parseFloat(button('A1').style['--fill']);advance(12);assert(parseFloat(button('A1').style['--fill'])>earlyFill);
  fresh();G.S.f[0].ce=0;mobileUpdateControls(G.S);assert.equal(MOBILE.views.get('A1').status.textContent,'NEED 20 CE');
  pointer('pointerdown','A1');advance(2);pointer('pointerup','A1');assert.equal(button('A1').dataset.denied,'true');
  G.S.f[0].ce=MAXCE;mobileUpdateControls(G.S);assert.equal(MOBILE.views.get('A1').status.textContent,'READY');assert.equal(button('A1').dataset.denied,'false');
  fresh('ai',5);G.S.f[0].hp=1;mobileUpdateControls(G.S);assert.equal(MOBILE.views.get('A1').status.textContent,'LOW HP');
  fresh('ai',7);assert.equal(MOBILE.views.get('A2').status.textContent,'NEED NAIL');assert.equal(MOBILE.views.get('A3').status.textContent,'HIT FIRST');
  fresh('ai',11);assert.equal(MOBILE.views.get('A2').status.textContent,'NEED GUM');
  fresh();G.S.f[0].y=GROUND-80;mobileUpdateControls(G.S);assert.equal(MOBILE.views.get('A1').status.textContent,'LAND FIRST');
  fresh('ai',3);G.S.dom={k:'garden',o:0};G.S.freeze=0;mobileUpdateControls(G.S);assert.equal(MOBILE.views.get('A1').detail.textContent,'0 CE');assert.equal(MOBILE.views.get('A1').status.textContent,'FREE CE');
  fresh('ai',2);G.S.f[0].ce=0;G.S.proj.push({k:'stone',o:0});mobileUpdateControls(G.S);assert.equal(MOBILE.views.get('A2').status.textContent,'SWAP STONE');assert.equal(MOBILE.views.get('A2').detail.textContent,'0 CE');
  for(const mode of ['ai','host','guest','watch']) {
    fresh(mode);const me=mode==='guest'?1:0,f=G.S.f[me];
    f.gauge=GAUGE_MAX/2;mobileUpdateControls(G.S);assert.equal(MOBILE.views.get('DOM').detail.textContent,'DOMAIN 50%');assert.equal(MOBILE.views.get('DOM').status.textContent,'OR 30% HP');
    f.hp=maxHp(f)*DOM_HP;mobileUpdateControls(G.S);assert.equal(MOBILE.views.get('DOM').status.textContent,'HP READY');
    f.hp=maxHp(f);f.gauge=GAUGE_MAX;mobileUpdateControls(G.S);assert.equal(MOBILE.views.get('DOM').status.textContent,'FULL READY');
    f.domUsed=1;mobileUpdateControls(G.S);assert.equal(MOBILE.views.get('DOM').status.textContent,'USED 1/1');assert.equal(button('DOM').style['--fill'],'0.0%');
    const before=JSON.stringify(G.S);drawHUD(ctx,G.S,labels());assert.equal(JSON.stringify(G.S),before);
  }
  console.log('PASS mobile overlay: all 60 names/costs/states, upper HUD identity, bottom transparency, real cooldown/denial, setup/air/free-CE/swap/HP/gauge/used, guest slot and read-only rendering');
}
// A complete seeded CPU match from the title route to results and rematch.
// Skip raster uploads during this long main-loop check, retaining real input,
// step, CPU, event handling, result scheduling and menu functions.
const savedWorld=drawWorld,savedHUD=drawHUD;drawWorld=()=>{};drawHUD=()=>{};
pickMode('ai');startFight();G.S=newMatch(0,1,106);G.S.stage=G.stage;
let matchTicks=0;for(;matchTicks<30000&&!G.over;matchTicks++) {
  if(matchTicks%90===0)pointer('pointerdown','P',3);
  if(matchTicks%90===1)pointer('pointerup','P',3);
  advance();
}
assert(G.over,'CPU match failed to finish');assert.equal(G.S.phase,'over');assert(G.S.wins.some(w=>w===2));
for(const t of timeouts.splice(0))t.f();assert.equal($('over').style.display,'flex');assert($('overScore').textContent.includes('First to 2 wins'));
rematch();assert(!G.over);assert.equal(G.S.round,1);assert.equal(input(),0);toMenu();assert(!G.running);drawWorld=savedWorld;drawHUD=savedHUD;
console.log('PASS complete CPU match through touch/main loop:',matchTicks,'frames, results, rematch and title return');
// Phone layout: every hit target >=48 px, separated by >=6 px, inside safe
// bounds. New controls overlay the lower arena and clear all upper meters.
for(const [w,h,safe] of [[844,390,{top:0,right:0,bottom:0,left:0}],[667,375,{top:0,right:0,bottom:0,left:0}],[844,390,{top:0,right:44,bottom:21,left:44}]]) {
  const l=mobileLayout(w,h,safe),rects=Object.values(l.buttons);assert(!l.portrait);
  for(const b of rects){assert(b.w>=48&&b.h>=48);assert(b.x>=safe.left&&b.x+b.w<=w-safe.right);assert(b.y>=(baseline?l.canvas.y+l.canvas.h:l.canvas.y+78*l.canvas.h/360));assert(b.y+b.h<=h-safe.bottom);if(!baseline){assert(b.x>=l.canvas.x&&b.x+b.w<=l.canvas.x+l.canvas.w);assert(b.y+b.h<=l.canvas.y+l.canvas.h);}}
  for(let i=0;i<rects.length;i++)for(let j=0;j<i;j++){const a=rects[i],b=rects[j],gap=baseline?0:6;assert(a.x+a.w+gap<=b.x||b.x+b.w+gap<=a.x||a.y+a.h+gap<=b.y||b.y+b.h+gap<=a.y);}
  if(!baseline){assert(l.canvas.h>=h-safe.top-safe.bottom-1);console.log('Arena',w+'x'+h,JSON.stringify(l.canvas));}
}
console.log('PASS mobile: ten real pointer commands, multi-touch/duplicate contacts, main-loop move+attack, jump/guard/arts/Domain, freeze tap, cleanup, CPU/watch, host/guest encoding, rotation, fifteen Domain labels, 36 safe-area target bounds');
globalThis.makePreview=(w,h,safe={top:0,right:0,bottom:0,left:0},ch=0,ce=100)=>{
  const out=new PixelSurface(w,h);out.rect(0,0,w,h,PX_INK);
  if(h>w){pxText(out,'TURN YOUR PHONE',Math.floor((w-pxTextWidth('TURN YOUR PHONE',2))/2),h/2-30,PX_LIGHT,2);pxText(out,'SIDEWAYS',Math.floor((w-pxTextWidth('SIDEWAYS',2))/2),h/2-8,PX_LIGHT,2);pxText(out,'GENERATED LAYOUT MODEL',12,h-20,'#68768a');return out;}
  innerWidth=w;innerHeight=h;mobileResize();fresh('ai',ch);G.S=newMatch(ch,1,106);G.S.f[0].ce=ce;G.S.phase='fight';G.S.intro=0;FX.banner=null;FX.nope=[0,0];drawWorld(ctx,G.S);drawHUD(ctx,G.S,labels());const l=mobileLayout(w,h,safe),r=l.canvas;
  const pixels=cv.pixels();for(let y=0;y<r.h;y++)for(let x=0;x<r.w;x++){const a=(Math.floor(y*cv.height/r.h)*cv.width+Math.floor(x*cv.width/r.w))*4,b=((y+r.y)*w+x+r.x)*4;out.data.set(pixels.subarray(a,a+4),b);}
  const states=baseline?{}:mobileArtStates(G.S,0);
  for(const [key,b] of Object.entries(l.buttons)) {
    const layer=new PixelSurface(b.w,b.h),state=states[key];
    for(let y=0;y<b.h;y++)for(let x=0;x<b.w;x++){const d=((b.y+y)*w+b.x+x)*4,border=x<2||x>=b.w-2||y<2||y>=b.h-2,col=border?[104,118,138]:[38,51,70],alpha=baseline?1:border?.6:.4;for(let k=0;k<3;k++)out.data[d+k]=Math.round(col[k]*alpha+out.data[d+k]*(1-alpha));out.data[d+3]=255;}
    if(state){pxWrap(state.short,b.w-8).forEach((t,j)=>pxText(layer,t,(b.w-pxTextWidth(t))/2,5+j*9,PX_LIGHT));pxText(layer,state.detail,(b.w-pxTextWidth(state.detail))/2,31,'#b5dce5');pxText(layer,state.status,(b.w-pxTextWidth(state.status))/2,43,state.ready?'#c3e4b7':'#f1ad91');layer.rect(2,b.h-4,(b.w-4)*state.fill,3,'#b5dce5');}
    else {const text=key==='pause'?'MOVES':key==='mute'?'MUTE':button(key).textContent;pxText(layer,text,(b.w-pxTextWidth(text))/2,(b.h-7)/2,PX_LIGHT);}
    for(let y=0;y<b.h;y++)for(let x=0;x<b.w;x++){const a=(y*b.w+x)*4,d=((b.y+y)*w+b.x+x)*4;if(layer.data[a+3])out.data.set(layer.data.subarray(a,a+4),d);}
  }
  pxText(out,'GENERATED LAYOUT MODEL',Math.floor((w-pxTextWidth('GENERATED LAYOUT MODEL'))/2),h-150,'#68768a');return out;
};
`,context);
const output=process.argv.slice(2).find(a=>!a.startsWith('--'));
if(output) {
  for(const [w,h] of [[844,390],[667,375],[390,844]])writePNG(path.join(output,`v107-${baseline?'before':'after'}-${w}x${h}.png`),context.makePreview(w,h));
  writePNG(path.join(output,`v107-${baseline?'before':'after'}-844x390-safe.png`),context.makePreview(844,390,{top:0,right:44,bottom:21,left:44}));
  if(!baseline)for(const [ch,ce] of [[0,0],[3,100],[7,100],[10,100]])writePNG(path.join(output,`v107-after-667x375-ch${ch}-ce${ce}.png`),context.makePreview(667,375,undefined,ch,ce));
}
// Reuse this real-script-order shell for the mobile menu route audit.
module.exports={context,html,root};

