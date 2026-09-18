(function(root){
 'use strict';const P=root.Elsewhere,TAU=Math.PI*2;
 class Renderer extends root.ParlorRenderer {
  door(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#04060b';c.fillRect(-32,-56,64,112);c.strokeStyle='#d3d2c1';c.lineWidth=3;c.strokeRect(-32,-56,64,112);c.strokeStyle='#777fa2';c.lineWidth=1;c.strokeRect(-25,-48,50,98);this.circle(c,20,6,3,'#d8c49b');c.restore();}
  clock(c,x,y,r,t=0){this.circle(c,x,y,r,'#090d18','#c9c8be',3);for(let i=0;i<12;i++){const a=i*TAU/12;this.line(c,[[x+Math.sin(a)*r*.77,y+Math.cos(a)*r*.77],[x+Math.sin(a)*r*.88,y+Math.cos(a)*r*.88]],'#aab2c6',2);}this.line(c,[[x-Math.sin(t)*r*.58,y-Math.cos(t)*r*.58],[x,y],[x+Math.cos(t*1.9)*r*.43,y+Math.sin(t*1.9)*r*.43]],'#ebdebc',2);this.circle(c,x,y,3,'#e5b98b');}
  eye(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.beginPath();c.moveTo(-38,0);c.quadraticCurveTo(0,-35,38,0);c.quadraticCurveTo(0,35,-38,0);c.fillStyle='#a9bbc4';c.fill();this.circle(c,0,0,15,'#253b47','#e3dace',2);this.circle(c,0,0,7,'#02050b');this.circle(c,4,-5,3,'#fff');c.restore();}
  key(c,x,y,s){c.save();c.translate(x,y);c.rotate(-.5);this.circle(c,0,0,s*12,null,'#cbbd91',3);this.line(c,[[s*12,0],[s*52,0],[s*52,s*10],[s*44,s*10],[s*44,0]],'#cbbd91',4);c.restore();}
  paintTable(c){
   c.fillStyle='#03050b';c.fillRect(0,0,600,1100);this.shell(c,-10);c.fillStyle='#242735';c.fill();this.shell(c,0);c.fillStyle='#070c16';c.fill();c.strokeStyle='#858a9e';c.lineWidth=3;c.stroke();
   let seed=64;for(let i=0;i<210;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=40+seed%520;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const y=50+seed%980;this.circle(c,x,y,i%7? .8:1.7,i%3?'#526170':'#c1bfa9');}
   const haze=c.createRadialGradient(296,555,15,296,555,340);haze.addColorStop(0,'#667ca640');haze.addColorStop(1,'#01030a00');c.fillStyle=haze;c.fillRect(45,100,490,880);
   // Impossible staircase receding into a door, entirely original geometry.
   for(let i=11;i>=0;i--){const y=425+i*25,w=27+i*11;this.line(c,[[296-w,y+11],[296-w,y],[296+w,y],[296+w,y+11]],i%2?'#687990':'#a0a6ad',2);}
   this.door(c,296,399,.72);this.eye(c,414,574,.66);this.key(c,152,599,.9);
   for(let i=0;i<9;i++){const a=i*.68;this.circle(c,296+Math.cos(a)*130,550+Math.sin(a)*96,4,null,'#92b9be',1);}
   this.text(c,'E L S E W H E R E',296,731,26,'#e0dfd7');this.text(c,'BEYOND THE OUTER LIMITS',296,754,9,'#99b5c7','sans-serif');this.text(c,'OF SPACE AND TIME',296,771,9,'#99b5c7','sans-serif');
   P.slings.forEach(t=>{c.beginPath();t.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle='#273846';c.fill();c.strokeStyle='#b4c1c2';c.lineWidth=2;c.stroke();});
   P.rails.forEach(r=>{this.line(c,[[r.a.x,r.a.y],[r.b.x,r.b.y]],'#02040a',13);this.line(c,[[r.a.x,r.a.y],[r.b.x,r.b.y]],'#777d92',7);this.line(c,[[r.a.x-1,r.a.y],[r.b.x-1,r.b.y]],'#d1d7d5',1.5);});
   this.text(c,'THE CLOCK KEEPS NO PROMISES',296,71,9,'#b8c2c8','sans-serif');this.text(c,'B U M P E R Y',296,1054,11,'#9fabb4','sans-serif');
   for(let y=360;y<920;y+=43)this.line(c,[[543,y+6],[550,y],[557,y+6]],'#697d95',2);
  }
  effect(e){if(e.type==='score')this.effects.push({...e,life:1});}
  draw(g,dt,paused){
   const c=this.ctx;c.save();c.scale(this.canvas.width/600,this.canvas.height/1100);c.fillStyle='#020309';c.fillRect(0,0,600,1100);
   let angle=0;if(g.warped){if(this.reducedMotion.matches)angle=Math.PI;else if(g.warpAge<2){const p=g.warpAge/2;angle=Math.PI*p*p*(3-2*p);}else if(g.warpUntil-g.time<2){const p=1-(g.warpUntil-g.time)/2;angle=Math.PI*(1+p*p*(3-2*p));}else angle=Math.PI;}
   c.save();c.translate(300,550);const fit=Math.min(1,600/(600*Math.abs(Math.cos(angle))+1100*Math.abs(Math.sin(angle))));c.scale(fit,fit);c.rotate(angle);c.translate(-300,-550);c.drawImage(this.cache,0,0,600,1100);
   if(g.warped){c.fillStyle='#60407822';c.fillRect(35,30,535,1040);}
   this.clock(c,296,205,29,g.warped?-g.time*2:g.time*.08);this.text(c,g.time>=g.nextWarpAt?'SOMETHING IS LISTENING':'THE CLOCK WAITS',296,251,8,'#a6ccce','sans-serif');
   P.bumpers.forEach((p,i)=>{this.circle(c,p.x,p.y,p.r+7,'#1c2231','#aab3be',2);this.circle(c,p.x,p.y,p.r,'#354857','#c9d5d0',2);if(i===0)this.eye(c,p.x,p.y,.63);else if(i===1)this.clock(c,p.x,p.y,23,-g.time*.2);else this.door(c,p.x,p.y,.4);});
   P.beacons.forEach((p,i)=>{this.circle(c,p.x,p.y,p.r,g.lit[i]?'#d5f5e7':'#314151','#b6c9cb',2);this.text(c,['I','II','III'][i],p.x,p.y+4,11,g.lit[i]?'#182d36':'#c2d2da');});
   P.targets.forEach((p,i)=>this.circle(c,p.x,p.y,p.r,g.targetLights[i]?'#d3e9e3':'#374357','#869ba8',2));
   g.flippers.forEach(f=>{const end=[f.x+Math.cos(f.angle)*91,f.y+Math.sin(f.angle)*91];this.line(c,[[f.x,f.y],end],'#02050c',29);this.line(c,[[f.x,f.y],end],g.tilted?'#444653':'#c9d4d0',24);this.line(c,[[f.x,f.y-3],[end[0],end[1]-3]],'#738a9c',4);this.circle(c,f.x,f.y,7,'#354b59');});
   for(let i=0;i<10;i++)this.line(c,[[539,1002+i*(4-g.charge*1.5)],[561,1004+i*(4-g.charge*1.5)]],'#abb9c2',2);
   for(const b of g.balls){const grad=c.createRadialGradient(b.x-3,b.y-4,1,b.x,b.y,b.r);grad.addColorStop(0,'#fff');grad.addColorStop(.45,'#c3d9e3');grad.addColorStop(1,'#3e5366');this.circle(c,b.x,b.y,b.r,grad,'#e5ffff',1);}
   if(!paused)for(const e of this.effects)e.life-=dt;this.effects=this.effects.filter(e=>e.life>0);for(const e of this.effects){c.globalAlpha=e.life;this.text(c,'+'+e.value,e.x||296,(e.y||550)-(1-e.life)*30,15,'#ebf6da','monospace');}c.globalAlpha=1;c.restore();
   if(g.warped){c.fillStyle='#080a17df';c.fillRect(82,488,436,93);this.text(c,g.warpPhase==='slow'?'TIME IS UNRAVELING':g.warpPhase==='leaving'?'FINDING YOUR WAY HOME':'GRAVITY HAS CHANGED ITS MIND',300,522,14,'#e4dbf0','sans-serif');this.text(c,`FLIPPERS ABOVE · ${Math.ceil(g.warpUntil-g.time)}s`,300,553,15,'#a9dcd9','monospace');}
   if(g.state==='intro')this.intro(c,g.storyTime);c.restore();
  }
  intro(c,t){
   c.fillStyle='#02030af7';c.fillRect(0,0,600,1100);
   const scroll=this.reducedMotion.matches?Math.floor(t/4)*360:t*100;
   for(let i=0;i<90;i++){const x=((i*173-scroll*.22)%680+680)%680-40,y=90+(i*137)%840;this.circle(c,x,y,i%5?1:2,'#768795');}
   c.save();c.beginPath();c.rect(20,140,560,570);c.clip();for(let i=0;i<7;i++){const x=240+i*350-scroll,y=420+(i%2?65:-50);c.save();c.translate(x,y);c.rotate(this.reducedMotion.matches?0:Math.sin(t*.3+i)*.16);if(i%4===0)this.door(c,0,0,1.35);if(i%4===1)this.clock(c,0,0,71,-t*.6);if(i%4===2)this.key(c,-25,0,2);if(i%4===3)this.eye(c,0,0,1.8);c.restore();}c.restore();
   this.text(c,'E L S E W H E R E',300,166,29,'#e5e3da');
   const chapter=Math.min(2,Math.floor(t/4));const lines=[['You missed the last train.','The station clock kept going backward.'],['A door appeared where the tracks ended.','Beyond it, even gravity had forgotten you.'],['Three lights. One clock. A way home.','Keep the silver ball in this reality.']][chapter];
   this.text(c,lines[0],300,765,20,'#e4e4de');this.text(c,lines[1],300,803,16,'#a7bac8');this.text(c,'BEYOND THE OUTER LIMITS OF SPACE AND TIME',300,873,10,'#798d9f','sans-serif');this.text(c,'LAUNCH TO SKIP',300,973,12,'#cad8d9','sans-serif');
  }
 }
 class Show{constructor(el){this.el=el;this.el.setAttribute('role','status');this.reset();}reset(){this.note='';this.until=0;}announce(title,copy,kind,time,duration=3){this.note=title;this.until=time+duration;}update(g,paused){const text=paused?'PAUSED':g.state==='intro'?'A DOOR OUTSIDE OF TIME':g.warped?`${g.warpPhase==='slow'?'TIME SLIP':'GRAVITY REVERSED'} · ${Math.ceil(g.warpUntil-g.time)}s`:g.time<this.until?this.note:`${g.multiplier}× · LIGHT THREE SIGNS · SHOOT THE CLOCK`;if(this.el.textContent!==text)this.el.textContent=text;}}
 root.ElsewhereRenderer=Renderer;root.ElsewhereShow=Show;
})(globalThis);
