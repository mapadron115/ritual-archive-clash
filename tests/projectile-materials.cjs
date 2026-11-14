// Remaining projectile materials, exercised through actual inputs. Not human play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs'),baseline=process.argv.includes('--baseline');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>baseline&&n==='pixel-world'?require('node:child_process').execFileSync('git',['show','HEAD:src/pixel-world.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
const math=Object.create(Math);math.random=()=>.5;
Function('assert','writePNG','output','prefix','baseline','Math',source+'\n'+`
const arts=['dismantle','thunderclap','quake','guided','stone'],previews=[],samples=[];
const labels=[{move:'A / D',U:'W',G:'S',P:'F',K:'G',A1:'R',A2:'T',A3:'Y',DOM:'H'},{move:'← / →',U:'↑',G:'↓',P:',',K:'.',A1:'I',A2:'O',A3:'P',DOM:'/'}];
let timelines=0,ticks=0,bodies=0,holds=0,crops=0,composites=0,minVisible=Infinity;
const damage={};
function resetFX(){for(const k of ['parts','rings','lines','contacts','dust','stars','puffs','nums','words'])FX[k]=[];FX.banner=FX.impact=FX.bf=null;FX.flash=FX.shake=0;FX.nope=[0,0];FX.silent=true;}
function shotLayer(S){const s=new PixelSurface(640,360);for(const p of S.proj)pxProjectile(s,p);return s;}
function capture(S,name,owner){previews.push({S:JSON.parse(JSON.stringify(S)),F:JSON.parse(JSON.stringify(FX)),name,owner});}
for(const art of arts)for(const owner of [0,1])for(const mode of ['front','guard','jump']){
  resetFX();const ch=CH.findIndex(c=>c.arts.some(a=>a.id===art)),key='A'+(CH[ch].arts.findIndex(a=>a.id===art)+1);
  const S=newMatch(ch,ch,731);S.phase='fight';const f=S.f[owner],o=S.f[1-owner];
  const distance={dismantle:500,thunderclap:250,quake:400,guided:500,stone:260}[art];
  f.x=owner?960:320;o.x=f.x+(owner?-distance:distance);f.face=owner?-1:1;o.face=-f.face;f.ce=100;
  const hp=o.hp,B=JSON.parse(JSON.stringify(S));let launched=false,flight=false,contact=false,held=false;
  for(let n=0;n<280;n++){
    const input=[0,0];if(n===0)input[owner]=BTN[key]<<INPUT_SHIFT;
    if(mode==='guard')input[1-owner]=BTN.G;
    if(mode==='jump'&&n===8)input[1-owner]=BTN.U<<INPUT_SHIFT;
    if(S.proj.length){
      const before=JSON.stringify(S),a=shotLayer(S);assert.deepEqual(a.data,shotLayer(JSON.parse(before)).data,'snapshot changes projectile');
      assert.deepEqual(a.data,shotLayer({...S,t:S.t+981}).data,'global clock changes projectile');
      if(!launched){launched=true;if(mode==='front'){capture(S,art+'-birth',owner);samples.push({...S.proj[0]});}}
      if(!flight&&S.proj.some(p=>p.t>=8)){flight=true;if(mode==='front')capture(S,art+'-flight',owner);}
      if(!held){
        for(const field of ['hitstop','freeze']){
          const C=JSON.parse(before);C.hitstop=C.freeze=0;C[field]=3;
          for(let h=0;h<3;h++){step(C,[0,0]);assert.deepEqual(C.proj,S.proj);assert.deepEqual(shotLayer(C).data,a.data);holds++;}
        }
        const C=JSON.parse(before);C.hitstop=C.freeze=0;C.stop={o:1-owner,t:4};
        for(let h=0;h<3;h++){step(C,[0,0]);assert.deepEqual(C.proj,S.proj);assert.deepEqual(shotLayer(C).data,a.data);holds++;}
        held=true;
      }
      if(n%8===0){pxWorldSurface(S,FX);pxHUDSurface(S,[null,null]);}
      assert.equal(JSON.stringify(S),before,'drawing changes combat');
    }
    step(S,input);step(B,input);assert.equal(JSON.stringify(S),JSON.stringify(B),'drawn/undrawn outcomes differ');ticks++;
    for(const e of S.ev)fxEvent(S,e);fxTick();S.ev.length=B.ev.length=0;
    if(!contact&&o.hp<hp){contact=true;if(mode==='front')capture(S,art+'-contact',owner);}
  }
  assert(launched,art+' input never launched');assert.equal(S.proj.length,0,art+' did not expire');
  if(mode==='front')assert(contact,art+' fixture never contacted');
  const expected={dismantle:[58,8.7,0],thunderclap:[75,11.25,0],quake:[80,12,80],guided:[85,17,85],stone:[30,4.5,0]}[art][['front','guard','jump'].indexOf(mode)];
  assert(Math.abs(hp-o.hp-expected)<1e-8,'existing contact/guard/jump outcome changed');
  damage[art+'/'+owner+'/'+mode]=hp-o.hp;timelines++;
}
if(!baseline){
  const trail=pxProjectileTrail;pxProjectileTrail=()=>{};
  try{
    const shapes=new Set();
    for(const sample of samples.filter((p,i)=>i%2===0)){
      const original={...sample,x:160,y:120};
      for(const radius of [sample.r,6,40])for(let t=0;t<16;t++){
        const p={...original,r:radius,t},a=new PixelSurface(160,120),b=new PixelSurface(160,120),before=JSON.stringify(p);
        pxProjectile(a,{...p,vx:18});pxProjectile(b,{...p,vx:-18});assert.equal(JSON.stringify(p),before);
        const colors=new Set();let area=0;
        for(let y=0;y<a.h;y++)for(let x=0;x<a.w;x++){
          const i=(y*a.w+x)*4,alpha=a.data[i+3];assert(alpha===0||alpha===255,'soft alpha');
          if(alpha){area++;colors.add(Array.from(a.data.slice(i,i+3)).join(','));assert(x>1&&x<158&&y>1&&y<118,'body clipping');}
          if(x>0)assert.deepEqual(a.data.slice(i,i+4),b.data.slice((y*b.w+160-x)*4,(y*b.w+160-x)*4+4),'body root reflection');
        }
        assert(area>10);assert(colors.size>=4&&colors.size<=10,'missing shaded material: '+sample.k+' / '+colors.size);bodies+=2;
      }
      const body=pxProjectileBody(original),shape=Array.from(body.sprite.data.filter((v,i)=>i%4===3)).join('');assert(!shapes.has(shape),'duplicate family silhouette');shapes.add(shape);
      for(const [x,y]of [[-.5,80],[1.5,0],[159.5,119],[80.5,60.5]])for(const vx of [-18,18]){
        const a=new PixelSurface(160,120);pxProjectile(a,{...original,x:x*2,y:y*2,vx});
        const expected=new PixelSurface(160,120);expected.blit(body.sprite,Math.round(x)-body.ox,Math.round(y)-body.oy,1,vx<0);assert.deepEqual(a.data,expected.data,'fractional edge crop');crops++;
      }
    }
    const p=samples.find(p=>p.k==='stone'),pebble=new PixelSurface(160,120),stone=new PixelSurface(160,120);
    pxZone(pebble,{}, {k:'pebble',x:160,y:120,t:22});pxProjectile(stone,{...p,x:160,y:120,r:7,vx:0,vy:0,t:22});assert.deepEqual(pebble.data,stone.data,'resting stone material differs');
    const low=pxProjectileBody(samples.find(p=>p.ground)),high=pxProjectileBody({...samples.find(p=>p.ground),ground:0});assert.notStrictEqual(low,high,'wave cache aliases ground/air families');
    const ground=new PixelSurface(640,360);pxProjectile(ground,{...samples.find(p=>p.ground),y:GROUND-26});
    for(let y=GROUND/2;y<ground.h;y++)for(let x=0;x<ground.w;x++)assert.equal(ground.data[(y*ground.w+x)*4+3],0,'ground wave paints below floor');
    const cleared=newMatch(0,0,1);cleared.proj=samples.map(p=>({...p}));newRound(cleared);assert(shotLayer(cleared).data.every(v=>v===0),'round reset leaves projectile pixels');
    for(let n=0;n<280;n++)pxProjectileBody({...samples[n%samples.length],col:'#'+(0x600000+n).toString(16)});assert(PX_PROJECTILE_BODIES.size<=256,'unbounded cache');
  }finally{pxProjectileTrail=trail;}
}
for(const preview of previews)for(const stage of PX_STAGES){
  const S=JSON.parse(JSON.stringify(preview.S));S.stage=stage.id;const before=JSON.stringify(S);
  const frame=pxWorldSurface(S,preview.F);frame.blit(pxHUDSurface(S,labels,preview.F),0,0);
  assert.equal(JSON.stringify(S),before);assert.deepEqual(pxWorldSurface(S,preview.F).data,pxWorldSurface(JSON.parse(before),preview.F).data);
  // Compare the actual scene with the exact same scene sans projectiles: visibility
  // includes fighter occlusion and every existing event, rather than a blank card.
  if(preview.name.endsWith('-flight')){
    const clear=pxWorldSurface({...S,proj:[]},preview.F);clear.blit(pxHUDSurface({...S,proj:[]},labels,preview.F),0,0);let visible=0;
    for(let i=0;i<frame.data.length;i+=4)if(frame.data[i]!==clear.data[i]||frame.data[i+1]!==clear.data[i+1]||frame.data[i+2]!==clear.data[i+2])visible++;
    assert(visible>30,'projectile disappears in native scene');minVisible=Math.min(minVisible,visible);
  }
  composites++;
  if(output){pxOutlinedText(frame,preview.name.toUpperCase()+' / '+(preview.owner?'LEFT':'RIGHT'),12,88,PX_LIGHT);writePNG(output+'/'+prefix+'-'+preview.name+'-'+stage.id+'-'+(preview.owner?'left':'right')+'.png',frame);}
}
console.log('PASS',timelines,'actual input timelines;',ticks,'parallel-state ticks;',bodies,'hard-alpha shaded mirror bodies;',holds,'freeze holds;',crops,'edge crops;',composites,'native composites; minimum flight visibility',minVisible,'pixels; damage',JSON.stringify(damage));
`)(assert,writePNG,process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,process.argv[3]||'v63',baseline,math);
