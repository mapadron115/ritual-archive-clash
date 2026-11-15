// Real guard-break/shock recovery clocks; native rasters, not play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,prefix=process.argv[3]||'stun';
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>baseline&&n==='pixel-world'?
  require('node:child_process').execFileSync('git',['show','7c83acc:src/pixel-world.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
Function('assert','writePNG','output','prefix','previewOnly',source+'\n'+`
const labels=[null,null];let timelines=0,rasters=0,holds=0,minVisible=Infinity;
const saved=typeof pxStunCrown==='function'?pxStunCrown:null;
if(!previewOnly)assert(saved,'stun crown still uses fixed-height pale diamonds');
for(let ch=0;ch<15;ch++)for(const owner of [0,1])for(const face of [-1,1])for(const kind of ['break','shock']) {
  if(previewOnly&&![0,14].includes(ch))continue;
  const S=newMatch(ch,ch,977);S.phase='fight';S.t=140;
  const f=S.f[owner],o=S.f[1-owner];f.x=face>0?540:740;o.x=f.x+face*200;f.face=face;o.face=-face;
  f.st=kind==='break'?'guard':'idle';f.guardHp=kind==='break'?1:100;
  hit(S,o.i,f,o.x,{dmg:30,kb:4,...(kind==='shock'?{shock:30}:{})});
  assert.equal(f.st,'stun');const control=JSON.parse(JSON.stringify(S));let age=0;
  while(f.st==='stun'&&age<80) {
    if([50,40,30,16,5].includes(f.stT)) {
      const before=JSON.stringify(S),view=pxWorldSurface(S,{}),hud=pxHUDSurface(S,labels,{});view.blit(hud,0,0);
      if(!previewOnly) {
        const crown=new PixelSurface(640,360);saved(crown,S,f);
        const snap=new PixelSurface(640,360),copy=JSON.parse(before);saved(snap,copy,copy.f[owner]);assert.deepEqual(crown.data,snap.data);
        pxStunCrown=()=>{};const plain=pxWorldSurface(S,{});pxStunCrown=saved;plain.blit(hud,0,0);
        let visible=0;for(let p=0;p<view.data.length;p+=4)if(!view.data.subarray(p,p+4).every((v,k)=>v===plain.data[p+k]))visible++;
        assert(visible>=120,'crown disappears at native size: '+ch+'/'+f.stT+'/'+visible);minVisible=Math.min(minVisible,visible);
        for(let p=3;p<crown.data.length;p+=4)assert(crown.data[p]===0||crown.data[p]===255,'soft alpha');
        // Crown is underneath both bodies, including a nearby unstunned foe.
        for(const actor of S.f) {
          const body=new PixelSurface(640,360);pxPaintFighter(body,S,actor,null);
          const full=pxWorldSurface(S,{});for(let p=0;p<body.data.length;p+=4)if(body.data[p+3])assert.deepEqual(full.data.subarray(p,p+4),body.data.subarray(p,p+4),'crown over body');
        }
        for(const pause of ['hitstop','freeze','stop']) {
          const T=JSON.parse(before);T.hitstop=T.freeze=0;T.stop=null;
          if(pause==='stop')T.stop={o:1-owner,t:3};else T[pause]=3;
          for(let n=0;n<3;n++){step(T,[0,0]);const held=new PixelSurface(640,360);saved(held,T,T.f[owner]);assert.deepEqual(held.data,crown.data,'orbit moved during '+pause);holds++;}
        }
        assert.equal(JSON.stringify(S),before,'drawing mutated match');rasters++;
      }
      if(output&&kind==='break'&&[0,14].includes(ch)&&face===(owner?-1:1)&&[40,30,5].includes(f.stT)&&S.hitstop===0)for(const stage of PX_STAGES) {
        const T={...S,stage:stage.id},scene=pxWorldSurface(T,{});scene.blit(hud,0,0);
        writePNG(output+'/'+prefix+'-ch'+ch+'-'+stage.id+'-'+(face>0?'right':'left')+'-remaining'+f.stT+'.png',scene);
      }
    }
    step(S,[0,0]);step(control,[0,0]);assert.equal(JSON.stringify(S),JSON.stringify(control),'rendering changed recovery');age++;
  }
  assert.equal(f.st,'idle');if(!previewOnly){const clear=new PixelSurface(640,360);saved(clear,S,f);assert(!clear.data.some(Boolean),'crown survived recovery');}
  timelines++;
}
if(!previewOnly)for(const ch of [0,4,14])for(const big of [0,100])for(const x of [LEFT,RIGHT]) {
  const S=newMatch(ch,ch,977);S.phase='fight';const f=S.f[0];f.st='stun';f.stT=30;f.big=big;f.x=x;
  pxWorldSurface(S,{});const a=new PixelSurface(640,360);saved(a,S,f);assert(a.data.some(Boolean));
  f.st='hit';const b=new PixelSurface(640,360);saved(b,S,f);assert(!b.data.some(Boolean),'ordinary hit shows stun');
}
console.log('PASS',timelines,'guard-break/shock timelines;',rasters,'native/snapshot checks;',holds,'pause holds; minimum visible crown pixels',minVisible);
`)(assert,writePNG,output,prefix,previewOnly);
