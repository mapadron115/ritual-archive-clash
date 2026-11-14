// Held guard through actual breaks and recovery, plus all-build contact states.
// Native memory-raster previews and script checks; never human play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,prefix=process.argv[3]||'recovery';
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>baseline&&n==='pixel-hud'?require('node:child_process').execFileSync('git',['show','HEAD:src/pixel-hud.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
Function('assert','writePNG','output','prefix','previewOnly',source+'\n'+`
const labels=[{move:'AD',U:'W',G:'S',P:'F',K:'G'},{move:'<>',U:'^',G:'V',P:'1',K:'2'}];
const neutral={parts:[],rings:[],lines:[],contacts:[],dust:[],ghosts:[],stars:[],puffs:[],nums:[],words:[],flash:0};
let timelines=0,ticks=0,rasters=0,holds=0,late=0;const samples=[];
function inspect(S) {
  const before=JSON.stringify(S),effects=JSON.stringify(FX),text=[],paint=pxText;
  pxText=function(s,t,x,y,c,z=1){text.push({t:String(t),x,y,w:pxTextWidth(t,z)});return paint(s,t,x,y,c,z);};
  let hud;try{hud=pxHUDSurface(S,labels,neutral);}finally{pxText=paint;}
  if(!previewOnly)for(const f of S.f)if(f.st!=='ko') {
    const x=(f.i?373:52)+121,locked=['hit','stun','down'].includes(f.st);
    const expected=locked?'GUARD LOCKED':f.guardHp<35?'GUARD LOW':'GUARD '+Math.ceil(clamp(f.guardHp,0,100))+'%';
    const label=text.find(p=>p.x===x&&p.y===55);
    assert.equal(label?.t,expected,'guard meter implies recovered guard during '+f.st);
    assert(label.w<=80,'guard label exceeds meter');
    const only=new PixelSurface(640,360);pxGuardHUD(only,f,x);
    for(let y=53;y<73;y++)for(let xx=x-2;xx<x+82;xx++) {
      const a=(y*640+xx)*4;assert.deepEqual(hud.data.subarray(a,a+4),only.data.subarray(a,a+4),'guard recovery crossed another HUD lane');
    }
  }
  if(!previewOnly)assert.deepEqual(hud.data,pxHUDSurface(JSON.parse(before),labels,neutral).data,'snapshot lost recovery feedback');
  assert.equal(JSON.stringify(S),before,'HUD changed simulation');assert.equal(JSON.stringify(FX),effects,'HUD changed effects');rasters++;
}
function save(S,name) {samples.push({S:JSON.parse(JSON.stringify(S)),name});}
// The full meter resets to 60 immediately, but holding guard cannot cancel the
// existing 55-tick break stun. Check beyond the 40-tick GUARD BREAK announcement.
for(let ch=0;ch<15;ch++)for(const owner of [0,1]) {
  for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];
  FX.banner=FX.impact=FX.bf=null;FX.shake=FX.flash=0;FX.nope=[0,0];FX.silent=true;
  const S=newMatch(owner?0:ch,owner?ch:0,901);S.phase='fight';S.t=120;
  const f=S.f[owner],a=S.f[1-owner];f.x=owner?700:580;a.x=owner?580:700;f.face=owner?-1:1;a.face=-f.face;
  const control=JSON.parse(JSON.stringify(S)),held=[0,0];held[owner]=BTN.G;
  function advance(input) {S.ev=[];control.ev=[];step(S,input);step(control,input);for(const e of S.ev)fxEvent(S,e);fxTick();ticks++;assert.equal(JSON.stringify(S),JSON.stringify(control),'presentation changed fight');}
  advance(held);assert.equal(f.st,'guard');
  for(let kick=0;kick<3;kick++) {
    for(let n=0;Math.abs(a.x-f.x)>85&&n<90;n++){const input=[...held];input[1-owner]=a.x<f.x?BTN.R:BTN.L;advance(input);}
    let reached=false;
    for(let n=0;n<90;n++) {
      const input=[...held];input[1-owner]=n===0?BTN.K<<INPUT_SHIFT:0;advance(input);
      if(S.ev.some(e=>e.k===(kick===2?'break':'block')))reached=true;
      if(reached&&(kick===2||a.st==='idle'))break;
    }
    assert(reached,'kick did not reach guard');inspect(S);
    if(kick===1&&[0,13,14].includes(ch))save(S,'ch'+ch+'-p'+(owner+1)+'-low');
  }
  assert.equal(f.st,'stun');assert(f.guardHp>=60&&f.guardHp<=60.3);
  if([0,13,14].includes(ch))save(S,'ch'+ch+'-p'+(owner+1)+'-break');
  let age=0;
  while(f.st==='stun'&&age<100) {
    if(age%8===0)inspect(S);
    if(age===45){assert.equal(FX.banner,null,'break banner has not expired');assert(f.stT>0);assert(f.guardHp>60);inspect(S);late++;if([0,13,14].includes(ch))save(S,'ch'+ch+'-p'+(owner+1)+'-after-banner');}
    advance(held);age++;
  }
  assert(age<100);advance(held);assert.equal(f.st,'guard','held guard did not return after recovery');inspect(S);
  if([0,13,14].includes(ch))save(S,'ch'+ch+'-p'+(owner+1)+'-restored');
  newRound(S);inspect(S);assert.equal(S.f[owner].guardHp,100);timelines++;
}
// Every damage/recovery route uses serialized state, including a first guest
// snapshot with no preceding break event. Ordinary blocking remains unlabelled
// as locked, because it can still block the next blow.
for(let ch=0;ch<15;ch++)for(const owner of [0,1])for(const kind of ['hit','shock','down','unblock']) {
  const S=newMatch(ch,ch,977);S.phase='fight';S.t=120;const f=S.f[owner],a=S.f[1-owner];f.x=owner?700:580;a.x=owner?580:700;
  if(kind==='unblock')f.st='guard';
  hit(S,a.i,f,a.x,{dmg:30,kb:4,...(kind==='shock'?{shock:30}:kind==='down'?{lift:7}:kind==='unblock'?{unblock:1}:{})});
  const held=[0,0];held[owner]=BTN.G;let age=0,down=false;
  do {if(f.st==='down')down=true;if(age%10===0)inspect(S);S.ev=[];step(S,held);age++;}while(['hit','stun','down'].includes(f.st)&&age<180);
  assert(age<180,'recovery stalled');if(kind==='down')assert(down,'launch did not reach knockdown');inspect(S);timelines++;
  for(const pause of ['hitstop','freeze','stop']) {
    const P=newMatch(ch,ch,977);P.phase='fight';const p=P.f[owner];hit(P,1-owner,p,P.f[1-owner].x,{dmg:30,shock:30});
    P.hitstop=P.freeze=0;if(pause==='stop')P.stop={o:1-owner,t:3};else P[pause]=3;
    const remaining=p.stT;for(let n=0;n<3;n++){inspect(P);step(P,held);assert.equal(p.stT,remaining);holds++;}
  }
}
const stress=newMatch(CH.findIndex(c=>c.res?.name==='REVENGE'),14,901);stress.phase='fight';stress.stop={o:0,t:30};
for(const f of stress.f){f.st='stun';f.stT=30;f.res=300;f.nails=3;f.zone=480;f.guardHp=70;}inspect(stress);save(stress,'stacked-status');
if(output)for(const sample of samples)for(const stage of PX_STAGES) {const S=sample.S;S.stage=stage.id;const s=pxWorldSurface(S,neutral);s.blit(pxHUDSurface(S,labels,neutral),0,0);writePNG(output+'/'+prefix+'-'+stage.id+'-'+sample.name+'.png',s);}
console.log('PASS',timelines,'real guard-break/contact recovery timelines;',ticks,'parallel-state ticks;',late,'recoveries after banner expiry;',rasters,'read-only snapshot rasters;',holds,'freeze holds;',samples.length*3,'native exports when requested');
`)(assert,writePNG,output,prefix,previewOnly);
