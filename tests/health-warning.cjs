// Real damage/recovery boundaries and native health-lane comparisons. Never played.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,prefix=process.argv[3]||'health';
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','ai','render','main'];
const read=n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8').split('// ---------- boot')[0];
const old=n=>require('node:child_process').execFileSync('git',['show','6c176e3:src/'+n+'.js'],{cwd:root,encoding:'utf8'}).split('// ---------- boot')[0];
const shell=[()=>{},{},{getElementById(){return {getContext(){return {};}};},querySelectorAll(){return [];}}];
const oldHUD=Function('addEventListener','window','document',names.map(n=>n==='pixel-hud'?old(n):read(n)).join('\n')+'\nreturn pxHUDSurface;')(...shell);
Function('assert','writePNG','output','prefix','previewOnly','oldHUD','addEventListener','window','document',names.map(n=>baseline&&n==='pixel-hud'?old(n):read(n)).join('\n')+'\n'+`
const neutral={parts:[],rings:[],lines:[],contacts:[],dust:[],ghosts:[],stars:[],puffs:[],nums:[],words:[],flash:0};
const modes=['ai','local','watch','host','guest'];
const lanes=[{x:47,y:22,w:225,h:19},{x:368,y:22,w:225,h:19}];
let checks=0,unchanged=0,minChange=Infinity,timelines=0,ticks=0,holds=0;
function inspect(S,mode='local') {
  G.mode=mode;const state=JSON.stringify(S),effects=JSON.stringify(FX),lab=labels(),hud=pxHUDSurface(S,lab,neutral);
  if(!previewOnly){
    const prior=oldHUD(S,lab,neutral),danger=S.f.map(f=>S.phase==='fight'&&f.hp>0&&f.hp<=maxHp(f)*DOM_HP),changed=[0,0];
    for(let y=0;y<360;y++)for(let x=0;x<640;x++){
      const p=(y*640+x)*4;assert(hud.data[p+3]===0||hud.data[p+3]===255,'soft alpha');
      const diff=hud.data[p]!==prior.data[p]||hud.data[p+1]!==prior.data[p+1]||hud.data[p+2]!==prior.data[p+2]||hud.data[p+3]!==prior.data[p+3];
      if(diff){const i=lanes.findIndex(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);assert(i>=0&&danger[i],'warning escaped a low-health lane');changed[i]++;}
    }
    for(let i=0;i<2;i++){
      if(danger[i]){assert(changed[i]>=800,'low-health frame lacks a visible warning: '+changed[i]);minChange=Math.min(minChange,changed[i]);}
      else assert.equal(changed[i],0,'ordinary/ended health lane changed');
      // The warning must not alter the length, top highlight or material of HP
      // and recent-damage fills. Those values remain the actual serialized bars.
      const f=S.f[i],x=i?373:52,hp=Math.round(215*clamp(f.hp/maxHp(f),0,1)),ghost=Math.round(215*clamp(f.ghost/maxHp(f),0,1));
      for(let u=0;u<Math.max(hp,ghost);u++)for(let y=25;y<37;y++){
        const xx=i?x+u:x+214-u,p=(y*640+xx)*4;
        assert.deepEqual(hud.data.subarray(p,p+4),prior.data.subarray(p,p+4),'changed HP/ghost fill');
      }
    }
    if(!danger.some(Boolean)){assert.deepEqual(hud.data,prior.data);unchanged++;}
    assert.equal(JSON.stringify(S),state,'HUD wrote match');assert.equal(JSON.stringify(FX),effects,'HUD wrote FX');
    assert.deepEqual(hud.data,pxHUDSurface(JSON.parse(state),lab,neutral).data,'snapshot needs presentation history');checks++;
  }
  return hud;
}
function save(S,name){if(output)for(const stage of PX_STAGES){S.stage=stage.id;G.mode='local';const scene=pxWorldSurface(S,neutral);scene.blit(pxHUDSurface(S,labels(),neutral),0,0);writePNG(output+'/'+prefix+'-'+stage.id+'-'+name+'.png',scene);}}
// Every build/slot crosses the line through real unguarded and guarded inputs,
// stays visibly low through recovery, then loses the warning on an actual KO.
for(let ch=0;ch<15;ch++)for(let owner=0;owner<2;owner++)for(const kind of ['hit','chip','ko']){
  const S=newMatch(ch,ch,104);S.phase='fight';S.t=120;S.f[0].x=500;S.f[1].x=580;
  const f=S.f[owner],attacker=1-owner;f.hp=kind==='ko'?1:maxHp(f)*DOM_HP+(kind==='chip'?1:5);f.ghost=f.hp;
  const control=JSON.parse(JSON.stringify(S));inspect(S);
  let contact=false;
  for(let t=0;t<75;t++){
    const input=[0,0];if(t===0)input[attacker]=BTN.P<<INPUT_SHIFT;if(kind==='chip')input[owner]=BTN.G;
    S.ev=[];control.ev=[];step(S,input);step(control,input);ticks++;
    assert.equal(JSON.stringify(S),JSON.stringify(control),'presentation changed damage/recovery');
    if(S.ev.some(e=>e.k===(kind==='chip'?'block':'hit'))){contact=true;for(const mode of modes)inspect(S,mode);}
    if([15,40,74].includes(t))inspect(S);
  }
  assert(contact,'input never connected');assert(kind==='ko'?S.phase==='ko':f.hp>0&&f.hp<=maxHp(f)*DOM_HP);
  if(ch===0&&kind==='hit')save(S,'ch0-p'+(owner+1)+'-recovered');timelines++;
}
// Exact 30% boundary, almost empty, fresh/full ghost, both fighters low, and
// non-fight phases; differing health maxima must use a ratio, not a fixed HP.
for(let ch=0;ch<15;ch++)for(const fraction of [1,.300001,.3,.299999,.01,0])for(const ghost of [false,true]){
  const S=newMatch(ch,14-ch,104);S.phase='fight';S.timer=600;S.stop={o:1,t:90};
  for(const f of S.f){f.hp=maxHp(f)*fraction;f.ghost=ghost?maxHp(f):f.hp;f.zone=120;f.nails=3;f.guardHp=12;}
  S.dom={o:0,k:CH[ch].dom.kind,t:120};
  for(const mode of modes)inspect(S,mode);
  if(ch===14&&fraction===.01&&!ghost)save(S,'ch14-both-one-percent');
  for(const phase of ['intro','ko','over']){S.phase=phase;inspect(S);}
}
// Pauses/snapshots hold the cue; healing above the threshold clears it at once.
for(const pause of ['hitstop','freeze']){
  const S=newMatch(0,14,104);S.phase='fight';S.f[0].hp=maxHp(S.f[0])*.3;S.f[0].ghost=S.f[0].hp;S[pause]=4;
  const before=inspect(S,'guest');
  for(let t=0;t<4;t++){step(S,[0,0]);assert.deepEqual(inspect(S,'guest').data,before.data,'warning moved during pause');holds++;}
  S.f[0].hp=maxHp(S.f[0])*.3+.001;inspect(S,'guest');
}
if(previewOnly)console.log('EXPORTED baseline scenes; health appearance assertions skipped');
else console.log('PASS',timelines,'actual hit/chip/KO timelines;',ticks,'parallel ticks;',checks,'read-only native HUD/snapshot checks;',unchanged,'ordinary/result HUDs identical;',holds,'pause holds; minimum danger change',minChange,'pixels');
`)(assert,writePNG,output,prefix,previewOnly,oldHUD,...shell);
