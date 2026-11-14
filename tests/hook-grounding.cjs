// Third-punch floor contact in actual chains; native raster evidence, not play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,prefix=process.argv[3]||'hook';
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>baseline&&n==='pixel'?require('node:child_process').execFileSync('git',['show','HEAD:src/pixel.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
Function('assert','writePNG','output','prefix','previewOnly',source+'\n'+`
const phases=['hookw','hookload','hook','hookfollow','hookre','hooksettle'];
const labels=[{move:'AD',U:'W',G:'S',P:'F',K:'G'},{move:'<>',U:'^',G:'V',P:'1',K:'2'}];
const neutral={parts:[],rings:[],lines:[],contacts:[],dust:[],ghosts:[],stars:[],puffs:[],nums:[],words:[],flash:0};
let frames=0,timelines=0,ticks=0,holds=0,exports=0;const sinks=new Map();
for(let ch=0;ch<15;ch++)for(const alt of [false,true])for(const pose of phases) {
  const f=pxFighterFrame(ch,pose,alt),s=f.sprite;let bottom=-1;
  for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++)if(s.data[(y*s.w+x)*4+3])bottom=Math.max(bottom,y);
  sinks.set(ch,Math.max(sinks.get(ch)||0,bottom-f.oy));
  if(!previewOnly) {
    assert.equal(bottom,f.oy,'third-punch calf sinks below floor: '+ch+' '+pose);
    for(const leg of ['l','r'])assert(s.data[(f.oy*s.w+f.ox+PX_POSES[pose][leg][1][0])*4+3],'sole left authored floor position');
    for(let p=3;p<s.data.length;p+=4)assert(s.data[p]===0||s.data[p]===255,'soft alpha');
  }
  frames++;
}
for(let ch=0;ch<15;ch++)for(const owner of [0,1])for(const face of [-1,1]) {
  const S=newMatch(ch,ch,947);S.phase='fight';S.t=120;const f=S.f[owner],o=S.f[1-owner];
  f.x=640;o.x=f.x+face*500;f.face=face;o.face=-face;
  const control=JSON.parse(JSON.stringify(S)),seen=new Set();let second=false,third=false;
  for(let t=0;t<160;t++) {
    const pulse=t===0||!second&&f.move==='p1'&&f.mt===6||!third&&f.move==='p2'&&f.mt===6;
    if(pulse&&f.move==='p1')second=true;if(pulse&&f.move==='p2')third=true;
    const input=[0,0];input[owner]=pulse?BTN.P<<INPUT_SHIFT:0;
    S.ev=[];control.ev=[];step(S,input);step(control,input);ticks++;
    assert.equal(JSON.stringify(S),JSON.stringify(control),'presentation changed chain');
    const pose=pxPose(S,f);
    if(f.move==='p3'&&!seen.has(pose)) {
      seen.add(pose);const before=JSON.stringify(S),fx=JSON.stringify(FX),body=new PixelSurface(640,360);pxPaintFighter(body,S,f,{kind:'white'}); // Omit the separate floor shadow.
      if(!previewOnly) {
        let bottom=-1;for(let y=0;y<360;y++)for(let x=0;x<640;x++)if(body.data[(y*640+x)*4+3])bottom=Math.max(bottom,y);
        assert.equal(bottom,GROUND/2,'composited sole below floor '+ch+' '+owner+' '+face+' '+pose);
      }
      const view=pxWorldSurface(S,neutral);view.blit(pxHUDSurface(S,labels,neutral),0,0);
      const clone=JSON.parse(before),snapshot=pxWorldSurface(clone,neutral);snapshot.blit(pxHUDSurface(clone,labels,neutral),0,0);
      assert.deepEqual(view.data,snapshot.data,'snapshot changed chain raster');
      assert.equal(JSON.stringify(S),before);assert.equal(JSON.stringify(FX),fx);
      if(output&&[0,13,14].includes(ch)&&((owner===0&&face===1)||(owner===1&&face===-1)))for(const stage of PX_STAGES) {
        const copy=JSON.parse(before);copy.stage=stage.id;const s=pxWorldSurface(copy,neutral);s.blit(pxHUDSurface(copy,labels,neutral),0,0);
        writePNG(output+'/'+prefix+'-'+stage.id+'-ch'+ch+'-p'+(owner+1)+'-'+(face>0?'right':'left')+'-'+pose+'.png',s);exports++;
      }
      for(const pause of ['hitstop','freeze','stop']) {
        const P=JSON.parse(before),p=P.f[owner];if(pause==='stop')P.stop={o:1-owner,t:3};else P[pause]=3;
        for(let n=0;n<3;n++){step(P,[0,0]);assert.equal(p.mt,f.mt);assert.equal(pxPose(P,p),pose);holds++;}
      }
    }
    if(t>1&&f.st==='idle')break;
  }
  assert(third);for(const pose of phases)assert(seen.has(pose),'missing actual '+pose);timelines++;
}
console.log('PASS',frames,'floor/sole frames;',timelines,'actual chains;',ticks,'parallel-state ticks;',holds,'freeze holds;',exports,'native exports; floor offsets',JSON.stringify([...sinks]));
`)(assert,writePNG,output,prefix,previewOnly);
