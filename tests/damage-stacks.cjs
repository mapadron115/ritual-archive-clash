// Real repeated-hit events and native composites; script/raster checks, not play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>baseline&&['render','pixel-world'].includes(n)?require('node:child_process').execFileSync('git',['show','HEAD:src/'+n+'.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
const math=Object.create(Math);math.random=()=>.5;
Function('assert','writePNG','output','prefix','baseline','Math',source+'\n'+`
function resetFX(){for(const k of ['parts','rings','lines','contacts','dust','stars','puffs','nums','words'])FX[k]=[];FX.banner=FX.impact=FX.bf=null;FX.flash=FX.shake=0;FX.silent=true;}
let timelines=0,layouts=0,values=0,rasters=0,maxLive=0;
for(const kind of ['shrine','web','jce'])for(const stage of PX_STAGES)for(const owner of [0,1]) {
  resetFX();const ch=CH.findIndex(c=>c.dom.kind===kind);assert(ch>=0,kind);
  const S=newMatch(ch,ch,451);S.phase='fight';S.stage=stage.id;
  const f=S.f[owner],o=S.f[1-owner];f.x=owner?930:350;o.x=owner?570:710;f.face=owner?-1:1;o.face=-f.face;f.gauge=100;
  const B=JSON.parse(JSON.stringify(S)),health=o.hp,b=[0,0];b[owner]=BTN.DOM;
  step(S,b);step(B,b);assert.equal(JSON.stringify(S),JSON.stringify(B));
  for(const e of S.ev)fxEvent(S,e);
  const chosen=kind==='shrine'?[16,32,48,64,176,192,205]:kind==='web'?[14,38,62,75,103]:[8,16,24,32,56,70,96];
  const captured=new Set(),sheet=new PixelSurface(1280,Math.ceil(chosen.length/2)*376);sheet.rect(0,0,sheet.w,sheet.h,PX_INK);
  let lastAge=0,hits=0;
  for(let tick=0;tick<650;tick++) {
    S.ev=[];B.ev=[];step(S,[0,0]);step(B,[0,0]);assert.equal(JSON.stringify(S),JSON.stringify(B),'presentation changed combat');
    const before=JSON.stringify(S);
    for(const e of S.ev){fxEvent(S,e);if(e.k==='hit')hits++;}
    fxTick();const effects=JSON.stringify(FX),layout=pxDamageLayout(S,FX.nums,FX);
    assert.equal(layout.length,FX.nums.length,'lost a value');
    assert.deepEqual(layout,pxDamageLayout(JSON.parse(before),JSON.parse(effects).nums,JSON.parse(effects)),'snapshot changed placement');
    maxLive=Math.max(maxLive,layout.length);
    for(const p of layout) {
      assert(p.x>=4&&p.x+p.w<=636&&p.y>=96&&p.y+p.h<=302,'outside gameplay lane');
      if(!baseline)assert.equal(p.n.target,o.i,'wrong damage target');
      for(const q of layout)if(p!==q&&!baseline)assert(p.y+p.h+4<=q.y||q.y+q.h+4<=p.y,'same-target values share a row');
      values++;
    }
    layouts++;
    const age=S.dom?.t??lastAge+1;lastAge=age;
    if(chosen.includes(age)&&!captured.has(age)&&!S.freeze) {
      const world=pxWorldSurface(S),hud=pxHUDSurface(S,[null,null]),bodies=new PixelSurface(640,360);
      for(const actor of S.f)pxPaintFighter(bodies,S,actor,null);
      for(const p of layout) {
        const glyph=new PixelSurface(p.w,p.h);pxDamageText(glyph,{...p,x:0,y:0});
        for(let y=0;y<p.h;y++)for(let x=0;x<p.w;x++) {
          const at=((p.y+y)*640+p.x+x)*4,g=(y*p.w+x)*4;
          if(glyph.data[g+3])assert.deepEqual(Array.from(world.data.slice(at,at+4)),Array.from(glyph.data.slice(g,g+4)),'final raster loses damage glyph');
          assert.equal(bodies.data[at+3],0,'value covers fighter');
          for(const [dx,dy] of [[0,0],[-5,-5],[-5,5],[5,-5],[5,5]]) {
            const xx=p.x+x+dx,yy=p.y+y+dy;if(xx>=0&&xx<640)assert.equal(hud.data[(yy*640+xx)*4+3],0,'value covers shaken HUD');
          }
        }
      }
      world.blit(hud,0,0);const index=chosen.indexOf(age),x=index%2*640,y=Math.floor(index/2)*376;
      sheet.blit(world,x,y+16);pxText(sheet,kind+' / P'+(owner+1)+(owner?' < LEFT':' > RIGHT')+' / T'+age,x+8,y+4,PX_LIGHT);
      if(output)writePNG(output+'/'+prefix+'-'+kind+'-'+stage.id+'-'+(owner?'left':'right')+'-t'+age+'.png',world);
      captured.add(age);rasters++;
    }
    assert.equal(JSON.stringify(S),before,'event/drawing changed state');assert.equal(JSON.stringify(FX),effects,'drawing changed effects');
  }
  assert.equal(captured.size,chosen.length,'missing lifecycle scene '+kind);
  assert.equal(hits,kind==='shrine'?12:kind==='web'?3:7);
  assert(Math.abs(health-o.hp-({shrine:204,web:211.2,jce:224}[kind]))<.001,'damage changed');
  assert.equal(FX.nums.length,0,'values never expired');
  if(output)writePNG(output+'/'+prefix+'-'+kind+'-'+stage.id+'-'+(owner?'left':'right')+'-lifecycle.png',sheet);
  timelines++;
}
// Presentation targets survive a swap/remote snapshot; legacy values still draw.
if(!baseline) {
  resetFX();const S=newMatch(0,0,451);S.phase='fight';S.f[0].x=450;S.f[1].x=750;
  for(const owner of [0,1,0,1]){S.ev=[];hit(S,owner,S.f[1-owner],S.f[owner].x,{dmg:24,kb:0});for(const e of S.ev)fxEvent(S,e);}
  const targets=FX.nums.map(n=>n.target);[S.f[0].x,S.f[1].x]=[S.f[1].x,S.f[0].x];
  assert.deepEqual(pxDamageLayout(S,FX.nums,FX).map(p=>p.target),targets);
  for(const n of FX.nums)delete n.target;
  assert.equal(pxDamageLayout(S,FX.nums,FX).length,4,'legacy snapshot dropped values');
}
console.log('PASS',timelines,'actual repeated-hit timelines;',layouts,'snapshot/read-only layouts;',values,'individual values;',rasters,'native body/HUD/glyph composites; max live',maxLive,'; damage/counts/expiry unchanged'+(baseline?' (baseline previews)':''));
`)(assert,writePNG,process.argv[2]?.startsWith('--')?null:process.argv[2],process.argv[3]||'v59-after',baseline,math);
