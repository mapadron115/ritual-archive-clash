// Numbered computer identities through real fights, swaps and results. Not played.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,prefix=process.argv[3]||'watch';
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','ai','render','main'].map(n=>
  (baseline&&n==='pixel-hud'?require('node:child_process').execFileSync('git',['show','HEAD:src/'+n+'.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).split('// ---------- boot')[0]).join('\n');
const nodes=new Map(),document={getElementById(id){if(!nodes.has(id))nodes.set(id,{getContext(){return {};},style:{},focus(){}});return nodes.get(id);}};
Function('assert','document','addEventListener','window','setTimeout','writePNG','output','prefix','previewOnly',source+'\n'+`
G.mode='watch';FX.silent=true;
function texts(S) {
  const ink=[],paint=pxText,before=JSON.stringify(S),effects=JSON.stringify(FX);
  pxText=function(s,text,x,y,col,scale=1){ink.push({text:String(text).toUpperCase(),x,y,w:pxTextWidth(text,scale),h:7*scale});return paint(s,text,x,y,col,scale);};
  let hud;try{hud=pxHUDSurface(S,labels(),{});}finally{pxText=paint;}
  assert.equal(JSON.stringify(S),before);assert.equal(JSON.stringify(FX),effects);
  assert.deepEqual(hud.data,pxHUDSurface(JSON.parse(before),labels(),{}).data,'snapshot changes identity');
  return {ink,hud};
}
let rasters=0,ticks=0,swaps=0,endings=0;
function check(S) {
  const {ink,hud}=texts(S);
  for(const f of S.f)if(f.st!=='ko') {
    const a=pxActorAnchor(f),name='CPU'+(f.i+1),tag=ink.find(p=>p.text===name&&p.y===a.y);
    assert(tag,'missing numbered actor tag '+name);
    assert.equal(tag.x,a.x-pxTextWidth(name)/2,'identity not attached to its simulation actor');
    assert(tag.x-3>=0&&tag.x+tag.w+3<=640&&tag.y>=90&&tag.y+14<309,'actor tag clipped');
    // Fit inside the shared damage-placement exclusion, including the shake margin.
    assert(tag.x-3-5>=a.x-20&&tag.x+tag.w+3+5<=a.x+20,'tag exceeds damage exclusion');
  }
  assert(!ink.some(p=>p.text==='CPU'),'ambiguous duplicate CPU tag');
  rasters++;return hud;
}
function save(S,name) {
  if(!output)return;
  const view=pxWorldSurface(S,{});view.blit(pxHUDSurface(S,labels(),{}),0,0);writePNG(output+'/'+prefix+'-'+name+'.png',view);
}
// Native-size before/after scenes, including mirrors and crossed positions.
for(const [ch,stage]of [[0,'courtyard'],[13,'gallery'],[14,'observatory']]) {
  const S=newMatch(ch,ch,800);S.phase='fight';S.stage=stage;save(S,stage+'-mirror');
  S.f[0].x=940;S.f[1].x=340;S.f[0].face=-1;S.f[1].face=1;save(S,stage+'-crossed');
  S.phase='ko';S.phaseT=45;S.winner=1;S.wins=[0,1];S.f[0].st='ko';save(S,stage+'-result');
}
if(!previewOnly) {
  // Use literal expected roles so a shared helper cannot make both UI and test lie.
  for(const [mode,want]of [['ai',['YOU','CPU']],['local',['P1','P2']],['watch',['CPU1','CPU2']],['host',['YOU','FOE']],['guest',['FOE','YOU']]]) {
    G.mode=mode;assert.deepEqual([pxResultRole(labels(),0),pxResultRole(labels(),1)],want,'mode roles '+mode);
  }
  G.mode='watch';
  for(let ch=0;ch<CH.length;ch++)for(const mirror of [false,true]) {
    const S=newMatch(ch,mirror?ch:(ch+1)%CH.length,217),B=JSON.parse(JSON.stringify(S));
    S.stage=B.stage=PX_STAGES[ch%3].id;AI_MEM[0]={};AI_MEM[1]={};
    for(let t=0;t<600;t++) {
      if(t%60===0)check(S);
      const input=[aiInput(S,0),aiInput(S,1)];step(S,input);step(B,input);ticks++;
      assert.equal(JSON.stringify(S),JSON.stringify(B),'identity rendering changed the fight');
      if(S.phase==='over')break;
    }
    // Screen edges and the highest airborne tag lane still fit both identities.
    for(const y of [GROUND,GROUND-340]) {const A=JSON.parse(JSON.stringify(S));A.phase='fight';A.f.forEach((f,i)=>{f.st='jump';f.x=i?RIGHT:LEFT;f.y=y;});check(A);}
  }
  for(const owner of [0,1]) {
    const ch=CH.findIndex(c=>c.arts[0].id==='boogie'),S=newMatch(ch,ch,800);S.phase='fight';
    const initial=S.f[owner].x;check(S);
    for(let t=0;t<30;t++) {const input=[0,0];if(!t)input[owner]=BTN.A1<<INPUT_SHIFT;step(S,input);check(S);}
    assert(Math.abs(S.f[owner].x-initial)>300,'real swap did not cross the actors');swaps++;
  }
  for(let ch=0;ch<CH.length;ch++)for(const winner of [0,1])for(const kind of ['ko','timeout','draw']) {
    const S=newMatch(ch,ch,1000);S.phase='fight';S.wins[winner]=1;
    S.f[0].x=500;S.f[1].x=570;
    if(kind!=='ko')S.timer=1;
    if(kind!=='draw')S.f[1-winner].hp=1;
    for(let t=0;t<250&&S.phase==='fight';t++) {const input=[0,0];if(!t&&kind==='ko')input[winner]=BTN.P<<INPUT_SHIFT;step(S,input);}
    assert.equal(S.phase,'ko');assert.equal(S.winner,kind==='draw'?-1:winner);
    while(S.phase==='ko'&&S.phaseT<30)step(S,[0,0]);
    const {ink}=texts(S),p=pxRoundResultLayout(S);
    const title=kind==='draw'?'NO ROUND AWARDED':'CPU'+(winner+1)+' / '+CH[ch].name.toUpperCase()+' WINS';
    assert(ink.some(t=>t.text===title),'wrong winner identity');
    assert(ink.some(t=>t.text==='CPU1 '+S.wins[0]+' - '+S.wins[1]+' CPU2'),'wrong score identity');
    for(const t of ink.filter(t=>t.y>=p.y&&t.y<p.y+p.h))assert(t.x>=p.x+6&&t.x+t.w<=p.x+p.w-6,'long result identity clipped');
    if(kind!=='draw') {
      while(S.phase==='ko')step(S,[0,0]);assert.equal(S.phase,'over');G.S=S;endMatch();
      assert.equal($('overTitle').textContent,'CPU'+(winner+1)+' / '+CH[ch].name+' wins');
      assert.equal($('overScore').textContent,'CPU1 '+S.wins[0]+' - '+S.wins[1]+' CPU2 / First to 2 wins');
    }
    endings++;
  }
  console.log('PASS',ticks,'parallel-state watch ticks;',rasters,'numbered actor/snapshot rasters across all builds, mirrors, stages, edges and airborne lanes;',swaps,'actual position swaps;',endings,'actual KO/timeout/draw endings, full names, scores and match-screen identities; other mode roles retained');
}
`)(assert,document,()=>{},{},()=>{},writePNG,output,prefix,previewOnly);
