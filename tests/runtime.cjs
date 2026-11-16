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
const nodes=new Map(),events={},listeners={};
const element=id=>({id,style:{setProperty(){}},children:[],_html:'',set innerHTML(value){this._html=value;this.children=[];},get innerHTML(){return this._html;},textContent:'',attributes:{},setAttribute(key,value){this.attributes[key]=value;},appendChild(child){this.children.push(child);},focus(){document.activeElement=this;}});
const cv=new Canvas(1280,720);nodes.set('cv',cv);
for(const id of ['title','select','online','pause','over'])nodes.set(id,element(id));
const document={visibilityState:'visible',getElementById(id){if(!nodes.has(id))nodes.set(id,element(id));return nodes.get(id);},querySelectorAll(){return ['title','select','online','pause','over'].map(id=>nodes.get(id));},createElement(tag){return tag==='canvas'?new Canvas():element(tag);},head:element('head')};
const timeouts=[];
const context=vm.createContext({console,assert,document,window:{},setTimeout(fn,ms){timeouts.push({fn,ms});},requestAnimationFrame(){},addEventListener(name,fn){(listeners[name]??=[]).push(fn);events[name]=(...args)=>listeners[name].forEach(listener=>listener(...args));}});
context.timeouts=timeouts;
context.events=events;
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
context.html=html;
const previewTag=(process.argv[3]||'').match(/^(v\d+)-/)?.[1]||'preview';context.previewTag=previewTag;
const scripts=[...html.matchAll(/<script src="([^"?]+)\?v=(\d+)"><\/script>/g)];
assert.equal(scripts.length,18);assert.equal(new Set(scripts.map(m=>m[2])).size,1);
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
// Remote selection changes must update the existing controls: replacing the
// rosters would detach the focused local button in a real browser.
let remoteSelectionChecks=0;
for(const mode of ['host','guest']){
  G.running=false;netWire(conn,mode);wire.open();
  const own=mode==='host'?0:1,other=1-own;
  const controls=[$('col0').children.slice(),$('col1').children.slice()];
  const arenas=$('stageChoices').children.slice();
  controls[own][7].focus();
  for(let ch=0;ch<CH.length;ch++){
    const localPick=G.pick[own],packets=sent.length;
    wire.data({t:'pick',ch});
    assert.equal(G.pick[other],ch);assert.equal(G.pick[own],localPick);
    assert.equal(document.activeElement,controls[own][7]);
    for(let slot=0;slot<2;slot++){
      assert.equal($('col'+slot).children[7],controls[slot][7],'remote pick replaced roster control');
      assert.equal(controls[slot].every(b=>b.disabled),slot===other);
      assert.equal(controls[slot][G.pick[slot]].attributes['aria-pressed'],'true');
      assert($('preview'+slot).innerHTML.includes(CH[G.pick[slot]].name));
      for(const a of [...CH[G.pick[slot]].arts,CH[G.pick[slot]].dom])assert($('detail').innerHTML.includes(a.name));
    }
    assert.equal($('stageChoices').children[0],arenas[0]);
    assert.equal(sent.length,packets,'remote refresh echoed a selection packet');
    remoteSelectionChecks++;
  }
  // The very same local button remains actionable after every opponent pick.
  controls[own][7].onclick();assert.equal(G.pick[own],7);assert.equal(sent.at(-1).ch,7);
  if(mode==='guest'){
    for(const stage of [...PX_STAGES.map(s=>s.id),'missing-stage']){
      const packets=sent.length;wire.data({t:'stage',stage});
      assert.equal(G.stage,pxStageId(stage));assert.equal(document.activeElement,controls[own][7]);
      assert.equal($('col'+own).children[7],controls[own][7],'host stage change replaced local roster');
      for(let n=0;n<arenas.length;n++){
        assert.equal($('stageChoices').children[n],arenas[n]);assert.equal(arenas[n].disabled,true);
        assert.equal(arenas[n].attributes['aria-pressed'],String(PX_STAGES[n].id===G.stage));
      }
      assert($('selNote').textContent.includes('host chooses'));assert.equal(sent.length,packets);
      remoteSelectionChecks++;
    }
  }else{
    arenas[1].focus();wire.data({t:'pick',ch:4});
    assert.equal(document.activeElement,arenas[1]);assert.equal($('stageChoices').children[1],arenas[1]);
    arenas[1].onclick();assert.equal(G.stage,'gallery');assert.equal(sent.at(-1).stage,'gallery');
    remoteSelectionChecks++;
  }
  startFight();
  const inFight=$('preview'+other).innerHTML;wire.data({t:'pick',ch:12});
  assert.equal($('preview'+other).innerHTML,inFight,'in-fight pick refreshed hidden selection');
}
console.log('PASS',remoteSelectionChecks,'remote pick/stage updates retain local roster/arena controls, focus, permissions, previews, lists and outbound actions');
G.stage='observatory';G.mode='local';startFight();
// Opening the real move list yields native keyboard navigation and no combat
// input, including guest held controls. Offline freezes; online keeps its
// existing advancement/snapshot rules. This shell does not emulate a browser's
// default Tab, scroll or button activation: those need native-browser review.
let pauseChecks=0;
for(const mode of ['ai','local','watch','host','guest']){
  G.mode=mode;startFight();G.S.phase='fight';G.S.hitstop=0;G.last=500;G.acc=0;
  G.keys.KeyJ=true;G.taps.KeyJ=true;
  events.keydown(key('Escape'));
  assert.equal(G.paused,true);assert.equal($('pause').style.display,'flex');
  assert.equal(document.activeElement,$('resumeBtn'));
  const online=mode==='host'||mode==='guest';
  assert.equal($('pauseTitle').textContent,online?'Move list':'Paused: move list');
  assert($('pauseNote').textContent.includes(online?'Online match continues':'Match paused'));
  for(const code of ['Tab','Enter','Space','ArrowDown','ArrowUp','PageDown','PageUp','Home','End','KeyJ','KeyK','KeyW','KeyS','KeyU','KeyI','KeyO','KeyL','Comma','Period','Slash']){
    for(const repeat of [false,true]){
      let prevented=false;events.keydown({code,repeat,preventDefault(){prevented=true;}});
      assert.equal(prevented,false,'move-list key swallowed: '+mode+'/'+code);
      assert.equal(readKeys(BIND.solo),0,'paused solo control leaked');
      assert.equal(readKeys(BIND.p1),0,'paused P1 control leaked');
      assert.equal(readKeys(BIND.p2),0,'paused P2 control leaked');pauseChecks++;
    }
  }
  events.keydown({...key('Escape'),repeat:true});assert.equal(G.paused,true,'held Escape closed list');
  const mute=AUDIO.mute;events.keydown(key('KeyM'));assert.equal(AUDIO.mute,!mute);
  events.keydown({...key('KeyM'),repeat:true});assert.equal(AUDIO.mute,!mute);setMute(mute);
  const before=JSON.stringify(G.S),sentAt=sent.length;
  if(mode==='guest')G.lastSent=BTN.P;
  if(mode==='host')G.remoteIn=BTN.R;
  frame(517);
  if(!online)assert.equal(JSON.stringify(G.S),before,'offline pause advanced');
  else if(mode==='guest'){
    assert.equal(JSON.stringify(G.S),before,'guest locally simulated');
    assert(sent.slice(sentAt).some(m=>m.t==='in'&&m.b===0),'guest did not send neutral controls');
    const snap=JSON.parse(before);snap.t+=2;wire.data({t:'s',s:snap,e:[]});assert.equal(G.S,snap,'paused guest lost live snapshots');
  }else{
    const expected=JSON.parse(before);step(expected,[0,BTN.R]);expected.ev=[];
    assert.equal(JSON.stringify(G.S),JSON.stringify(expected),'paused host changed existing neutral-local/remote-input behavior');
  }
  events.keydown(key('Escape'));assert.equal(G.paused,false);assert.equal($('pause').style.display,'none');
  assert.equal(readKeys(BIND.solo),0,'menu input survived resume');assert.equal(readKeys(BIND.p2),0);
  events.keydown(key(mode==='local'?'KeyF':'KeyJ'));
  assert.equal(readKeys(mode==='local'?BIND.p1:BIND.solo),BTN.P|(BTN.P<<INPUT_SHIFT),'fresh press after resume lost');
  events.keyup(key(mode==='local'?'KeyF':'KeyJ'));clearInput();
}
assert(html.includes('id="resumeBtn"')&&html.includes('aria-labelledby="pauseTitle"'));
const pauseHTML=html.slice(html.indexOf('id="pause"'),html.indexOf('id="over"'));
assert(pauseHTML.indexOf('id="resumeBtn"')<pauseHTML.indexOf('id="pauseList"'),'pause actions must precede long move lists');
for(const action of ['togglePause()','toSelect()','toMenu()']){
  G.mode='local';startFight();togglePause();assert(pauseHTML.includes('onclick="'+action+'"'));eval(action);
  assert.equal(G.paused,false);assert.equal($('pause').style.display,'none');
  assert.equal($('stage').attributes['data-screen'],action==='togglePause()'?'none':action==='toSelect()'?'select':'title');
}
console.log('PASS',pauseChecks,'move-list key events in five modes, Resume focus, all three HTML actions, neutral guest controls, existing host/guest continuation, offline freeze and fresh resume input');
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
// Either player's existing Change fighters action must return BOTH clients to
// selection. Relaying the received request must not echo it back indefinitely.
let selectionReturnChecks=0;
for(const [sender,fromResult] of [['guest',false],['host',false],['host',true]]){
  G.running=false;netWire(conn,sender);wire.open();G.pick=[4,9];G.stage='gallery';startFight();
  if(fromResult){G.S.phase='over';G.S.wins=[2,0];endMatch();timeouts.pop().fn();}
  else togglePause();
  const screen=fromResult?'over':'pause';
  const menuHTML=html.slice(html.indexOf('id="'+screen+'"'));
  const action=menuHTML.match(/onclick="([^"]+)">Change fighters/)[1];
  sent.length=0;eval(action);
  const requests=sent.filter(m=>m.t==='select');
  assert.equal(requests.length,1,sender+' did not notify opponent of Change fighters');
  assert.equal(G.running,false);assert.equal(G.paused,false);assert.equal($('stage').attributes['data-screen'],'select');
  assert.deepEqual(G.pick,[4,9]);assert.equal(G.stage,'gallery');
  const receiver=sender==='guest'?'host':'guest';
  netWire(conn,receiver);wire.open();G.pick=[4,9];G.stage='gallery';startFight();togglePause();
  sent.length=0;wire.data(requests[0]);
  assert.equal(sent.length,0,'received Change fighters echoed to sender');
  assert.equal(G.running,false);assert.equal(G.paused,false);assert.equal($('stage').attributes['data-screen'],'select');
  assert.deepEqual(G.pick,[4,9]);assert.equal(G.stage,'gallery');
  assert.equal($('start').style.display,receiver==='guest'?'none':'');
  assert($('col'+(receiver==='guest'?0:1)).children.every(b=>b.disabled));
  // The resulting selection still supports picks and a host-started new fight.
  const other=receiver==='guest'?0:1;wire.data({t:'pick',ch:6});assert.equal(G.pick[other],6);
  if(receiver==='host'){
    startFight();const restart=sent.findLast(m=>m.t==='start');assert(restart);assert.deepEqual(restart.p,[4,6]);
  }else wire.data({t:'start',p:[6,9],stage:'gallery'});
  assert.equal(G.running,true);assert.equal(G.paused,false);assert.equal(G.S.phase,'intro');assert.equal(G.S.stage,'gallery');
  selectionReturnChecks++;
}
console.log('PASS',selectionReturnChecks,'actual online Change fighters actions notify either role, receive without echo and retain selection/start authority');
// The host can still have snapshots in flight when the guest leaves a fight.
// They must not inject hits/sound/results into selection, including before
// the first start. A move list is still a running match and keeps receiving.
let inactiveSnapshotChecks=0;
const snapshotSounds=[],originalSnapshotSfx=sfx;
sfx=e=>snapshotSounds.push(e.k);
for(const route of ['local-select','remote-select','before-start']){
  G.running=false;netWire(conn,'guest');wire.open();
  const source=newMatch(0,1,12345);source.phase='fight';source.t=200;
  source.f[0].x=500;source.f[1].x=575;
  startMove(source.f[0],'p1');source.f[0].mt=BASIC.p1.su-1;step(source,[0,0]);
  assert(source.ev.some(e=>e.k==='hit'),'snapshot fixture must contain a real hit');
  const hitPacket={t:'s',s:JSON.parse(JSON.stringify(source)),e:JSON.parse(JSON.stringify(source.ev))};
  if(route!=='before-start'){
    wire.data({t:'start',p:[0,1],stage:'gallery'});togglePause();
    wire.data(hitPacket);assert.equal(G.S,hitPacket.s,'open move list lost live hit');
    assert(snapshotSounds.includes('hit'));assert(FX.nums.length>0);
    if(route==='local-select'){
      const action=html.slice(html.indexOf('id="pause"')).match(/onclick="([^"]+)">Change fighters/)[1];eval(action);
    }else wire.data({t:'select'});
  }
  const waitingMatch=G.S,waitingOver=G.over,timers=timeouts.length,fx=JSON.stringify(FX),sounds=snapshotSounds.length;
  const roster=$('col1').children[7];roster.focus();sent.length=0;
  const finalState=JSON.parse(JSON.stringify(source));finalState.phase='over';finalState.wins=[2,0];
  for(const packet of [hitPacket,{t:'s',s:finalState,e:[{k:'ko'}]}]){
    wire.data(JSON.parse(JSON.stringify(packet)));
    assert(G.S===waitingMatch,'inactive guest accepted a fight snapshot after '+route);
    assert.equal(G.over,waitingOver);assert.equal(timeouts.length,timers,'inactive snapshot scheduled results');
    assert(JSON.stringify(FX)===fx,'inactive snapshot injected fight effects');
    assert.equal(snapshotSounds.length,sounds,'inactive snapshot played fight sound');
    assert.equal(G.running,false);assert.equal($('stage').attributes['data-screen'],'select');
    assert.equal(document.activeElement,roster);assert.equal(sent.length,0);
    inactiveSnapshotChecks++;
  }
  wire.data({t:'pick',ch:6});wire.data({t:'stage',stage:'observatory'});
  assert.equal(G.pick[0],6);assert.equal(G.stage,'observatory');
  wire.data({t:'start',p:[6,9],stage:'observatory'});assert.equal(G.running,true);
  const fresh=JSON.parse(JSON.stringify(G.S));fresh.t+=2;
  wire.data({t:'s',s:fresh,e:[]});assert.equal(G.S,fresh,'host start did not restore snapshots');
  togglePause();const paused=JSON.parse(JSON.stringify(fresh));paused.t+=2;
  wire.data({t:'s',s:paused,e:[]});assert.equal(G.S,paused);assert.equal($('stage').attributes['data-screen'],'pause');
  togglePause();
}
sfx=originalSnapshotSfx;
console.log('PASS',inactiveSnapshotChecks,'inactive guest hit/result snapshots ignored across initial/local/remote selection; sound/effects/focus/timers untouched, live move lists and host restarts retained');
// A hit on an odd host tick waits for the next snapshot. Starting another
// fight before that snapshot must not deliver the old hit with the new state.
let eventResetChecks=0;
for(const route of ['rematch','select','rehost']){
  G.mode='host';G.pick=[0,1];startFight();G.S.phase='fight';G.S.t=200;
  G.S.f[0].x=500;G.S.f[1].x=575;G.S.seed=12345;
  startMove(G.S.f[0],'p1');G.S.f[0].mt=BASIC.p1.su-1;
  G.acc=0;G.last=2000;G.netEv=[];sent.length=0;frame(2017);
  assert.equal(G.S.t,201);assert(G.netEv.some(e=>e.k==='hit'),'fixture must retain a real unsent hit');
  assert.equal(sent.filter(m=>m.t==='s').length,0,'odd tick unexpectedly sent snapshot');
  const oldEvents=JSON.parse(JSON.stringify(G.netEv));
  if(route==='rematch')rematch();
  else if(route==='select'){toSelect();startFight();}
  else {toMenu();netWire(conn,'host');wire.open();startFight();}
  assert.equal(G.netEv.length,0,'previous fight events survived '+route);
  const startAt=sent.length;G.acc=0;G.last=3000;frame(3034);
  const snapshot=sent.slice(startAt).find(m=>m.t==='s');assert(snapshot,'new fight snapshot missing');
  assert.equal(snapshot.s.t,2);assert.equal(snapshot.s.phase,'intro');
  assert.equal(snapshot.e.some(e=>oldEvents.some(old=>JSON.stringify(old)===JSON.stringify(e))),false,'old hit delivered in new fight');
  assert.equal(snapshot.e.some(e=>e.k==='hit'),false);
  // Resetting the queue must leave normal current-fight batching intact.
  G.S.phase='fight';G.S.t=202;G.S.f[0].x=500;G.S.f[1].x=575;G.S.seed=12345;
  startMove(G.S.f[0],'p1');G.S.f[0].mt=BASIC.p1.su-1;
  const activeAt=sent.length;frame(3051);assert(G.netEv.some(e=>e.k==='hit'));
  frame(3068);const activeSnapshot=sent.slice(activeAt).find(m=>m.t==='s');
  assert(activeSnapshot&&activeSnapshot.e.some(e=>e.k==='hit'),'current fight hit lost');
  assert.equal(G.netEv.length,0,'sent events were not drained');eventResetChecks++;
}
console.log('PASS',eventResetChecks,'host rematch/change-fighters/rehost routes discard real unsent hit events before new-match snapshots');
G.stage='observatory';G.mode='local';startFight();
G.S.phase='fight';G.S.t=130;G.S.f[0].ch=0;G.S.f[1].ch=14;G.S.f[0].x=400;G.S.f[1].x=880;
frame(119);assert.equal(G.S.f[0].hp,1000);
console.log('PASS real script order, title, fighter/stage selection, start, input-to-frame, pause/resume, rematch, host/guest stage messages and composite canvas presentation');
`,context);
// Exercise delayed WebRTC/library events through the real menu actions. These
// fakes control event ordering; they do not establish real network behavior.
vm.runInContext(`
const mockConnection=()=>({open:true,events:{},sent:[],on(name,fn){this.events[name]=fn;},send(m){this.sent.push(m);}});
const staleConn=mockConnection();netWire(staleConn,'guest');staleConn.events.open();
netClose();show('title');pickMode('local');startFight();
const offlineMatch=G.S,offlinePicks=G.pick.slice();
staleConn.events.data({t:'start',p:[5,6],stage:'gallery'});
assert.equal(G.S,offlineMatch,'closed room restarted the current match');
assert.deepEqual(G.pick,offlinePicks);assert.equal(G.mode,'local');
staleConn.events.open();assert.equal(G.mode,'local','closed room reopened selection');
toMenu();

