// Native raster review, not observed browser motion or owner play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
// Keep the old cloth renderer so the before pair survives the coordinator's commit.
const oldLife=`pxStageLife=function(frame) {
  frame%=PX_STAGE_FRAMES;if(PX_LIFE.has(frame))return PX_LIFE.get(frame);
  const angle=frame*Math.PI*2/PX_STAGE_FRAMES,s=new PixelSurface(640,360);
  for(const [x,base,light]of [[77,'#365f7f','#75c9d9'],[547,'#824856','#df9a88']]) {
    for(let j=0;j<62;j++) {
      const wave=Math.round(Math.sin(angle+j*.08)*2*j/62),w=j>50?32-Math.round((j-50)/2):32;
      s.rect(x+wave,160+j,w,1,PX_INK);s.rect(x+wave+1,160+j,w-2,1,base);s.rect(x+wave+4,160+j,2,1,light);
    }
    const wx=Math.round(Math.sin(angle+1.8));
    s.poly([[x+16+wx,175],[x+23+wx,186],[x+16+wx,197],[x+9+wx,186]],light);s.line([x+16+wx,178],[x+16+wx,194],base);
  }
  PX_LIFE.set(frame,s);return s;
};`;
const load=baseline=>Function(source+'\n'+(baseline?oldLife:'')+`\nreturn {
  backdrop:(n,id)=>pxBackdrop(n,id),cloth:n=>pxStageLife(n),world:S=>pxWorldSurface(S,{})
};`)();
const before=load(true),after=load(process.argv.includes('--baseline'));
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null;
Function('assert','writePNG','before','after','output',source+'\n'+`
const different=(a,b,p)=>a.data[p]!==b.data[p]||a.data[p+1]!==b.data[p+1]||a.data[p+2]!==b.data[p+2]||a.data[p+3]!==b.data[p+3];
let stages=0,minChanged=Infinity,scenes=0,bodies=0;
const hems=[];
for(let phase=0;phase<16;phase++) {
  const cloth=after.cloth(phase),xs=[];
  for(let x=60;x<120;x++)if(cloth.data[(220*640+x)*4+3])xs.push(x);
  hems.push(Math.min(...xs));
  // Attachment stays on the rail while the free hem moves.
  for(const x of [77,547])assert.equal(cloth.data[(160*640+x)*4+3],255,'detached top');
  for(const stage of PX_STAGES) {
    const a=after.backdrop(phase,stage.id),b=before.backdrop(phase,stage.id);let changed=0;
    assert.strictEqual(a,after.backdrop(phase+48,stage.id),'loop/cache identity');
    for(let y=0;y<360;y++)for(let x=0;x<640;x++) {
      const p=(y*640+x)*4,delta=different(a,b,p);assert.equal(a.data[p+3],255,'soft/empty stage');
      if(delta) {
        assert(stage.id==='courtyard'&&y>=160&&y<254&&((x>=68&&x<117)||(x>=538&&x<587)),'changed other scenery/floor');changed++;
      }
    }
    if(stage.id==='courtyard'){assert(changed>700,'cloth change invisible at native size');minChanged=Math.min(minChanged,changed);}
    stages++;
  }
}
assert(Math.max(...hems)-Math.min(...hems)>=12,'hem still barely moves');
assert(Math.max(...hems.map((x,n)=>Math.abs(x-hems[(n+1)%16])))<=3,'hem jumps at loop seam');
const labs=[{P:'F',K:'G',G:'S',A1:'R',A2:'T',A3:'Y',DOM:'H',move:'A/D',U:'W'},null];labs.other='Computer';
for(const ch of [0,7,14])for(const dir of [-1,1])for(const pose of ['idle','air','guard'])for(const phase of [0,4,8,12]) {
  const S=newMatch(ch,ch,193);S.phase='fight';S.stage='courtyard';S.t=phase*8;
  const f=S.f[0],o=S.f[1];f.x=dir>0?180:1100;o.x=dir>0?1100:180;f.face=dir;o.face=-dir;
  if(pose==='air'){f.st='jump';f.y=430;}if(pose==='guard'){f.st='guard';f.guard=true;}
  const snapshot=JSON.stringify(S),a=after.world(S),b=before.world(S),mask=new PixelSurface(640,360);
  assert.equal(JSON.stringify(S),snapshot,'render mutated match');assert.deepEqual(a.data,after.world(JSON.parse(snapshot)).data,'snapshot differs');
  for(const actor of S.f)pxPaintFighter(mask,S,actor,null);
  for(let p=0;p<mask.data.length;p+=4)if(mask.data[p+3]){assert(!different(a,b,p),'cloth covers fighter');bodies++;}
  if(output&&ch===0&&dir===1&&pose==='idle')for(const [label,s]of [['before',b],['after',a]]) {
    s.blit(pxHUDSurface(S,labs),0,0);writePNG(output+'/v90-'+label+'-courtyard-p'+phase+'.png',s);
  }
  scenes++;
}
if(output)for(const [label,renderer]of [['before',before],['after',after]]) {
  const sheet=new PixelSurface(640,280);sheet.rect(0,0,640,280,PX_INK);
  for(let n=0;n<16;n++) {
    const cloth=renderer.cloth(n),col=n%8,row=Math.floor(n/8);
    pxText(sheet,'P'+n,col*80+8,row*140+6,PX_LIGHT);
    for(let y=0;y<104;y++)for(let x=0;x<55;x++) {
      const p=((y+155)*640+x+65)*4;if(cloth.data[p+3])sheet.data.set(cloth.data.subarray(p,p+4),((row*140+y+25)*640+col*80+x+8)*4);
    }
  }
  writePNG(output+'/v90-'+label+'-cloth-loop.png',sheet);
}
console.log('PASS',stages,'stage frames;',scenes,'native mirror scenes;',bodies,'unchanged body pixels; minimum changed cloth pixels',minChanged,'hem span',Math.max(...hems)-Math.min(...hems),'max step',Math.max(...hems.map((x,n)=>Math.abs(x-hems[(n+1)%16]))));
`)(assert,writePNG,before,after,output);
