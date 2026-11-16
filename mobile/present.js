// Keep upload sources independent until the arena has consumed each layer.
// This is a mobile-only mitigation for the reported frozen-world/label smear;
// a deferred-copy test is not evidence of the native iPhone failure's cause.
const MOBILE_PRESENT=new Map();
pxPresent=function(c,s,layer='world') {
  c.save();
  try {
    if(layer!=='hud') {
      // Clear even if a native world copy silently fails. A missed copy may
      // leave a blank arena, but cannot retain the preceding frame's tags.
      c.fillStyle=PX_INK;c.fillRect(0,0,W,H);
    }
    let upload=MOBILE_PRESENT.get(layer);
    if(!upload) {
      const canvas=document.createElement('canvas');canvas.width=640;canvas.height=360;
      const context=canvas.getContext('2d');
      upload={canvas,context,image:context.createImageData(640,360)};
      MOBILE_PRESENT.set(layer,upload);
    }
    upload.image.data.set(s.data);upload.context.putImageData(upload.image,0,0);
    c.imageSmoothingEnabled=false;c.drawImage(upload.canvas,0,0,W,H);
  } finally {c.restore();}
};
// Match the shared camera/shake raster exactly, choosing a separate upload
// source for the shifted world. Desktop continues to use the shared function.
pxDrawWorld=function(c,S) {
  FX.clock++;FX.cam.x=W/2;FX.cam.y=H/2;FX.cam.z=1;
  const s=pxWorldSurface(S),shake=Math.min(5,Math.round(FX.shake/3));
  if(shake>0) {
    const shift=new PixelSurface(640,360);shift.rect(0,0,640,360,PX_INK);
    shift.blit(s,Math.round(Math.sin(FX.clock*13)*shake),Math.round(Math.cos(FX.clock*7)*shake));
    pxPresent(c,shift,'shake');
  } else pxPresent(c,s,'world');
};