const peers=[];
class MockPeer {
  constructor(id){this.id=id;this.events={};this.destroyed=0;this.connection=mockConnection();peers.push(this);}
  on(name,fn){this.events[name]=fn;}
  connect(id,options){this.target=id;this.options=options;return this.connection;}
  destroy(){this.destroyed++;if(this.attached)this.attached.events.close();}
}
globalThis.Peer=window.Peer=MockPeer;
// A real close may fire synchronously from destroy(), or arrive afterward.
show('online');hostGame();const oldPeer=peers.at(-1);
oldPeer.events.open();const oldConn=mockConnection();oldPeer.attached=oldConn;
oldPeer.events.connection(oldConn);oldConn.events.open();
netClose();show('title');
assert.equal($('netStatus').textContent.includes('disconnected'),false,'intentional exit reported a disconnect');
assert.equal(NET.peer,null);assert.equal(NET.conn,null);assert.equal(oldPeer.destroyed,1);

// Rehost before the old room's queued events finish. No old callback may
// destroy the replacement, change its status, or mutate its match/selection.
show('online');hostGame();const freshPeer=peers.at(-1);freshPeer.events.open();
const freshStatus=$('netStatus').textContent,freshConn=mockConnection();
freshPeer.attached=freshConn;freshPeer.events.connection(freshConn);freshConn.events.open();
const freshControls=$('col0').children.slice(),freshPicks=G.pick.slice(),freshStage=G.stage;
let staleEvents=0;
const unchanged=()=>{
  assert.equal(NET.peer,freshPeer);assert.equal(NET.conn,freshConn);assert.equal(freshPeer.destroyed,0);
  assert.equal(G.mode,'host');assert.equal(G.running,false);assert.deepEqual(G.pick,freshPicks);
  assert.equal(G.stage,freshStage);assert.equal($('stage').attributes['data-screen'],'select');
  assert.equal($('netStatus').textContent,freshStatus);assert.equal($('col0').children[0],freshControls[0]);
  assert.equal(G.remoteIn,0);assert.equal(G.remoteTap,0);staleEvents++;
};
G.remoteIn=0;G.remoteTap=0;
oldPeer.events.open();unchanged();
oldPeer.events.error({type:'peer-unavailable'});unchanged();
oldPeer.events.connection(mockConnection());unchanged();
oldConn.events.open();unchanged();
for(const packet of [{t:'pick',ch:12},{t:'stage',stage:'gallery'},{t:'in',b:1023},
  {t:'select'},{t:'start',p:[3,4],stage:'gallery'},{t:'s',s:null,e:[]}]){
  oldConn.events.data(packet);unchanged();
}
oldConn.events.close();unchanged();
// Superseded connections in the same room are isolated too.
const priorConn=freshConn,replacement=mockConnection();freshPeer.attached=replacement;
netWire(replacement,'host');replacement.events.open();
priorConn.events.close();assert.equal(NET.conn,replacement);assert.equal(NET.peer,freshPeer);
priorConn.events.data({t:'pick',ch:10});assert.deepEqual(G.pick,[0,1]);
replacement.events.data({t:'pick',ch:8});assert.equal(G.pick[1],8,'current connection stopped receiving');
replacement.events.close();assert.equal($('stage').attributes['data-screen'],'online');
assert.equal($('netStatus').textContent,'The other player disconnected.');
assert.equal(NET.peer,null);assert.equal(NET.conn,null);assert.equal(freshPeer.destroyed,1);

