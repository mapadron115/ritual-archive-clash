// Synthetic contacts through the actual mobile scripts. No browser/phone play.
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {context,root}=require('./mobile.cjs');
vm.runInContext(`
const feedbackFailures=[];
function feedbackCase(name,run){try{toMenu();fresh();run();console.log('PASS feedback: '+name);}catch(e){feedbackFailures.push(name+': '+e.message);}}
feedbackCase('short taps stay visible for 120 ms without holding game input',()=>{
  for(const key of Object.keys(BTN)) {
    fresh();pointer('pointerdown',key);pointer('pointerup',key);
    assert.equal(button(key).dataset.pressed,'true',key+' tap vanished before a frame');
    assert.equal(input(),BTN[key]<<INPUT_SHIFT);assert.equal(input(),0);
    now+=119;mobileUpdateControls(G.S);assert.equal(button(key).dataset.pressed,'true');
    now+=2;mobileUpdateControls(G.S);assert.equal(button(key).dataset.pressed,'false');
  }
});
feedbackCase('low CE lights only the touched unavailable art for 300 ms',()=>{
  G.S.f[0].ce=0;mobileUpdateControls(G.S);
  pointer('pointerdown','A1');pointer('pointerup','A1');advance(2);
  assert.equal(button('A1').dataset.denied,'true');
  for(const key of ['A2','A3','DOM'])assert.equal(button(key).dataset.denied,'false',key+' falsely rejected');
  assert.equal(G.S.f[0].move,null);assert.equal(G.S.f[0].cd[0],0);
  now+=301;mobileUpdateControls(G.S);assert.equal(button('A1').dataset.denied,'false');
});
feedbackCase('Domain and used Maximum show unavailable touch feedback immediately',()=>{
  pointer('pointerdown','DOM');
  assert.equal(button('DOM').dataset.denied,'true','Domain has no failure flash');
  assert.equal(MOBILE.views.get('DOM').status.textContent,'OR 30% HP');
  pointer('pointerup','DOM');advance(2);assert.equal(G.S.f[0].domUsed,0);
  fresh('ai',14);G.S.f[0].domUsed=1;mobileUpdateControls(G.S);
  pointer('pointerdown','DOM');assert.equal(button('DOM').dataset.denied,'true');
  assert.equal(MOBILE.views.get('DOM').status.textContent,'USED 1/1');pointer('pointerup','DOM');
});
feedbackCase('airborne Domain gives LAND FIRST instead of FULL READY',()=>{
  G.S.f[0].gauge=GAUGE_MAX;G.S.f[0].y=GROUND-80;mobileUpdateControls(G.S);
  assert.equal(MOBILE.views.get('DOM').status.textContent,'LAND FIRST');
  assert.equal(button('DOM').dataset.ready,'false');
  pointer('pointerdown','DOM');assert.equal(button('DOM').dataset.denied,'true');pointer('pointerup','DOM');
  G.S.f[0].y=GROUND;mobileUpdateControls(G.S);
  assert.equal(MOBILE.views.get('DOM').status.textContent,'FULL READY');assert.equal(button('DOM').dataset.denied,'false');
});
feedbackCase('setup, cooldown, low HP and airborne arts keep their own reasons',()=>{
  for(const [ch,key,prepare,reason] of [
    [0,'A1',f=>f.cd[0]=60,'WAIT 1.0S'],[5,'A1',f=>f.hp=1,'LOW HP'],
    [7,'A2',()=>{},'NEED NAIL'],[7,'A3',()=>{},'HIT FIRST'],[11,'A2',()=>{},'NEED GUM'],
    [0,'A1',f=>f.y=GROUND-80,'LAND FIRST']]) {
    fresh('ai',ch);prepare(G.S.f[0]);mobileUpdateControls(G.S);const before=JSON.stringify(G.S);
    pointer('pointerdown',key);assert.equal(button(key).dataset.denied,'true',reason);
    assert.equal(MOBILE.views.get(key).status.textContent,reason);
    assert.equal(JSON.stringify(G.S),before,'feedback changed simulation');pointer('pointerup',key);
  }
});
feedbackCase('ready free-CE, swap and HP Domain taps never flash denial',()=>{
  for(const kind of ['garden','stone','hp']) {
    fresh('ai',kind==='garden'?3:kind==='stone'?2:0);
    if(kind==='garden')G.S.dom={k:'garden',o:0};
    if(kind==='stone'){G.S.f[0].ce=0;G.S.proj.push({k:'stone',o:0});}
    if(kind==='hp')G.S.f[0].hp=maxHp(G.S.f[0])*DOM_HP;
    const key=kind==='hp'?'DOM':kind==='stone'?'A2':'A1';mobileUpdateControls(G.S);
    assert.equal(button(key).dataset.ready,'true');pointer('pointerdown',key);
    assert.equal(button(key).dataset.denied,'false');assert.equal(button(key).dataset.pressed,'true');pointer('pointerup',key);
  }
  fresh();G.S.f[0].ce=0;pointer('pointerdown','A1');pointer('pointerup','A1');
  G.S.f[0].ce=100;mobileUpdateControls(G.S);assert.equal(button('A1').dataset.denied,'false');
  G.S.f[0].cd[0]=60;mobileUpdateControls(G.S);assert.equal(button('A1').dataset.denied,'false','old denial returned on later cooldown');
});
feedbackCase('guest feedback uses local fighter, not opponent or global nope events',()=>{
  fresh('guest');G.S.f[0].ce=100;G.S.f[1].ce=0;mobileUpdateControls(G.S);
  pointer('pointerdown','A1');assert.equal(button('A1').dataset.denied,'true');pointer('pointerup','A1');
  for(const key of ['A2','A3','DOM'])assert.equal(button(key).dataset.denied,'false');
  clearInput();FX.nope=[18,18];mobileUpdateControls(G.S);
  for(const key of ['A1','A2','A3','DOM'])assert.equal(button(key).dataset.denied,'false','global nope leaked');
  G.S.f[1].ce=100;mobileUpdateControls(G.S);pointer('pointerdown','A1');
  assert.equal(button('A1').dataset.denied,'false');pointer('pointerup','A1');
});
feedbackCase('cancellation, duplicate contacts and lifecycle clear without stale flashes',()=>{
  for(const cancel of ['pointercancel','lostpointercapture']) {
    fresh();pointer('pointerdown','P');pointer(cancel,'P');
    assert.equal(button('P').dataset.pressed,'false');assert.equal(input(),0);
  }
  fresh();pointer('pointerdown','P',1);pointer('pointerdown','P',2);pointer('pointerup','P',1);
  now+=121;mobileUpdateControls(G.S);assert.equal(button('P').dataset.pressed,'true');
  pointer('pointerup','P',2);mobileUpdateControls(G.S);assert.equal(button('P').dataset.pressed,'false');
  for(const action of [()=>togglePause(),()=>show('online'),()=>startFight(),()=>toSelect(),()=>win.dispatch('blur'),()=>mobileResize()]) {
    fresh();G.S.f[0].ce=0;pointer('pointerdown','A1');pointer('pointerup','A1');action();
    for(const b of buttons){assert.equal(b.dataset.pressed,'false');assert.equal(b.dataset.denied,'false');}
  }
  fresh('watch');pointer('pointerdown','P');assert.equal(button('P').dataset.pressed,'false');assert.equal(input(),0);
});
globalThis.feedbackAuditFailures=feedbackFailures;
`,context);
const previewOnly=process.argv.includes('--preview-only');
if(previewOnly)console.log('Preview-only audit findings:',context.feedbackAuditFailures);
else assert.deepEqual(Array.from(context.feedbackAuditFailures),[],'mobile touch-feedback audit failed');
// Static cascade guard only: native :active/capture/style behavior needs a browser.
const css=fs.readFileSync(path.join(root,'mobile/mobile.css'),'utf8');
if(!previewOnly){
  assert(css.indexOf('#touchControls button[data-denied="true"]')>css.indexOf('#touchControls button.held'),'held CSS overrides denial');
  assert(css.includes('button[data-pressed="true"]'));assert(css.includes('inset 0 4px')&&css.includes('inset 0 -4px'));
  console.log('PASS feedback CSS: denial wins over held/active; persistent touch flash and paired rails');
}
const preview=process.argv.find(a=>a.startsWith('--preview-dir='));
if(preview){
  const dir=preview.slice('--preview-dir='.length),png=require('./png.cjs'),before=process.argv.includes('--feedback-baseline');
  fs.mkdirSync(dir,{recursive:true});
  for(const [w,h] of [[667,375],[844,390],[390,844]])for(const [name,ce,key,held] of [
    ['low-ce-held',0,'A1',true],['low-ce-released',0,'A1',false],['domain',100,'DOM',false],['punch-tap',100,'P',false]
  ])png(path.join(dir,`v112-${before?'before':'after'}-${name}-${w}x${h}.png`),context.makePreview(w,h,undefined,0,ce,{key,held}));
}
