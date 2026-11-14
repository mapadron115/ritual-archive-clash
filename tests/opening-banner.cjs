// Real intro/opening inputs, native composites and occlusion checks. Not played.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,prefix=process.argv[3]||'opening';
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>baseline&&['pixel-world','render'].includes(n)?require('node:child_process').execFileSync('git',['show','HEAD:src/'+n+'.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
Function('assert','writePNG','output','prefix','previewOnly',source+'\n'+`
const labels=[{move:'AD',U:'W',G:'S',P:'F',K:'G'},{move:'<>',U:'^',G:'V',P:'1',K:'2'}];
let timelines=0,ticks=0,layouts=0,rasters=0;
function resetFX(){for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];FX.banner=FX.impact=FX.bf=null;FX.shake=FX.flash=0;FX.nope=[0,0];FX.silent=true;}
const overlap=(a,b)=>a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h;
function save(S,name) {
  for(const stage of PX_STAGES){const copy=JSON.parse(JSON.stringify(S));copy.stage=stage.id;const s=pxWorldSurface(copy);s.blit(pxHUDSurface(copy,labels),0,0);writePNG(output+'/'+prefix+'-'+stage.id+'-'+name+'.png',s);}
}
function check(S,raster=false) {
  const before=JSON.stringify(S),effects=JSON.stringify(FX),b=FX.banner;
  if(b&&!previewOnly) {
    const p=pxBannerLayout(b);assert.equal(p.size,3,'opening type shrank');
    for(const f of S.f) {
      assert(!overlap(p,pxBodyBounds(S,f)),'opening banner covers fighter '+f.ch+' / '+f.i+' at '+S.t);
      const a=pxActorAnchor(f),w=pxTextWidth('CPU1'); // Widest tag in any mode.
      assert(!overlap(p,{x:a.x-w/2-3,y:a.y-2,w:w+6,h:14}),'opening banner covers actor tag '+f.ch+' / '+f.i+' at '+S.t+' '+JSON.stringify(a));
    }
    layouts++;
    if(raster) {
      const texts=[],paint=pxText;
      pxText=function(s,t,x,y,c,z=1){texts.push({t:String(t),x,y,w:pxTextWidth(t,z),h:7*z});return paint(s,t,x,y,c,z);};
      let hud;try{hud=pxHUDSurface(S,labels);}finally{pxText=paint;}
      const title=texts.find(t=>t.t===b.txt&&t.h===21);assert(title,'missing opening title');
      for(const t of texts)if(t!==title)assert(!overlap(p,t),'opening plaque covers HUD '+t.t);
      for(let i=3;i<hud.data.length;i+=4)assert(hud.data[i]===0||hud.data[i]===255,'soft alpha');
      const clone=JSON.parse(before),fx=JSON.parse(effects);assert.deepEqual(hud.data,pxHUDSurface(clone,labels,fx).data,'snapshot changed opening');rasters++;
    }
  }
  assert.equal(JSON.stringify(S),before,'presentation changed simulation');assert.equal(JSON.stringify(FX),effects,'drawing changed effects');
}
for(let ch=0;ch<15;ch++)for(let owner=0;owner<2;owner++)for(const action of ['stand','approach','jump','forward-jump','back-jump','air-punch','both-jump']) {
  resetFX();const S=newMatch(ch,ch,1000);S.stage='courtyard';const control=JSON.parse(JSON.stringify(S));
  function advance(input,raster){
    S.ev=[];control.ev=[];step(S,input);step(control,input);ticks++;
    for(const e of S.ev)fxEvent(S,e);fxTick();check(S,raster);
    assert.equal(JSON.stringify(S),JSON.stringify(control),'opening rendering changed fight');
  }
  for(let t=0;t<100;t++) {
    advance([0,0],t===0||t===40||t===99);
    if(!previewOnly) {
      assert.equal(S.phase,t===99?'fight':'intro');
      assert.equal(FX.banner?.txt,t<70?'ROUND 1':t===99?'FIGHT!':undefined,'announcement timing changed');
    }
    if(output&&ch===0&&owner===0&&action==='stand'&&t===40)save(S,'round');
  }
  for(let t=0;t<46;t++) {
    const input=[0,0],toward=owner?BTN.L:BTN.R,away=owner?BTN.R:BTN.L;
    if(action==='approach')input[owner]=toward;
    if(['jump','forward-jump','back-jump','air-punch','both-jump'].includes(action)&&t===0)input[owner]=BTN.U<<INPUT_SHIFT;
    if(action==='forward-jump')input[owner]|=toward;
    if(action==='back-jump')input[owner]|=away;
    if(action==='air-punch'&&t===12)input[owner]|=BTN.P<<INPUT_SHIFT;
    if(action==='both-jump'&&t===0)input[1-owner]=BTN.U<<INPUT_SHIFT;
    advance(input,[5,10,15,20,30,44,45].includes(t));
    if(!previewOnly)assert.equal(FX.banner?.txt,t<44?'FIGHT!':undefined,'FIGHT lifetime changed');
    if(output&&((ch===0&&owner===0&&action==='jump')||(ch===13&&owner===1&&action==='forward-jump')||(ch===14&&owner===0&&action==='both-jump'))&&[5,15,25].includes(t))save(S,'ch'+ch+'-p'+(owner+1)+'-'+action+'-t'+t);
  }
  timelines++;
}
// Longer rounds fit too; unrelated banners retain their established layouts.
if(!previewOnly)for(const round of [2,9,10,99]) {resetFX();const S=newMatch(0,14,1000);S.round=round;fxEvent(S,{k:'round',a:round});check(S,true);}
if(!previewOnly)for(const b of [{txt:'COUNTER!',small:1},{txt:'DOMAIN CLASH'},{txt:'DOMAIN',sub:'DOMAIN EXPANSION'},{txt:'K.O.'}]) {
  const p=pxBannerLayout(b);assert.equal(p.textY,b.small?105:150);assert.equal(p.y,b.small?96:141);assert.equal(p.h,p.size*7+18);assert.equal(p.w,b.small?pxTextWidth(b.txt,p.size)+20:640);
}
console.log('PASS',timelines,'actual intro/opening timelines;',ticks,'parallel ticks;',layouts,'body/tag-clear opening layouts;',rasters,'read-only HUD/snapshot rasters; 30 native exports when requested');
`)(assert,writePNG,output,prefix,previewOnly);