// Normal joins still connect reliably; leaving cancels a pending peer open.
$('code').value=' abcd ';joinGame();const joining=peers.at(-1);
joining.events.open();assert.equal(joining.target,'ritual-demo-ABCD');assert.equal(joining.options.reliable,true);
joining.connection.events.open();assert.equal(G.mode,'guest');
joining.connection.events.data({t:'stage',stage:'gallery'});assert.equal(G.stage,'gallery');
joining.connection.events.data({t:'start',p:[2,3],stage:'gallery'});assert.equal(G.S.stage,'gallery');
const joinedMatch=G.S;
for(const stale of [staleConn,oldConn,priorConn]){
  stale.events.data({t:'s',s:null,e:[]});assert.equal(G.S,joinedMatch,'old snapshot replaced the current guest match');
  stale.events.close();assert.equal(NET.peer,joining);assert.equal(G.running,true);
}
netClose();show('online');joinGame();const pending=peers.at(-1);netClose();show('title');
pending.events.open();pending.events.error({type:'peer-unavailable'});
assert.equal(Object.keys(pending.connection.events).length,0);assert.equal(NET.peer,null);
assert.equal($('stage').attributes['data-screen'],'title');

// Back, rehost, join, and library failure while PeerJS is still loading.
delete window.Peer;delete globalThis.Peer;
hostGame();const cancelledScript=document.head.children.at(-1),beforeCancel=peers.length;
netClose();show('title');window.Peer=globalThis.Peer=MockPeer;
cancelledScript.onload();assert.equal(peers.length,beforeCancel,'Back did not cancel pending library load');
netStatus('current status');cancelledScript.onerror();assert.equal($('netStatus').textContent,'current status');
delete window.Peer;delete globalThis.Peer;
show('online');hostGame();const firstScript=document.head.children.at(-1);
hostGame();const secondScript=document.head.children.at(-1);
window.Peer=globalThis.Peer=MockPeer;
const beforeLoad=peers.length;firstScript.onload();assert.equal(peers.length,beforeLoad);
secondScript.onload();assert.equal(peers.length,beforeLoad+1);netClose();
delete window.Peer;delete globalThis.Peer;
joinGame();const joinScript=document.head.children.at(-1);window.Peer=globalThis.Peer=MockPeer;
joinScript.onload();const loadedJoin=peers.at(-1);loadedJoin.events.open();
assert.equal(loadedJoin.target,'ritual-demo-ABCD');netClose();
hostGame();peers.at(-1).events.error({type:'network'});
assert.equal($('netStatus').textContent,'Network error: network');netClose();
joinGame();peers.at(-1).events.error({type:'peer-unavailable'});
assert.equal($('netStatus').textContent,'No room with that code.');netClose();
delete window.Peer;delete globalThis.Peer;
hostGame();document.head.children.at(-1).onerror();
assert.equal($('netStatus').textContent,'Could not load the network library. Is this computer online?');
netClose();show('title');
console.log('PASS closed-room start/open isolation,',staleEvents,'stale peer/connection events, synchronous destroy, replacement connection, current disconnect, joins and cancelled/superseded PeerJS loads');
// The desktop adapter loads after main's boot, and must run on the real frame
// and guest transport paths. Multiple blur listeners must both be delivered.
const normalAI=aiInput;aiInput=()=>0;
for(const mode of ['ai','local','host','guest']) {
  G.mode=mode;G.pick=[0,14];startFight();G.S.phase='fight';G.acc=0;G.last=1000;
  const packets=[];NET.conn={open:true,send(m){packets.push(m);}};
  const slot=mode==='guest'||mode==='local'?1:0,code=mode==='local'?'Slash':'KeyL';
  events.keydown({code,repeat:false,preventDefault(){}});events.keyup({code});
  frame(1017);assert(FX.domainNope[slot]&&FX.domainNope[slot].t===17);
  assert(pxDomainCardState(G.S,G.S.f[slot],FX).denied);assert.equal(FX.domainNope[1-slot],null);
  if(mode==='guest')assert(packets.some(m=>m.t==='in'&&m.b===(BTN.DOM<<INPUT_SHIFT)));
  else assert.equal(G.S.f[slot].prev,0,'short press acquired a hold');
  events.keydown({code:'KeyD',repeat:false,preventDefault(){}});events.blur();
  assert.equal(Object.keys(G.keys).length,0);assert.equal(Object.keys(G.taps).length,0);assert.deepEqual(FX.domainNope,[null,null]);
  NET.conn=null;
}
console.log('PASS desktop Domain availability cues through actual AI/local/host/guest frames, exact guest input packet and both blur listeners');
for(const mode of ['ai','local','host'])for(const name of ['K','DOM','U']) {
  G.mode=mode;G.pick=[0,14];startFight();G.S.phase='fight';G.acc=0;G.last=1000;
  const slot=mode==='local'?1:0,binding=mode==='local'?BIND.p2:BIND.solo,code=binding[name][0];
  if(name==='DOM')G.S.f[slot].gauge=100;
  events.keydown({code,repeat:false,preventDefault(){}});events.keyup({code});frame(1017);
  const state=pxGuardHUDState(G.S.f[slot]);assert(state.locked);assert.equal(state.status,name==='U'?'LAND TO GUARD':'GUARD LOCKED');
  toMenu();
}
// A guest's very first snapshot needs no preceding cast/break event.
G.mode='guest';const guardConn=mockConnection();netWire(guardConn,'guest');guardConn.events.open();G.pick=[0,14];startFight();
for(const st of ['atk','cast','jump','block','idle']) {
  const snapshot=newMatch(0,14,115);snapshot.phase='fight';snapshot.f[1].st=st;
  if(st==='jump')snapshot.f[1].y=GROUND-40;
  guardConn.events.data({t:'s',s:snapshot,e:[]});G.acc=0;G.last=1000;frame(1017);
  const state=pxGuardHUDState(G.S.f[1]);assert.equal(state.locked,['atk','cast','jump'].includes(st));
}
netClose();aiInput=normalAI;G.mode='ai';toMenu();
console.log('PASS desktop guard availability through actual AI/local/host frames and event-free guest snapshots');
// Verify the desktop pose adapter reaches the painter used by the actual loop.
const hitPaintBase=pxPaintFighter,hitPaints=[];
pxPaintFighter=function(s,S,f,impact){if(f.st==='hit')hitPaints.push(pxPose(S,f));return hitPaintBase(s,S,f,impact);};
aiInput=()=>0;
for(const mode of ['ai','local','host']) {
  G.mode=mode;G.pick=[0,14];startFight();G.S.phase='fight';G.acc=0;G.last=1000;
  G.S.seed=117;G.S.f[0].x=600;G.S.f[1].x=660;hitPaints.length=0;
  const binding=mode==='local'?BIND.p1:BIND.solo,code=binding.P[0];
  events.keydown({code,repeat:false,preventDefault(){}});events.keyup({code});
  for(let n=1;n<=35;n++)frame(1000+n*17);
  for(const pose of ['hitreel','hitbrace','hitrise'])assert(hitPaints.includes(pose),mode+' loop missed '+pose);
  toMenu();
}
G.mode='guest';const hitConn=mockConnection();netWire(hitConn,'guest');hitConn.events.open();G.pick=[0,14];startFight();
for(const remaining of [14,10,5]) {
  const snapshot=newMatch(0,14,117);snapshot.phase='fight';hit(snapshot,0,snapshot.f[1],snapshot.f[0].x,{dmg:32,stun:remaining});snapshot.ev=[];
  hitPaints.length=0;hitConn.events.data({t:'s',s:snapshot,e:[]});G.acc=0;G.last=1000;frame(1017);
  assert(hitPaints.includes(remaining>10?'hitreel':remaining>5?'hitbrace':'hitrise'));
}
pxPaintFighter=hitPaintBase;aiInput=normalAI;netClose();G.mode='ai';toMenu();
console.log('PASS desktop ground-hit poses through real keyboard/AI/local/host frames and event-free guest snapshot painting');
// Summon-only animation reaches the same painter from real input and snapshots.
const summonPaintBase=pxPaintFighter,summonPaints=[];
pxPaintFighter=function(s,S,f,impact){if(f.ch===3&&f.st==='atk')summonPaints.push(pxPose(S,f));return summonPaintBase(s,S,f,impact);};
aiInput=()=>0;
for(const mode of ['ai','local','host'])for(const art of ['A1','A2','A3']) {
  G.mode=mode;G.pick=[3,3];startFight();G.S.phase='fight';G.acc=0;G.last=1000;
  const slot=mode==='local'?1:0,f=G.S.f[slot];f.ce=100;G.S.f[0].x=360;G.S.f[1].x=920;summonPaints.length=0;
  const binding=mode==='local'?BIND.p2:BIND.solo,code=binding[art][0];
  events.keydown({code,repeat:false,preventDefault(){}});events.keyup({code});
  for(let n=1;n<=48;n++)frame(1000+n*17);
  for(const pose of ['summoncoil','summonseal','signre','signsettle'])assert(summonPaints.includes(pose),mode+' '+art+' missed '+pose);
  toMenu();
}
G.mode='guest';const summonConn=mockConnection();netWire(summonConn,'guest');summonConn.events.open();G.pick=[3,3];startFight();
for(const n of [0,1,2])for(const mt of [6,11,12,14,15]) {
  const snapshot=newMatch(3,3,119);snapshot.phase='fight';startMove(snapshot.f[1],'a'+n);snapshot.f[1].mt=mt;snapshot.ev=[];
  summonPaints.length=0;summonConn.events.data({t:'s',s:snapshot,e:[]});G.acc=0;G.last=1000;frame(1017);
  assert(summonPaints.includes(mt<12?'summoncoil':mt<15?'summonseal':'signre'));
}
pxPaintFighter=summonPaintBase;aiInput=normalAI;netClose();G.mode='ai';toMenu();
console.log('PASS all three summon animations through real AI/local/host keyboard frames and fifteen event-free guest snapshots');
// The separate desktop Maximum adapter must reach the real loop and first guest snapshot.
const maximumPaintBase=pxPaintFighter,maximumPaints=[];
pxPaintFighter=function(s,S,f,impact){if(S.dom&&S.dom.o===f.i&&f.st==='cast')maximumPaints.push({t:S.dom.t,pose:pxPose(S,f)});return maximumPaintBase(s,S,f,impact);};
aiInput=()=>0;
for(const mode of ['ai','local','host']) {
  G.mode=mode;G.pick=[4,4];startFight();G.S.phase='fight';G.acc=0;G.last=1000;
  const slot=mode==='local'?1:0;G.S.f[slot].gauge=100;G.S.f[0].x=360;G.S.f[1].x=920;maximumPaints.length=0;
  const binding=mode==='local'?BIND.p2:BIND.solo,code=binding.DOM[0];
  events.keydown({code,repeat:false,preventDefault(){}});events.keyup({code});
  for(let n=1;n<=180;n++)frame(1000+n*17);
  for(const [t,pose] of [[36,'nuclearcoil'],[59,'nuclearcoil'],[60,'nuclearbrace'],[71,'nuclearbrace'],[72,'cannon'],[77,'cannonre']])
    assert(maximumPaints.some(p=>p.t===t&&p.pose===pose),mode+' Maximum missed '+t+' '+pose);
  assert.equal(G.S.f[slot].domUsed,1);toMenu();
}
G.mode='guest';const maximumConn=mockConnection();netWire(maximumConn,'guest');maximumConn.events.open();G.pick=[4,4];startFight();
for(const owner of [0,1])for(const t of [35,36,59,60,71,72,77,85]) {
  const snapshot=newMatch(4,4,123);snapshot.phase='fight';snapshot.f[owner].gauge=100;startDomain(snapshot,snapshot.f[owner],snapshot.f[1-owner]);snapshot.freeze=0;snapshot.dom.t=t;snapshot.ev=[];
  maximumPaints.length=0;maximumConn.events.data({t:'s',s:snapshot,e:[]});G.acc=0;G.last=1000;frame(1017);
  assert(maximumPaints.some(p=>p.t===t&&p.pose===(t<36?'cannonw':t<60?'nuclearcoil':t<72?'nuclearbrace':t<77?'cannon':t<85?'cannonre':'cannonsettle')));
}
pxPaintFighter=maximumPaintBase;aiInput=normalAI;netClose();G.mode='ai';toMenu();
console.log('PASS desktop Nuclear Shell coil/brace/release through actual AI/local/host keys and sixteen event-free guest snapshots');
// Everything I Have must load, travel and hit through the same real input path.
aiInput=()=>0;pxPaintFighter=function(s,S,f,impact){if(S.dom&&S.dom.o===f.i&&f.st==='cast')maximumPaints.push({t:S.dom.t,pose:pxPose(S,f)});return maximumPaintBase(s,S,f,impact);};
for(const mode of ['ai','local','host']) {
  G.mode=mode;G.pick=[12,12];startFight();G.S.phase='fight';G.acc=0;G.last=1000;
  const slot=mode==='local'?1:0;G.S.f[slot].gauge=100;G.S.f[0].x=100;G.S.f[1].x=600;maximumPaints.length=0;
  const binding=mode==='local'?BIND.p2:BIND.solo,code=binding.DOM[0];
  events.keydown({code,repeat:false,preventDefault(){}});events.keyup({code});
  for(let n=1;n<=150;n++)frame(1000+n*17);
  for(const [t,pose] of [[12,'alloutcoil'],[23,'alloutcoil'],[24,'alloutdrive'],[34,'alloutdrive'],[35,'punch']])
    assert(maximumPaints.some(p=>p.t===t&&p.pose===pose),mode+' allout missed '+t+' '+pose);
  // A 17-ms display frame occasionally advances two 60-Hz ticks. The focused
  // audit owns the exact tick-40 boundary; require its recovery window here.
  assert(maximumPaints.some(p=>p.t>=40&&p.t<48&&p.pose==='punchre'),mode+' allout recovery not painted');
  assert.equal(G.S.f[slot].domUsed,1);toMenu();
}
G.mode='guest';const alloutConn=mockConnection();netWire(alloutConn,'guest');alloutConn.events.open();G.pick=[12,12];startFight();
for(const owner of [0,1])for(const [t,done,pose] of [[11,0,'hookw'],[12,0,'alloutcoil'],[23,0,'alloutcoil'],[24,0,'alloutdrive'],[34,0,'alloutdrive'],[24,1,'punch'],[35,1,'punch'],[40,0,'punchre']]) {
  const snapshot=newMatch(12,12,125);snapshot.phase='fight';snapshot.f[owner].gauge=100;startDomain(snapshot,snapshot.f[owner],snapshot.f[1-owner]);snapshot.freeze=0;snapshot.dom.t=t;snapshot.dom.done=done;snapshot.ev=[];
  maximumPaints.length=0;alloutConn.events.data({t:'s',s:snapshot,e:[]});G.acc=0;G.last=1000;frame(1017);
  assert(maximumPaints.some(p=>p.t===t&&p.pose===pose));
}
pxPaintFighter=maximumPaintBase;aiInput=normalAI;netClose();G.mode='ai';toMenu();
console.log('PASS desktop allout coil/rush/contact through actual AI/local/host keys and sixteen event-free guest snapshots');
// The word's inhale and brace must also reach real keyboard and guest frames.
aiInput=()=>0;pxPaintFighter=function(s,S,f,impact){if(S.dom&&S.dom.o===f.i&&f.st==='cast')maximumPaints.push({t:S.dom.t,pose:pxPose(S,f)});return maximumPaintBase(s,S,f,impact);};
for(const mode of ['ai','local','host']) {
  G.mode=mode;G.pick=[6,6];startFight();G.S.phase='fight';G.acc=0;G.last=1000;
  const slot=mode==='local'?1:0;G.S.f[slot].gauge=100;G.S.f[0].x=400;G.S.f[1].x=880;maximumPaints.length=0;
  const binding=mode==='local'?BIND.p2:BIND.solo,code=binding.DOM[0];
  events.keydown({code,repeat:false,preventDefault(){}});events.keyup({code});
  for(let n=1;n<=140;n++)frame(1000+n*17);
  for(const [a,b,pose] of [[12,20,'voiceinhale'],[20,24,'voicebrace'],[24,29,'speech'],[29,42,'speechre']])
    assert(maximumPaints.some(p=>p.t>=a&&p.t<b&&p.pose===pose),mode+' voice missed '+pose);
  assert.equal(G.S.f[slot].domUsed,1);assert.equal(G.S.f[slot].hp,CH[6].hp-40);toMenu();
}
G.mode='guest';const voiceConn=mockConnection();netWire(voiceConn,'guest');voiceConn.events.open();G.pick=[6,6];startFight();
for(const owner of [0,1])for(const [t,pose] of [[11,'speechw'],[12,'voiceinhale'],[19,'voiceinhale'],[20,'voicebrace'],[23,'voicebrace'],[24,'speech'],[29,'speechre'],[42,'speechsettle']]) {
  const snapshot=newMatch(6,6,127);snapshot.phase='fight';snapshot.f[owner].gauge=100;startDomain(snapshot,snapshot.f[owner],snapshot.f[1-owner]);snapshot.freeze=0;snapshot.dom.t=t;snapshot.ev=[];
  maximumPaints.length=0;voiceConn.events.data({t:'s',s:snapshot,e:[]});G.acc=0;G.last=1000;frame(1017);
  assert(maximumPaints.some(p=>p.t===t&&p.pose===pose));
}
pxPaintFighter=maximumPaintBase;aiInput=normalAI;netClose();G.mode='ai';toMenu();
console.log('PASS desktop Resounding Voice inhale/brace/word through AI/local/host keys and sixteen event-free guest snapshots');

