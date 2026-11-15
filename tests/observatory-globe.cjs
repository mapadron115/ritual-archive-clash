// Native scene/raster regression. No browser motion or owner play is implied.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const writePNG=require('./png.cjs'),root=path.join(__dirname,'..');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null;
const suppress="\nif(typeof pxObservatoryMeridian==='function')pxObservatoryMeridian=()=>{};\n";
const load=omit=>Function(source+(omit?suppress:'')+`\nreturn {
  backdrop:(phase,id)=>pxBackdrop(phase,id),world:S=>pxWorldSurface(S,{}),
  meridian:()=>{const s=new PixelSurface(640,360);if(typeof pxObservatoryMeridian==='function')pxObservatoryMeridian(s);return s;}
};`)();
const prior=load(true),current=load(process.argv.includes('--baseline'));
Function('assert','writePNG','output','prior','current',source+'\n'+`
const box=[321,109,464,247];
const changed=(a,b)=>{let count=0;for(let p=0;p<a.data.length;p+=4)if(!a.data.subarray(p,p+4).every((v,k)=>v===b.data[p+k]))count++;return count;};
// The still meridian must be a large, open, closed loop rather than another
// radial spoke. Flood-fill the opening to detect a broken/slotted outline.
const ring=current.meridian(),center=178*640+392,seen=new Set([center]),queue=[center];
assert.equal(ring.data[center*4+3],0,'meridian fills the center');
for(let i=0;i<queue.length;i++) {
  const at=queue[i],x=at%640,y=Math.floor(at/640);
  assert(x>box[0]&&x<box[2]-1&&y>box[1]&&y<box[3]-1,'fixed ring has no enclosed globe aperture');
  for(const next of [at-1,at+1,at-640,at+640])if(!seen.has(next)&&!ring.data[next*4+3]){seen.add(next);queue.push(next);}
}
assert(seen.size>3000,'fixed ring opening too small to read at native size');
let stages=0,scenes=0,bodies=0,minScene=Infinity,minRim=Infinity;
for(const stage of PX_STAGES)for(let phase=0;phase<PX_STAGE_FRAMES;phase++) {
  const a=current.backdrop(phase,stage.id),b=prior.backdrop(phase,stage.id);
  assert.strictEqual(a,current.backdrop(phase+PX_STAGE_FRAMES*4,stage.id),'cache/loop identity');
  let visible=0;
  for(let y=0;y<360;y++)for(let x=0;x<640;x++) {
    const p=(y*640+x)*4,delta=!a.data.subarray(p,p+4).every((v,k)=>v===b.data[p+k]);
    assert.equal(a.data[p+3],255,'stage alpha');
    if(stage.id!=='observatory'||x<box[0]||x>=box[2]||y<box[1]||y>=box[3])assert(!delta,'changed other scenery/fighting floor');
    if(delta)visible++;
  }
  if(stage.id==='observatory'){assert(visible>250,'fixed meridian lost behind moving ring at phase '+phase);minRim=Math.min(minRim,visible);}
  stages++;
}
const labs=[{P:'F',K:'G',G:'S',A1:'R',A2:'T',A3:'Y',DOM:'H',move:'A/D',U:'W'},null];labs.other='Computer';
for(let ch=0;ch<15;ch++)for(const dir of [-1,1])for(const pose of ['idle','air','guard'])for(const phase of [7,8,9]) {
  const S=newMatch(ch,ch,193);S.stage='observatory';S.phase='fight';S.t=phase*8;
  const f=S.f[0],o=S.f[1];f.x=dir>0?670:900;o.x=dir>0?900:670;f.face=dir;o.face=-dir;
  if(pose==='air'){f.y=430;f.st='jump';}if(pose==='guard'){f.guard=true;f.st='guard';}
  const state=JSON.stringify(S),a=current.world(S),b=prior.world(S);
  assert.equal(JSON.stringify(S),state,'stage changed match');
  assert.deepEqual(a.data,current.world(JSON.parse(state)).data,'snapshot discrepancy');
  const mask=new PixelSurface(640,360);for(const actor of S.f)pxPaintFighter(mask,S,actor,null);
  for(let p=0;p<mask.data.length;p+=4)if(mask.data[p+3]){assert.deepEqual(a.data.subarray(p,p+4),b.data.subarray(p,p+4),'meridian paints over body');bodies++;}
  const difference=changed(a,b);assert(difference>250,'fixed ring hidden in native fight '+[ch,dir,pose,phase,difference]);minScene=Math.min(minScene,difference);
  if(output&&(ch===0||ch===14))for(const [label,raster]of [['before',b],['after',a]]) {
    raster.blit(pxHUDSurface(S,labs),0,0);
    writePNG(output+'/v89-'+label+'-ch'+ch+'-'+pose+'-'+(dir>0?'right':'left')+'-p'+phase+'.png',raster);
  }
  scenes++;
}
console.log('PASS',stages,'stage frames;',scenes,'edge-on native fight snapshots;',bodies,'unchanged body pixels; enclosed aperture',seen.size,'pixels; minimum visible meridian/stage and fight:',minRim,minScene);
`)(assert,writePNG,output,prior,current);
