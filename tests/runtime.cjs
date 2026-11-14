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
const timeouts=[];
const context=vm.createContext({console,assert,document,window:{},setTimeout(fn,ms){timeouts.push({fn,ms});},requestAnimationFrame(){},addEventListener(name,fn){events[name]=fn;}});
context.timeouts=timeouts;
context.events=events;
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const previewTag=(process.argv[3]||'').match(/^(v\d+)-/)?.[1]||'preview';context.previewTag=previewTag;
const scripts=[...html.matchAll(/<script src="([^"?]+)\?v=(\d+)"><\/script>/g)];
assert.equal(scripts.length,11);assert.equal(new Set(scripts.map(m=>m[2])).size,1);
for(const m of scripts)vm.runInContext(fs.readFileSync(path.join(root,m[1]),'utf8'),context,{filename:m[1]});
// Execute the four actual HTML button routes, rather than a duplicate menu mapping.
const titleHTML=html.slice(html.indexOf('id="title"'),html.indexOf('id="select"'));
const modeActions=[...titleHTML.matchAll(/<button[^>]*onclick="([^"]+)"/g)].map(m=>m[1]);
assert.equal(modeActions.length,4);
context.modeActions=modeActions;
vm.runInContext(`
assert.equal($('title').style.display,'flex');
assert.equal($('stage').attributes['data-screen'],'title');
const logo=$('titleLogo').children[0];assert.equal(logo.width,216);assert.equal(logo.height,76);
const logoPixels=logo.pixels(),logoColors=new Set();let ink=0;
for(let p=0;p<logoPixels.length;p+=4) {
  assert(logoPixels[p+3]===0||logoPixels[p+3]===255,'soft logo alpha');
  if(logoPixels[p+3]){ink++;logoColors.add(Array.from(logoPixels.slice(p,p+3)).join(','));}
}
assert(ink>4000);assert(logoColors.size<=6);
globalThis.titleLogo={w:logo.width,h:logo.height,data:new Uint8ClampedArray(logoPixels)};
// The attract match advances while the title stays open; its labels name the actual actors/stage.
frame(17);assert(G.demo.t>0);assert.equal(G.running,false);
assert.equal($('attractNames').textContent,G.demo.f.map(f=>CH[f.ch].name).join(' vs '));
assert.equal($('attractStage').textContent,'Archive Courtyard');
const firstDemo=G.demo;G.stage='gallery';frame(34);
assert.equal(G.demo,firstDemo);assert.equal($('attractStage').textContent,'Rainlit Gallery');
assert.equal($('title').style.display,'flex');assert.equal(FX.silent,false);
// New exhibitions refresh both names, even when the old one ended behind another menu.
G.demo.phase='over';frame(51);assert.notEqual(G.demo,firstDemo);
assert.notEqual(G.demo.f[0].ch,G.demo.f[1].ch);
assert.equal($('attractNames').textContent,G.demo.f.map(f=>CH[f.ch].name).join(' vs '));
globalThis.attractFrame={w:cv.width,h:cv.height,data:new Uint8ClampedArray(cv.pixels())};
for(let i=0;i<modeActions.length;i++) {
  eval(modeActions[i]);
  assert.equal($('stage').attributes['data-screen'],i===2?'online':'select');
  assert.equal($(i===2?'online':'select').style.display,'flex');
  if(i!==2)assert.equal(G.mode,['ai','local',null,'watch'][i]);
  toMenu();assert.equal($('stage').attributes['data-screen'],'title');assert.equal(G.running,false);
}
console.log('PASS actual four title routes, hard-alpha bitmap mark, advancing silent attract match, live actor/stage labels and title returns');
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
pxText(selectionAssets,previewTag.toUpperCase()+' / ACTUAL MENU CANVASES / MAIN RIGHT + MIRROR LEFT',16,12,PX_LIGHT,2);
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
assert.equal($('stage').attributes['data-screen'],'none','fight canvas must return to its native aspect');
for(const f of G.S.f){assert(PX_DOMAIN_BACKDROPS.has(CH[f.ch].dom.kind),'selected Domain was not prewarmed');assert.equal(f.domUsed,0);}
assert.equal(G.S.dom,null);
for(let n=0;n<101;n++){step(G.S,[0,0]);G.S.ev.length=0;}
assert.equal(G.S.stage,'gallery');
frame(68);frame(85);
const key=code=>({code,repeat:false,preventDefault(){}});
events.keydown(key('KeyJ'));events.keyup(key('KeyJ'));frame(102);
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
// End-screen role, score, focus, navigation and guest snapshot handoff.
for(const mode of ['ai','local','watch','host','guest'])for(const winner of [0,1]){
  G.mode=mode;startFight();G.S.phase='fight';G.S.wins[winner]=1;G.S.f[1-winner].hp=1;G.S.timer=1;
  step(G.S,[0,0]);while(G.S.phase==='ko')step(G.S,[0,0]);assert.equal(G.S.phase,'over');
  if(mode==='guest')wire.data({t:'s',s:JSON.parse(JSON.stringify(G.S)),e:[]});else endMatch();
  assert.equal($('overTitle').textContent,pxResultRole(labels(),winner)+' / '+CH[G.S.f[winner].ch].name+' wins');
  assert($('overScore').textContent.includes(G.S.wins[0]+' - '+G.S.wins[1]));
  assert.equal($('overFighters').textContent,CH[G.S.f[0].ch].name+' vs '+CH[G.S.f[1].ch].name);
  assert.equal($('overBtns').style.display,mode==='guest'?'none':'');
  assert($('overNote').textContent.includes(mode==='guest'?'Waiting for the host':'Dawn Observatory'));
  if(mode==='guest'){const snap=JSON.parse(JSON.stringify(G.S));wire.data({t:'s',s:snap,e:[]});assert.equal(G.S,snap,'guest receives a new object while result timer waits');}
  const timer=timeouts.pop();assert.equal(timer.ms,1400);timer.fn();assert.equal($('over').style.display,'flex');
  assert.equal(document.activeElement,$(mode==='guest'?'overTitle':'rematchBtn'));
  for(const code of ['Tab','Enter','Space']){let prevented=false;events.keydown({code,repeat:false,preventDefault(){prevented=true;}});assert.equal(prevented,false,'result menu key swallowed: '+code);assert.equal(G.taps[code],undefined);}
  if(mode==='guest'){
    wire.data({t:'start',p:[0,1],stage:'gallery'});assert.equal(G.over,false);assert.equal($('over').style.display,'none');
  }else{
    const choices=G.pick.slice();rematch();assert.equal(G.S.stage,'observatory');assert.deepEqual(G.pick,choices);assert.deepEqual(G.S.wins,[0,0]);
    assert.equal(G.over,false);assert.equal(G.S.phase,'intro');assert.equal(FX.banner,null);
  }
}
// A delayed result must never open over a later match, even if that match ends too.
G.mode='local';G.stage='observatory';startFight();G.S.wins=[2,0];G.S.phase='over';endMatch();const stale=timeouts.pop();
startFight();G.S.wins=[0,2];G.S.phase='over';endMatch();const current=timeouts.pop();
stale.fn();assert.equal($('over').style.display,'none');current.fn();assert.equal($('over').style.display,'flex');
toSelect();assert.equal($('select').style.display,'flex');assert.equal(G.running,false);
toMenu();assert.equal($('title').style.display,'flex');
console.log('PASS ten actual match endings in five modes, score/role/guest guidance, delayed focus, rematch reset, snapshot restart, navigation and stale timer isolation');
G.stage='observatory';G.mode='local';startFight();
G.S.phase='fight';G.S.t=130;G.S.f[0].ch=0;G.S.f[1].ch=14;G.S.f[0].x=400;G.S.f[1].x=880;
frame(119);assert.equal(G.S.f[0].hp,1000);
console.log('PASS real script order, title, fighter/stage selection, start, input-to-frame, pause/resume, rematch, host/guest stage messages and composite canvas presentation');
`,context);
for(let i=3;i<cv.pixels().length;i+=4)assert.equal(cv.pixels()[i],255);
if(process.argv[2])writePNG(path.join(process.argv[2],process.argv[3]||'runtime-frame.png'),{w:cv.width,h:cv.height,data:cv.pixels()});
if(process.argv[2]) {
  writePNG(path.join(process.argv[2],previewTag+'-selection-assets.png'),context.selectionAssets);
  writePNG(path.join(process.argv[2],previewTag+'-title-mark.png'),context.titleLogo);
  writePNG(path.join(process.argv[2],previewTag+'-attract-frame.png'),context.attractFrame);
}
