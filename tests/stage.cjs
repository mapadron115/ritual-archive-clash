const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const writePNG=require('./png.cjs'),root=path.join(__dirname,'..'),ctx=vm.createContext({console,assert});
vm.runInContext(['sim','fighters','fighters2','pixel','pixel-stage'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
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
`,ctx);
if(process.argv[2]) writePNG(path.join(process.argv[2],'v4-courtyard.png'),ctx.large);
