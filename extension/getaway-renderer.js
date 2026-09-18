(function(root){
 'use strict';
 const P=root.Getaway;
 class Renderer extends root.ParlorRenderer {
  car(c,x,y,w,h,color='#e73532',police=false){
   c.save();c.translate(x,y);c.fillStyle='#080b10';c.fillRect(-w*.58,-h*.3,w*1.16,h*.17);c.fillRect(-w*.58,h*.25,w*1.16,h*.17);
   c.fillStyle=color;c.beginPath();c.roundRect(-w/2,-h/2,w,h,[w*.22,w*.22,w*.12,w*.12]);c.fill();
   c.fillStyle='#101e29';c.fillRect(-w*.36,-h*.23,w*.72,h*.25);c.fillRect(-w*.32,h*.22,w*.64,h*.15);
   c.fillStyle='#ffecd0';c.fillRect(-w*.4,-h*.46,w*.23,h*.045);c.fillRect(w*.17,-h*.46,w*.23,h*.045);
   c.fillStyle='#ff403a';c.fillRect(-w*.4,h*.43,w*.2,h*.04);c.fillRect(w*.2,h*.43,w*.2,h*.04);
   if(police){c.fillStyle='#e73532';c.fillRect(-w*.35,h*.045,w*.35,h*.07);c.fillStyle='#56baff';c.fillRect(0,h*.045,w*.35,h*.07);}
   else{c.fillStyle='#ff8b6b';c.fillRect(-w*.025,-h*.43,w*.05,h*.18);}
   c.restore();
  }
  paintTable(c){
   const bg=c.createLinearGradient(0,0,600,1100);bg.addColorStop(0,'#111d27');bg.addColorStop(.5,'#29262a');bg.addColorStop(1,'#190e14');c.fillStyle=bg;c.fillRect(0,0,600,1100);
   c.strokeStyle='#9b9690';c.lineWidth=8;c.strokeRect(21,15,558,1067);c.strokeStyle='#df3c30';c.lineWidth=3;c.strokeRect(30,23,540,1050);
   for(let i=0;i<17;i++){const x=52+i*29,h=25+(i*47%96);c.fillStyle=i%2?'#24313b':'#34404a';c.fillRect(x,230-h,23,h);c.fillStyle='#be9d66';for(let y=239-h;y<223;y+=13)c.fillRect(x+6,y,4,4);}
   // Original winding expressway, painted beneath the physical rails.
   const road=[[165,277],[180,415],[381,584],[328,701],[236,836],[287,993]];
   this.line(c,road,'#11151b',130);this.line(c,road,'#847766',134);this.line(c,road,'#282b31',124);
   c.setLineDash([17,19]);this.line(c,road,'#d4b976',3);c.setLineDash([]);
   this.text(c,'NIGHT RUN · PORT CITY',303,249,10,'#f1cc81','sans-serif');
   this.text(c,'GETAWAY',300,659,49,'#ef4638','Impact, sans-serif');this.text(c,'NO EASY WAY OUT',300,682,11,'#f7dfad','sans-serif');
   c.save();c.translate(313,746);c.rotate(-.55);this.car(c,0,0,66,115);c.restore();
   this.circle(c,295,825,75,null,'#bf9d60',2);
   for(let i=0;i<25;i++){const a=Math.PI*.82+i*Math.PI*1.36/24;this.line(c,[[295+Math.cos(a)*63,825+Math.sin(a)*63],[295+Math.cos(a)*72,825+Math.sin(a)*72]],i>18?'#f44133':'#d4c5a2',i%4?2:4);}
   this.text(c,'RPM',295,827,12,'#d3b57b','sans-serif');
   P.slings.forEach(t=>{c.beginPath();t.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle='#85291f';c.fill();c.strokeStyle='#f2bc5f';c.lineWidth=3;c.stroke();});
   P.rails.forEach(r=>{const points=[[r.a.x,r.a.y],[r.b.x,r.b.y]];this.line(c,points,'#05080c',15);this.line(c,points,'#a5a6a3',8);this.line(c,points,'#f0e4c5',2);});
   c.fillStyle='#151318';c.fillRect(536,355,29,685);for(let y=395;y<927;y+=39)this.line(c,[[543,y+8],[550,y],[557,y+8]],'#b7a06c',2);
   this.text(c,'HIDEOUT',141,313,12,'#f2d49b','sans-serif');this.text(c,'GEAR UP',85,646,9,'#efb064','sans-serif');this.text(c,'REDLINE',481,669,9,'#efb064','sans-serif');
   this.text(c,'B U M P E R Y',297,1060,12,'#dfc4a3','sans-serif');
   [[35,30],[565,30],[35,1068],[565,1068]].forEach(p=>this.screw(c,...p));
  }
  effect(e){if(e.type==='score')this.effects.push({...e,life:1});}
  draw(game,dt,paused){
   const c=this.ctx;c.save();c.scale(this.canvas.width/600,this.canvas.height/1100);c.drawImage(this.cache,0,0,600,1100);
   c.fillStyle='#060d13';c.fillRect(63,36,474,156);c.strokeStyle='#657478';c.lineWidth=3;c.strokeRect(63,36,474,156);
   this.text(c,game.state==='chase'?'PURSUIT LIVE':'GETAWAY',300,75,28,'#f24f3c','Impact, sans-serif');
   this.text(c,game.state==='chase'?'BALL LOCKED · FLIPPERS STEER':game.pocketArmed?'HIDEOUT LIT · SHOOT THE POCKET':'LIGHT 3 SIGNALS TO OPEN HIDEOUT',300,108,12,'#f5d89c','sans-serif');
   this.text(c,`GEAR ${game.gear}     ${game.multiplier}× SCORE`,300,145,17,'#e8e3ce','monospace');
   P.bumpers.forEach((b,i)=>{this.circle(c,b.x,b.y,b.r+7,'#1c2025','#b9b6a5',3);this.circle(c,b.x,b.y,b.r,['#b12a23','#cf9527','#278677'][i],'#f8d49c',2);this.circle(c,b.x-6,b.y-7,b.r*.44,['#ff7250','#ffe079','#80dfb4'][i]);});
   P.targets.forEach((p,i)=>{this.circle(c,p.x,p.y,p.r,game.targetLights[i]?'#ffe59a':'#713021','#d49b68',2);this.text(c,String(i+1),p.x,p.y+4,11,'#f4e5c4','sans-serif');});
   P.beacons.forEach((p,i)=>this.circle(c,p.x,p.y,p.r,game.lit[i]?'#b6f8ac':'#4e5e39','#e5c087',3));
   this.circle(c,P.pocket.x,P.pocket.y,31,'#020408',game.pocketArmed?'#70e4b0':'#777b77',5);this.text(c,game.pocketArmed?'LOCK':'CLOSED',141,409,11,game.pocketArmed?'#98f3c4':'#aeb6b4','sans-serif');
   game.flippers.forEach(f=>{const tip=[f.x+Math.cos(f.angle)*91,f.y+Math.sin(f.angle)*91];this.line(c,[[f.x,f.y],tip],'#0c0b10',29);this.line(c,[[f.x,f.y],tip],game.tilted?'#625d55':'#e13f32',24);this.line(c,[[f.x,f.y-3],[tip[0],tip[1]-3]],'#f1c7a1',4);this.circle(c,f.x,f.y,8,'#d6c3a6');});
   for(let i=0;i<10;i++)this.line(c,[[539,1004+i*(4-game.charge*1.5)],[561,1006+i*(4-game.charge*1.5)]],'#b6b4a5',2);
   for(const b of game.balls){const grad=c.createRadialGradient(b.x-3,b.y-4,1,b.x,b.y,b.r);grad.addColorStop(0,'#fff');grad.addColorStop(.4,'#e2e6e1');grad.addColorStop(1,'#424a51');this.circle(c,b.x,b.y,b.r,grad,'#fff9',1);}
   this.text(c,`GEAR ${game.gear}`,295,850,15,'#f7d098','monospace');
   if(!paused)for(const e of this.effects)e.life-=dt;this.effects=this.effects.filter(e=>e.life>0);for(const e of this.effects){c.globalAlpha=e.life;this.text(c,'+'+e.value,e.x||300,(e.y||500)-(1-e.life)*35,17,'#fff1a7','monospace');}c.globalAlpha=1;
   if(game.chase)this.drawChase(c,game);c.restore();
  }
  drawChase(c,game){
   const g=game.chase;c.fillStyle='#06090ec9';c.fillRect(0,0,600,1100);
   const x=58,y=235,w=484,h=660;
   c.fillStyle='#101922';c.fillRect(36,106,528,850);c.strokeStyle='#d4b480';c.lineWidth=3;c.strokeRect(36,106,528,850);
   this.text(c,'GETAWAY',300,150,32,'#ff5c49','Impact, sans-serif');this.text(c,`${g.time.toFixed(1)}s     +${(g.bonus*game.multiplier).toLocaleString()}     ${'●'.repeat(g.health)}${'○'.repeat(3-g.health)}`,300,185,20,'#f5dda9','monospace');
   this.text(c,'BALL LOCKED · SURVIVE FOR 250 POINTS / SEC × GEAR',300,214,10,'#b4c5c9','sans-serif');
   c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.fillStyle='#2a2d32';c.fillRect(x,y,w,h);
   const offset=this.reducedMotion.matches?0:g.distance*3%80;
   for(let i=-1;i<10;i++){c.fillStyle=i%2?'#eadfc0':'#dc4131';c.fillRect(x,y+i*80+offset,9,80);c.fillRect(x+w-9,y+i*80+offset,9,80);}
   c.setLineDash([35,35]);c.lineDashOffset=-offset;for(const lane of [1/3,2/3])this.line(c,[[x+w*lane,y],[x+w*lane,y+h]],'#e5dcb3',3);c.setLineDash([]);
   for(const o of g.traffic){const px=x+o.x*w,py=y+o.y*h;if(o.kind==='barrier'){c.fillStyle='#d59c35';c.fillRect(px-o.w*w/2,py-o.h*h/2,o.w*w,o.h*h);for(let i=0;i<3;i++)this.line(c,[[px-o.w*w/2+i*24,py+o.h*h/2],[px-o.w*w/2+i*24+20,py-o.h*h/2]],'#222830',8);}else this.car(c,px,py,o.w*w,o.h*h,o.kind==='traffic'?'#c5bda3':'#1a3447',o.kind!=='traffic');}
   c.globalAlpha=g.invulnerable?.65:1;this.car(c,x+g.player.x*w,y+g.player.y*h,w*.115,h*.115);c.globalAlpha=1;c.restore();
   this.text(c,'← LEFT FLIPPER          RIGHT FLIPPER →',300,930,14,'#f7ddb2','sans-serif');
   if(g.phase!=='running'){c.fillStyle='#08111eea';c.fillRect(66,424,468,215);this.text(c,g.phase==='intro'?'FLIPPERS STEER':g.reason,300,481,33,'#ff6348','Impact, sans-serif');this.text(c,g.phase==='intro'?'AVOID TRAFFIC. WATCH YOUR BACK.':`+${(g.bonus*game.multiplier).toLocaleString()} BONUS`,300,528,19,'#ffe5b0','sans-serif');this.text(c,g.phase==='intro'?'Three hits and the chase is over.':'Returning to the table…',300,570,16,'#bcced2','sans-serif');}
  }
 }
 class Show {
  constructor(el){this.el=el;this.el.setAttribute('role','status');this.note='';this.until=0;}
  reset(){this.note='';this.until=0;}
  announce(title,copy,kind,time,duration=3){this.note=title;this.until=time+duration;}
  update(g,paused){this.el.textContent=paused?'PAUSED':g.chase?`CHASE · ${g.chase.time.toFixed(1)}s · ${g.chase.health} HITS LEFT`:g.time<this.until?this.note:`GEAR ${g.gear} · ${g.multiplier}× · ${g.pocketArmed?'HIDEOUT LIT':'LIGHT THE SIGNALS'}`;}
 }
 root.GetawayRenderer=Renderer;root.GetawayShow=Show;
})(globalThis);
