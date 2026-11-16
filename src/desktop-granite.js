'use strict';
// Granite Blast coils low, aims, then braces behind the sustained cannon beam.
// Serialized move age holds the body through freezes and event-free snapshots.
Object.assign(PX_POSES, {
  granitecoil: {planted:true,h:[-20,-64],tilt:.12,s:[-22,-47],hip:[-14,-24],a:[[0,-31],[11,-43]],b:[[-35,-33],[1,-41]],l:[[18,-12],[32,0]],r:[[-32,-13],[-40,0]]},
  graniteaim: {planted:true,h:[-12,-78],s:[-14,-60],hip:[-9,-30],a:[[15,-35],[36,-34]],b:[[-4,-41],[29,-35]],l:[[19,-15],[32,0]],r:[[-30,-16],[-40,0]]},
  granitefire: {planted:true,h:[8,-74],tilt:.08,s:[2,-56],hip:[-7,-29],a:[[22,-35],[45,-34]],b:[[6,-42],[37,-35]],l:[[23,-14],[32,0]],r:[[-29,-16],[-40,0]]},
  granitebrace: {planted:true,h:[-14,-72],tilt:-.12,s:[-17,-54],hip:[-12,-27],a:[[17,-35],[45,-34]],b:[[-2,-42],[37,-35]],l:[[19,-13],[32,0]],r:[[-33,-14],[-40,0]]},
  granitewithdraw: {planted:true,h:[-9,-70],tilt:.08,s:[-12,-53],hip:[-9,-27],a:[[9,-35],[23,-42]],b:[[-22,-39],[12,-44]],l:[[21,-13],[32,0]],r:[[-30,-15],[-40,0]]},
});
const desktopGranitePoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='atk'&&f.y>=GROUND) {
    const m=moveDef(f);
    if(m&&m.id==='granite'&&f.mt>=Math.ceil(m.su/2)) {
      if(f.mt<m.su)return f.mt<m.su-3?'granitecoil':'graniteaim';
      const elapsed=f.mt-m.su;
      if(elapsed<3)return 'granitefire';
      // The original sixteen-tick beam outlasts the generic cannon's recoil.
      if(elapsed<16)return 'granitebrace';
      if(elapsed<20)return 'granitewithdraw';
    }
  }
  return desktopGranitePoseBase(S,f);
};
