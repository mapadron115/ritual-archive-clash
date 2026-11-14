const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const writePNG=require('./png.cjs'),root=path.join(__dirname,'..'),ctx=vm.createContext({console,assert});
vm.runInContext(['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
vm.runInContext(`
const bg=pxStage();assert.equal(bg,pxStage());assert.equal(bg.sky.w,640);assert.equal(bg.sky.h,360);
for(const layer of Object.values(bg)) for(let i=3;i<layer.data.length;i+=4) assert(layer.data[i]===0 || layer.data[i]===255);
for(let x=0;x<700;x++) assert.equal(bg.arena.data[(306*700+x)*4+3],255,'ground plane');
assert.notEqual(BufferlessHash(pxStageLife(0)),BufferlessHash(pxStageLife(2)));
function BufferlessHash(s) {let h=0;for(let n=0;n<s.data.length;n++) h=(h*31+s.data[n])|0;return h;}
globalThis.scene=new PixelSurface(640,360);scene.blit(bg.sky,0,0);scene.blit(bg.far,-30,0);scene.blit(bg.town,-30,0);scene.blit(bg.arena,-30,0);scene.blit(pxStageLife(0),0,0);
scene.ellipse(205,308,23,3,'#645963');scene.ellipse(435,308,23,3,'#645963');
scene.blit(pxSprite(0,'idle'),205-PX_OX,306-PX_OY);
scene.blit(pxSprite(7,'guard'),435-(PX_W-1-PX_OX),306-PX_OY,1,true);
pxText(scene,'THE ARCHIVE COURTYARD',18,17,'#f4d7a4',2);
pxText(scene,'NATIVE PIXELS / ORIGINAL ART / GAMEPLAY GROUND UNCHANGED',18,38,'#acb5c1',1);
globalThis.large=new PixelSurface(1280,720);large.blit(scene,0,0,2);
console.log('PASS seven hard-alpha stage layers, floor coverage and eight-step cloth animation');
const signatures=new Set();let total=0;
globalThis.stages=[];
for(const stage of PX_STAGES) {
  const hashes=new Set();
  for(let frame=0;frame<8;frame++) {
    const raster=pxBackdrop(frame,stage.id);assert.equal(raster,pxBackdrop(frame,stage.id));
    const hash=BufferlessHash(raster);hashes.add(hash);
    for(let p=3;p<raster.data.length;p+=4)assert.equal(raster.data[p],255,'stage not opaque');
    for(let x=0;x<640;x++)assert.equal(raster.data[(GROUND/2*640+x)*4+3],255,'ground row');
    total++;
  }
  assert.equal(hashes.size,8,'eight distinct stage animation frames '+stage.id);
  const signature=BufferlessHash(pxBackdrop(0,stage.id));assert(!signatures.has(signature),'duplicate stage');signatures.add(signature);
  const S=newMatch(0,14,197);S.stage=stage.id;S.phase='fight';S.t=130;
  const before=JSON.stringify(S),frame=pxWorldSurface(S,{parts:[],puffs:[],stars:[],lines:[],rings:[],nums:[],words:[]});
  assert.equal(JSON.stringify(S),before,'stage rendering changed simulation');
  const labs=[{P:'F',K:'G',G:'S',A1:'R',A2:'T',A3:'Y',DOM:'H',move:'A/D',U:'W'},null];labs.other='Computer';
  frame.blit(pxHUDSurface(S,labs),0,0);const large=new PixelSurface(1280,720);large.blit(frame,0,0,2);stages.push({id:stage.id,surface:large});
  newRound(S);assert.equal(S.stage,stage.id,'stage lost between rounds');
  // The renderer's stage field must not affect deterministic match rules.
  const A=newMatch(0,14,197),B=JSON.parse(JSON.stringify(A));A.stage=stage.id;B.stage='courtyard';A.phase=B.phase='fight';
  for(let n=0;n<180;n++){const input=[n%41===0?BTN.P:n%73===0?BTN.K:BTN.R,n%37===0?BTN.K:BTN.G];step(A,input);step(B,input);}
  delete A.stage;delete B.stage;assert.equal(JSON.stringify(A),JSON.stringify(B),'stage changed combat');
}
assert.equal(pxBackdrop(0,'unknown'),pxBackdrop(0,'courtyard'));assert.equal(pxStageId(null),'courtyard');
let domains=0;
for(const stage of PX_STAGES)for(let ch=0;ch<15;ch++) {
  const S=newMatch(ch,(ch+1)%15,197);S.stage=stage.id;S.phase='fight';S.f[0].gauge=100;startDomain(S,S.f[0],S.f[1]);
  S.t=90;S.dom.t=20;const frame=pxWorldSurface(S,{parts:[],puffs:[],stars:[],lines:[],rings:[],nums:[],words:[]});
  for(let p=3;p<frame.data.length;p+=4)assert.equal(frame.data[p],255,'domain/stage compositing');domains++;
}
console.log('PASS',total,'opaque animated stage frames;',domains,'stage/Domain combinations; three distinct arenas; stage persistence; deterministic combat unchanged');
`,ctx);
if(process.argv[2])for(const stage of ctx.stages)writePNG(path.join(process.argv[2],'v10-'+stage.id+'.png'),stage.surface);
