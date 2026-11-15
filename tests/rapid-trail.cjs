// Real Rapid Slash inputs and native-size rendering; this is not human play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,prefix=process.argv[3]||'rapid';
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'];
const read=n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8');
const old=n=>require('node:child_process').execFileSync('git',['show','53f628d:src/'+n+'.js'],{cwd:root,encoding:'utf8'});
const oldStep=Function(['sim','fighters','fighters2'].map(old).join('\n')+'\nreturn step;')();
const oldWorld=Function(names.map(n=>n==='pixel-world'?old(n):read(n)).join('\n')+'\nreturn pxWorldSurface;')();
const source=names.map(n=>baseline&&['pixel-world','render'].includes(n)?old(n):read(n)).join('\n');
Function('assert','writePNG','output','prefix','previewOnly','oldStep','oldWorld',source+'\n'+`
function reset(){for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];FX.nope=[0,0];FX.impact=FX.bf=FX.banner=null;FX.shake=FX.flash=0;FX.silent=true;}
let timelines=0,ticks=0,frames=0,minVisible=Infinity;
for(const owner of [0,1])for(const dir of [-1,1])for(const mode of ['whiff','hit','guard','wall']) {
  reset();const ch=CH.findIndex(c=>c.arts.some(a=>a.id==='rapid')),S=newMatch(ch,ch,983);S.phase='fight';S.t=140;
  const f=S.f[owner],o=S.f[1-owner];f.x=mode==='wall'?(dir>0?1100:180):dir>0?400:880;f.face=dir;
  o.x=mode==='wall'?f.x-dir*400:f.x+dir*(mode==='whiff'?600:220);o.face=-dir;
  const B=JSON.parse(JSON.stringify(S));let fired=false,seen=0;
  for(let tick=0;tick<45;tick++) {
    S.ev=[];B.ev=[];const inputs=[0,0];if(tick===0)inputs[owner]=BTN.A3<<INPUT_SHIFT;if(mode==='guard')inputs[1-owner]=BTN.G;
    step(S,inputs);oldStep(B,inputs);ticks++;assert.equal(JSON.stringify(S),JSON.stringify(B),'combat differs from v97');
    for(const e of S.ev)fxEvent(S,e);fxTick();
    if(S.ev.some(e=>e.k==='dash')){fired=true;assert.equal(FX.lines[0].life,12);}
    if(!fired)continue;
    const line=FX.lines.find(l=>l.col==='#6fe8ff'),age=line?line.t:12;
    if(line)seen++;
    if([1,4,8,11,12].includes(age))for(const stage of PX_STAGES) {
      S.stage=B.stage=stage.id;const state=JSON.stringify(S),effects=JSON.stringify(FX);
      const view=pxWorldSurface(S,FX),plain=pxWorldSurface(S,{...FX,lines:[]}),hud=pxHUDSurface(S,[null,null],FX);view.blit(hud,0,0);plain.blit(hud,0,0);
      if(!previewOnly) {
        assert.equal(JSON.stringify(S),state);assert.equal(JSON.stringify(FX),effects);
        const snap=pxWorldSurface(JSON.parse(state),JSON.parse(effects));snap.blit(hud,0,0);assert.deepEqual(view.data,snap.data);
        const pixels=s=>new Uint32Array(s.data.buffer,s.data.byteOffset,s.w*s.h),a=pixels(view),b=pixels(plain);
        const bodies=new PixelSurface(640,360);for(const actor of S.f)pxPaintFighter(bodies,S,actor,null);const body=pixels(bodies);
        let visible=0;for(let p=0;p<a.length;p++){if(a[p]!==b[p])visible++;if(body[p])assert.equal(a[p],b[p],'trail paints over a fighter');}
        if(mode==='whiff'&&age<=4){assert(visible>=400,'trail disappears at native size: '+visible);minVisible=Math.min(minVisible,visible);}
        if(age===12)assert.equal(visible,0,'trail survives expiry');frames++;
      }
      if(output&&[1,4,8,11].includes(age))writePNG(output+'/'+prefix+'-'+stage.id+'-p'+(owner+1)+'-'+(dir>0?'right':'left')+'-'+mode+'-t'+age+'.png',view);
    }
    if(age===12)break;
  }
  assert(fired);assert.equal(seen,11);assert.equal(FX.lines.length,0);
  if(mode==='whiff'||mode==='wall')assert.equal(o.hp,maxHp(o));else assert(o.hp<maxHp(o));
  assert.equal(f.cd[2]>0,true);timelines++;
}
if(!previewOnly) {
  let early=0,late=0;
  for(let t=0;t<12;t++) {
    const l={kind:'dash',x1:400,y1:542,x2:760,y2:542,t,life:12,w:12,col:'#6fe8ff'},s=new PixelSurface(640,360);
    pxRapidTrail(s,l);let area=0;for(let p=3;p<s.data.length;p+=4){assert(s.data[p]===0||s.data[p]===255);if(s.data[p])area++;}
    if(t===1)early=area;if(t===11)late=area;
    const mirror=new PixelSurface(640,360);pxRapidTrail(mirror,{...l,x1:880,x2:520});
    for(let y=230;y<300;y++)for(let x=195;x<385;x++)assert.deepEqual(s.data.subarray((y*640+x)*4,(y*640+x)*4+4),mirror.data.subarray((y*640+640-x)*4,(y*640+640-x)*4+4),'facing mirror');
  }
  assert(late<early/5,'trail does not disperse');
  let crops=0;
  for(let t=0;t<12;t++)for(const x of [LEFT,LEFT+.5,640,RIGHT-.5,RIGHT])for(const dir of [-1,1]) {
    const l={kind:'dash',x1:x,y1:GROUND-70,x2:x+dir*360,y2:GROUND-70,t,life:12};
    const full=new PixelSurface(1000,480),crop=new PixelSurface(640,360),expected=new PixelSurface(640,360);
    pxRapidTrail(full,{...l,x1:l.x1+200,x2:l.x2+200,y1:l.y1+100,y2:l.y2+100});expected.blit(full,-100,-50);
    pxRapidTrail(crop,l);assert.deepEqual(crop.data,expected.data);crops++;
  }
  const empty=new PixelSurface(640,360);pxRapidTrail(empty,{x1:400,x2:400,t:0,life:12});assert(empty.data.every(n=>n===0));
  reset();const S=newMatch(13,13,983);S.phase='fight';S.t=140;
  for(const kind of ['slash','rain','cuts','swap']) {
    reset();fxEvent(S,{k:kind,x:450,y:500,a:700,b:480});
    for(const stage of PX_STAGES){S.stage=stage.id;assert.deepEqual(pxWorldSurface(S,FX).data,oldWorld(S,FX).data,'unrelated line effect changed');}
  }
  console.log('PASS',crops,'fractional/edge crops; zero-distance safety; 12 non-dash scene comparisons identical to v97');
}
console.log(previewOnly?'PREVIEW':'PASS',timelines,'actual Rapid Slash timelines;',ticks,'v97 parallel-state ticks;',frames,'native/snapshot checks; minimum early whiff visibility',minVisible,'pixels; body clearance, contact/guard/whiff/walls, mirrors, hard alpha and expiry');
`)(assert,writePNG,output,prefix,previewOnly,oldStep,oldWorld);