// Desktop-only Convergence must reach actual keyboard casts and event-free guests.
aiInput=()=>0;pxPaintFighter=function(s,S,f,impact){if(S.dom&&S.dom.o===f.i&&f.st==='cast')maximumPaints.push({t:S.dom.t,pose:pxPose(S,f)});return maximumPaintBase(s,S,f,impact);};
const convergenceCh=CH.findIndex(c=>c.dom.kind==='bloodsweep');
for(const mode of ['ai','local','host']) {
  G.mode=mode;G.pick=[convergenceCh,convergenceCh];startFight();G.S.phase='fight';G.S.t=120;G.last=1000;G.acc=0;
  const slot=mode==='local'?1:0;G.S.f[slot].gauge=100;G.S.f[0].x=380;G.S.f[1].x=710;maximumPaints.length=0;
  const binding=mode==='local'?BIND.p2:BIND.solo,code=binding.DOM[0];
  events.keydown({code,repeat:false,preventDefault(){}});events.keyup({code});
  for(let n=1;n<=170;n++)frame(1000+n*17);
  for(const [a,b,pose] of [[20,32,'convergencefold'],[32,40,'convergenceaim'],[40,45,'cannon'],[45,53,'cannonre']])
    assert(maximumPaints.some(p=>p.t>=a&&p.t<b&&p.pose===pose),mode+' Convergence missed '+pose);
  assert.equal(G.S.f[slot].domUsed,1);assert.equal(G.S.f[slot].hp,CH[convergenceCh].hp);assert.equal(G.S.f[1-slot].hp,CH[convergenceCh].hp-240);toMenu();
}
G.mode='guest';const convergenceConn=mockConnection();netWire(convergenceConn,'guest');convergenceConn.events.open();G.pick=[convergenceCh,convergenceCh];startFight();
for(const owner of [0,1])for(const [t,pose] of [[19,'cannonw'],[20,'convergencefold'],[31,'convergencefold'],[32,'convergenceaim'],[39,'convergenceaim'],[40,'cannon'],[45,'cannonre'],[53,'cannonsettle']]) {
  const snapshot=newMatch(convergenceCh,convergenceCh,129);snapshot.phase='fight';snapshot.f[owner].gauge=100;startDomain(snapshot,snapshot.f[owner],snapshot.f[1-owner]);snapshot.freeze=0;snapshot.dom.t=t;snapshot.ev=[];
  maximumPaints.length=0;convergenceConn.events.data({t:'s',s:snapshot,e:[]});G.acc=0;G.last=1000;frame(1017);
  assert(maximumPaints.some(p=>p.t===t&&p.pose===pose));
}
pxPaintFighter=maximumPaintBase;aiInput=normalAI;netClose();G.mode='ai';toMenu();
console.log('PASS desktop Convergence fold/aim/beam through AI/local/host keys and sixteen event-free guest snapshots');

