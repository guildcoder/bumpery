(function(root){
'use strict';
class Art extends root.ExpansionRenderer{
 paintTable(c){const cfg=root.Eschaton.cfg;this.cfg=cfg;this.id='eschaton';c.fillStyle='#080817';c.fillRect(0,0,600,1100);this.shell(c,0);const bg=c.createLinearGradient(0,0,600,1100);bg.addColorStop(0,'#27113b');bg.addColorStop(.5,'#100d26');bg.addColorStop(1,'#09212b');c.fillStyle=bg;c.fill();this.shell(c,7);c.strokeStyle='#937db2';c.lineWidth=2;c.stroke();
 for(let i=0;i<260;i++){const x=50+i*173%472,y=58+i*139%968;this.circle(c,x,y,i%11?1:2,i%2?'#d7b7ff77':'#92e6ed88');}
 for(let i=0;i<12;i++){c.beginPath();c.ellipse(295,595,50+i*12,22+i*6,-.4,0,Math.PI*2);c.strokeStyle=i%2?'#a166b72d':'#90e9ed25';c.lineWidth=1;c.stroke();}
 const glow=c.createRadialGradient(295,590,10,295,590,128);glow.addColorStop(0,'#d2a1ff');glow.addColorStop(.25,'#663b9b');glow.addColorStop(.6,'#202044');glow.addColorStop(1,'#11122500');this.circle(c,295,590,128,glow);this.circle(c,295,590,47,'#070713','#af70cf',2);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;c.beginPath();c.moveTo(295+Math.cos(a)*60,590+Math.sin(a)*60);c.lineTo(295+Math.cos(a+.15)*100,590+Math.sin(a+.15)*100);c.lineTo(295+Math.cos(a)*130,590+Math.sin(a)*130);c.strokeStyle='#bf75ef88';c.lineWidth=3;c.stroke();}
 for(const x of [90,485])for(let i=0;i<10;i++){const y=560+i*15;this.line(c,[[x,y],[x+(x<300?28:-28),y],[x+(x<300?42:-42),y+14]],'#77a5aa44',1);}
 this.text(c,'E S C H A T O N',295,803,29,'#e5c6ff','Georgia');this.text(c,'THE DESTRUCTION OF ALL',295,829,10,'#8ee9dc','sans-serif');this.text(c,'THREE ROUTES · ONE HUNGRY CORE',295,858,8,'#cdbbe8','sans-serif');this.text(c,'B U M P E R Y',295,1050,10,'#88b9c3','sans-serif');
 root.Expansion.rails.forEach(r=>{this.line(c,[[r.a.x,r.a.y],[r.b.x,r.b.y]],'#5b537477',6);});
 root.Eschaton.routes.forEach((r,i)=>{const [x,y]=r.points[0];this.circle(c,x,y,28,'#091220',r.color,2);this.text(c,String(i+1),x,y+5,14,r.color,'monospace');this.text(c,r.name,x,y+40,8,r.color,'sans-serif');});
 this.text(c,'FEED THE CORE',296,182,10,'#ffcf91','sans-serif');
 }
 draw(g,dt,paused){super.draw(g,dt,paused);const c=this.ctx;c.save();c.scale(this.canvas.width/600,this.canvas.height/1100);root.Eschaton.routes.forEach((r,i)=>{c.beginPath();for(let n=0;n<=60;n++){const [x,y]=root.Eschaton.sample(i,n/60);n?c.lineTo(x,y):c.moveTo(x,y);}c.strokeStyle=r.color+'80';c.lineWidth=6;c.stroke();});for(const b of g.balls)if(b.route)this.circle(c,b.x,b.y,11,'#fff',root.Eschaton.routes[b.route.index].color,3);c.restore();}
}
class Show{constructor(el){this.el=el;}reset(){}announce(){}update(g,paused){const text=paused?'PAUSED':g.objective;if(this.el.textContent!==text)this.el.textContent=text;}}
root.EschatonArt=Art;root.EschatonShow=Show;
})(globalThis);
