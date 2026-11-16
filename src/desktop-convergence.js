'use strict';
// Desktop-only Convergence anticipation. The phone keeps its current bodies.
// Existing serialized Domain age holds the pose through pauses and snapshots.
Object.assign(PX_POSES, {
  convergencefold: {planted:true,h:[-21,-59],tilt:.2,s:[-22,-43],hip:[-13,-26],a:[[-2,-29],[9,-40]],b:[[-34,-30],[3,-39]],l:[[17,-11],[29,0]],r:[[-31,-12],[-39,0]]},
  convergenceaim: {planted:true,h:[-8,-81],tilt:-.08,s:[-10,-63],hip:[-9,-32],a:[[13,-46],[24,-38]],b:[[-5,-43],[19,-41]],l:[[19,-16],[29,0]],r:[[-29,-17],[-39,0]]},
});
const desktopConvergencePoseBase=pxDomainPose;
pxDomainPose=function(S,f) {
  const d=S.dom;
  // Compress, then bring the joined hands into the existing blood-feed lane.
  // Beam/contact/recoil still begin at tick 40 in the original renderer.
  if(d&&d.o===f.i&&d.k==='bloodsweep'&&d.t>=20&&d.t<40)
    return d.t<32?'convergencefold':'convergenceaim';
  return desktopConvergencePoseBase(S,f);
};
