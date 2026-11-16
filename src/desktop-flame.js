'use strict';
// Gather, draw to a wide aim, then let the rear hand fly back on arrow release.
// Existing move age holds the gesture through freezes and event-free snapshots.
Object.assign(PX_POSES, {
  flamegather: {planted:true,h:[-13,-78],tilt:-.08,s:[-15,-62],hip:[-9,-34],a:[[9,-48],[14,-51]],b:[[-35,-48],[-12,-63]],l:[[19,-17],[30,0]],r:[[-29,-18],[-37,0]]},
  flameaim: {planted:true,h:[-6,-78],tilt:.04,s:[-8,-62],hip:[-9,-34],a:[[9,-39],[25,-39]],b:[[-47,-61],[-14,-69]],l:[[21,-17],[30,0]],r:[[-30,-18],[-37,0]]},
  flameloose: {planted:true,h:[8,-77],tilt:.12,s:[1,-61],hip:[-6,-34],a:[[12,-39],[25,-39]],b:[[-26,-58],[-43,-72]],l:[[23,-17],[30,0]],r:[[-29,-18],[-37,0]]},
  flamefollow: {planted:true,h:[11,-76],tilt:.14,s:[4,-60],hip:[-5,-33],a:[[18,-40],[31,-43]],b:[[-24,-48],[-43,-60]],l:[[23,-16],[30,0]],r:[[-29,-18],[-37,0]]},
  flamerecover: {planted:true,h:[1,-78],tilt:.04,s:[-5,-62],hip:[-8,-34],a:[[15,-46],[24,-51]],b:[[-30,-46],[-22,-57]],l:[[21,-17],[30,0]],r:[[-29,-18],[-37,0]]},
});
const desktopFlamePoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='atk'&&f.y>=GROUND) {
    const m=moveDef(f);
    if(m&&m.id==='flame'&&f.mt>=Math.ceil(m.su/2)) {
      if(f.mt<m.su-8)return 'flamegather';
      if(f.mt<m.su)return 'flameaim';
      const elapsed=f.mt-m.su;
      if(elapsed<3)return 'flameloose';
      if(elapsed<8)return 'flamefollow';
      if(elapsed<Math.ceil(m.re*.65))return 'flamerecover';
    }
  }
  return desktopFlamePoseBase(S,f);
};
