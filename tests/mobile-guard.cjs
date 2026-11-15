// Actual mobile pointer/input/simulation paths; generated models are not phone play.
const vm=require('node:vm'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {context,root}=require('./mobile.cjs');
vm.runInContext(`
const guardFailures=[];let guardChecks=0,guardTicks=0;
function auditGuard(name,run){try{toMenu();fresh();run();console.log('PASS mobile guard: '+name);}catch(e){guardFailures.push(name+': '+e.message);console.log('FAIL mobile guard: '+name+': '+e.message);}}
function guardSetup(ch=0,slot=0){fresh(slot?'guest':'host',ch);if(slot)G.S.f[1]=newFighter(1,ch);G.S.f[0].x=250;G.S.f[1].x=1050;return G.S.f[slot];}
function guardInspect(want){
  const before=JSON.stringify(G.S);mobileUpdateControls(G.S);assert.equal(JSON.stringify(G.S),before,'display mutated simulation');
  const b=button('G'),status=b.children.find(n=>n.className==='guard-status')?.textContent;
  assert.equal(status,want,'button contradicts '+G.S.f[G.mode==='guest'?1:0].st);
  assert.equal(b.children.find(n=>n.className==='guard-name')?.textContent,'GUARD');
  assert.equal(b.dataset.guardLocked,String(['LAND','LOCKED','WAIT'].includes(want)));
  assert.equal(b.dataset.guardActive,String(want==='ON'));
  assert(b.attributes['aria-label'].includes({LAND:'land',LOCKED:'locked',WAIT:'round',HOLD:'Hold',ON:'active'}[want]));
  assert.equal(b.disabled,undefined,'unavailable guard must still accept a hold');
  guardChecks++;
}
function guardTick(){
  const slot=G.mode==='guest'?1:0,mask=input(),bits=slot?[0,mask]:[mask,0],control=JSON.parse(JSON.stringify(G.S));
  step(G.S,bits);step(control,bits);const before=JSON.stringify(G.S);mobileUpdateControls(G.S);
  assert.equal(JSON.stringify(G.S),before);assert.equal(JSON.stringify(G.S),JSON.stringify(control));guardTicks++;
}
function guardPress(key,id=2){pointer('pointerdown',key,id);pointer('pointerup',key,id);}
auditGuard('idle instruction, actual guard and quick release do not confuse contact with defense',()=>{
  for(const slot of [0,1]){
    const f=guardSetup(0,slot);guardInspect('HOLD');pointer('pointerdown','G');guardInspect('HOLD');guardTick();assert.equal(f.st,'guard');guardInspect('ON');
    pointer('pointerup','G');guardTick();assert.equal(f.st,'idle');guardInspect('HOLD');
    assert.equal(button('G').dataset.pressed,'true','120 ms contact acknowledgement lost');
    now+=121;guardInspect('HOLD');assert.equal(button('G').dataset.pressed,'false');
  }
});
auditGuard('real basics and all 45 arts lock guard until recovery with held restoration',()=>{
  for(let ch=0;ch<15;ch++)for(const slot of [0,1])for(const key of ['P','K','A1','A2','A3']){
    const f=guardSetup(ch,slot),o=G.S.f[1-slot];o.nails=3;o.gum=300;o.hurtT=G.S.t;
    for(let t=0;t<80;t++)guardTick();guardPress(key);guardTick();assert.equal(f.st,'atk',CH[ch].name+' '+key);
    pointer('pointerdown','G');guardInspect('LOCKED');let age=0;
    while(f.st==='atk'&&age++<180){guardTick();if(f.st==='atk'&&age%10===0)guardInspect('LOCKED');}
    // Some art callbacks release into guard on their final simulation tick.
    assert(age<180);guardInspect(f.y<GROUND?'LAND':f.st==='guard'?'ON':'HOLD');guardTick();guardInspect(f.y<GROUND?'LAND':'ON');pointer('pointerup','G');
  }
  const f=guardSetup(CH.findIndex(c=>c.arts[0].id==='rock'));pointer('pointerdown','A1',2);guardTick();pointer('pointerdown','G');
  for(let n=0;n<70;n++){guardTick();guardInspect('LOCKED');}assert(f.chg>0);pointer('pointerup','A1',2);
  for(let n=0;n<90&&f.st==='atk';n++)guardTick();guardTick();guardInspect('ON');
});
auditGuard('every actual Domain/Maximum and cinematic hold reports locked',()=>{
  for(let ch=0;ch<15;ch++)for(const slot of [0,1]){
    const f=guardSetup(ch,slot);f.gauge=100;guardPress('DOM');guardTick();assert.equal(f.st,'cast');pointer('pointerdown','G');guardInspect('LOCKED');
    const stT=f.stT;for(let n=0;n<60;n++)guardTick();assert.equal(f.stT,stT);guardInspect('LOCKED');
    let age=0;while(f.st==='cast'&&age++<200){guardTick();if(f.st==='cast'&&age%10===0)guardInspect('LOCKED');}
    assert(age<200);guardTick();guardInspect(f.y<GROUND?'LAND':f.st==='guard'?'ON':'HOLD');
  }
});
auditGuard('real jump and air attacks return through landing into held guard',()=>{
  for(const slot of [0,1])for(const attack of [null,'P','K']){
    const f=guardSetup(14,slot);guardPress('U');guardTick();assert(f.y<GROUND);pointer('pointerdown','G');guardInspect('LAND');
    if(attack){guardPress(attack);guardTick();assert.equal(f.st,'atk');guardInspect('LOCKED');}
    for(let t=0;t<120&&(f.y<GROUND||f.st==='atk');t++){guardTick();if(t%8===0)guardInspect(f.st==='atk'?'LOCKED':f.y<GROUND?'LAND':'HOLD');}
    assert.equal(f.y,GROUND);guardTick();assert.equal(f.st,'guard');guardInspect('ON');
  }
});
auditGuard('real blocks stay active; guard break, shock, hit and down lock until recovery',()=>{
  for(const slot of [0,1])for(const kind of ['block','break','shock','hit','down']){
    const f=guardSetup(0,slot),o=G.S.f[1-slot];o.x=f.x+f.face*80;
    pointer('pointerdown','G');if(['block','break'].includes(kind))guardTick();if(kind==='break')f.guardHp=1;
    hit(G.S,o.i,f,o.x,{dmg:20,kb:0,...(kind==='shock'?{shock:55}:kind==='down'?{lift:8}:{})});
    assert.equal(f.st,kind==='block'?'block':['break','shock'].includes(kind)?'stun':'hit');guardInspect(kind==='block'?'ON':'LOCKED');
    let age=0;while(!free(f)&&age++<180){guardTick();if(age%10===0)guardInspect(f.st==='block'?'ON':!free(f)?'LOCKED':f.y<GROUND?'LAND':'HOLD');}
    assert(age<180);guardTick();guardInspect('ON');
  }
});
auditGuard('real front-hit damage agrees with the displayed action restriction',()=>{
  for(const kind of ['kick','cast','air','guard','block']){
    const f=guardSetup(),o=G.S.f[1];o.x=f.x+80;
    if(kind==='kick'){guardPress('K');guardTick();}if(kind==='cast'){f.gauge=100;guardPress('DOM');guardTick();G.S.freeze=0;}
    if(kind==='air'){guardPress('U');guardTick();}pointer('pointerdown','G');
    if(kind==='guard'||kind==='block'){guardTick();if(kind==='block')hit(G.S,1,f,o.x,{dmg:10});}
    guardInspect(kind==='air'?'LAND':kind==='kick'||kind==='cast'?'LOCKED':'ON');
    prepareGuard(f,o,BTN.G);const hp=f.hp;hit(G.S,1,f,o.x,{dmg:20});assert(Math.abs(hp-f.hp-(['guard','block'].includes(kind)?3:20))<1e-7);
  }
});
auditGuard('serialized guest snapshots update without events; freezes and round phases stay truthful',()=>{
  netClose();const callbacks={},packets=[],conn={open:true,on(k,fn){callbacks[k]=fn;},send(p){packets.push(JSON.parse(JSON.stringify(p)));}};
  netWire(conn,'guest');callbacks.open();guardSetup(0,1);pointer('pointerdown','G');advance();
  assert.equal(packets.filter(p=>p.t==='in').at(-1).b,BTN.G|(BTN.G<<INPUT_SHIFT));
  for(const [st,y,want] of [['atk',GROUND,'LOCKED'],['cast',GROUND,'LOCKED'],['jump',GROUND-50,'LAND'],['block',GROUND,'ON'],['guard',GROUND,'ON'],['idle',GROUND,'HOLD']]){
    const snapshot=JSON.parse(JSON.stringify(G.S));snapshot.f[1].st=st;snapshot.f[1].y=y;
    callbacks.data({t:'s',s:snapshot,e:[]});advance();guardInspect(want);assert.equal(G.S,snapshot);
  }
  for(const phase of ['intro','ko','over']){G.S.phase=phase;guardInspect('WAIT');}newRound(G.S);guardInspect('WAIT');G.S.phase='fight';guardInspect('HOLD');
  for(const pause of ['freeze','hitstop','stop']){
    const f=guardSetup();guardPress('K');guardTick();pointer('pointerdown','G');if(pause==='stop')G.S.stop={o:1,t:4};else G.S[pause]=4;
    const mt=f.mt;for(let n=0;n<4;n++){guardTick();assert.equal(f.mt,mt);guardInspect('LOCKED');}
  }
});
auditGuard('main-loop recovery, multiple fingers, cancellation and lifecycle retain real input semantics',()=>{
  // Keep the real CPU/frame path while making its choices reproducible.
  const random=Math.random;Math.random=()=>.99;
  try{for(const mode of ['ai','host']){
    fresh(mode);guardPress('K');advance(2);pointer('pointerdown','G');advance();guardInspect('LOCKED');
    advance(35);assert(['guard','block'].includes(G.S.f[0].st));guardInspect('ON');
  }}finally{Math.random=random;}
  fresh();pointer('pointerdown','G',1);pointer('pointerdown','G',2);guardTick();pointer('pointerup','G',1);guardTick();guardInspect('ON');
  pointer('pointercancel','G',2);guardTick();guardInspect('HOLD');assert.equal(input(),0);
  for(const stop of [()=>togglePause(),()=>win.dispatch('blur'),()=>mobileResize(),()=>toSelect(),()=>startFight()]){
    fresh();pointer('pointerdown','G');advance(2);stop();assert.equal(MOBILE.pointers.size,0);assert.equal(input(),0);assert.equal(button('G').dataset.pressed,'false');
  }
});
globalThis.guardAuditFailures=guardFailures;console.log(guardChecks+' read-only guard button checks; '+guardTicks+' parallel simulation ticks. Scripted, not played.');
`,context);
const previewOnly=process.argv.includes('--preview-only');
if(!previewOnly)assert.deepEqual(Array.from(context.guardAuditFailures),[],'mobile guard audit failed');
const css=fs.readFileSync(path.join(root,'mobile/mobile.css'),'utf8');
if(!previewOnly){assert(css.indexOf('button[data-guard-locked="true"]')>css.indexOf('#touchControls button.held'));console.log('PASS mobile guard CSS: locked plate follows held/contact styling (static cascade check)');}
const dir=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
if(dir){
  const png=require('./png.cjs');fs.mkdirSync(dir,{recursive:true});
  for(const [w,h] of [[667,375],[844,390],[390,844]])for(const kind of ['kick-recovery','cast-hold','air-guard','break-recovery','guard-restored']){
    Object.assign(context,{previewW:w,previewH:h,previewKind:kind});
    const scene=vm.runInContext(`makePreview(previewW,previewH,undefined,previewKind==='cast-hold'?14:0,100,{
      key:'G',held:true,prepare(S){G.mode='host';FX.clock=0;S.stage=previewKind==='cast-hold'?'gallery':'courtyard';
        if(previewKind==='kick-recovery'){guardPress('K');guardTick();for(let t=0;t<18;t++)guardTick();}
        if(previewKind==='cast-hold'){S.f[0].gauge=100;guardPress('DOM');guardTick();for(let t=0;t<62;t++)guardTick();}
        if(previewKind==='air-guard'){guardPress('U');guardTick();for(let t=0;t<15;t++)guardTick();}
      },run(){if(previewKind==='guard-restored')guardTick();if(previewKind==='break-recovery'){guardTick();const f=G.S.f[0];f.guardHp=1;hit(G.S,1,f,f.x+80,{dmg:20});for(let t=0;t<45;t++)guardTick();}}
    })`,context);
    png(path.join(dir,'v116-'+(process.argv.includes('--guard-baseline')?'before':'after')+'-'+kind+'-'+w+'x'+h+'.png'),scene);
  }
}
