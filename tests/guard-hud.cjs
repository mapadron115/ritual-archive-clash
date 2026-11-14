// Real held-guard/kick timelines and full native composites. Scripted, not played.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>baseline&&n==='pixel-hud'?require('node:child_process').execFileSync('git',['show','HEAD:src/pixel-hud.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
Function('assert','writePNG','output','prefix','previewOnly',source+'\n'+`
const labels=[{move:'AD',U:'W',G:'S',P:'F',K:'G'},{move:'<>',U:'^',G:'V',P:'1',K:'2'}];
const neutral={parts:[],rings:[],lines:[],contacts:[],dust:[],ghosts:[],stars:[],puffs:[],nums:[],words:[],flash:0};
function inspect(S) {
  const before=JSON.stringify(S),text=[],paint=pxText;
  pxText=function(s,t,x,y,c,z=1){text.push({t:String(t),x,y,w:pxTextWidth(t,z)});return paint(s,t,x,y,c,z);};
  let hud;try{hud=pxHUDSurface(S,labels,neutral);}finally{pxText=paint;}
  for(const f of S.f)if(f.st!=='ko') {
    const x=(f.i?373:52)+121;
    const locked=['hit','stun','down'].includes(f.st);
    assert(text.some(p=>p.x===x&&p.y===55&&p.t===(locked?'GUARD LOCKED':f.guardHp<35?'GUARD LOW':'GUARD '+Math.ceil(clamp(f.guardHp,0,100))+'%')),'guard has no readable fixed HUD label');
    // Resources, setup, Zone and stop plaques must not paint over the meter.
    const only=new PixelSurface(640,360);pxGuardHUD(only,f,x);
    for(let y=53;y<73;y++)for(let xx=x-2;xx<x+82;xx++) {
      const a=(y*640+xx)*4;
      assert.deepEqual(hud.data.subarray(a,a+4),only.data.subarray(a,a+4),'guard crossed another HUD element');
    }
  }
  assert.equal(JSON.stringify(S),before,'HUD wrote simulation');return hud;
}
let checks=0,ticks=0,holds=0;const samples=[];
for(const owner of [0,1]) {
  const S=newMatch(0,0,901);S.phase='fight';S.t=120;
  const f=S.f[owner],a=S.f[1-owner];f.x=owner?700:580;a.x=owner?580:700;f.face=owner?-1:1;a.face=-f.face;
  const control=JSON.parse(JSON.stringify(S));
  function advance(b) { S.ev=[];step(S,b);control.ev=[];step(control,b);ticks++;if(!previewOnly)inspect(S);assert.equal(JSON.stringify(S),JSON.stringify(control),'HUD changes fight outcome'); }
  const input=[0,0];input[owner]=BTN.G;advance(input);assert.equal(f.st,'guard');
  samples.push({owner,name:'full',S:JSON.parse(JSON.stringify(S))});
  for(let kick=0;kick<3;kick++) {
    for(let n=0;Math.abs(a.x-f.x)>85&&n<90;n++) {
      const b=[...input];b[1-owner]=a.x<f.x?BTN.R:BTN.L;advance(b);
    }
    let contact=false;
    for(let n=0;n<90;n++) {
      const b=[...input];b[1-owner]=n===0?BTN.K<<INPUT_SHIFT:0;advance(b);
      if(S.ev.some(e=>e.k===(kick===2?'break':'block')))contact=true;
      if(contact&&(kick===2||a.st==='idle'))break;
    }
    assert(contact,'kick never reached held guard');
    if(kick<2)assert.equal(f.guardHp,kick===0?55:10);
    else {assert.equal(f.st,'stun');assert(f.guardHp>=60&&f.guardHp<=60.3);}
    if(kick===1||kick===2)samples.push({owner,name:kick===1?'low':'break',S:JSON.parse(JSON.stringify(S))});
    if(!previewOnly)for(const kind of ['hitstop','freeze','stop']) {
      const F=JSON.parse(JSON.stringify(S));F.hitstop=F.freeze=0;F.stop=null;
      if(kind==='stop')F.stop={o:1-owner,t:3};else F[kind]=3;
      const hp=F.f[owner].guardHp;inspect(F);
      for(let n=0;n<3;n++){step(F,[0,0]);assert.equal(F.f[owner].guardHp,hp);inspect(F);holds++;}
    }
  }
  for(let n=0;n<200;n++)advance([0,0]);assert(f.guardHp>=100);samples.push({owner,name:'restored',S:JSON.parse(JSON.stringify(S))});
  newRound(S);if(!previewOnly)inspect(S);assert.equal(S.f[owner].guardHp,100);
}
if(!previewOnly)for(let ch=0;ch<15;ch++)for(const owner of [0,1]) {
  const S=newMatch(ch,ch,901);S.phase='fight';S.stop={o:owner,t:30};
  for(const f of S.f){f.res=CH[ch].res?.max||0;f.nails=3;f.zone=480;f.guardHp=f.i===owner?10:100;}
  inspect(S);checks++;
  const snap=JSON.parse(JSON.stringify(S));assert.deepEqual(inspect(S).data,inspect(snap).data);
}
const stress=newMatch(CH.findIndex(c=>c.res?.name==='REVENGE'),0,901);stress.phase='fight';stress.stop={o:0,t:30};
for(const f of stress.f){f.res=300;f.nails=3;f.zone=480;f.guardHp=f.i?10:100;}
samples.push({owner:1,name:'stacked-status',S:stress});
if(output)for(const sample of samples)for(const stage of PX_STAGES) {
  const S=sample.S;S.stage=stage.id;const s=pxWorldSurface(S,neutral);s.blit(pxHUDSurface(S,labels,neutral),0,0);
  writePNG(output+'/'+prefix+'-'+stage.id+'-p'+(sample.owner+1)+'-'+sample.name+'.png',s);
}
console.log('PASS 2 real three-kick guard/break/recovery timelines;',ticks,'parallel-state ticks;',holds,'freeze holds;',checks,'all-build stacked-status/snapshot layouts; 27 native composites when exported');
`)(assert,writePNG,process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,process.argv[3]||'guard',previewOnly);
