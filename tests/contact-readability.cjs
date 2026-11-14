// First-contact visibility in actual-input native fight scenes; scripting, never play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,prefix=process.argv[3]||'contacts';
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>
  baseline&&n==='pixel-world'?require('node:child_process').execFileSync('git',['show','HEAD:src/pixel-world.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
Function('assert','writePNG','output','prefix','previewOnly',source+'\n'+`
function reset(){for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];FX.nope=[0,0];FX.impact=FX.bf=FX.banner=null;FX.shake=FX.flash=0;FX.silent=true;}
const controls=[{move:'AD',U:'W',G:'S',P:'F',K:'G'},{move:'<>',U:'^',G:'V',P:'1',K:'2'}];
let timelines=0,rasters=0,ticks=0,minVisible=Infinity;
for(let ch=0;ch<15;ch++)for(const owner of [0,1])for(const dir of [-1,1])for(const kind of ['hit','block','break','heavy']) {
  if(previewOnly&&(ch!==0||dir!==(owner?-1:1)))continue;
  reset();const S=newMatch(ch,ch,1000);S.phase='fight';S.t=120;S.stage=PX_STAGES[ch%3].id;
  const f=S.f[owner],o=S.f[1-owner];f.x=dir>0?580:700;o.x=f.x+dir*70;f.face=dir;o.face=-dir;
  if(kind==='break')o.guardHp=1;
  const B=JSON.parse(JSON.stringify(S));let found=false;
  for(let n=0;n<60;n++) {
    const input=[0,0];input[owner]=n===0?(kind==='heavy'?BTN.K:BTN.P)<<INPUT_SHIFT:0;input[1-owner]=kind==='block'||kind==='break'?BTN.G:0;
    S.ev=[];B.ev=[];step(S,input);step(B,input);ticks++;
    assert.equal(JSON.stringify(S),JSON.stringify(B),'drawing changed combat');
    for(const e of S.ev)fxEvent(S,e);fxTick();
    if(FX.contacts.length){found=true;break;}
  }
  assert(found,'missing real contact');const contact=FX.contacts[0];
  assert.equal(contact.kind,kind==='heavy'?'hit':kind);
  if(kind==='heavy')assert.equal(contact.heavy,S.ev.find(e=>e.k==='hit').a>70,'existing damage-based heavy threshold changed');
  for(let age=1;age<=contact.life;age++) {
    assert.equal(contact.t,age);const before=JSON.stringify(S),effects=JSON.stringify(FX);
    const frame=pxWorldSurface(S,FX),plain=pxWorldSurface(S,{...FX,contacts:[]}),hud=pxHUDSurface(S,controls,FX);frame.blit(hud,0,0);plain.blit(hud,0,0);
    if(!previewOnly) {
      assert.equal(JSON.stringify(S),before,'drawing mutates match');assert.equal(JSON.stringify(FX),effects,'drawing mutates FX');
      const snap=pxWorldSurface(JSON.parse(before),JSON.parse(effects));snap.blit(hud,0,0);assert.deepEqual(frame.data,snap.data,'snapshot changes contact');
      let visible=0;for(let p=0;p<frame.data.length;p+=4)if(!frame.data.subarray(p,p+4).every((v,k)=>v===plain.data[p+k]))visible++;
      if(age<=3){assert(visible>=300,'first contact too small in full native scene: '+kind+' / '+age+' / '+visible);minVisible=Math.min(minVisible,visible);}
      if(age===contact.life)assert.equal(visible,0,'contact survives expiry');
      rasters++;
    }
    if(output&&ch===0&&dir===(owner?-1:1)&&[1,3,5].includes(age))for(const stage of PX_STAGES){const view=pxWorldSurface({...S,stage:stage.id},FX);view.blit(hud,0,0);writePNG(output+'/'+prefix+'-'+stage.id+'-'+kind+'-'+(dir>0?'right':'left')+'-t'+age+'.png',view);}
    S.ev=[];B.ev=[];step(S,[0,0]);step(B,[0,0]);ticks++;
    assert.equal(JSON.stringify(S),JSON.stringify(B),'contact changed recovery/outcome');for(const e of S.ev)fxEvent(S,e);fxTick();
  }
  timelines++;
}
if(!previewOnly){
  // Shape and material must distinguish hit, guard and break immediately, not
  // only after the first two frames. Count broad colored surfaces, not labels.
  for(const t of [0,1,2,3]) {
    const masks=[];for(const kind of ['hit','block','break']) {
      const s=new PixelSurface(160,160);pxContact(s,{x:160,y:160,dir:1,kind,t,heavy:kind==='break'});
      const mask=[];let bright=0;for(let p=0;p<s.data.length;p+=4){mask.push(s.data[p+3]);if((3*s.data[p]+6*s.data[p+1]+s.data[p+2])/10>160)bright++;}
      assert(bright>=180,'first contact lacks a broad bright surface: '+kind+' / '+t+' / '+bright);masks.push(Buffer.from(mask).toString('base64'));
    }
    assert.equal(new Set(masks).size,3,'hit, guard and break share the same initial silhouette');
  }
  console.log('PASS',timelines,'actual jab/kick/guard/break timelines;',ticks,'parallel-state ticks;',rasters,'native scenes/snapshots, first-three-age minimum',minVisible,'visible contact pixels; immediate distinct silhouettes/materials and expiry');
}
`)(assert,writePNG,output,prefix,previewOnly);