// Ordinary Gamma Quake must use the floor-strike body through the actual loop.
aiInput=()=>0;const quakePaints=[];
pxPaintFighter=function(s,S,f,impact){if(f.st==='atk'&&['quake','thunderclap'].includes(moveDef(f)?.id))quakePaints.push({t:f.mt,pose:pxPose(S,f)});return maximumPaintBase(s,S,f,impact);};
const quakeCh=CH.findIndex(c=>c.arts.some(a=>a.id==='quake'));
for(const mode of ['ai','local','host']) {
  G.mode=mode;G.pick=[quakeCh,quakeCh];startFight();G.S.phase='fight';G.S.t=120;G.last=1000;G.acc=0;
  const slot=mode==='local'?1:0;G.S.f[0].x=420;G.S.f[1].x=640;G.S.f[slot].ce=100;quakePaints.length=0;
  const binding=mode==='local'?BIND.p2:BIND.solo,code=binding.A3[0];
  events.keydown({code,repeat:false,preventDefault(){}});events.keyup({code});
  for(let n=1;n<=100;n++)frame(1000+n*17);
  for(const [a,b,pose] of [[10,20,'quakeopen'],[20,23,'quakeimpact'],[23,35,'quakepull'],[35,42,'quakerise']])
    assert(quakePaints.some(p=>p.t>=a&&p.t<b&&p.pose===pose),mode+' Gamma Quake missed '+pose);
  assert.equal(G.S.f[slot].hp,CH[quakeCh].hp);assert.equal(G.S.f[1-slot].hp,CH[quakeCh].hp-80);toMenu();
}
G.mode='guest';const quakeConn=mockConnection();netWire(quakeConn,'guest');quakeConn.events.open();G.pick=[quakeCh,quakeCh];startFight();
for(const owner of [0,1])for(const [mt,pose] of [[9,'hookw'],[10,'quakeopen'],[19,'quakeopen'],[20,'quakeimpact'],[22,'quakeimpact'],[23,'quakepull'],[34,'quakepull'],[35,'quakerise'],[41,'quakerise']]) {
  const snapshot=newMatch(quakeCh,quakeCh,131);snapshot.phase='fight';startMove(snapshot.f[owner],'a2');snapshot.f[owner].mt=mt;snapshot.ev=[];
  quakePaints.length=0;quakeConn.events.data({t:'s',s:snapshot,e:[]});G.acc=0;G.last=1000;frame(1017);
  assert(quakePaints.some(p=>p.t===mt&&p.pose===pose));
}
pxPaintFighter=maximumPaintBase;aiInput=normalAI;netClose();G.mode='ai';toMenu();
console.log('PASS desktop Gamma Quake coil/ground strike/recovery through AI/local/host keys and eighteen event-free guest snapshots');

