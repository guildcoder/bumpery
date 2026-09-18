(function(root){
 'use strict';
 const P=root.Deadwood;
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
   c.fillStyle='#291b14';c.fillRect(0,0,600,1100);for(let x=20;x<590;x+=47){c.fillStyle=x%3?'#37251a':'#422b1d';c.fillRect(x,15,43,1068);this.line(c,[[x+9,25],[x+9,1070]],'#d49e5820',2);}
   c.strokeStyle='#b98c52';c.lineWidth=7;c.strokeRect(25,20,550,1060);
   c.fillStyle='#bc9560';c.beginPath();c.moveTo(180,230);c.lineTo(420,230);c.lineTo(498,925);c.lineTo(95,925);c.closePath();c.fill();
   this.line(c,[[292,260],[330,400],[236,560],[330,800]],'#765032',2);
   for(let i=0;i<18;i++){const x=118+(i*73)%360,y=320+(i*131)%560;this.line(c,[[x,y],[x+8,y+2]],'#7f613c',2);}
   this.text(c,'D E A D W O O D',295,656,36,'#382417','Georgia');this.text(c,'THE LAST LIGHT IN THE WEST',295,681,10,'#633d25','sans-serif');
   this.circle(c,295,760,61,'#815c30','#d9b87d',3);for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;this.line(c,[[295+Math.cos(a)*47,760+Math.sin(a)*47],[295+Math.cos(a+Math.PI*4/5)*47,760+Math.sin(a+Math.PI*4/5)*47]],'#dec996',6);}this.text(c,'BOUNTY',295,846,17,'#573a24','Georgia');
   P.slings.forEach(t=>{c.beginPath();t.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle='#742f24';c.fill();c.strokeStyle='#ebc78a';c.lineWidth=3;c.stroke();});
   P.rails.forEach(r=>{const points=[[r.a.x,r.a.y],[r.b.x,r.b.y]];this.line(c,points,'#160f0d',15);this.line(c,points,'#ad8754',8);this.line(c,points,'#f0d4a4',2);});
   c.fillStyle='#201710';c.fillRect(536,355,29,685);for(let y=395;y<927;y+=39)this.line(c,[[543,y+8],[550,y],[557,y+8]],'#b7a06c',2);
   this.text(c,'SALOON',141,313,12,'#f2d49b','Georgia');this.text(c,'WANTED',85,646,9,'#efb064','sans-serif');this.text(c,'BOUNTY',481,669,9,'#efb064','sans-serif');this.text(c,'B U M P E R Y',297,1060,12,'#dfc4a3','sans-serif');
  }
  effect(e){if(e.type==='score')this.effects.push({...e,life:1});}
  draw(game,dt,paused){
   const c=this.ctx;c.save();c.scale(this.canvas.width/600,this.canvas.height/1100);c.drawImage(this.cache,0,0,600,1100);
   c.fillStyle='#060d13';c.fillRect(63,36,474,156);c.strokeStyle='#657478';c.lineWidth=3;c.strokeRect(63,36,474,156);
   this.text(c,game.state==='chase'?'SHOWDOWN':'DEADWOOD',300,75,28,'#f24f3c','Impact, sans-serif');
   this.text(c,game.state==='chase'?'BALL LOCKED · WAIT FOR FIRE':game.pocketArmed?'SALOON LIT · SHOOT THE POCKET':'LIGHT 3 LANTERNS TO OPEN SALOON',300,108,12,'#f5d89c','sans-serif');
   this.text(c,`RANK ${game.gear}     ${game.multiplier}× SCORE`,300,145,17,'#e8e3ce','monospace');
   P.bumpers.forEach((b,i)=>{this.circle(c,b.x,b.y,b.r+7,'#1c2025','#b9b6a5',3);this.circle(c,b.x,b.y,b.r,['#b12a23','#cf9527','#278677'][i],'#f8d49c',2);this.circle(c,b.x-6,b.y-7,b.r*.44,['#ff7250','#ffe079','#80dfb4'][i]);});
   P.targets.forEach((p,i)=>{this.circle(c,p.x,p.y,p.r,game.targetLights[i]?'#ffe59a':'#713021','#d49b68',2);this.text(c,String(i+1),p.x,p.y+4,11,'#f4e5c4','sans-serif');});
   P.beacons.forEach((p,i)=>this.circle(c,p.x,p.y,p.r,game.lit[i]?'#b6f8ac':'#4e5e39','#e5c087',3));
   this.circle(c,P.pocket.x,P.pocket.y,31,'#020408',game.pocketArmed?'#70e4b0':'#777b77',5);this.text(c,game.pocketArmed?'LOCK':'CLOSED',141,409,11,game.pocketArmed?'#98f3c4':'#aeb6b4','sans-serif');
   game.flippers.forEach(f=>{const tip=[f.x+Math.cos(f.angle)*91,f.y+Math.sin(f.angle)*91];this.line(c,[[f.x,f.y],tip],'#0c0b10',29);this.line(c,[[f.x,f.y],tip],game.tilted?'#625d55':'#e13f32',24);this.line(c,[[f.x,f.y-3],[tip[0],tip[1]-3]],'#f1c7a1',4);this.circle(c,f.x,f.y,8,'#d6c3a6');});
   for(let i=0;i<10;i++)this.line(c,[[539,1004+i*(4-game.charge*1.5)],[561,1006+i*(4-game.charge*1.5)]],'#b6b4a5',2);
   for(const b of game.balls){const grad=c.createRadialGradient(b.x-3,b.y-4,1,b.x,b.y,b.r);grad.addColorStop(0,'#fff');grad.addColorStop(.4,'#e2e6e1');grad.addColorStop(1,'#424a51');this.circle(c,b.x,b.y,b.r,grad,'#fff9',1);}
   this.text(c,`RANK ${game.gear}`,295,850,15,'#f7d098','monospace');
   if(!paused)for(const e of this.effects)e.life-=dt;this.effects=this.effects.filter(e=>e.life>0);for(const e of this.effects){c.globalAlpha=e.life;this.text(c,'+'+e.value,e.x||300,(e.y||500)-(1-e.life)*35,17,'#fff1a7','monospace');}c.globalAlpha=1;
   if(game.chase)this.drawChase(c,game);c.restore();
  }
  drawChase(c,game){
   const g=game.chase;c.fillStyle='#130e0af0';c.fillRect(0,0,600,1100);
   const sky=c.createLinearGradient(0,100,0,650);sky.addColorStop(0,'#171c29');sky.addColorStop(1,'#b06140');c.fillStyle=sky;c.fillRect(24,50,552,980);this.circle(c,420,267,57,'#c3a276');
   c.fillStyle='#8b6040';c.beginPath();c.moveTo(235,415);c.lineTo(365,415);c.lineTo(576,1030);c.lineTo(24,1030);c.closePath();c.fill();
   // Perspective facades converge on the lone opponent at the vanishing point.
   for(const side of [-1,1])for(let i=0;i<4;i++){const depth=i/4,x=300+side*(76+depth*216),y=388+depth*155,w=34+depth*105,h=62+depth*248;c.fillStyle=i%2?'#4d3024':'#382824';c.fillRect(side<0?x-w:x,y-h,w,h+80);c.strokeStyle='#b38452';c.lineWidth=3;c.strokeRect(side<0?x-w:x,y-h,w,h+80);c.fillStyle='#cf9d53';c.fillRect((side<0?x-w:x)+w*.2,y-h*.65,w*.23,h*.28);this.line(c,[[side<0?x-w:x,y],[side<0?x:x+w,y]],'#2b1b16',9);}
   this.text(c,'SALOON',109,418,17,'#dec390','Georgia');this.text(c,'DEADWOOD',300,114,42,'#edd3a2','Georgia');this.text(c,'ROUND '+g.round+' · '+g.wins+' WON',300,151,16,'#e0c499','monospace');
   c.save();c.translate(300,g.phase==='victory'?560:545);if(g.phase==='victory')c.rotate(.8);this.circle(c,0,-45,16,'#c5a17b');this.line(c,[[-30,-59],[30,-59]],'#201b1a',9);c.fillStyle='#201b1a';c.fillRect(-17,-85,34,25);c.fillStyle='#333035';c.fillRect(-22,-24,44,67);this.line(c,[[-12,38],[-21,109]],'#18191e',15);this.line(c,[[12,38],[25,109]],'#18191e',15);this.line(c,[[-24,-14],[-34,34]],'#333035',12);this.line(c,[[24,-14],[34,34]],'#333035',12);c.fillStyle='#c6a376';c.fillRect(21,30,28,8);c.restore();
   // Foreground gloved hands and polished revolver silhouettes establish depth.
   for(const side of [-1,1]){c.save();c.translate(300+side*181,957);c.rotate(side*-.25);c.fillStyle='#422f26';c.fillRect(-27,-6,54,107);c.fillStyle='#c1b39b';c.fillRect(-9,-95,18,113);c.fillStyle='#666268';c.fillRect(-18,-28,36,40);c.restore();}
   let cue=g.phase==='intro'?String(Math.ceil(g.countdown)):g.phase==='wait'?'STEADY…':g.phase==='fire'?'FIRE!':g.phase==='victory'?'QUICKER THAN DUST':g.reason;
   c.fillStyle='#211710eb';c.fillRect(45,711,510,147);this.text(c,cue,300,767,g.phase==='intro'?56:28,g.phase==='fire'?'#ffdd87':'#eed6b0','Georgia');
   const detail=g.phase==='victory'?Math.round(g.lastReaction*1000)+' ms · NEXT OPPONENT':g.phase==='crashed'?'+'+(g.bonus*game.multiplier).toLocaleString()+' BONUS · BACK TO THE TABLE':g.phase==='fire'?'TAP EITHER FLIPPER NOW':'RELEASE BOTH FLIPPERS. WAIT FOR FIRE.';this.text(c,detail,300,809,12,'#dbc9b0','sans-serif');
   this.text(c,'A FAST DRAW EARNS ANOTHER SHOWDOWN',300,1056,11,'#d8b888','sans-serif');
  }
 }
 class Show {
  constructor(el){this.el=el;this.el.setAttribute('role','status');this.note='';this.until=0;}
  reset(){this.note='';this.until=0;}
  announce(title,copy,kind,time,duration=3){this.note=title;this.until=time+duration;}
  update(g,paused){this.el.textContent=paused?'PAUSED':g.chase?`ROUND ${g.chase.round} · ${g.chase.phase==='fire'?'FIRE!':g.chase.phase==='intro'?Math.ceil(g.chase.countdown):g.chase.phase==='victory'?'WON':'WAIT'}`:g.time<this.until?this.note:`RANK ${g.gear} · ${g.multiplier}× · ${g.pocketArmed?'SALOON LIT':'LIGHT THE SIGNALS'}`;}
 }
 root.DeadwoodRenderer=Renderer;root.DeadwoodShow=Show;
})(globalThis);
