'use strict';
// Mobile-only row fills. Keep PixelSurface's rounding, clipping and RGBA bytes;
// a rectangle need not look up its colour and bounds separately for every dot.
// Views follow the backing byte array weakly, so transient surfaces are freed.
(() => {
  const views=new WeakMap(),colours=new Map();
  PixelSurface.prototype.rect=function(x,y,w,h,col) {
    const left=Math.max(0,Math.round(x)),right=Math.min(this.w,Math.round(x+w));
    const top=Math.max(0,Math.round(y)),bottom=Math.min(this.h,Math.round(y+h));
    if(!(right>left&&bottom>top))return;
    let pixels=views.get(this.data);
    if(!pixels){pixels=new Uint32Array(this.data.buffer,this.data.byteOffset,this.data.length/4);views.set(this.data,pixels);}
    let colour=colours.get(col);
    if(colour===undefined){
      // Reading the same four bytes as a native word works on either endian.
      colour=new Uint32Array(new Uint8ClampedArray(pxRGB(col)).buffer)[0];
      colours.set(col,colour);
    }
    for(let row=top*this.w;row<bottom*this.w;row+=this.w)pixels.fill(colour,row+left,row+right);
  };
})();
