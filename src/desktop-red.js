'use strict';
// Reversal Red draws its palm toward the chest, drives it out, then absorbs the recoil.
// The existing move age keeps the body fixed through freezes and guest snapshots.
Object.assign(PX_POSES, {
  redcoil: {planted:true,h:[-18,-78],tilt:-.12,s:[-20,-62],hip:[-10,-34],a:[[-10,-37],[-6,-48]],b:[[-32,-46],[-19,-57]],l:[[18,-16],[30,0]],r:[[-29,-18],[-37,0]],palm:true},
  reddrive: {planted:true,h:[8,-76],tilt:.12,s:[3,-60],hip:[-6,-34],a:[[17,-39],[34,-38]],b:[[-23,-46],[-12,-57]],l:[[23,-17],[30,0]],r:[[-30,-18],[-37,0]],palm:true},
  redrecoil: {planted:true,h:[-18,-74],tilt:-.16,s:[-20,-58],hip:[-11,-32],a:[[6,-35],[24,-42]],b:[[-35,-46],[-22,-57]],l:[[18,-15],[30,0]],r:[[-32,-17],[-37,0]],palm:true},
  redrecover: {planted:true,h:[-7,-76],tilt:.05,s:[-10,-60],hip:[-8,-33],a:[[6,-39],[20,-49]],b:[[-27,-45],[-15,-56]],l:[[20,-16],[30,0]],r:[[-29,-18],[-37,0]],palm:true},
});
const desktopRedPoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='atk'&&f.y>=GROUND) {
    const m=moveDef(f);
    if(m&&m.id==='red'&&f.mt>=Math.ceil(m.su/2)) {
      if(f.mt<m.su)return 'redcoil';
      const elapsed=f.mt-m.su;
      if(elapsed<3)return 'reddrive';
      if(elapsed<7)return 'redrecoil';
      if(elapsed<Math.ceil(m.re*.65))return 'redrecover';
    }
  }
  return desktopRedPoseBase(S,f);
};
