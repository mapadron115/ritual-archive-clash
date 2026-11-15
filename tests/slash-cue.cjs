// Actual slash inputs and exact native scenes; script/raster evidence, never play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,prefix=process.argv[3]||'slash';
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'];
const read=n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8');
const old=n=>require('node:child_process').execFileSync('git',['show','25ee956:src/'+n+'.js'],{cwd:root,encoding:'utf8'});
const oldStep=Function(['sim','fighters','fighters2'].map(old).join('\n')+'\nreturn step;')();
const oldWorld=Function(names.map(n=>n==='pixel-world'?old(n):read(n)).join('\n')+'\nreturn pxWorldSurface;')();
const source=names.map(n=>baseline&&['pixel-world','render'].includes(n)?old(n):read(n)).join('\n');
Function('assert','writePNG','output','prefix','previewOnly','baseline','oldStep','oldWorld',source+'\n'+`
function reset(){for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];FX.nope=[0,0];FX.impact=FX.bf=FX.banner=null;FX.shake=FX.flash=0;FX.silent=true;}
const pixels=s=>new Uint32Array(s.data.buffer,s.data.byteOffset,s.w*s.h);
// Facing is the only new serialized field, on the two presentation events.
const combat=S=>JSON.stringify({...S,ev:S.ev.map(e=>e.k==='slash'?{...e,b:undefined}:e)});
let timelines=0,ticks=0,frames=0,replays=0,minVisible=Infinity;
for(const art of [0,1])for(const owner of [0,1])for(const dir of [-1,1])for(const mode of ['whiff','hit','guard','wall']) {
  reset();const S=newMatch(1,1,999);S.phase='fight';S.t=140;
  const f=S.f[owner],o=S.f[1-owner];f.x=mode==='wall'?(dir>0?RIGHT-110:LEFT+110):dir>0?320:960;f.face=dir;
  o.x=f.x+dir*(mode==='whiff'?600:95);o.face=-dir;
  const B=JSON.parse(JSON.stringify(S));let fired=false,seen=0,connected=false;
  for(let tick=0;tick<45;tick++) {
    S.ev=[];B.ev=[];const input=[0,0];if(tick===0)input[owner]=(art?BTN.A2:BTN.A1)<<INPUT_SHIFT;if(mode==='guard')input[1-owner]=BTN.G;
    step(S,input);oldStep(B,input);ticks++;assert.equal(combat(S),combat(B),'combat changed from v98');
    if(S.ev.some(e=>e.k==='hit'||e.k==='block'))connected=true;
    for(const e of S.ev) {
      fxEvent(S,e);
      if(e.k==='slash'&&!previewOnly) {
        const line=FX.lines.at(-1),remote=JSON.parse(JSON.stringify(S));remote.f.forEach(f=>f.face*=-1);
        fxEvent(remote,JSON.parse(JSON.stringify(e)));assert.deepEqual(FX.lines.pop(),line,'event replay guesses facing from the current actors');replays++;
      }
    }
    fxTick();
    if(S.ev.some(e=>e.k==='slash')){fired=true;for(const e of S.ev.filter(e=>e.k==='slash'))assert.equal(e.b,dir);}
    if(!fired)continue;
    const line=FX.lines.find(l=>l.col==='#ff5a5a'),age=line?line.t:9;
    if(line){seen++;if(!previewOnly&&!baseline){assert.equal(line.dir,dir,[art,owner,dir,mode].join(','));assert.equal(line.heavy,!!art);}}
    if([1,3,6,8,9].includes(age))for(const stage of PX_STAGES) {
      S.stage=B.stage=stage.id;const state=JSON.stringify(S),effects=JSON.stringify(FX);
      const frame=pxWorldSurface(S,FX),plain=pxWorldSurface(S,{...FX,lines:FX.lines.filter(l=>l!==line)}),hud=pxHUDSurface(S,[null,null],FX);frame.blit(hud,0,0);plain.blit(hud,0,0);
      if(!previewOnly) {
        assert.equal(JSON.stringify(S),state);assert.equal(JSON.stringify(FX),effects);
        const snap=pxWorldSurface(JSON.parse(state),JSON.parse(effects));snap.blit(hud,0,0);assert.deepEqual(frame.data,snap.data);
        const bodies=new PixelSurface(640,360);for(const actor of S.f)pxPaintFighter(bodies,S,actor,null);
        const a=pixels(frame),b=pixels(plain),body=pixels(bodies);let visible=0;
        for(let p=0;p<a.length;p++){if(a[p]!==b[p])visible++;if(body[p])assert.equal(a[p],b[p],'slash covers occupied fighter pixels');}
        if(mode==='whiff'&&age<=3){assert(visible>=140,'slash disappears at native size: '+visible);minVisible=Math.min(minVisible,visible);}
        if(age===9)assert.equal(visible,0,'slash survives its existing expiry');frames++;
      }
      if(output&&mode!=='wall'&&[1,3,6,8].includes(age))writePNG(output+'/'+prefix+'-'+(art?'cleave':'dismantle')+'-'+stage.id+'-p'+(owner+1)+'-'+(dir>0?'right':'left')+'-'+mode+'-t'+age+'.png',frame);
    }
    if(age===9)break;
  }
  assert(fired);assert.equal(seen,8);assert.equal(FX.lines.length,0);
  assert.equal(connected,mode!=='whiff');assert(f.cd[art]>0);timelines++;
}
if(!previewOnly) {
  let crops=0;
  for(const heavy of [false,true]) {
    const areas=[];
    for(let t=0;t<=9;t++) {
      const l={kind:'slash',x1:590,y1:460,x2:690,y2:540,dir:1,heavy,t,life:9},s=new PixelSurface(640,360);
      pxSlashCue(s,l);let area=0;for(let p=3;p<s.data.length;p+=4){assert(s.data[p]===0||s.data[p]===255);if(s.data[p])area++;}areas.push(area);
      const mirror=new PixelSurface(640,360);pxSlashCue(mirror,{...l,dir:-1});
      const a=pixels(s),b=pixels(mirror);for(let y=180;y<320;y++)for(let x=250;x<390;x++)assert.equal(a[y*640+x],b[y*640+640-x],'exact facing reflection');
      for(const x of [LEFT,LEFT+.5,640,RIGHT-.5,RIGHT])for(const dir of [-1,1]) {
        const cue={...l,x1:x-50,x2:x+50,dir},full=new PixelSurface(1000,480),crop=new PixelSurface(640,360),expected=new PixelSurface(640,360);
        pxSlashCue(full,{...cue,x1:cue.x1+200,x2:cue.x2+200,y1:cue.y1+100,y2:cue.y2+100});expected.blit(full,-100,-50);
        pxSlashCue(crop,cue);assert.deepEqual(crop.data,expected.data);crops++;
      }
    }
    assert(areas[8]<areas[1]/3,'late slash holds its entire opening shape');assert.equal(areas[9],0);
    const early=new PixelSurface(640,360),middle=new PixelSurface(640,360);const l={x1:590,y1:460,x2:690,y2:540,dir:1,heavy,life:9};
    pxSlashCue(early,{...l,t:1});pxSlashCue(middle,{...l,t:3});assert.notDeepEqual(early.data,middle.data,'slash has no sweep');
  }
  // Two identical fighters can release on the same tick. Each event must retain
  // its own direction even while their bodies overlap or occupy opposite walls.
  for(const distance of [90,180,800]) {
    reset();const S=newMatch(1,1,999);S.phase='fight';S.t=140;S.f[0].x=640-distance/2;S.f[1].x=640+distance/2;
    for(let n=0;n<9;n++){S.ev=[];step(S,n===0?[BTN.A1<<INPUT_SHIFT,BTN.A1<<INPUT_SHIFT]:[0,0]);for(const e of S.ev)fxEvent(S,e);fxTick();}
    assert.equal(FX.lines.length,2);assert.deepEqual(FX.lines.map(l=>l.dir),[1,-1]);
  }
  reset();const S=newMatch(1,1,999);S.phase='fight';S.t=140;
  for(const kind of ['slash','dash','rain','cuts','swap']) {
    reset();fxEvent(S,{k:kind,x:450,y:500,a:700,b:480});
    for(const stage of PX_STAGES){S.stage=stage.id;assert.deepEqual(pxWorldSurface(S,FX).data,oldWorld(S,FX).data,'unrelated effect changed');}
  }
  // Every other real slash-event consumer keeps its original raster.
  let legacy=0;
  for(const id of ['bloodwheel','resonance','vanish','revenge','scissors'])for(const owner of [0,1]) {
    reset();const ch=CH.findIndex(c=>c.arts.some(a=>a.id===id)),S=newMatch(ch,ch,999);S.phase='fight';S.t=140;
    S.f[1-owner].hurtT=S.t;
    const a=CH[ch].arts.findIndex(a=>a.id===id),input=[0,0];input[owner]=BTN['A'+(a+1)]<<INPUT_SHIFT;
    let fired=false;
    for(let n=0;n<40&&!fired;n++) {
      S.ev=[];step(S,n===0?input:[0,0]);for(const e of S.ev)fxEvent(S,e);fxTick();
      if(S.ev.some(e=>e.k==='slash')){fired=true;assert(FX.lines.every(l=>!l.kind));for(const stage of PX_STAGES){S.stage=stage.id;assert.deepEqual(pxWorldSurface(S,FX).data,oldWorld(S,FX).data);legacy++;}}
    }
    assert(fired,'missing real legacy slash: '+id);
  }
  reset();const web=CH.findIndex(c=>c.dom.kind==='web'),W=newMatch(web,web,999);W.phase='fight';W.t=140;W.f[0].gauge=100;
  for(let n=0;n<150;n++) {
    W.ev=[];step(W,n===0?[BTN.DOM<<INPUT_SHIFT,0]:[0,0]);for(const e of W.ev)fxEvent(W,e);fxTick();
    if(W.ev.some(e=>e.k==='slash')){assert(FX.lines.every(l=>!l.kind));for(const stage of PX_STAGES){W.stage=stage.id;assert.deepEqual(pxWorldSurface(W,FX).data,oldWorld(W,FX).data);legacy++;}}
  }
  assert(legacy>=39);
  console.log('PASS',crops,'fractional/edge crops; hard alpha, exact mirrors, sweep/contraction/expiry, simultaneous sources;',legacy,'actual legacy-slash scenes and 15 other scenes unchanged');
}
console.log(previewOnly?'PREVIEW':'PASS',timelines,'actual slash input timelines;',ticks,'v98 parallel-state ticks;',frames,'native/snapshot checks;',replays,'serialized event replays; minimum early whiff visibility',minVisible,'pixels; clear bodies, hit/guard/whiff/walls');
`)(assert,writePNG,output,prefix,previewOnly,baseline,oldStep,oldWorld);
