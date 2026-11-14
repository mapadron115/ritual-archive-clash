// Executes the real HTML script order and main loop with a memory canvas / small DOM shell.
// This is integration scripting, not a real-browser or human-play test.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const writePNG=require('./png.cjs'),root=path.join(__dirname,'..');
class Canvas {
  constructor(w=300,h=150){this.width=w;this.height=h;this.buffer=null;this.context=new Context(this);}
  getContext(){return this.context;}
  setAttribute(){}
  pixels(){if(!this.buffer||this.buffer.length!==this.width*this.height*4)this.buffer=new Uint8ClampedArray(this.width*this.height*4);return this.buffer;}
}
class Context {
  constructor(canvas){this.canvas=canvas;this.imageSmoothingEnabled=true;}
  save(){} restore(){}
  createImageData(w,h){return {width:w,height:h,data:new Uint8ClampedArray(w*h*4)};}
  putImageData(image,x,y){const out=this.canvas.pixels();for(let j=0;j<image.height;j++)out.set(image.data.subarray(j*image.width*4,(j+1)*image.width*4),((y+j)*this.canvas.width+x)*4);}
  drawImage(image,x,y,w=image.width,h=image.height){
    const out=this.canvas.pixels(),src=image.pixels();
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){
      const a=(Math.floor(j*image.height/h)*image.width+Math.floor(i*image.width/w))*4,b=((y+j)*this.canvas.width+x+i)*4;
      if(src[a+3])for(let k=0;k<4;k++)out[b+k]=src[a+k];
    }
  }
}
const nodes=new Map(),events={};
const element=id=>({id,style:{setProperty(){}},children:[],_html:'',set innerHTML(value){this._html=value;this.children=[];},get innerHTML(){return this._html;},textContent:'',attributes:{},setAttribute(key,value){this.attributes[key]=value;},appendChild(child){this.children.push(child);},focus(){document.activeElement=this;}});
const cv=new Canvas(1280,720);nodes.set('cv',cv);
for(const id of ['title','select','online','pause','over'])nodes.set(id,element(id));
const document={visibilityState:'visible',getElementById(id){if(!nodes.has(id))nodes.set(id,element(id));return nodes.get(id);},querySelectorAll(){return ['title','select','online','pause','over'].map(id=>nodes.get(id));},createElement(tag){return tag==='canvas'?new Canvas():element(tag);},head:element('head')};
const context=vm.createContext({console,assert,document,window:{},setTimeout(){},requestAnimationFrame(){},addEventListener(name,fn){events[name]=fn;}});
context.events=events;
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script src="([^"?]+)\?v=(\d+)"><\/script>/g)];
assert.equal(scripts.length,11);assert.equal(new Set(scripts.map(m=>m[2])).size,1);
for(const m of scripts)vm.runInContext(fs.readFileSync(path.join(root,m[1]),'utf8'),context,{filename:m[1]});
vm.runInContext(`
assert.equal($('title').style.display,'flex');
pickMode('ai');assert.equal($('col0').children.length,15);assert.equal($('col1').children.length,15);
assert.equal($('stageChoices').children.length,3);
$('stageChoices').children[1].onclick();assert.equal(G.stage,'gallery');assert.equal($('stageChoices').children[1].attributes['aria-pressed'],'true');
assert($('selBasics').innerHTML.includes('Black Flash'));
// All modes retain their controls, selection authority and complete move lists.
let selected=0;
for(const mode of ['ai','local','watch','host','guest']) {
  G.mode=mode;G.pick=[0,1];buildSelect();
  const original=[$('col0').children.slice(),$('col1').children.slice()];
  assert.equal($('start').style.display,mode==='guest'?'none':'');
  assert.equal($('start').textContent,mode==='watch'?'Start exhibition':'Fight');
  assert.equal($('stageChoices').children.every(b=>b.disabled),mode==='guest');
  if(mode==='local')for(const key of ['F','G','R T Y','H',',','.','I O P','/','← / →'])assert($('quickControls').innerHTML.includes(key));
  else if(mode==='watch')assert($('quickControls').innerHTML.includes('exhibition'));
  else for(const key of ['J','K','U I O','L'])assert($('quickControls').innerHTML.includes(key));
  for(let slot=0;slot<2;slot++) {
    const locked=mode==='host'?slot===1:mode==='guest'?slot===0:false;
    assert.equal(original[slot].every(b=>b.disabled),locked);
    for(let ch=0;ch<CH.length;ch++) {
      // Incoming remote choices use the same refresh path; disabled controls stay disabled.
      if(locked){G.pick[slot]=ch;refreshSelection();}else original[slot][ch].onclick();
      assert.equal(G.pick[slot],ch);
      assert.equal(original[slot][ch].attributes['aria-pressed'],'true');
      assert.equal($('col'+slot).children.filter(b=>b.attributes['aria-pressed']==='true').length,1);
      assert(original[slot][ch].attributes['aria-label'].includes(CH[ch].name));
      assert(original[slot][ch].attributes['aria-label'].includes(CH[ch].tech));
      assert(original[slot][ch].children.some(c=>c.getContext),'missing roster portrait');
      assert($('preview'+slot).innerHTML.includes(CH[ch].name));
      assert($('preview'+slot).children.some(c=>c.getContext),'missing full-body preview');
      for(let i=0;i<2;i++) {
        assert.equal($('col'+i).children[0],original[i][0],'selection replaced keyboard focus target');
        for(const a of [...CH[G.pick[i]].arts,CH[G.pick[i]].dom])assert($('detail').innerHTML.includes(a.name),'move list lost '+a.name);
      }
      selected++;
    }
  }
}
G.mode='ai';G.pick=[0,1];buildSelect();
const choices=$('col0').children;
for(const [from,code,to] of [[0,'ArrowLeft',14],[0,'ArrowUp',12],[14,'ArrowRight',0],[14,'ArrowDown',2],[7,'Home',0],[7,'End',14]]) {
  let prevented=false;choices[from].onkeydown({code,preventDefault(){prevented=true;}});
  assert(prevented);assert.equal(document.activeElement,choices[to]);assert.equal(G.pick[0],0,'browsing must wait for activation');
}
choices[14].focus();choices[14].onclick();assert.equal(document.activeElement,choices[14]);assert.equal(G.pick[0],14);
// Both selected costumes, for every build: compare actual menu canvases to their source pixels.
globalThis.selectionAssets=new PixelSurface(1280,1040);selectionAssets.rect(0,0,1280,1040,PX_INK);
pxText(selectionAssets,'V34 / ACTUAL MENU CANVASES / MAIN RIGHT + MIRROR LEFT',16,12,PX_LIGHT,2);
for(let ch=0;ch<CH.length;ch++) {
  G.pick=[ch,ch];refreshSelection();
  const x=(ch%5)*256,y=42+Math.floor(ch/5)*324;
  pxText(selectionAssets,CH[ch].name,x+8,y,PX_LIGHT);
  pxText(selectionAssets,CH[ch].tech,x+8,y+12,PX_KITS[ch].accent);
  for(let i=0;i<2;i++) {
    const canvas=$('preview'+i).children.find(c=>c.getContext),expected=new PixelSurface(144,132);
    expected.rect(0,0,144,132,'#1b293b');expected.rect(10,120,124,2,'#68768a');expected.blit(pxSprite(ch,'idle',i===1),0,0,1,i===1);
    assert.deepEqual(Array.from(canvas.pixels()),Array.from(expected.data));
    selectionAssets.blit(expected,x+56,y+30+i*142);
  }
}
console.log('PASS',selected,'fighter selections across five modes; full move lists, permissions, stable focus, six grid-navigation boundaries and 30 exact costume previews');
G.pick=[0,1];G.stage='gallery';G.mode='ai';buildSelect();
startFight();
for(const f of G.S.f){assert(PX_DOMAIN_BACKDROPS.has(CH[f.ch].dom.kind),'selected Domain was not prewarmed');assert.equal(f.domUsed,0);}
assert.equal(G.S.dom,null);
for(let n=0;n<101;n++){step(G.S,[0,0]);G.S.ev.length=0;}
assert.equal(G.S.stage,'gallery');
frame(17);frame(34);
const key=code=>({code,repeat:false,preventDefault(){}});
events.keydown(key('KeyJ'));events.keyup(key('KeyJ'));frame(51);
assert.equal(G.S.f[0].move,'p1');
togglePause();assert.equal($('pause').style.display,'flex');togglePause();
FX.rings.push({x:10,y:10,r:20,vr:2,t:0,life:20,col:'#fff'});FX.contacts.push({x:10,y:10,dir:1,kind:'hit',t:0,life:14});groundDust({k:'thud',x:600});FX.shake=12;startFight();assert.equal(G.S.stage,'gallery');
assert.equal(FX.rings.length,0);assert.equal(FX.contacts.length,0);assert.equal(FX.dust.length,0);assert.equal(FX.shake,0);
// Serialized host choice, guest menu restrictions, rematch and old-message fallback.
const sent=[],wire={};const conn={open:true,send(m){sent.push(JSON.parse(JSON.stringify(m)));},on(name,fn){wire[name]=fn;}};
G.running=false;netWire(conn,'host');wire.open();
$('stageChoices').children[2].onclick();assert.equal(sent.at(-1).stage,'observatory');
wire.data({t:'stage',stage:'gallery'});assert.equal(G.stage,'observatory','guest cannot change host stage');
startFight();const hostStart=sent.findLast(m=>m.t==='start');assert.equal(hostStart.stage,'observatory');
G.running=false;G.stage='courtyard';netWire(conn,'guest');wire.open();wire.data({t:'stage',stage:'gallery'});
assert.equal(G.stage,'gallery');assert($('stageChoices').children.every(b=>b.disabled));
wire.data(hostStart);assert.equal(G.S.stage,'observatory');newRound(G.S);assert.equal(G.S.stage,'observatory');
wire.data({t:'start',p:[0,1]});assert.equal(G.S.stage,'courtyard','old host message defaults safely');
wire.data({t:'stage',stage:'missing-stage'});assert.equal(G.stage,'courtyard');
G.stage='observatory';G.mode='local';startFight();
G.S.phase='fight';G.S.t=130;G.S.f[0].ch=0;G.S.f[1].ch=14;G.S.f[0].x=400;G.S.f[1].x=880;
frame(68);assert.equal(G.S.f[0].hp,1000);
console.log('PASS real script order, title, fighter/stage selection, start, input-to-frame, pause/resume, rematch, host/guest stage messages and composite canvas presentation');
`,context);
for(let i=3;i<cv.pixels().length;i+=4)assert.equal(cv.pixels()[i],255);
if(process.argv[2])writePNG(path.join(process.argv[2],process.argv[3]||'runtime-frame.png'),{w:cv.width,h:cv.height,data:cv.pixels()});
if(process.argv[2])writePNG(path.join(process.argv[2],'v34-selection-assets.png'),context.selectionAssets);
