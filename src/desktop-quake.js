'use strict';
// Gamma Quake's body strikes the floor on the existing wave-release tick.
// Move age is serialized: freezes and event-free guests need no extra clock.
Object.assign(PX_POSES, {
  quakecoil: {planted:true,h:[-16,-75],tilt:-.12,s:[-14,-59],hip:[-8,-29],a:[[-30,-77],[-19,-98]],b:[[13,-43],[19,-57]],l:[[21,-13],[33,0]],r:[[-28,-15],[-37,0]]},
  quakeimpact: {planted:true,h:[21,-53],tilt:.4,s:[9,-39],hip:[-10,-24],a:[[35,-25],[43,-7]],b:[[-24,-29],[-20,-14]],l:[[22,-11],[33,0]],r:[[-30,-12],[-37,0]]},
  quakepull: {planted:true,h:[12,-59],tilt:.25,s:[2,-44],hip:[-9,-26],a:[[28,-27],[35,-19]],b:[[-25,-33],[-18,-23]],l:[[21,-12],[33,0]],r:[[-29,-13],[-37,0]]},
  quakerise: {planted:true,h:[1,-71],tilt:.08,s:[-5,-55],hip:[-7,-30],a:[[20,-39],[28,-49]],b:[[-25,-39],[-18,-51]],l:[[19,-15],[33,0]],r:[[-27,-16],[-37,0]]},
});
const desktopQuakePoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='atk'&&f.y>=GROUND) {
    const m=moveDef(f);
    if(m&&m.id==='quake') {
      if(f.mt<m.su/2)return desktopQuakePoseBase(S,f);
      if(f.mt<m.su)return 'quakecoil';
      const elapsed=f.mt-m.su,contact=Math.min(3,Math.ceil(m.re/3));
      return elapsed<contact?'quakeimpact':elapsed<Math.ceil(m.re*.65)?'quakepull':'quakerise';
    }
  }
  return desktopQuakePoseBase(S,f);
};
