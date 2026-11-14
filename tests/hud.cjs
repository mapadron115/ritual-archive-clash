const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const writePNG=require('./png.cjs'),root=path.join(__dirname,'..');
const ctx=vm.createContext({console,assert,setTimeout,requestAnimationFrame(){},addEventListener(){},window:{},document:{getElementById(){return {getContext(){return {};}};},querySelectorAll(){return [];}}});
vm.runInContext(['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','ai','render','main'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
vm.runInContext(`
let checked=0;
for(let ch=0;ch<15;ch++)for(const mode of ['ai','local','watch','host','guest']) {
  const S=newMatch(ch,ch,1000);S.phase='fight';S.t=90;S.f[0].hp=maxHp(S.f[0])*.25;S.f[0].ghost=maxHp(S.f[0])*.4;S.f[0].zone=240;S.f[0].nails=3;S.f[0].guardHp=25;
  S.f[1].cd=[90,100,120];S.f[1].ce=5;S.wins=[1,0];G.mode=mode;
  const hud=pxHUDSurface(S,labels());assert.equal(hud.w,640);assert.equal(hud.h,360);
  for(let n=3;n<hud.data.length;n+=4)assert(hud.data[n]===0||hud.data[n]===255);
  [...CH[ch].arts,CH[ch].dom].forEach((a,n)=>{
    const width=n===3?75:59,lines=pxWrap(a.name,width);
    assert(lines.length<=2,CH[ch].name+': too many lines for '+a.name);
    assert.equal(lines.join('').replace(/\\s/g,''),a.name.toUpperCase().replace(/\\s/g,''),'lost letters in '+a.name);
    for(const line of lines)assert(pxTextWidth(line)<=width,'overflow in '+a.name);
  });
  checked++;
}
const S=newMatch(0,7,1000);S.phase='fight';S.t=130;S.f[0].x=400;S.f[1].x=880;S.f[0].hp=720;S.f[0].ghost=800;S.f[0].gauge=75;S.f[0].cd=[15,100,0];S.f[1].hp=420;S.f[1].ce=34;S.f[1].guardHp=70;S.wins=[1,0];G.mode='local';FX.banner=null;FX.flash=0;FX.parts=[];FX.puffs=[];FX.rings=[];FX.lines=[];FX.stars=[];FX.nums=[];FX.words=[];FX.bf=null;FX.impact=null;
const scene=pxWorldSurface(S);scene.blit(pxHUDSurface(S,labels()),0,0);globalThis.large=new PixelSurface(1280,720);large.blit(scene,0,0,2);
globalThis.lowhealth=new PixelSurface(1280,720);S.f[0].hp=200;S.f[0].zone=400;S.f[0].nails=3;S.f[1].domUsed=1;S.f[1].ce=2;S.f[1].cd=[100,120,120];G.mode='ai';
const low=pxWorldSurface(S);low.blit(pxHUDSurface(S,labels()),0,0);lowhealth.blit(low,0,0,2);
assert.equal(pxWrap('Worldbreaker',51).join(''),'WORLDBREAKER');
globalThis.cards=[];
for(let page=0;page<3;page++) {
  const sheet=new PixelSurface(1280,550);sheet.rect(0,0,1280,550,PX_INK);
  pxText(sheet,'ALL CARD LABELS / LOCAL CONTROLS / PAGE '+(page+1),16,12,PX_LIGHT,2);
  for(let row=0;row<5;row++) {
    const ch=page*5+row,T=newMatch(ch,ch,1000);G.mode='local';
    T.f[0].cd=[90,100,120];T.f[0].ce=50;T.f[1].gauge=GAUGE_MAX;
    const hud=pxHUDSurface(T,labels()),strip=new PixelSurface(640,36);
    for(let y=0;y<36;y++)strip.data.set(hud.data.subarray((320+y)*640*4,(321+y)*640*4),y*640*4);
    pxText(sheet,CH[ch].name,16,42+row*100,PX_KITS[ch].accent,2);sheet.blit(strip,0,62+row*100,2);
  }
  cards.push(sheet);
}
console.log('PASS',checked,'HUD states, all 60 complete names within two lines, mirrored portraits and status combinations');
`,ctx);
if(process.argv[2])ctx.cards.forEach((sheet,n)=>writePNG(path.join(process.argv[2],'v8-card-labels-'+(n+1)+'.png'),sheet));
