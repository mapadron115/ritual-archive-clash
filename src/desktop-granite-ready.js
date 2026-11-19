'use strict';
// Keep the cannon's wide soles planted while gathering and returning to guard.
Object.assign(PX_POSES, {
  graniteready: {planted:true,h:[-10,-75],s:[-13,-58],hip:[-10,-30],a:[[5,-39],[11,-50]],b:[[-23,-41],[-3,-48]],l:[[18,-15],[32,0]],r:[[-30,-16],[-40,0]]},
  granitesettle: {planted:true,h:[-4,-76],s:[-7,-59],hip:[-8,-30],a:[[17,-42],[25,-55]],b:[[-23,-43],[-15,-55]],l:[[21,-15],[32,0]],r:[[-29,-16],[-40,0]]},
});
const desktopGraniteReadyPoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='atk'&&f.y>=GROUND) {
    const m=moveDef(f);
    if(m&&m.id==='granite') {
      if(f.mt<Math.ceil(m.su/2))return 'graniteready';
      if(f.mt>=m.su+20)return 'granitesettle';
    }
  }
  return desktopGraniteReadyPoseBase(S,f);
};
