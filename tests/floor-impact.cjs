// Native floor contact from real three-press punch chains. Scripted, never played.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,prefix=process.argv[3]||'floor-impact';
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'];
const oldWorld=require('node:child_process').execFileSync('git',['show','HEAD:src/pixel-world.js'],{cwd:root,encoding:'utf8'});
const source=names.map(n=>baseline&&n==='pixel-world'?oldWorld:fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
const oldDust=Function(names.map(n=>n==='pixel-world'?oldWorld:fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n')+'\nreturn (e)=>{const s=new PixelSurface(192,96);pxDust(s,e);return s.data;};')();
Function('assert','writePNG','output','prefix','previewOnly','oldDust',source+'\n'+`
function reset(){for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];FX.nope=[0,0];FX.impact=FX.bf=FX.banner=null;FX.shake=FX.flash=0;FX.silent=true;}
const controls=[{move:'AD',U:'W',G:'S',P:'F',K:'G'},{move:'<>',U:'^',G:'V',P:'1',K:'2'}];
let timelines=0,ticks=0,rasters=0,minVisible=Infinity;
for(let ch=0;ch<15;ch++)for(const owner of [0,1])for(const dir of [-1,1]) {
  if(previewOnly&&(ch!==0||dir!==(owner?-1:1)))continue;
  reset();const S=newMatch(ch,ch,947);S.phase='fight';S.t=120;S.stage=PX_STAGES[ch%3].id;
  const f=S.f[owner],o=S.f[1-owner];f.x=dir>0?580:700;o.x=f.x+dir*48;f.face=dir;o.face=-dir;
  const B=JSON.parse(JSON.stringify(S));let second=false,third=false,found=false;
  for(let n=0;n<220;n++) {
    const pulse=n===0||!second&&f.move==='p1'&&f.mt===6||!third&&f.move==='p2'&&f.mt===6;
    if(pulse&&f.move==='p1')second=true;if(pulse&&f.move==='p2')third=true;
    const input=[0,0];input[owner]=pulse?BTN.P<<INPUT_SHIFT:0;
    S.ev=[];B.ev=[];step(S,input);step(B,input);ticks++;assert.equal(JSON.stringify(S),JSON.stringify(B));
    for(const e of S.ev)fxEvent(S,e);fxTick();
    if(S.ev.some(e=>e.k==='thud')){found=true;break;}
  }
  assert(second&&third&&found,'chain did not produce a real body impact');
  assert.equal(FX.dust.length,1,'land/thud should coalesce');assert.equal(FX.dust[0].kind,'thud');assert.equal(o.st,'down');
  for(let age=1;age<=24;age++) {
    const before=JSON.stringify(S),effects=JSON.stringify(FX);
    if([1,3,5,8,12,23,24].includes(age)) {
      const frame=pxWorldSurface(S,FX),plain=pxWorldSurface(S,{...FX,dust:[]}),hud=pxHUDSurface(S,controls,FX);frame.blit(hud,0,0);plain.blit(hud,0,0);
      if(!previewOnly){
        assert.equal(JSON.stringify(S),before);assert.equal(JSON.stringify(FX),effects);
        const snap=pxWorldSurface(JSON.parse(before),JSON.parse(effects));snap.blit(hud,0,0);assert.deepEqual(frame.data,snap.data);rasters++;
        let visible=0;for(let p=0;p<frame.data.length;p+=4)if(!frame.data.subarray(p,p+4).every((v,k)=>v===plain.data[p+k]))visible++;
        if(age<=3){assert(visible>=500,'body impact disappears into floor/body: '+visible);minVisible=Math.min(minVisible,visible);}
        if(age===24)assert.equal(visible,0,'dust survives expiry');
      }
      if(output&&ch===0&&dir===(owner?-1:1)&&[1,3,5,8].includes(age))for(const stage of PX_STAGES){const view=pxWorldSurface({...S,stage:stage.id},FX);view.blit(hud,0,0);writePNG(output+'/'+prefix+'-'+stage.id+'-'+(dir>0?'right':'left')+'-t'+age+'.png',view);}
    }
    S.ev=[];B.ev=[];step(S,[0,0]);step(B,[0,0]);ticks++;assert.equal(JSON.stringify(S),JSON.stringify(B));for(const e of S.ev)fxEvent(S,e);fxTick();
  }
  timelines++;
}
if(!previewOnly){
  for(const kind of ['jump','land','thud'])for(let t=0;t<(kind==='jump'?12:kind==='land'?18:24);t++) {
    const e={x:192,y:160,kind,t},s=new PixelSurface(192,96);pxDust(s,e);
    if(kind!=='thud'||t>=6)assert.deepEqual(s.data,oldDust(e),'unrelated dust frame changed');
    let bright=0;for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++){
      const p=(y*s.w+x)*4,a=s.data[p+3];assert(a===0||a===255);
      if(a){assert(x>0&&x<s.w-1&&y>0&&y<=80,'dust clipped/below floor');if(s.data[p]>200&&s.data[p+1]>180)bright++;}
    }
    if(kind==='thud'&&t<4)assert(bright>=300,'initial body impact lacks bright surface: '+bright);
  }
  for(let t=0;t<24;t++)for(const x of [60,60.5,640,1219.5,1220]) {
    const cell=new PixelSurface(192,96);pxDust(cell,{x:192,y:160,kind:'thud',t});
    const actual=new PixelSurface(640,360),expected=new PixelSurface(640,360);
    pxDust(actual,{x,y:GROUND,kind:'thud',t});expected.blit(cell,Math.round(x/2)-96,GROUND/2-80);
    assert.deepEqual(actual.data,expected.data,'fractional/edge root changes the floor burst');
  }
  console.log('PASS',timelines,'actual punch-chain knockdowns;',ticks,'parallel-state ticks;',rasters,'native scene/snapshot checks; minimum initial visible floor burst',minVisible,'pixels; 120 edge/fractional crops; hard alpha, coalescing, expiry and unchanged jump/land/late thud');
}
`)(assert,writePNG,output,prefix,previewOnly,oldDust);
