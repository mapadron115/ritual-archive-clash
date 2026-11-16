// Real resize/mute handlers plus geometry and phone bitmap models. Not Safari or human play.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {context,root}=require('./mobile.cjs'),png=require('./png.cjs');
const baseline=process.argv.includes('--utility-baseline'),previewOnly=process.argv.includes('--preview-only');
const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
const old=require('node:child_process').execFileSync('git',['show','c820e92:mobile/touch.js'],{cwd:root,encoding:'utf8'});
context.utilityPriorLayout=Function(old.slice(0,old.indexOf('const MOBILE='))+'return mobileLayout;')();
Object.assign(context,{utilityBaseline:baseline,utilityPreviewOnly:previewOnly,utilityHTML:fs.readFileSync(path.join(root,'mobile/index.html'),'utf8')});
vm.runInContext(`
let utilityPassed=0,utilityFailed=0,utilityLayouts=0,utilityToggles=0;
function utilityGroup(name,fn){try{fn();utilityPassed++;console.log('PASS',name);}catch(e){utilityFailed++;console.log('FAIL',name+':',e.message);}}
const utilityCurrentLayout=mobileLayout;
if(utilityBaseline)mobileLayout=utilityPriorLayout;
const utilitySafe={top:0,right:44,bottom:21,left:44};
const utilityRect=id=>{const s=$(id).style;return Object.fromEntries(['left','top','width','height'].map(k=>[k,parseFloat(s[k])]));};
function utilitySize(w,h,safe=utilitySafe){innerWidth=w;innerHeight=h;getComputedStyle=()=>Object.fromEntries(Object.entries(safe).map(([k,v])=>['padding'+k[0].toUpperCase()+k.slice(1),v+'px']));win.dispatch('resize');}
utilityGroup('MUTE and MOVES keep the same fixed slot through Safari toolbar height changes',()=>{
 let original;
 for(const h of [375,320,270,219,200,320,375]){
  utilitySize(812,h);const r={mute:utilityRect('touchMute'),moves:utilityRect('touchPause')};
  if(!original)original=r;else assert.deepEqual(r,original,'utility slot follows toolbar height');
  for(const b of Object.values(r)){assert.equal(b.width,52);assert.equal(b.height,48);}
 }
});
utilityGroup('all twelve targets stay separated, >=48 px, safe and below the meters in short landscape viewports',()=>{
 for(const [w,h] of [[812,375],[812,320],[812,270],[812,219],[812,200],[667,375],[667,320],[667,219],[568,320],[568,219],[844,390],[844,244],[1024,768]])
 for(const safe of [{top:0,right:0,bottom:0,left:0},utilitySafe]){
  const l=mobileLayout(w,h,safe),bs=Object.values(l.buttons);assert.equal(bs.length,12);utilityLayouts++;
  for(const b of bs){assert(b.w>=48&&b.h>=48);assert(b.x>=safe.left&&b.x+b.w<=w-safe.right);assert(b.y>=safe.top&&b.y+b.h<=h-safe.bottom);
   if(b.x<l.canvas.x+l.canvas.w&&b.x+b.w>l.canvas.x)assert(b.y>=l.canvas.y+78*l.canvas.h/360,'target covers upper HUD at '+w+'x'+h);}
  for(let i=0;i<bs.length;i++)for(let j=0;j<i;j++){const a=bs[i],b=bs[j];assert(a.x+a.w+6<=b.x||b.x+b.w+6<=a.x||a.y+a.h+6<=b.y||b.y+b.h+6<=a.y,'overlapping targets at '+w+'x'+h);}
 }
});
utilityGroup('actual MUTE/UNMUTE clicks, changing fighter states and main-loop draws never reposition utilities',()=>{
 utilitySize(812,320);fresh('ai',1);aiInput=()=>0;G.paused=true;
 const r={mute:utilityRect('touchMute'),moves:utilityRect('touchPause')};
 const action=utilityHTML.match(/id="touchMute"[^>]*onclick="([^"]+)"/)[1];
 for(let n=0;n<16;n++){
  eval(action);utilityToggles++;assert.equal($('touchMute').textContent,AUDIO.mute?'UNMUTE':'MUTE');assert.equal($('touchMute').attributes['aria-pressed'],String(AUDIO.mute));
  G.S.f[0].x=200+n*25;G.S.f[0].ce=n*6;G.S.f[1].gauge=n*5;advance();
  assert.deepEqual({mute:utilityRect('touchMute'),moves:utilityRect('touchPause')},r);assert.equal(readKeys(BIND.solo),0);
 }
 const pauseAction=utilityHTML.match(/id="touchPause"[^>]*onclick="([^"]+)"/)[1];
 eval(pauseAction);assert(!G.paused);eval(pauseAction);assert(G.paused);assert.equal(readKeys(BIND.solo),0);
});
globalThis.utilityGeometry={passed:utilityPassed,failed:utilityFailed,layouts:utilityLayouts,toggles:utilityToggles,baseline:utilityBaseline};
console.log(JSON.stringify(utilityGeometry));
mobileLayout=utilityCurrentLayout;
if(utilityFailed&&!utilityPreviewOnly)throw Error('mobile utility audit failed: '+utilityFailed);
`,context,{filename:'mobile-utility-audit.js'});
const html=fs.readFileSync(path.join(root,'mobile/index.html'),'utf8'),css=fs.readFileSync(path.join(root,'mobile/mobile.css'),'utf8');
if(!baseline){assert(/id="mobileBuild"[^>]*>Mobile v156/.test(html));assert(/#touchMute[^}]*white-space:\s*nowrap/.test(css));}
if(out){
  const layout=baseline?context.utilityPriorLayout:vm.runInContext('mobileLayout',context),samples=[];
  for(const [w,h] of [[812,375],[812,320],[812,219],[667,375],[568,219],[375,812]]){
    const safe=w===812?{top:0,right:44,bottom:21,left:44}:{top:0,right:0,bottom:0,left:0};
    context.utilityExportLayout=layout;
    vm.runInContext('mobileLayout=utilityExportLayout',context);
    const surface=context.makePreview(w,h,safe,1);vm.runInContext('mobileLayout=utilityCurrentLayout',context);
    png(path.join(out,'v136-'+(baseline?'before':'after')+'-utility-'+w+'x'+h+'.png'),surface);
    if(w>h)samples.push({width:w,height:h,safe,...layout(w,h,safe)});
  }
  fs.writeFileSync(path.join(out,'v136-'+(baseline?'before':'after')+'-utility-layouts.json'),JSON.stringify(samples,null,2));
}
