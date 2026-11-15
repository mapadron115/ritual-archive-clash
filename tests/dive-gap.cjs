// Real Maximum + defender button timelines. Script/raster evidence, never play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null;
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'];
const read=(n,old)=>old?require('node:child_process').execFileSync('git',['show','6abc3b4:src/'+n+'.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8');
function load(old){return Function('assert',names.map(n=>read(n,old)).join('\n')+'\n'+`
  const dax=CH.findIndex(c=>c.dom.kind==='howitzer');
  function begin(owner,ch=2,low=false,edge=false){
    const S=newMatch(owner?ch:dax,owner?dax:ch,193);S.phase='fight';S.t=140;
    const f=S.f[owner],o=S.f[1-owner];f.x=owner?1030:250;o.x=edge?(owner?LEFT:RIGHT):640;
    f.gauge=low?0:100;if(low)f.hp=f.ghost=maxHp(f)*.3;
    const input=[0,0];input[owner]=BTN.DOM;step(S,input);
    assert.equal(f.domUsed,1);assert.equal(f.gauge,0);assert(S.dom?.k==='howitzer');
    // Both readiness routes still spend the once-per-round Maximum, not CE/HP.
    assert.equal(f.hp,low?maxHp(f)*.3:maxHp(f));assert.equal(f.ce,50+CH[dax].regen);
    return S;
  }
  function frame(S,stage){const A=JSON.parse(JSON.stringify(S));A.stage=stage;const s=pxWorldSurface(A,{});s.blit(pxHUDSurface(A,[null,null]),0,0);assert.equal(JSON.stringify(A),JSON.stringify({...S,stage}));return s;}
  function run(owner=0,ch=2,mode='away',delay=0,low=false,edge=false,capture=false){
    const S=begin(owner,ch,low,edge),B=JSON.parse(JSON.stringify(S)),hp=S.f[1-owner].hp;
    let cue=null,locked=null,contact=null,ticks=0,peakHeight=0;const scenes={};
    while(S.dom&&S.dom.t<46){
      const z=S.zones.find(z=>z.k==='target'),t=S.dom.t;
      if(z){if(cue===null){cue=t;locked=z.x;}assert.equal(z.x,locked);assert.equal(z.t,t-cue);assert.equal(z.dur,46-cue);}
      if(capture&&[2,20,35,45].includes(t))scenes[t]=JSON.parse(JSON.stringify(S));
      let b=0;const elapsed=t-cue;
      if(cue!==null&&elapsed>=delay){
        if(mode==='away'||mode==='jumpAway')b=owner?BTN.L:BTN.R;
        if(mode==='toward')b=owner?BTN.R:BTN.L;
        if((mode==='jumpAway'||mode==='jump')&&elapsed===delay)b|=BTN.U;
        if(mode==='guard')b=BTN.G;
        if(mode==='swap'&&elapsed===delay)b=BTN.A1;
      }
      const input=[0,0];input[1-owner]=b;
      // Body pushes can affect jumps: measure at contact, not speed * time.
      step(S,input);step(B,input);ticks++;
      peakHeight=Math.max(peakHeight,GROUND-S.f[1-owner].y);
      assert.equal(JSON.stringify(S),JSON.stringify(B),'snapshot/input determinism');
      if(S.dom?.t===46){contact=JSON.parse(JSON.stringify(S));assert(S.ev.some(e=>e.k==='nuke'));assert(!S.zones.some(z=>z.k==='target'));}
    }
    assert(contact&&cue!==null);if(capture)scenes[46]=contact;
    return {cue,damage:hp-S.f[1-owner].hp,dx:Math.abs(S.f[1-owner].x-locked),height:GROUND-S.f[1-owner].y,peakHeight,scenes,ticks};
  }
  function holds(owner){const S=begin(owner);while(!S.zones.length)step(S,[0,0]);let count=0;
    for(const key of ['freeze','hitstop']){const A=JSON.parse(JSON.stringify(S));A[key]=3;const z=JSON.stringify(A.zones),t=A.dom.t;
      for(let n=0;n<3;n++){step(A,[0,0]);assert.equal(JSON.stringify(A.zones),z);assert.equal(A.dom.t,t);count++;}}
    const A=JSON.parse(JSON.stringify(S));A.stop={o:1-owner,t:3};step(A,[0,0]);assert.equal(A.zones[0].t,S.zones[0].t+1,'existing time-stop zone clock');
    return count;
  }
  return {run,holds,frame,roster:CH.map(c=>({name:c.name,speed:c.speed}))};
`)(assert);}
const current=load(false),prior=load(true);let timelines=0,ticks=0,holds=0;
function check(api,owner,ch,mode,delay,expected,low=false,edge=false){const r=api.run(owner,ch,mode,delay,low,edge);assert.equal(r.damage,expected,[owner,ch,mode,delay,r.dx].join('/'));timelines++;ticks+=r.ticks;return r;}
for(const owner of [0,1])for(const low of [false,true]){
  // Exact adjacent-tick cutoffs, including a human reaction interval before jump.
  for(const [mode,delay,damage] of [['stand',0,250],['guard',0,100],['jump',0,250],['swap',0,0],['away',0,0],['away',8,0],['away',9,250],['toward',11,0],['toward',12,250],['jumpAway',15,0],['jumpAway',16,250]]){
    const r=check(current,owner,2,mode,delay,damage,low);assert.equal(r.cue,2);
    if(mode==='away'&&delay===8)assert(Math.abs(r.dx-155.52)<1e-8);
    if(mode==='jumpAway'&&delay===15)assert(Math.abs(r.dx-155.73)<1e-8);
  }
  // The exact same immediate escape inputs failed before; stationary/guard/swap
  // outcomes remain identical, along with full/low-HP readiness and contact time.
  for(const [mode,damage] of [['away',250],['toward',250],['jumpAway',250],['stand',250],['guard',100],['swap',0]]){
    const r=check(prior,owner,2,mode,0,damage,low);assert.equal(r.cue,20);
  }
}
for(const owner of [0,1]){
  holds+=current.holds(owner);
  for(const mode of ['stand','guard'])assert.deepEqual(current.run(owner,2,mode,0,false,false,true).scenes[46],prior.run(owner,2,mode,0,false,false,true).scenes[46],'unchanged contact state differs from v96');
  // Every build can clear the lock using ordinary forward input at the cue.
  // Retreat intentionally retains character speed: Gideon's slow backstep fails.
  for(let ch=0;ch<15;ch++){
    check(current,owner,ch,'toward',0,0);
    check(current,owner,ch,'away',0,ch===4?250:0);
    check(current,owner,ch,'jumpAway',0,0);
    check(current,owner,ch,'away',25,250);
    check(current,owner,ch,'jump',0,250);
  }
  // Moving further into a wall cannot evade; moving back into the arena can.
  check(current,owner,2,'away',0,250,false,true);
  check(current,owner,2,'toward',0,0,false,true);
}
// Measure actual full-window travel, including changes of facing/body collision.
const measurements={};for(const mode of ['away','toward','jumpAway','jump'])measurements[mode]=current.run(0,2,mode,0);
console.log('PASS',timelines,'actual Maximum/defender timelines;',ticks,'parallel ticks;',holds,'freeze holds; both slots/readiness routes, adjacent-tick escape cutoffs, unchanged damage/cost/contact, all builds and walls');
console.log('Bram full 44-tick travel:',JSON.stringify(Object.fromEntries(Object.entries(measurements).map(([k,r])=>[k,{distance:+r.dx.toFixed(2),height:+r.height.toFixed(2),peakHeight:+r.peakHeight.toFixed(2),damage:r.damage}]))));
if(output){
  for(const owner of [0,1])for(const stage of ['courtyard','gallery','observatory'])for(const [mode,delay] of [['away',0],['away',8],['away',9],['jumpAway',15],['jumpAway',16]])for(const [prefix,api] of [['before',prior],['after',current]]){
    const r=api.run(owner,2,mode,delay,false,false,true);
    for(const [t,S] of Object.entries(r.scenes))writePNG(path.join(output,'v97-'+prefix+'-'+stage+'-p'+(owner+1)+'-'+mode+'-delay'+delay+'-t'+t+'.png'),api.frame(S,stage));
  }
  console.log('Exported native before/after cue, countdown, pre-contact and contact scenes.');
}
