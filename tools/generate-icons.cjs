// Rasterizes original geometric artwork with Node built-ins; no art downloads.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const dir=path.resolve(__dirname,'../extension/icons');fs.mkdirSync(dir,{recursive:true});
const crcTable=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc(buffer){let c=0xffffffff;for(const b of buffer)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
function chunk(type,data){const t=Buffer.from(type),len=Buffer.alloc(4),sum=Buffer.alloc(4);len.writeUInt32BE(data.length);sum.writeUInt32BE(crc(Buffer.concat([t,data])));return Buffer.concat([len,t,data,sum]);}
function inside(x,y,polygon){let yes=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const [xi,yi]=polygon[i],[xj,yj]=polygon[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)yes=!yes;}return yes;}
function render(size,name,maskable=false){
  const data=Buffer.alloc((size*3+1)*size);const scale=maskable?.78:1;
  const star=Array.from({length:8},(_,i)=>{const r=i%2?.075:.265;return[Math.cos(i*Math.PI/4)*r,Math.sin(i*Math.PI/4)*r];});
  for(let y=0;y<size;y++){let offset=y*(size*3+1);data[offset++]=0;for(let x=0;x<size;x++){
    let rgb=[0,0,0];for(let sy=0;sy<2;sy++)for(let sx=0;sx<2;sx++){
      const px=((x+(sx+.5)/2)/size-.5)/scale,py=((y+(sy+.5)/2)/size-.5)/scale,r=Math.hypot(px,py);
      const capsule=(ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy)));return Math.hypot(px-ax-t*dx,py-ay-t*dy);};
      const glow=Math.max(0,1-r*1.8);let col=[169+glow*50,62+glow*50,53+glow*30];
      const arch=py<-.047?Math.abs(Math.hypot(px,py+.047)-.283):Math.min(Math.abs(px-.283),Math.abs(px+.283));
      if(arch<.009&&py<.184)col=[235,204,161];
      if(Math.abs(Math.abs(px)-.225)<.007&&py>.02&&py<.15)col=[242,223,184];
      const flipper=Math.min(capsule(-.184,.152,-.059,.227),capsule(.184,.152,.059,.227));
      if(flipper<.045)col=[105,47,46];
      const face=Math.min(capsule(-.184,.133,-.059,.227),capsule(.184,.133,.059,.227));
      if(face<.037)col=[242,223,184];if(face<.004)col=[207,170,112];
      const br=Math.hypot(px,py+.063);
      if(br<.105){const light=Math.max(0,1-Math.hypot(px+.036,py+.102)/.19);col=[65+light*190,95+light*158,102+light*142];}
      const starDistance=Math.abs(px+.135)+Math.abs(py+.176);if(starDistance<.036&&(Math.abs(px+.135)<.01||Math.abs(py+.176)<.01))col=[242,223,184];
      if(Math.hypot(px-.15,py+.197)<.016)col=[190,213,182];
      for(let k=0;k<3;k++)rgb[k]+=col[k]/4;
    }for(const n of rgb)data[offset++]=Math.round(n);
  }}
  const header=Buffer.alloc(13);header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);header[8]=8;header[9]=2;
  fs.writeFileSync(path.join(dir,name),Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(data)),chunk('IEND',Buffer.alloc(0))]));
}
render(180,'apple-touch-icon.png');render(192,'icon-192.png');render(512,'icon-512.png');render(512,'icon-maskable-512.png',true);
console.log('Generated four opaque Home Screen icons.');
