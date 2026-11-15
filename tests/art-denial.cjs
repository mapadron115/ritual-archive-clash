// Rejected real commands and the existing 18-update feedback lifecycle. Not play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,prefix=process.argv[3]||'denial';
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','ai','render','main'];
const read=n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8').split('// ---------- boot')[0];
const old=n=>require('node:child_process').execFileSync('git',['show','45af126:src/'+n+'.js'],{cwd:root,encoding:'utf8'}).split('// ---------- boot')[0];
const shell=[()=>{},{},{getElementById(){return {getContext(){return {};}};},querySelectorAll(){return [];}}];
const oldHUD=Function('addEventListener','window','document',names.map(n=>n==='pixel-hud'?old(n):read(n)).join('\n')+'\nreturn pxHUDSurface;')(...shell);
Function('assert','writePNG','output','prefix','previewOnly','oldHUD','addEventListener','window','document',names.map(n=>baseline&&n==='pixel-hud'?old(n):read(n)).join('\n')+'\n'+`
let timelines=0,ticks=0,checks=0,unchanged=0,minChange=Infinity;
function reset(){for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];FX.nope=[0,0];FX.banner=FX.impact=FX.bf=null;FX.flash=FX.shake=0;FX.silent=true;}
function inspect(S,mode='local') {
  G.mode=mode;const before=JSON.stringify(S),effects=JSON.stringify(FX),lab=labels(),hud=pxHUDSurface(S,lab,FX);
  if(!previewOnly){
    const prior=oldHUD(S,lab,FX),regions=[];
    for(let i=0;i<2;i++)for(let n=0;n<4;n++){
      const ready=n===3?domReady(S.f[i]):pxArtCardState(S,S.f[i],n).ready;
      if(FX.nope[i]>0&&!ready)regions.push({x:(i?331:14)+n*72,w:n===3?83:67,changed:0});
    }
    for(let y=0;y<360;y++)for(let x=0;x<640;x++){
      const p=(y*640+x)*4;assert(hud.data[p+3]===0||hud.data[p+3]===255,'soft alpha');
      if(hud.data[p]!==prior.data[p]||hud.data[p+1]!==prior.data[p+1]||hud.data[p+2]!==prior.data[p+2]||hud.data[p+3]!==prior.data[p+3]){
        const r=regions.find(r=>x>=r.x&&x<r.x+r.w&&y>=319&&y<358);
        assert(r,'feedback changed a ready card, other actor or unrelated HUD pixel');r.changed++;
      }
    }
    for(const r of regions){assert(r.changed>=1500,'rejection lacks broad visible feedback: '+r.changed);minChange=Math.min(minChange,r.changed);}
    if(!regions.length){assert.deepEqual(hud.data,prior.data);unchanged++;}
    assert.deepEqual(hud.data,pxHUDSurface(JSON.parse(before),lab,JSON.parse(effects)).data,'snapshot with replayed FX drifted');
    assert.equal(JSON.stringify(S),before,'HUD wrote match');assert.equal(JSON.stringify(FX),effects,'HUD wrote effects');checks++;
  }
  return hud;
}
function save(S,name){if(output)for(const stage of PX_STAGES){const copy=JSON.parse(JSON.stringify(S));copy.stage=stage.id;const scene=pxWorldSurface(copy,FX);scene.blit(pxHUDSurface(copy,labels(),FX),0,0);writePNG(output+'/'+prefix+'-'+stage.id+'-'+name+'.png',scene);}}
function run(ch,owner,n,kind) {
  reset();G.mode='local';const S=newMatch(ch,ch,105);S.phase='fight';S.t=120;
  const f=S.f[owner],o=S.f[1-owner],a=CH[ch].arts[n];f.ce=100;
  // Isolate cooldown/energy from setup failures. None of these fixtures bypass
  // the command path: a real upper-bit key press must emit the nope event.
  if(['hairpin','resonance'].includes(a.id))o.nails=3;
  if(['contract','slingshot'].includes(a.id))o.gum=120;
  if(a.id==='rewind')f.hist=Array.from({length:10},()=>[f.x,f.y]);
  if(kind==='ce')f.ce=0;
  if(kind==='cooldown')f.cd[n]=90;
  if(kind==='hp')f.hp=a.hp+1;
  if(kind==='setup'){o.nails=0;o.gum=0;o.hurtT=-999;f.hist=[];}
  const control=JSON.parse(JSON.stringify(S)),input=[0,0],bit=BTN['A'+(n+1)];input[owner]=bit|(bit<<INPUT_SHIFT);
  inspect(S);step(S,input);step(control,input);ticks++;
  assert.deepEqual(S,control);const events=S.ev.filter(e=>e.k==='nope');assert.equal(events.length,1,'no real rejection: '+a.id+'/'+kind);assert.equal(events[0].a,owner);
  assert.equal(f.ce,control.f[owner].ce);assert.equal(f.st,'idle','rejected command began a move');
  for(const e of S.ev)fxEvent(S,e);assert.equal(FX.nope[owner],18);inspect(S,owner?'guest':'ai');
  if((ch===0&&n===0&&kind==='ce')||(a.id==='hairpin'&&kind==='setup')||(a.id==='piercing'&&kind==='hp'))save(S,'ch'+ch+'-p'+(owner+1)+'-'+kind);
  // Advance presentation exactly once per update. The held art key must not
  // retrigger denial, and expiry must restore byte-identical ordinary cards.
  for(let t=1;t<=18;t++){
    S.ev=[];control.ev=[];const held=[0,0];held[owner]=BTN['A'+(n+1)];step(S,held);step(control,held);ticks++;
    assert.deepEqual(S,control,'rendering changed simulation');assert(!S.ev.some(e=>e.k==='nope'),'held key retriggered rejection');fxTick();
    assert.equal(FX.nope[owner],18-t);if(t===9||t===17||t===18)inspect(S);
  }
  timelines++;
}
for(let ch=0;ch<15;ch++)for(let owner=0;owner<2;owner++)for(let n=0;n<3;n++)for(const kind of ['ce','cooldown'])run(ch,owner,n,kind);
for(let ch=0;ch<15;ch++)for(let owner=0;owner<2;owner++)for(let n=0;n<3;n++){
  const a=CH[ch].arts[n];if(a.hp)run(ch,owner,n,'hp');if(['hairpin','resonance','contract','slingshot','rewind'].includes(a.id))run(ch,owner,n,'setup');
}
// Already-ready cards stay clear even with a denial still alive. Test the
// readiness transition, both actors at once, used Domains and every mode.
reset();const S=newMatch(0,14,105);S.phase='fight';S.f[0].ce=S.f[1].ce=0;FX.nope=[18,18];
for(const mode of ['ai','local','watch','host','guest']){inspect(S,mode);S.f[0].ce=100;S.f[0].gauge=100;inspect(S,mode);S.f[0].ce=0;S.f[0].gauge=0;}
S.f[0].domUsed=1;S.f[1].domUsed=1;inspect(S);FX.nope=[0,0];inspect(S);
if(previewOnly)console.log('EXPORTED baseline scenes; appearance assertions skipped');
else console.log('PASS',timelines,'actual rejected-command timelines;',ticks,'parallel ticks;',checks,'native HUD/snapshot checks;',unchanged,'ordinary HUDs identical; minimum denied-card change',minChange,'pixels');
`)(assert,writePNG,output,prefix,previewOnly,oldHUD,...shell);
