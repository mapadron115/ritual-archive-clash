'use strict';
// Keep the palm strike's footing while preparing and returning to guard.
Object.assign(PX_POSES, {
  redready: {planted:true,h:[-8,-78],s:[-11,-62],hip:[-8,-34],a:[[8,-42],[17,-54]],b:[[-27,-46],[-16,-57]],l:[[20,-17],[30,0]],r:[[-29,-18],[-37,0]],palm:true},
  redsettle: {planted:true,h:[-3,-78],s:[-7,-62],hip:[-7,-34],a:[[12,-44],[23,-57]],b:[[-25,-46],[-15,-58]],l:[[21,-17],[30,0]],r:[[-29,-18],[-37,0]],palm:true},
});
const desktopRedReadyPoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='atk'&&f.y>=GROUND) {
    const m=moveDef(f);
    if(m&&m.id==='red') {
      if(f.mt<Math.ceil(m.su/2))return 'redready';
      if(f.mt>=m.su+Math.ceil(m.re*.65))return 'redsettle';
    }
  }
  return desktopRedReadyPoseBase(S,f);
};
