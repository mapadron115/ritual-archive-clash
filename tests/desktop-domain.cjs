// Real desktop key handlers, input encoding and native renderer. Scripted, not played.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
const old=p=>require('node:child_process').execFileSync('git',['show','8afa390:'+p],{cwd:root,encoding:'utf8'});
const html=baseline?old('index.html'):fs.readFileSync(path.join(root,'index.html'),'utf8');
const files=[...html.matchAll(/<script src="([^"?]+)\?v=\d+"><\/script>/g)].map(m=>m[1]);
const events={},nodes=new Map();
function element(){return {style:{setProperty(){}},children:[],set innerHTML(v){this.children=[];this._html=v;},get innerHTML(){return this._html;},appendChild(c){this.children.push(c);},setAttribute(){},focus(){},getContext(){return {drawImage(){},createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(){}};}};}
const document={visibilityState:'visible',createElement:element,getElementById(id){if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);},querySelectorAll(){return [];}};
const code=files.map(p=>(baseline?old(p):fs.readFileSync(path.join(root,p),'utf8')).split('// ---------- boot')[0]).join('\n');
const shared=files.filter(p=>!p.endsWith('/desktop-feedback.js')&&!p.endsWith('/desktop-animation.js')&&!p.endsWith('/desktop-maximum.js')&&!p.endsWith('/desktop-convergence.js')&&!p.endsWith('/desktop-quake.js')&&!p.endsWith('/desktop-ordinary.js')&&!p.endsWith('/desktop-apshot.js')&&!p.endsWith('/desktop-piercing.js')&&!p.endsWith('/desktop-contract.js')&&!p.endsWith('/desktop-blast.js')&&!p.endsWith('/desktop-granite.js')&&!p.endsWith('/desktop-red.js'));
const hud=read=>Function('addEventListener','document','window',shared.map(p=>read(p).split('// ---------- boot')[0]).join('\n')+'\nreturn pxHUDSurface;')(()=>{},document,{});
const oldHUD=hud(old),sharedHUD=hud(p=>fs.readFileSync(path.join(root,p),'utf8'));
Function('assert','writePNG','output','baseline','previewOnly','oldHUD','sharedHUD','events','addEventListener','document','window',code+'\n'+`
let failed=0,passed=0,checked=0;
const neutral={parts:[],rings:[],lines:[],contacts:[],dust:[],ghosts:[],stars:[],puffs:[],nums:[],words:[],flash:0};
function group(name,fn){try{fn();passed++;console.log('PASS',name);}catch(e){failed++;console.log('FAIL',name+':',e.message);}}
function setup(ch=0,mode='ai',slot=0){
  G.mode=mode;G.running=true;G.paused=G.over=false;G.S=newMatch(slot?14:ch,slot?ch:14,113);G.S.phase='fight';G.S.t=120;
  clearInput();FX.nope=[0,0];FX.silent=true;return G.S;
}
function key(code,type='keydown',repeat=false){for(const fn of events[type]||[])fn({code,repeat,preventDefault(){}});}
function binding(slot){return G.mode==='local'?(slot?BIND.p2:BIND.p1):BIND.solo;}
function press(slot=0,name='DOM',hold=false){const b=binding(slot),code=b[name][0];key(code);if(!hold)key(code,'keyup');return readKeys(b);}
function texts(S=G.S){const rows=[],base=pxText;pxText=function(s,t,x,y,...rest){rows.push({t,x,y});return base(s,t,x,y,...rest);};
  let hud;try{const before=JSON.stringify(S),fx=JSON.stringify(FX);hud=pxHUDSurface(S,labels(),FX);assert.equal(JSON.stringify(S),before);assert.equal(JSON.stringify(FX),fx);checked++;}finally{pxText=base;}
  return {hud,rows};
}
function status(slot=0){const x=(slot?331:14)+216;return texts().rows.find(r=>r.y===349&&r.x===x+4)?.t;}
function crimson(slot=0,n=3){const {hud}=texts(),x=(slot?331:14)+n*72+3,p=(338*640+x)*4;return Array.from(hud.data.slice(p,p+3)).join(',')==='96,51,70';}
function tick(input=[0,0]){step(G.S,input);for(const e of G.S.ev)fxEvent(G.S,e);G.S.ev=[];fxTick();}
function save(name){if(!output)return;for(const stage of ['courtyard','gallery']){const S=JSON.parse(JSON.stringify(G.S));S.stage=stage;const scene=pxWorldSurface(S,neutral);scene.blit(pxHUDSurface(S,labels(),FX),0,0);writePNG(output+'/v113-'+(baseline?'before':'after')+'-'+name+'-'+stage+'.png',scene);}}
group('airborne full-gauge and low-HP Domain/Maximum availability',()=>{
  for(let ch=0;ch<15;ch++)for(const slot of [0,1])for(const hp of [false,true]){
    const S=setup(ch,'local',slot),f=S.f[slot];f.y=GROUND-40;f.st='jump';f.gauge=hp?0:100;if(hp)f.hp=maxHp(f)*DOM_HP;
    assert.equal(status(slot),'LAND FIRST');f.y=GROUND;assert.equal(status(slot),hp?'HP READY':'FULL READY');
  }
});
group('quick Domain press highlights only its own card and expires',()=>{
  setup();const input=press();assert.equal(input,BTN.DOM<<INPUT_SHIFT);assert(crimson(),'no immediate Domain feedback');
  for(let n=0;n<3;n++)assert(!crimson(0,n),'unrelated art flashed');assert(!crimson(1));
  for(let t=0;t<18;t++){assert(crimson());tick([t?0:input,0]);}assert(!crimson(),'cue did not expire');assert.equal(status(),'OR 30% HP');
});
group('unrelated real art rejection does not flash Domain',()=>{
  setup();G.S.f[0].ce=0;const input=press(0,'A1');tick([input,0]);assert.equal(FX.nope[0],17);assert(crimson(0,0));assert(!crimson(),'art rejection flashed Domain');
});
group('used Maximum denial, full-gauge and HP-ready exceptions',()=>{
  for(let ch=0;ch<15;ch++)for(const slot of [0,1]){
    const S=setup(ch,'local',slot),f=S.f[slot];f.domUsed=1;f.gauge=100;f.hp=maxHp(f)*.2;
    press(slot);assert.equal(status(slot),'USED 1/1');assert(crimson(slot));f.domUsed=0;assert(!crimson(slot));assert.equal(status(slot),'HP READY');
    clearInput();f.hp=maxHp(f);assert.equal(status(slot),'FULL READY');press(slot);assert(!crimson(slot));
  }
});
group('readiness clears stale denial through subsequent unavailability',()=>{
  setup();press();assert(crimson());G.S.f[0].gauge=100;tick();assert(!crimson());G.S.f[0].gauge=0;assert(!crimson());
});
group('held key never renews cue; input and simulation remain identical',()=>{
  setup();const before=JSON.stringify(G.S),input=press(0,'DOM',true);assert.equal(JSON.stringify(G.S),before);assert(crimson());
  const control=JSON.parse(before);for(let t=0;t<25;t++){
    const value=t?readKeys(BIND.solo):input;assert.equal(value,t?BTN.DOM:BTN.DOM|(BTN.DOM<<INPUT_SHIFT));
    step(control,[value,0]);control.ev=[];tick([value,0]);assert.deepEqual(G.S,control);if(t>=17)assert(!crimson());
  }key('KeyL','keyup');
});
group('available Domains execute; freeze buffers keep existing behavior',()=>{
  for(let ch=0;ch<15;ch++)for(const hp of [false,true]){
    const S=setup(ch),f=S.f[0];f.gauge=hp?0:100;if(hp)f.hp=maxHp(f)*DOM_HP;
    const input=press(),control=JSON.parse(JSON.stringify(S));assert(!crimson());step(control,[input,0]);control.ev=[];tick([input,0]);
    assert.deepEqual(S,control);assert.equal(f.domUsed,1);assert(!crimson());
  }
  const S=setup();S.freeze=3;const input=press();assert(crimson());tick([input,0]);assert(S.f[0].buf&BTN.DOM);
  S.f[0].gauge=100;for(let t=0;t<4;t++)tick();assert.equal(S.f[0].domUsed,1);assert(!crimson());
});
group('guest slot, local bindings and watch isolation',()=>{
  setup(14,'guest',1);const input=press(1);assert.equal(input,BTN.DOM<<INPUT_SHIFT);assert(crimson(1));assert(!crimson(0));
  setup(0,'local');press(1);assert(crimson(1));assert(!crimson(0));press(0);assert(crimson(0));
  setup(0,'watch');press();assert(!crimson(0));assert(!crimson(1));
});
group('pause, blur, selection, new fight and round cleanup',()=>{
  setup();press();assert(crimson());key('Escape');assert(G.paused);assert(!crimson());key('Escape');assert(!crimson());
  press();assert(crimson());for(const fn of events.blur||[])fn();assert(!crimson());
  press();assert(crimson());G.S.phase='ko';assert(!crimson());G.S.phase='intro';G.S.round++;fxTick();G.S.phase='fight';assert(!crimson());
  press();assert(crimson());toSelect(true);assert(!crimson());
  setup();press();assert(crimson());startFight();G.S.phase='fight';assert(!crimson());
});
group('shared/mobile default is byte-identical; Domain changes stay in cards, guard availability in its lanes',()=>{
  for(let ch=0;ch<15;ch++)for(const kind of ['ordinary','gauge','hp','air','used','denied','art']){
    const S=setup(ch,'local'),f=S.f[0];
    if(['gauge','air'].includes(kind))f.gauge=100;if(kind==='hp')f.hp=maxHp(f)*DOM_HP;
    if(kind==='air'){f.y=GROUND-40;f.st='jump';}if(kind==='used')f.domUsed=1;
    if(kind==='art'){f.ce=0;tick([press(0,'A1'),0]);}else if(kind==='denied')press();
    const prior=oldHUD(S,labels(),FX),base=sharedHUD(S,labels(),FX),current=texts().hud;
    assert.deepEqual(base.data,prior.data,'shared default drifted: '+ch+'/'+kind);
    if(['ordinary','gauge','hp','used'].includes(kind))assert.deepEqual(current.data,prior.data,'ordinary grounded card changed');
    for(let y=0;y<360;y++)for(let x=0;x<640;x++){
      const p=(y*640+x)*4;if(current.data[p]===prior.data[p]&&current.data[p+1]===prior.data[p+1]&&current.data[p+2]===prior.data[p+2]&&current.data[p+3]===prior.data[p+3])continue;
      // v115 also refines desktop guard availability; its dedicated audit
      // checks these exact lane pixels and their attack/air/recovery states.
      const guard=y>=53&&y<73&&((x>=171&&x<255)||(x>=492&&x<576));
      assert(guard||y>=317&&((x>=228&&x<315)||(x>=545&&x<632)),'desktop change escaped Domain cards/guard lanes');
    }
  }
});
// Native 640x360 review pairs, with identical match and FX inputs on either revision.
setup();G.S.f[0].ce=0;press();save('domain-press');
setup(14);G.S.f[0].domUsed=1;press();save('used-maximum');
setup();G.S.f[0].gauge=100;G.S.f[0].y=GROUND-60;G.S.f[0].st='jump';press();save('air-domain');
setup();G.S.f[0].ce=0;tick([press(0,'A1'),0]);save('art-rejection');
console.log(passed+' audit groups passed; '+failed+' failed; '+checked+' read-only HUD checks. Scripted, not played.');
if(failed&&!previewOnly)throw Error(failed+' desktop Domain audit groups failed');
`)(assert,writePNG,output,baseline,previewOnly,oldHUD,sharedHUD,events,(name,fn)=>(events[name]??=[]).push(fn),document,{});
