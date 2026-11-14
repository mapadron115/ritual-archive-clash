// Real seeded basic-hit events and native fight scenes; scripting, never play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,prefix=process.argv[3]||'black-flash';
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'];
const source=names.map(n=>baseline&&n==='pixel-world'?require('node:child_process').execFileSync('git',['show','HEAD:src/pixel-world.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
Function('assert','writePNG','output','prefix','previewOnly','Math',source+'\n'+`
const controls=[{move:'AD',U:'W',G:'S',P:'F',K:'G'},{move:'<>',U:'^',G:'V',P:'1',K:'2'}];
function reset(){Math.seed=42;for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];FX.nope=[0,0];FX.impact=FX.bf=FX.banner=null;FX.shake=FX.flash=0;FX.silent=true;}
const changed=(a,b)=>{let n=0;for(let p=0;p<a.data.length;p+=4)if(!a.data.subarray(p,p+4).every((v,k)=>v===b.data[p+k]))n++;return n;};
if(!previewOnly){
  const S=newMatch(0,14,1972);S.phase='fight';S.t=120;
  const bf={x:640,y:350,t:32,life:36},a=pxWorldSurface(S,{bf}),b=pxWorldSurface(S,{});
  for(let y=165;y<=185;y++)for(let x=310;x<=330;x++){
    const p=(y*640+x)*4;assert.deepEqual(a.data.subarray(p,p+4),b.data.subarray(p,p+4),'late Black Flash still pins full spokes to the contact');
  }
  assert(changed(a,b)<200,'late Black Flash still occupies full lightning spokes');
}
let timelines=0,ticks=0,rasters=0,minVisible=Infinity;
for(let ch=0;ch<15;ch++)for(const owner of [0,1])for(const dir of [-1,1])for(const move of ['p1','k','jp','jk']){
  if(previewOnly&&(ch!==0||dir!==(owner?-1:1)||move!=='p1'))continue;
  reset();const S=newMatch(ch,ch,1972);S.phase='fight';S.t=120;
  const f=S.f[owner],o=S.f[1-owner];f.x=dir>0?540:740;o.x=f.x+dir*60;f.face=dir;o.face=-dir;
  if(move==='jp'||move==='jk'){f.y=o.y=GROUND-85;f.air=o.air=1;f.st=o.st='jump';}
  const B=JSON.parse(JSON.stringify(S));let fired=false;
  for(let n=0;n<60;n++){
    const input=[0,0];input[owner]=n===0?(move==='p1'||move==='jp'?BTN.P:BTN.K)<<INPUT_SHIFT:0;
    S.ev=[];B.ev=[];step(S,input);step(B,input);ticks++;assert.equal(JSON.stringify(S),JSON.stringify(B));
    for(const e of S.ev)fxEvent(S,e);fxTick();
    if(FX.bf){assert(S.ev.some(e=>e.k==='blackflash'&&e.a===owner));fired=true;break;}
  }
  assert(fired,'missing seeded Black Flash: '+[ch,owner,dir,move]);
  assert.equal(FX.bf.life,36);assert.equal(S.hitstop,20);assert.equal(f.zone,BF_ZONE_TICKS);
  const hashes=[];
  for(let age=1;age<=36;age++){
    assert.equal(FX.bf?.t??36,age);const state=JSON.stringify(S),effects=JSON.stringify(FX);
    if([1,4,7,12,18,26,32,35,36].includes(age)){
      const frame=pxWorldSurface(S,FX),plain=pxWorldSurface(S,{...FX,bf:null});
      if(!previewOnly){
        assert.equal(JSON.stringify(S),state);assert.equal(JSON.stringify(FX),effects);
        assert.deepEqual(frame.data,pxWorldSurface(JSON.parse(state),JSON.parse(effects)).data,'snapshot changes rupture');
        const visible=changed(frame,plain);
        if(age===7){assert(visible>=500,'Black Flash unreadable in native scene: '+visible);minVisible=Math.min(minVisible,visible);}
        if(age===36)assert.equal(visible,0,'Black Flash survives expiry');
        hashes.push(Buffer.from(frame.data).toString('base64'));rasters++;
      }
      if(output&&ch===0&&move==='p1'&&dir===(owner?-1:1))for(const stage of PX_STAGES){
        const view=pxWorldSurface({...S,stage:stage.id},FX);view.blit(pxHUDSurface(S,controls,FX),0,0);
        writePNG(output+'/'+prefix+'-'+stage.id+'-'+(dir>0?'right':'left')+'-t'+age+'.png',view);
      }
    }
    S.ev=[];B.ev=[];step(S,[0,0]);step(B,[0,0]);ticks++;assert.equal(JSON.stringify(S),JSON.stringify(B),'rupture changes recovery');
    for(const e of S.ev)fxEvent(S,e);fxTick();
  }
  if(!previewOnly)assert(new Set(hashes).size>=7,'missing distinct rupture phases');timelines++;
}
if(!previewOnly){
  // Isolated geometry: broad dark/red strike, opening forks, detached late shards.
  let firstArea=0,lastArea=0;
  for(let t=0;t<=36;t++){
    const cell=new PixelSurface(256,224);pxBlackFlash(cell,{x:256,y:224,t,life:36});
    let area=0,red=0,dark=0;
    for(let y=0;y<224;y++)for(let x=0;x<256;x++){
      const p=(y*256+x)*4;if(!cell.data[p+3])continue;
      area++;assert.equal(cell.data[p+3],255,'soft alpha');assert(x>3&&x<252&&y>3&&y<220,'rupture clipped in its cell');
      if(cell.data[p]>170&&cell.data[p+1]<120)red++;
      if(cell.data[p]<40&&cell.data[p+1]<40)dark++;
    }
    if(t===1){firstArea=area;assert(red>200&&dark>200,'strike lacks broad red/black material');}
    if(t===35)lastArea=area;
    if(t>=36)assert.equal(area,0);
    // Translation/cropping uses one rounded event root, including offscreen contact.
    if([1,7,18,32,35].includes(t))for(const [x,y]of [[60,542],[60.5,300.5],[640,60],[1219.5,542],[1220,300]]){
      const a=new PixelSurface(640,360),b=new PixelSurface(640,360);pxBlackFlash(a,{x,y,t,life:36});b.blit(cell,Math.round(x/2)-128,Math.round(y/2)-112);assert.deepEqual(a.data,b.data,'fractional/edge contact');
    }
  }
  assert(lastArea<firstArea*.05,'rupture does not disperse before expiry');
  // The rupture sits below both fighters, even during the initial impact silhouette.
  for(const kind of ['black','white',null])for(const big of [0,60]){
    const S=newMatch(14,14,1972);S.phase='fight';S.t=120;S.f[0].x=600;S.f[1].x=680;S.f[0].big=big;
    const impact=kind?{kind,t:1,sil:5,a:0}:null,F={bf:{x:680,y:542,t:1,life:36},impact};
    const a=pxWorldSurface(S,F),b=pxWorldSurface(S,{impact}),mask=new PixelSurface(640,360);
    for(const f of S.f)pxPaintFighter(mask,S,f,impact);
    for(let p=0;p<mask.data.length;p+=4)if(mask.data[p+3])assert.deepEqual(a.data.subarray(p,p+4),b.data.subarray(p,p+4),'rupture covers a fighter');
  }
  console.log('PASS',timelines,'real seeded grounded/air punch/kick Black Flashes;',ticks,'parallel-state ticks;',rasters,'native frames/snapshots; minimum expanded rupture',minVisible,'pixels; 37 hard-alpha phase frames, late detachment/expiry, 25 edge crops and unchanged body/impact silhouettes');
}
`)(assert,writePNG,output,prefix,previewOnly,Object.assign(Object.create(Math),{seed:42,random(){this.seed=(this.seed*1664525+1013904223)>>>0;return this.seed/4294967296;}}));
