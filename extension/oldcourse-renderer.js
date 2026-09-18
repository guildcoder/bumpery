(function(root){
'use strict';const P=root.OldCourse;
class Renderer extends root.ParlorRenderer{
 paintTable(c){}
 effect(){}
 draw(g,dt,paused){const c=this.ctx;c.save();c.scale(this.canvas.width/600,this.canvas.height/1100);
 c.fillStyle='#c9c3a1';c.fillRect(0,0,600,1100);c.fillStyle='#586954';c.fillRect(22,75,556,963);
 const h=g.hole;const path=h.path;this.line(c,path,'#768965',h.width*2+18);this.line(c,path,'#a0ac7b',h.width*2);
 // Fine mowing strokes and gorse flecks evoke a hand-engraved course plan.
 c.save();c.beginPath();c.rect(25,79,550,956);c.clip();for(let i=0;i<150;i++){const x=35+(i*139)%527,y=85+(i*173)%943;this.line(c,[[x,y],[x+4,y-6]],'#354e393a',1);}
 for(const [x,y,rx,ry]of h.water){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle='#597e83';c.fill();c.strokeStyle='#bdc9aa';c.lineWidth=5;c.stroke();for(let k=-2;k<=2;k++)this.line(c,[[x-rx*.55,y+k*14],[x+rx*.55,y+k*14]],'#a6bab488',1);}
 for(const [x,y,r]of h.sand){this.circle(c,x,y,r+4,'#3e4834');this.circle(c,x,y,r,'#d6c49a','#f1dfb3',2);for(let i=0;i<10;i++){const a=i*2.4;this.circle(c,x+Math.cos(a)*r*.6,y+Math.sin(a)*r*.6,1,'#9c8053');}}
 this.circle(c,g.cup.x,g.cup.y,69,'#b4bc8a','#d2d5a1',2);this.circle(c,g.cup.x,g.cup.y,12,'#233c2d');this.line(c,[[g.cup.x,g.cup.y],[g.cup.x,g.cup.y-65]],'#e7dec1',3);c.fillStyle='#842f29';c.beginPath();c.moveTo(g.cup.x,g.cup.y-65);c.lineTo(g.cup.x+36,g.cup.y-52);c.lineTo(g.cup.x,g.cup.y-41);c.fill();this.text(c,String(g.holeIndex+1),g.cup.x+12,g.cup.y-50,10,'#f9edd1','Georgia');
 const tee=h.path[0];this.circle(c,tee[0]-17,tee[1],5,'#f5e7c6');this.circle(c,tee[0]+17,tee[1],5,'#f5e7c6');
 if(g.state==='aim'){
  const length=65+g.charge*155,dx=Math.cos(g.angle),dy=Math.sin(g.angle);c.setLineDash([4,9]);this.line(c,[[g.ball.x+dx*14,g.ball.y+dy*14],[g.ball.x+dx*length,g.ball.y+dy*length]],'#f5edc9',2);c.setLineDash([]);
  this.circle(c,g.ball.x,g.ball.y,21,null,'#e8dfb988',1);
 }
 // A hickory flipper follows the lie, cocking back with charge and striking on release.
 if(g.state==='aim'||g.swing>0){c.save();c.translate(g.ball.x,g.ball.y);c.rotate(g.angle);c.translate(-20,0);c.rotate(-.6-g.charge*.8+(g.swing>0?.9:0));this.line(c,[[-27,32],[8,5]],'#433123',17);this.line(c,[[-27,32],[8,5]],'#c69e61',12);this.line(c,[[-23,29],[5,8]],'#ead2a0',2);this.circle(c,-27,32,5,'#84714f');c.restore();}
 if(g.state!=='hole'&&g.state!=='over'){this.circle(c,g.ball.x+2,g.ball.y+3,7,'#26362566');this.circle(c,g.ball.x,g.ball.y,7,'#f4efda','#bdbca4',1);this.circle(c,g.ball.x-2,g.ball.y-2,2,'#fff');}c.restore();
 this.text(c,'THE OLD COURSE',300,38,26,'#343b2e','Georgia');this.text(c,`HOLE ${g.holeIndex+1} · ${h.name.toUpperCase()} · PAR ${h.par}`,300,61,11,'#46513d','sans-serif');
 this.text(c,`${P.clubs[g.club].name.toUpperCase()} · ${g.lie.toUpperCase()} · ${Math.round(Math.hypot(g.ball.x-g.cup.x,g.ball.y-g.cup.y)/3)} YDS`,300,1060,12,'#3c4533','sans-serif');
 if(g.state==='aim'){c.fillStyle='#576149';c.fillRect(165,1073,270,9);c.fillStyle='#e9dfb4';c.fillRect(165,1073,270*g.charge,9);}
 const wind=h.wind;this.text(c,(wind<0?'← ':'→ ')+Math.abs(wind)+' WIND',480,99,10,'#ece7c9','sans-serif');
 if(g.state==='hole'||g.state==='over')this.card(c,g);c.restore();
 }
 card(c,g){c.fillStyle='#192d24bb';c.fillRect(0,80,600,960);c.fillStyle='#e8dfbe';c.fillRect(70,245,460,595);c.strokeStyle='#6d7658';c.lineWidth=2;c.strokeRect(83,258,434,569);
 const delta=g.strokes-g.hole.par;this.text(c,g.state==='over'?'A PROPER ROUND':g.strokes>=10?'HOLE PICKED UP':delta===0?'PAR':delta===-1?'BIRDIE':delta<=-2?'A FINE HOLE':delta===1?'BOGEY':'HOLED OUT',300,303,29,'#3c4937','Georgia');
 this.text(c,'THE OLD COURSE · SCORECARD',300,339,12,'#6d7054','sans-serif');
 for(let i=0;i<9;i++){const y=382+i*37;this.text(c,String(i+1),116,y,17,'#394b36','Georgia');this.text(c,P.holes[i].name,148,y,14,'#394b36','Georgia','left');this.text(c,'PAR '+P.holes[i].par,374,y,10,'#6a7054','sans-serif');this.text(c,g.card[i]===undefined?'—':String(g.card[i]),472,y,18,'#394b36','Georgia');this.line(c,[[107,y+11],[490,y+11]],'#aba88a',1);}
 const par=P.holes.slice(0,g.card.length).reduce((a,h)=>a+h.par,0),diff=g.total-par;this.text(c,`${g.total} STROKES · ${diff===0?'LEVEL':(diff>0?'+':'')+diff}`,300,749,22,'#384d37','Georgia');this.text(c,g.state==='over'?'THE CLUBHOUSE AWAITS':g.holeIndex===8?'PRESS FINISH FOR YOUR ROUND':'PRESS NEXT HOLE TO CONTINUE',300,792,11,'#65704f','sans-serif');
 }
}
class Show{constructor(el){this.el=el;}reset(){}announce(){}update(g,paused){const text=paused?'PAUSED':g.state==='rolling'?'BALL IN MOTION':g.state==='hole'?'MARK YOUR CARD':`${P.clubs[g.club].name.toUpperCase()} · ${g.lie.toUpperCase()} · STROKE ${g.strokes+1}`;if(this.el.textContent!==text)this.el.textContent=text;}}
root.OldCourseRenderer=Renderer;root.OldCourseShow=Show;
})(globalThis);
