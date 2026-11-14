const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const writePNG=require('./png.cjs'),root=path.join(__dirname,'..'),ctx=vm.createContext({console,assert});
vm.runInContext(['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','ai','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
vm.runInContext(`
let frames=0;
function validate(s) {assert.equal(s.data.length,640*360*4);for(let n=3;n<s.data.length;n+=4)assert.equal(s.data[n],255);frames++;}
for(let ch=0;ch<CH.length;ch++)for(let n=0;n<4;n++) {
  const S=newMatch(ch,(ch+1)%CH.length,1000);S.phase='fight';S.f[0].x=450;S.f[1].x=720;S.f[0].ce=100;S.f[0].gauge=100;
  S.f[1].nails=3;S.f[1].gum=300;S.f[1].hurtT=0;S.f[0].hist=Array.from({length:10},()=>[450,1000]);
  const inp=n===3?BTN.DOM:BTN['A'+(n+1)];step(S,[inp,0]);
  for(let t=0;t<150;t++){step(S,[0,0]);for(const e of S.ev)fxEvent(S,e);S.ev.length=0;fxTick();if(t%30===0)validate(pxWorldSurface(S));}
}
// Exercise every projectile and zone visual, including states AI may not produce in a short run.
const S=newMatch(0,7,1000);S.phase='fight';S.t=80;S.f[0].x=420;S.f[1].x=850;
S.proj=['cut','knife','nail','wave','stone','shell','pellet','red','flame','orb','gum'].map((k,n)=>({k,x:80+n*110,y:240+(n%2)*90,vx:n%2?-12:12,vy:0,r:10,t:20,life:60,spin:1}));
S.ents=[{k:'dog',x:320,y:612,face:1,t:30,v:0,bite:8},{k:'nue',x:760,y:200,face:-1,t:10}];
validate(pxWorldSurface(S));globalThis.effects=pxWorldSurface(S);
const T=newMatch(1,2,1000);T.phase='fight';T.f[0].x=590;T.f[1].x=710;T.f[0].st='atk';T.f[0].move='p3';T.f[0].mt=8;T.f[1].st='hit';T.f[0].zone=480;
FX.parts=[];FX.lines=[];FX.puffs=[];FX.stars=[];FX.rings=[];FX.nums=[];FX.words=[];FX.flash=0;
fxEvent(T,{k:'blackflash',x:690,y:528,a:0});FX.impact.t=6;FX.bf.t=7;FX.nums.push({x:730,y:420,txt:'127',t:6,life:40,bf:1});
globalThis.blackflash=pxWorldSurface(T);validate(blackflash);
globalThis.domainSheet=new PixelSurface(1280,1080);domainSheet.rect(0,0,1280,1080,PX_INK);
for(const [idx,ch]of [0,1,3,8,10,14].entries()) {const D=newMatch(ch,(ch+1)%15,1234);D.phase='fight';D.f[0].gauge=100;startDomain(D,D.f[0],D.f[1]);D.freeze=0;D.t=120;D.dom.t=30;const neutral={parts:[],lines:[],puffs:[],stars:[],rings:[],nums:[],words:[],flash:0};const frame=pxWorldSurface(D,neutral);validate(frame);domainSheet.blit(frame,(idx%2)*640,Math.floor(idx/2)*360);pxOutlinedText(domainSheet,CH[ch].dom.name,(idx%2)*640+14,Math.floor(idx/2)*360+20,PX_LIGHT,2);}
console.log('PASS',frames,'opaque world frames across all arts, all ultimates, every projectile, summons and Black Flash');
`,ctx);
if(process.argv[2]) {for(const [name,key] of [['v5-effects.png','effects'],['v5-blackflash.png','blackflash'],['v5-domains.png','domainSheet']])writePNG(path.join(process.argv[2],name),ctx[key]);}
