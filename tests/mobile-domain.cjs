// Actual mobile pointer/main-loop/simulation paths. Script-tested, not played.
const vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {context}=require('./mobile.cjs');
vm.runInContext(`
const domainFailures=[];let domainChecks=0;
function audit(name,run){try{toMenu();fresh();run();console.log('PASS mobile Domain: '+name);}catch(e){domainFailures.push(name+': '+e.message);console.log('FAIL mobile Domain: '+name+': '+e.message);}}
function domainView(){mobileUpdateControls(G.S);domainChecks++;return mobileArtStates(G.S,G.mode==='guest'?1:0).DOM;}
function tapDomain(){pointer('pointerdown','DOM');pointer('pointerup','DOM');}
function landing(ch=0,clash=false){
  fresh('host',ch);const S=G.S,f=S.f[0];f.gauge=GAUGE_MAX;f.y=GROUND-1;f.vy=8;f.st='jump';
  if(clash){S.f[1].domUsed=1;S.dom={o:1,k:CH[S.f[1].ch].dom.kind,t:0,dur:600,n:0};}
  mobileUpdateControls(S);tapDomain();assert.equal(button('DOM').dataset.denied,'true');
  // Two physics ticks between drawings: land, then consume the buffered tap.
  G.last=now;G.acc=0;frame(now+=34);assert.equal(f.domUsed,1);
  assert.equal(!!S.dom,!clash);assert.equal(domainView().status,'USED 1/1');return S;
}
audit('fifteen full names/types and both slots retain gauge, HP, air and used truth',()=>{
  for(let ch=0;ch<15;ch++)for(const mode of ['host','guest']){
    fresh(mode,ch);if(mode==='guest')G.S.f[1]=newFighter(1,ch);
    const f=G.S.f[mode==='guest'?1:0],a=CH[ch].dom;
    for(const kind of ['gauge','hp','air','used','empty']){
      f.gauge=kind==='empty'?50:100;f.hp=kind==='hp'?maxHp(f)*DOM_HP:maxHp(f);f.y=kind==='air'?GROUND-80:GROUND;f.domUsed=kind==='used'?1:0;
      const before=JSON.stringify(G.S),v=domainView();assert.equal(JSON.stringify(G.S),before);
      assert.equal(v.name,a.name);assert(v.detail.startsWith(a.maximum?'MAXIMUM':'DOMAIN'));
      assert.equal(v.status,{gauge:'FULL READY',hp:'HP READY',air:'LAND FIRST',used:'USED 1/1',empty:'OR 30% HP'}[kind]);
      assert.equal(v.ready,kind==='hp'||kind==='gauge');assert.equal(v.denied,false);
      assert(button('DOM').attributes['aria-label'].includes(a.name));
    }
  }
});
audit('landing and casting between drawings clears obsolete LAND FIRST denial',()=>{
  for(let ch=0;ch<15;ch++){landing(ch);assert.equal(button('DOM').dataset.denied,'false','successful '+CH[ch].dom.name+' still crimson');}
});
audit('a real buffered Domain clash does not inherit the airborne denial',()=>{
  landing(0,true);assert.equal(button('DOM').dataset.denied,'false','clash still crimson');assert(G.S.freeze>0);
});
audit('changed reason clears permanently; fresh used press still responds',()=>{
  tapDomain();assert(domainView().denied);G.S.f[0].domUsed=1;
  assert.equal(domainView().denied,false,'gauge denial followed USED');
  G.S.f[0].domUsed=0;assert.equal(domainView().denied,false,'obsolete cue returned');
  G.S.f[0].domUsed=1;tapDomain();assert(domainView().denied);assert.equal(domainView().status,'USED 1/1');
  now+=301;assert.equal(domainView().denied,false);
});
audit('KO, real newRound and actor/slot replacement discard the old cue',()=>{
  for(const change of [()=>{G.S.phase='ko';},()=>newRound(G.S),()=>{G.S.f[0]=newFighter(0,14);},()=>{G.mode='guest';}]){
    fresh();tapDomain();assert(domainView().denied);change();assert.equal(domainView().denied,false);
    G.S.phase='fight';G.mode='ai';G.S.f[0].ch=0;assert.equal(domainView().denied,false,'old context cue returned');
  }
});
audit('intro and round-result presses do not report an availability failure',()=>{
  for(const phase of ['intro','ko']){fresh();G.S.phase=phase;tapDomain();assert.equal(domainView().denied,false,phase+' press crimson');}
});
audit('guest snapshot can jump from unavailable to consumed without a false denial',()=>{
  netClose();const callbacks={},packets=[],conn={open:true,on(k,fn){callbacks[k]=fn;},send(p){packets.push(JSON.parse(JSON.stringify(p)));}};
  netWire(conn,'guest');callbacks.open();fresh('guest');const f=G.S.f[1];f.gauge=100;f.y=GROUND-1;f.vy=8;f.st='jump';tapDomain();
  advance();const mask=packets.filter(p=>p.t==='in').at(-1).b;assert.equal(mask,BTN.DOM<<INPUT_SHIFT);const control=JSON.parse(JSON.stringify(G.S));
  step(control,[0,mask]);step(control,[0,0]);assert.equal(control.f[1].domUsed,1);
  callbacks.data({t:'s',s:control,e:[]});advance();assert.equal(G.S,control);assert.equal(domainView().denied,false,'consumed guest snapshot crimson');
});
audit('freeze-buffered gauge and HP crossings clear without changing the cast',()=>{
  for(const hp of [false,true]){
    fresh('host');G.S.freeze=2;tapDomain();const first=input();step(G.S,[first,0]);
    assert(domainView().denied);if(hp)G.S.f[0].hp=maxHp(G.S.f[0])*DOM_HP;else G.S.f[0].gauge=100;
    const control=JSON.parse(JSON.stringify(G.S));
    for(let t=0;t<2;t++){step(G.S,[0,0]);step(control,[0,0]);}
    assert.equal(G.S.f[0].domUsed,1);assert.equal(domainView().denied,false);assert.equal(JSON.stringify(G.S),JSON.stringify(control));
  }
});
audit('cue leaves input and simulation unchanged and held DOM does not renew it',()=>{
  fresh('host');pointer('pointerdown','DOM');const control=JSON.parse(JSON.stringify(G.S));
  for(let t=0;t<22;t++){
    const mask=input();assert.equal(mask,t?BTN.DOM:BTN.DOM|(BTN.DOM<<INPUT_SHIFT));
    step(G.S,[mask,0]);step(control,[mask,0]);const before=JSON.stringify(G.S);domainView();
    assert.equal(JSON.stringify(G.S),before);assert.equal(JSON.stringify(G.S),JSON.stringify(control));now+=17;
  }
  assert.equal(domainView().denied,false);pointer('pointerup','DOM');
});
globalThis.domainAuditFailures=domainFailures;
console.log(domainChecks+' read-only mobile Domain state checks');
`,context);
const previewOnly=process.argv.includes('--preview-only');
if(!previewOnly)assert.deepEqual(Array.from(context.domainAuditFailures),[],'mobile Domain audit failed');
const dir=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
if(dir){
  const png=require('./png.cjs'),fs=require('node:fs');fs.mkdirSync(dir,{recursive:true});
  for(const [w,h] of [[667,375],[844,390],[390,844]])for(const [name,ch,clash] of [['domain',0,false],['maximum',14,false],['clash',0,true]]){
    context.previewW=w;context.previewH=h;context.previewCh=ch;context.previewClash=clash;
    const scene=vm.runInContext(`makePreview(previewW,previewH,undefined,previewCh,100,{
      key:'DOM',prepare(S){FX.clock=0;S.stage=previewCh===14?'gallery':'courtyard';G.mode='host';const f=S.f[0];f.gauge=100;f.y=GROUND-1;f.vy=8;f.st='jump';
        if(previewClash){S.f[1].domUsed=1;S.dom={o:1,k:CH[S.f[1].ch].dom.kind,t:0,dur:600,n:0};}},
      run(){frame(now+=34);}
    })`,context);
    png(path.join(dir,'v114-'+(process.argv.includes('--domain-baseline')?'before':'after')+'-'+name+'-'+w+'x'+h+'.png'),scene);
  }
}