// Thunder Clap uses the same real main-loop routes; event-free guests keep the open/close/pull ages.
aiInput=()=>0;pxPaintFighter=function(s,S,f,impact){if(f.st==='atk'&&moveDef(f)?.id==='thunderclap')quakePaints.push({t:f.mt,pose:pxPose(S,f)});return maximumPaintBase(s,S,f,impact);};
for(const mode of ['ai','local','host']) {
  G.mode=mode;G.pick=[quakeCh,quakeCh];startFight();G.S.phase='fight';G.S.t=120;G.last=1000;G.acc=0;
  const slot=mode==='local'?1:0;G.S.f[0].x=420;G.S.f[1].x=640;G.S.f[slot].ce=100;quakePaints.length=0;
  const binding=mode==='local'?BIND.p2:BIND.solo,code=binding.A1[0];
  events.keydown({code,repeat:false,preventDefault(){}});events.keyup({code});
  for(let n=1;n<=100;n++)frame(1000+n*17);
  for(const [a,b,pose] of [[6,12,'thunderopen'],[12,15,'thunderclose'],[15,23,'thunderpull'],[23,28,'clapseparate']])
    assert(quakePaints.some(p=>p.t>=a&&p.t<b&&p.pose===pose),mode+' Thunder Clap missed '+pose);
  assert.equal(G.S.f[slot].hp,CH[quakeCh].hp);assert.equal(G.S.f[1-slot].hp,CH[quakeCh].hp-75);toMenu();
}
G.mode='guest';const thunderConn=mockConnection();netWire(thunderConn,'guest');thunderConn.events.open();G.pick=[quakeCh,quakeCh];startFight();
for(const owner of [0,1])for(const [mt,pose] of [[5,'clapw'],[6,'thunderopen'],[11,'thunderopen'],[12,'thunderclose'],[14,'thunderclose'],[15,'thunderpull'],[22,'thunderpull'],[23,'clapseparate'],[27,'clapseparate']]) {
  const snapshot=newMatch(quakeCh,quakeCh,133);snapshot.phase='fight';startMove(snapshot.f[owner],'a0');snapshot.f[owner].mt=mt;snapshot.ev=[];
  quakePaints.length=0;thunderConn.events.data({t:'s',s:snapshot,e:[]});G.acc=0;G.last=1000;frame(1017);
  assert(quakePaints.some(p=>p.t===mt&&p.pose===pose));
}
pxPaintFighter=maximumPaintBase;aiInput=normalAI;netClose();G.mode='ai';toMenu();
console.log('PASS desktop Thunder Clap anticipation/contact/recoil through AI/local/host keys and eighteen event-free guest snapshots');

