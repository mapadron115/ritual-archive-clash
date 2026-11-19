'use strict';
// Keep the inward draw's footing while preparing and returning to guard.
Object.assign(PX_POSES, {
  blueready: {planted:true,h:[-8,-78],s:[-11,-62],hip:[-8,-34],a:[[8,-42],[17,-54]],b:[[-27,-46],[-16,-57]],l:[[20,-17],[30,0]],r:[[-29,-18],[-37,0]],palm:true},
  bluesettle: {planted:true,h:[-3,-78],s:[-7,-62],hip:[-7,-34],a:[[12,-44],[23,-57]],b:[[-25,-46],[-15,-58]],l:[[21,-17],[30,0]],r:[[-29,-18],[-37,0]],palm:true},
});
const desktopBlueReadyPoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='atk'&&f.y>=GROUND) {
    const m=moveDef(f);
    if(m&&m.id==='blue') {
      if(f.mt<Math.ceil(m.su/2))return 'blueready';
      if(f.mt>=m.su+Math.ceil(m.re*.65))return 'bluesettle';
    }
  }
  return desktopBlueReadyPoseBase(S,f);
};
