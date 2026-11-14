// Actual cast lifecycles and state-derived HUD rasters; scripted, never played.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>baseline&&n==='pixel-hud'?require('node:child_process').execFileSync('git',['show','HEAD:src/pixel-hud.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
Function('assert','writePNG','output','prefix','previewOnly','baseline',source+'\n'+`
const ch=CH.findIndex(c=>c.arts[0].id==='goldenhour');
function resetFX(){for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];FX.banner=FX.impact=FX.bf=null;FX.flash=FX.shake=0;FX.nope=[0,0];}
function advance(S,b=[0,0]){S.ev=[];step(S,b);for(const e of S.ev)fxEvent(S,e);fxTick();}
function begin(kind,owner=0){
  resetFX();const S=newMatch(ch,ch,901);S.phase='fight';const f=S.f[owner],o=S.f[1-owner];
  f.x=owner?900:380;o.x=owner?380:900;f.face=owner?-1:1;o.face=-f.face;f.ce=100;f.gauge=100;
  if(kind==='rewind')for(let n=0;n<80;n++)advance(S);
  const b=[0,0];b[owner]=kind==='world'?BTN.DOM:kind==='rewind'?BTN.A3:BTN.A1;advance(S,b);
  for(let n=0;n<20&&!S.ev.some(e=>e.k==='stop');n++)advance(S);
  assert(S.ev.some(e=>e.k==='stop'),'cast did not emit stop');return S;
}
function layer(S,labels=[null,null]){const s=new PixelSurface(640,360);if(typeof pxTimeStopHUD==='function')pxTimeStopHUD(s,S,labels);return s;}
function count(s){let n=0;for(let p=3;p<s.data.length;p+=4)if(s.data[p])n++;return n;}
function crop(s){const a=[];for(let y=61;y<=75;y++)a.push(...s.data.subarray((y*640+261)*4,(y*640+379)*4));return a;}
const keys={move:'A / D',U:'W',G:'S',P:'J',K:'K',A1:'U',A2:'I',A3:'O',DOM:'L'};
const modes=[
  {id:'local',labels:[keys,keys],roles:['P1','P2']},
  {id:'ai',labels:Object.assign([keys,null],{other:'Computer'}),roles:['YOU','CPU']},
  {id:'watch',labels:Object.assign([null,null],{other:'Computer'}),roles:['CPU1','CPU2']},
  {id:'host',labels:Object.assign([keys,null],{other:'Online opponent'}),roles:['YOU','FOE']},
  {id:'guest',labels:Object.assign([null,keys],{other:'Online opponent'}),roles:['FOE','YOU']}
];
// Check literal mode identities independently of the shared role helper, using
// actual casts and the complete HUD. This fails on the old P1/P2-only notice.
if(!previewOnly){
  let identities=0;
  for(const mode of modes)for(const owner of [0,1])for(const kind of ['golden','world','rewind']){
    const S=begin(kind,owner),before=JSON.stringify(S),effects=JSON.stringify(FX);
    const s=layer(S,mode.labels),ink=[],paint=pxText;
    pxText=function(surface,text,x,y,col,size=1){ink.push({text,x,y,w:pxTextWidth(text,size)});return paint(surface,text,x,y,col,size);};
    let hud;try{hud=pxHUDSurface(S,mode.labels,{});}finally{pxText=paint;}
    const expected=mode.roles[owner]+' TIME STOP',notice=ink.filter(p=>p.text.includes('TIME STOP'));
    assert.equal(notice.length,kind==='rewind'?0:1,'wrong notice count '+mode.id);
    if(kind!=='rewind'){
      assert.equal(notice[0].text,expected,'time-stop identity '+mode.id+' slot '+owner);
      assert(notice[0].x>=282&&notice[0].x+notice[0].w<=375,'notice exceeds existing plaque');
      const glyphs=new PixelSurface(640,360);pxText(glyphs,expected,284,65,PX_INK);
      for(let p=0;p<glyphs.data.length;p+=4)if(glyphs.data[p+3])assert.deepEqual(s.data.subarray(p,p+4),glyphs.data.subarray(p,p+4),'missing mode glyph');
      assert.deepEqual(crop(hud),crop(s),'complete HUD obscures mode identity');
    }else assert.equal(count(s),0,'Rewind claims active stopped time');
    assert.deepEqual(layer(JSON.parse(before),mode.labels).data,s.data,'snapshot changes mode identity');
    assert.equal(JSON.stringify(S),before,'identity rendering mutates combat');assert.equal(JSON.stringify(FX),effects,'identity rendering mutates effects');
    for(const stage of PX_STAGES){
      S.stage=stage.id;const frame=pxWorldSurface(S,{});frame.blit(pxHUDSurface(S,mode.labels,{}),0,0);
      if(kind!=='rewind')assert.deepEqual(crop(frame),crop(s),'native composition obscures mode identity');
    }
    identities++;
  }
  console.log('PASS',identities,'actual cast/mode/owner identities, bounded literal glyphs, snapshot and full-stage compositions; Rewind excluded');
}
if(!previewOnly){
  let timelines=0,ticks=0,rasters=0,holds=0,composites=0;const signatures=[];
  for(const owner of [0,1])for(const kind of ['golden','world','rewind']){
    const A=begin(kind,owner),B=JSON.parse(JSON.stringify(A));const duration=kind==='world'?150:kind==='golden'?66:0;
    assert.equal(A.stop?.t||0,duration);let shown=0,probed=false;
    for(let n=0;n<300;n++){
      const before=JSON.stringify(A),active=A.phase==='fight'&&A.stop?.t>0,s=layer(A);
      if(!baseline){
        assert.equal(count(s)>0,!!active,'persistent cue disagrees with active stop');
        assert.deepEqual(layer(JSON.parse(before)).data,s.data,'snapshot changes cue');
        assert.deepEqual(layer({...A,t:A.t+1555}).data,s.data,'global clock changes cue');
        if(active){
          shown++;assert(count(s)>1200,'stop too faint at native size');
          for(let p=3;p<s.data.length;p+=4)assert(s.data[p]===0||s.data[p]===255,'soft alpha');
          const expected=new PixelSurface(640,360);pxText(expected,'P'+(owner+1)+' TIME STOP',284,65,PX_INK);
          for(let p=0;p<expected.data.length;p+=4)if(expected.data[p+3])assert.deepEqual(s.data.subarray(p,p+4),expected.data.subarray(p,p+4),'missing owner/status glyph');
          if(!probed){
            signatures.push(Buffer.from(s.data).toString('base64'));
            for(const field of ['freeze','hitstop']){
              const F=JSON.parse(before);F.freeze=F.hitstop=0;F[field]=3;
              for(let k=0;k<3;k++){step(F,[0,0]);assert.equal(F.stop.t,A.stop.t);assert.deepEqual(layer(F).data,s.data,'pause changes label');holds++;}
            }
            const lab={move:'AD',U:'W',G:'S',P:'F',K:'G'};
            for(const stage of PX_STAGES)for(const labels of [[null,null],[lab,lab],[null,lab],[lab,null]]){
              const F=JSON.parse(before);F.stage=stage.id;const hud=pxHUDSurface(F,labels,{}),frame=pxWorldSurface(F,{});frame.blit(hud,0,0);
              const notice=layer(F,labels);assert.deepEqual(crop(hud),crop(notice),'HUD obscures persistent stop');assert.deepEqual(crop(frame),crop(notice),'world obscures persistent stop');composites++;
            }
            probed=true;
          }
        }
        rasters++;
      }
      if(n%13===0){pxWorldSurface(A,FX);pxHUDSurface(A,[null,null]);}
      assert.equal(JSON.stringify(A),before,'drawing writes combat');
      const input=[0,0];if(n>80){input[owner]=owner?BTN.R:BTN.L;input[1-owner]=owner?BTN.L:BTN.R;}
      const frozenX=A.f[1-owner].x,stopped=A.stop?.t>0&&!A.freeze&&!A.hitstop;
      advance(A,input);B.ev=[];step(B,input);assert.equal(JSON.stringify(A),JSON.stringify(B),'presentation changes outcome');
      if(stopped)assert.equal(A.f[1-owner].x,frozenX,'stopped foe moved');ticks++;
    }
    assert(!A.stop,'stop did not expire');if(!baseline&&duration)assert(shown>=duration-1,'label vanished early');
    // KO and next-round lifecycle clear state and cue through existing simulation.
    if(duration){const C=begin(kind,owner);C.freeze=C.hitstop=0;C.f[1-owner].hp=0;ko(C,C.f[1-owner]);assert.equal(C.stop,null);if(!baseline)assert.equal(count(layer(C)),0);newRound(C);assert.equal(C.stop,null);}
    timelines++;
  }
  if(!baseline){
    assert.equal(new Set(signatures).size,2,'owner is not distinguished');
    const S=begin('golden');
    for(const phase of ['intro','ko','over'])assert.equal(count(layer({...S,phase})),0,'stale phase label');
    for(const stop of [null,{o:0,t:0},{o:0,t:-1},{o:3,t:4}])assert.equal(count(layer({...S,stop})),0,'invalid/expired stop label');
    // Labels remain independent of event history, active Domain and depleted resources.
    const F=JSON.parse(JSON.stringify(S));F.ev=[];F.dom=null;F.f[0].ce=0;assert.deepEqual(layer(F).data,layer(S).data);
    const before=pxHUDSurface(S,[null,null],{}),clean=pxHUDSurface({...S,stop:null},[null,null],{});
    for(let y=0;y<360;y++)for(let x=0;x<640;x++)if(x<261||x>378||y<61||y>75){const p=(y*640+x)*4;assert.deepEqual(before.data.subarray(p,p+4),clean.data.subarray(p,p+4),'unrelated HUD changed');}
  }
  // Actual punches during either stop keep the existing 75% damage rule and
  // leave the state-derived label intact after contact FX and HUD compositing.
  for(const owner of [0,1])for(const kind of ['golden','world']){
    const A=begin(kind,owner);while(A.freeze||!free(A.f[owner]))advance(A);
    const f=A.f[owner],o=A.f[1-owner];f.x=owner?700:580;o.x=owner?620:660;f.face=owner?-1:1;o.face=-f.face;
    const B=JSON.parse(JSON.stringify(A)),hp=o.hp;let damage=0;
    for(let n=0;n<14;n++){
      const b=[0,0];if(n===0)b[owner]=BTN.P;advance(A,b);B.ev=[];step(B,b);assert.equal(JSON.stringify(A),JSON.stringify(B));
      if(A.ev.some(e=>e.k==='hit')){damage=hp-o.hp;assert(A.stop?.t>0);if(!baseline){const frame=pxWorldSurface(A,FX);frame.blit(pxHUDSurface(A,[null,null]),0,0);assert.deepEqual(crop(frame),crop(layer(A)));composites++;}}
    }
    assert.equal(damage,24,'existing stopped-time punch damage changed');timelines++;
  }
  console.log('PASS',timelines,'real Golden Hour/World/Rewind lifecycles;',ticks,'parallel-state ticks;',rasters,'read-only/snapshot rasters;',holds,'freeze holds;',composites,'native composites; owner glyphs, expiry, KO/reset, Rewind exclusion');
}
if(output){
  for(const mode of modes)for(const owner of [0,1])for(const stage of PX_STAGES){
    const S=begin('golden',owner);S.stage=stage.id;
    S.f[0].x=940;S.f[1].x=340;S.f[0].face=-1;S.f[1].face=1;
    // Stacked resources and status lanes exercise the same full HUD as play.
    S.f.forEach(f=>{f.nails=3;f.zone=180;});
    const view=pxWorldSurface(S,{});view.blit(pxHUDSurface(S,mode.labels,{}),0,0);
    writePNG(output+'/'+prefix+'-'+mode.id+'-'+stage.id+'-cpu'+(owner+1)+'.png',view);
  }
  let total=0;
  for(const kind of ['golden','world','rewind'])for(const owner of [0,1])for(const stage of PX_STAGES){
    const S=begin(kind,owner);S.stage=stage.id;const targets=kind==='golden'?[0,25,60,67]:kind==='world'?[0,85,170,211]:[0,25,60,80];
    const strip=new PixelSurface(1280,720);let age=0;
    targets.forEach((target,i)=>{while(age<target){advance(S);age++;}const view=pxWorldSurface(S,FX);view.blit(pxHUDSurface(S,[null,null]),0,0);
      const name=prefix+'-'+kind+'-'+stage.id+'-'+(owner?'left':'right')+'-t'+target;writePNG(output+'/'+name+'.png',view);strip.blit(view,i%2*640,Math.floor(i/2)*360);total++;
    });writePNG(output+'/'+prefix+'-'+kind+'-'+stage.id+'-'+(owner?'left':'right')+'-lifecycle.png',strip);
  }console.log('Exported',total+30,'native scenes and 18 lifecycle sheets');
}
`)(assert,writePNG,process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,process.argv[3]||'v61',previewOnly,baseline);
