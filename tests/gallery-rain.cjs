// Native rain readability and composition; not browser motion or owner play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
// Fixed reference survives coordinator commits and keeps the before pairs exact.
const oldStage=require('node:child_process').execFileSync('git',['show','b72b33c:src/pixel-stage.js'],{cwd:root,encoding:'utf8'});
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'];
const source=old=>names.map(n=>n==='pixel-stage'&&old?oldStage:fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
const before=Function(source(true)+'\nreturn {backdrop:(n,id)=>pxBackdrop(n,id),world:S=>pxWorldSurface(S,{})};')();
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null;
Function('assert','writePNG','before','output',source(process.argv.includes('--baseline'))+'\n'+`
const different=(a,b,p)=>a.data[p]!==b.data[p]||a.data[p+1]!==b.data[p+1]||a.data[p+2]!==b.data[p+2];
const glass=new Set(['23,43,65','38,61,80','48,73,89','62,88,99','36,55,71','68,97,108']);
const base=pxStageVariant('gallery');let frames=0,scenes=0,bodies=0,minChanged=Infinity,minVisible=Infinity;
for(let phase=0;phase<16;phase++)for(const stage of PX_STAGES) {
  const a=pxBackdrop(phase,stage.id),b=before.backdrop(phase,stage.id);let changed=0,heads=0;
  assert.strictEqual(a,pxBackdrop(phase+48,stage.id),'cache/loop identity');
  for(let y=0;y<360;y++)for(let x=0;x<640;x++) {
    const p=(y*640+x)*4;assert.equal(a.data[p+3],255,'soft/empty stage');
    if(!different(a,b,p))continue;
    assert(stage.id==='gallery'&&y>=113&&y<261,'changed other stage/floor/lamp');
    assert(glass.has(Array.from(base.data.subarray(p,p+3)).join(',')),'rain covers stonework');changed++;
    if(a.data[p]===163&&a.data[p+1]===184&&a.data[p+2]===194)heads++;
  }
  if(stage.id==='gallery') {
    assert(changed>=600,'rain still too fine at native size: '+changed);
    assert(heads>=200,'missing broad pale rain heads: '+heads);minChanged=Math.min(minChanged,changed);
  }
  frames++;
}
const labs=[{P:'F',K:'G',G:'S',A1:'R',A2:'T',A3:'Y',DOM:'H',move:'A/D',U:'W'},null];labs.other='Computer';
for(const ch of [0,7,14])for(const dir of [-1,1])for(const kind of ['idle','air','guard'])for(const phase of [0,4,8,12]) {
  const S=newMatch(ch,ch,193);S.stage='gallery';S.phase='fight';S.t=phase*8;
  const f=S.f[0],o=S.f[1];f.x=dir>0?390:890;o.x=dir>0?890:390;f.face=dir;o.face=-dir;
  if(kind==='air'){f.y=430;f.st='jump';}if(kind==='guard'){f.guard=true;f.st='guard';}
  const state=JSON.stringify(S),a=pxWorldSurface(S,{}),b=before.world(S),mask=new PixelSurface(640,360);let visible=0;
  assert.equal(JSON.stringify(S),state,'render mutates match');assert.deepEqual(a.data,pxWorldSurface(JSON.parse(state),{}).data,'snapshot discrepancy');
  for(const actor of S.f)pxPaintFighter(mask,S,actor,null);
  for(let p=0;p<mask.data.length;p+=4) {
    if(mask.data[p+3]){assert(!different(a,b,p),'rain covers fighter');bodies++;}
    if(different(a,b,p))visible++;
  }
  assert(visible>=500,'rain disappears behind fighters: '+visible);minVisible=Math.min(minVisible,visible);
  if(output&&(ch===0&&kind==='idle'&&dir===1||ch===14&&kind!=='idle'))for(const [label,s]of [['before',b],['after',a]]) {
    s.blit(pxHUDSurface(S,labs),0,0);writePNG(output+'/v92-'+label+'-ch'+ch+'-'+kind+'-'+(dir>0?'right':'left')+'-p'+phase+'.png',s);
  }
  scenes++;
}
if(output)for(const [label,renderer]of [['before',before],['after',{backdrop:(n,id)=>pxBackdrop(n,id)}]]) {
  const sheet=new PixelSurface(640,720);sheet.rect(0,0,640,720,PX_INK);
  for(let phase=0;phase<16;phase++) {
    const bg=renderer.backdrop(phase,'gallery'),crop=new PixelSurface(160,160),x=phase%4*160,y=Math.floor(phase/4)*180;
    for(let row=0;row<160;row++)crop.data.set(bg.data.subarray(((110+row)*640+240)*4,((110+row)*640+400)*4),row*160*4);
    sheet.blit(crop,x,y);pxText(sheet,'PHASE '+phase,x+4,y+164,PX_LIGHT);
  }
  writePNG(output+'/v92-'+label+'-rain-loop.png',sheet);
}
console.log('PASS',frames,'stage frames;',scenes,'native mirror scenes;',bodies,'unchanged fighter pixels; minimum changed rain pixels',minChanged,'minimum visible scene change',minVisible);
`)(assert,writePNG,before,output);
