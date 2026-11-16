'use strict';
// Grape Shot opens into its upward fan, then kicks both arms back and up.
// Existing move age holds every body through freezes and guest snapshots.
Object.assign(PX_POSES, {
  grapecoil: {planted:true,h:[-19,-64],tilt:.12,s:[-21,-48],hip:[-13,-25],a:[[0,-31],[4,-43]],b:[[-35,-34],[-14,-43]],l:[[18,-12],[32,0]],r:[[-32,-13],[-40,0]]},
  grapeopen: {planted:true,h:[-10,-76],s:[-12,-59],hip:[-9,-30],a:[[11,-33],[25,-36]],b:[[-14,-56],[22,-58]],l:[[20,-15],[32,0]],r:[[-31,-16],[-40,0]]},
  grapefire: {planted:true,h:[8,-74],tilt:.08,s:[1,-56],hip:[-6,-29],a:[[15,-32],[29,-36]],b:[[0,-55],[26,-57]],l:[[23,-14],[32,0]],r:[[-29,-16],[-40,0]]},
  grapekick: {planted:true,h:[-23,-76],tilt:-.16,s:[-23,-57],hip:[-13,-27],a:[[1,-38],[13,-57]],b:[[-29,-53],[1,-68]],l:[[19,-13],[32,0]],r:[[-33,-14],[-40,0]]},
  graperecover: {planted:true,h:[-12,-70],tilt:.06,s:[-15,-53],hip:[-10,-27],a:[[7,-37],[18,-47]],b:[[-27,-40],[-5,-52]],l:[[20,-13],[32,0]],r:[[-31,-15],[-40,0]]},
});
const desktopGrapePoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='atk'&&f.y>=GROUND) {
    const m=moveDef(f);
    if(m&&m.id==='grape'&&f.mt>=Math.ceil(m.su/2)) {
      if(f.mt<m.su)return f.mt<m.su-3?'grapecoil':'grapeopen';
      const elapsed=f.mt-m.su;
      if(elapsed<3)return 'grapefire';
      if(elapsed<9)return 'grapekick';
      if(elapsed<Math.ceil(m.re*.75))return 'graperecover';
    }
  }
  return desktopGrapePoseBase(S,f);
};