// AP Shot must paint from actual keyboard input and transported state, without FX events.
aiInput=()=>0;const shotPaints=[];
pxPaintFighter=function(s,S,f,impact){if(f.st==='atk'&&moveDef(f)?.id==='apshot')shotPaints.push({t:f.mt,pose:pxPose(S,f)});return maximumPaintBase(s,S,f,impact);};
const shotCh=CH.findIndex(c=>c.arts.some(a=>a.id==='apshot'));
for(const mode of ['ai','local','host']) {
  G.mode=mode;G.pick=[shotCh,shotCh];startFight();G.S.phase='fight';G.S.t=121;G.last=1000;G.acc=0;
  const slot=mode==='local'?1:0;G.S.f[0].x=420;G.S.f[1].x=640;G.S.f[slot].ce=100;G.S.f[slot].res=0;shotPaints.length=0;
  const binding=mode==='local'?BIND.p2:BIND.solo,code=binding.A3[0];
  events.keydown({code,repeat:false,preventDefault(){}});events.keyup({code});
  for(let n=1;n<=100;n++)frame(1000+n*17);
  for(const [a,b,pose] of [[7,11,'apcompress'],[11,14,'apaim'],[14,17,'apfire'],[17,26,'aprecoil'],[26,32,'clapseparate']])
    assert(shotPaints.some(p=>p.t>=a&&p.t<b&&p.pose===pose),mode+' AP Shot missed '+pose);
  assert.equal(G.S.f[slot].hp,CH[shotCh].hp);assert.equal(G.S.f[1-slot].hp,CH[shotCh].hp-85);toMenu();
}
G.mode='guest';const shotConn=mockConnection();netWire(shotConn,'guest');shotConn.events.open();G.pick=[shotCh,shotCh];startFight();
for(const owner of [0,1])for(const [mt,pose] of [[6,'clapw'],[7,'apcompress'],[10,'apcompress'],[11,'apaim'],[13,'apaim'],[14,'apfire'],[16,'apfire'],[17,'aprecoil'],[25,'aprecoil'],[26,'clapseparate'],[31,'clapseparate']]) {
  const snapshot=newMatch(shotCh,shotCh,135);snapshot.phase='fight';startMove(snapshot.f[owner],'a2');snapshot.f[owner].mt=mt;snapshot.ev=[];
  shotPaints.length=0;shotConn.events.data({t:'s',s:snapshot,e:[]});G.acc=0;G.last=1000;frame(1017);
  assert(shotPaints.some(p=>p.t===mt&&p.pose===pose));
}
pxPaintFighter=maximumPaintBase;aiInput=normalAI;netClose();G.mode='ai';toMenu();
console.log('PASS desktop AP Shot compression/aim/fire/recoil through AI/local/host keys and twenty-two event-free guest snapshots');

`,context);
for(let i=3;i<cv.pixels().length;i+=4)assert.equal(cv.pixels()[i],255);
if(process.argv[2])writePNG(path.join(process.argv[2],process.argv[3]||'runtime-frame.png'),{w:cv.width,h:cv.height,data:cv.pixels()});
if(process.argv[2]) {
  writePNG(path.join(process.argv[2],previewTag+'-selection-assets.png'),context.selectionAssets);
  writePNG(path.join(process.argv[2],previewTag+'-title-mark.png'),context.titleLogo);
  writePNG(path.join(process.argv[2],previewTag+'-attract-frame.png'),context.attractFrame);
}
