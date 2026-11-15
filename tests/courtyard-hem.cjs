// Native raster review, not observed browser motion or owner play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
// Keep the v90 square-cut cloth renderer so the before pair survives the coordinator's commit.
const oldLife=`pxStageLife=function(frame) {
  frame%=PX_STAGE_FRAMES;if(PX_LIFE.has(frame))return PX_LIFE.get(frame);
  const angle=frame*Math.PI*2/PX_STAGE_FRAMES;
  const s=new PixelSurface(640,360);
  for(const [x,base,light,shade] of [[77,'#365f7f','#75c9d9','#29465f'],[547,'#824856','#df9a88','#633640']]) {
    for(let j=0;j<62;j++) {
      // The rail pins the top; a travelling fold pulls the free hem farther
      // than the shoulder. Broad light/dark bands read as cloth at play size.
      const loose=j/61,wave=Math.round(Math.sin(angle-j*.065)*7*loose);
      const w=32-Math.round((1-Math.cos(angle-j*.09))*2*loose)-(j>50?Math.round((j-50)/2):0);
      s.rect(x+wave,160+j,w,1,PX_INK);s.rect(x+wave+1,160+j,w-2,1,base);
      if(j===61)continue;
      const fold=Math.round(Math.sin(angle-j*.07)*3*loose);
      s.rect(x+wave+4+fold,160+j,3,1,light);
      s.rect(x+wave+10+fold,160+j,4,1,shade);
      if(j>=15&&j<=37) {
        const half=Math.floor(7*(1-Math.abs(j-26)/11)),cx=x+wave+20;
        s.rect(cx-half,160+j,half*2+1,1,light);
        if(j>=18&&j<=34)s.dot(cx,160+j,base);
      }
    }
  }
  PX_LIFE.set(frame,s);return s;
}`;
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
  assert.deepEqual(cloth.data.slice(0,211*640*4),before.cloth(phase).data.slice(0,211*640*4),'changed pinned cloth/emblem above hem');
  for(let x=60;x<120;x++)if(cloth.data[(253*640+x)*4+3])xs.push(x);
  assert(xs.length>=2,'full-length pointed hem missing');
  hems.push(Math.min(...xs));
  for(const origin of [77,547]) {
    const row=y=>{const out=[];for(let x=origin-8;x<origin+40;x++)if(cloth.data[(y*640+x)*4+3])out.push(x);return out;};
    const tips=row(253),upper=row(236),split=row(250);
    assert(tips.length>=2&&tips.length<=4,'hem must end in two narrow points');
    const runs=values=>values.reduce((n,x,i)=>n+(!i||x>values[i-1]+1),0);
    assert.equal(runs(tips),2,'swallowtail tips joined');
    assert.equal(runs(split),2,'missing open hem notch');
    assert.equal(runs(upper),1,'notch rises into banner body');
    assert(upper.length>=26,'banner narrowed before hem');
    for(let p=3;p<cloth.data.length;p+=4)assert(cloth.data[p]===0||cloth.data[p]===255,'soft cloth alpha');
    assert.equal(row(254).length,0,'hem too long');
  }
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
    if(stage.id==='courtyard'){assert(changed>700,'restored hem invisible at native size');minChanged=Math.min(minChanged,changed);}
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
    s.blit(pxHUDSurface(S,labs),0,0);writePNG(output+'/v91-'+label+'-courtyard-p'+phase+'.png',s);
  }
  if(output&&ch===14&&pose!=='idle')for(const [label,s]of [['before',b],['after',a]]) {
    s.blit(pxHUDSurface(S,labs),0,0);writePNG(output+'/v91-'+label+'-ch14-'+pose+'-'+(dir>0?'right':'left')+'-p'+phase+'.png',s);
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
  writePNG(output+'/v91-'+label+'-cloth-loop.png',sheet);
}
console.log('PASS',stages,'stage frames;',scenes,'native mirror scenes;',bodies,'unchanged body pixels; minimum changed cloth pixels',minChanged,'hem span',Math.max(...hems)-Math.min(...hems),'max step',Math.max(...hems.map((x,n)=>Math.abs(x-hems[(n+1)%16]))));
`)(assert,writePNG,before,after,output);
