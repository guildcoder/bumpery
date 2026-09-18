(function(root){
'use strict';const STEP=1/240,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const holes=[
 {name:'The First Light',par:4,path:[[300,951],[265,735],[339,460],[300,180]],width:102,sand:[[209,240,36],[403,520,43]],water:[],wind:8},
 {name:'The Burn',par:3,path:[[288,927],[394,670],[353,410],[218,251]],width:94,sand:[[285,245,31]],water:[[173,590,90,63]],wind:-15},
 {name:'Hickory Bend',par:4,path:[[300,950],[164,716],[180,419],[384,176]],width:89,sand:[[371,308,43],[278,690,47]],water:[],wind:20},
 {name:'The Shepherd',par:3,path:[[296,923],[400,713],[365,490],[295,328]],width:90,sand:[[251,431,41],[405,339,35]],water:[],wind:-12},
 {name:'Salt & Gorse',par:5,path:[[354,970],[185,800],[152,549],[356,368],[369,133]],width:85,sand:[[270,511,44],[453,191,29]],water:[[414,697,76,141]],wind:24},
 {name:'The Stone Wall',par:4,path:[[313,948],[410,721],[279,488],[186,183]],width:92,sand:[[173,326,42],[377,452,40]],water:[],wind:-22},
 {name:'Still Water',par:3,path:[[245,932],[167,695],[279,501],[365,332]],width:90,sand:[[414,449,32]],water:[[367,695,91,81]],wind:4},
 {name:'The Long Way',par:5,path:[[321,973],[432,788],[368,555],[153,365],[246,126]],width:85,sand:[[326,290,42],[253,659,42]],water:[[125,777,57,102]],wind:18},
 {name:'Homeward',par:4,path:[[300,950],[216,728],[333,442],[300,167]],width:97,sand:[[203,264,34],[418,304,42]],water:[[451,669,55,98]],wind:-9}
];
const clubs=[{name:'Brassie',speed:960},{name:'Iron',speed:620},{name:'Putter',speed:255}];
function distance(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((p.x-a[0])*dx+(p.y-a[1])*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(p.x-a[0]-t*dx,p.y-a[1]-t*dy);}
class Game{
 constructor(emit=()=>{}){this.onEvent=emit;this.state='ready';this.input={left:false,right:false,launch:false};this.time=0;this.score=0;this.holeIndex=0;this.card=[];this.strokes=0;this.total=0;this.charge=0;this.club=0;this.swing=0;this.ball={x:300,y:951,vx:0,vy:0,r:7};this.angle=-Math.PI/2;this.shotOrigin={x:300,y:951};this.rollingTime=0;}
 get hole(){return holes[this.holeIndex];}get cup(){const p=this.hole.path.at(-1);return{x:p[0],y:p[1]};}get elapsedTime(){return this.time;}
 emit(type,data={}){this.onEvent({type,...data});}
 start(){this.time=0;this.score=0;this.holeIndex=0;this.card=[];this.total=0;this.input={left:false,right:false,launch:false};this.loadHole();}
 loadHole(){const p=this.hole.path[0];this.ball={x:p[0],y:p[1],vx:0,vy:0,r:7};this.strokes=0;this.charge=0;this.club=0;this.state='aim';this.aimAtCup();this.emit('holeStart');}
 aimAtCup(){this.angle=Math.atan2(this.cup.y-this.ball.y,this.cup.x-this.ball.x);}
 get lie(){const p=this.ball,h=this.hole;if(h.water.some(([x,y,rx,ry])=>((p.x-x)/rx)**2+((p.y-y)/ry)**2<1))return 'Water';if(h.sand.some(([x,y,r])=>Math.hypot(p.x-x,p.y-y)<r))return 'Bunker';if(Math.hypot(p.x-this.cup.x,p.y-this.cup.y)<69)return 'Green';if(h.path.slice(1).some((p2,i)=>distance(p,h.path[i],p2)<h.width))return 'Fairway';return 'Rough';}
 nextClub(){if(this.state==='aim'){this.club=(this.club+1)%clubs.length;this.charge=0;this.emit('club');}}
 launch(){
  if(this.state==='hole'){if(this.holeIndex===holes.length-1){this.state='over';this.emit('over');}else{this.holeIndex++;this.loadHole();}return;}
  if(this.state!=='aim')return;const factor=this.lie==='Bunker'?.46:this.lie==='Rough'?.73:1,speed=clubs[this.club].speed*(.06+.94*this.charge)*factor;
  this.shotOrigin={x:this.ball.x,y:this.ball.y};this.ball.vx=Math.cos(this.angle)*speed;this.ball.vy=Math.sin(this.angle)*speed;this.strokes++;this.state='rolling';this.rollingTime=0;this.swing=.25;this.charge=0;this.emit('strike');
 }
 penalty(){this.strokes++;Object.assign(this.ball,this.shotOrigin,{vx:0,vy:0});this.emit('penalty');this.stop();}
 stop(){this.ball.vx=this.ball.vy=0;if(this.strokes>=10){this.finishHole(true);return;}this.state='aim';this.aimAtCup();if(this.lie==='Green')this.club=2;this.emit('rest');}
 finishHole(pickedUp=false){if(this.state==='hole'||this.state==='over')return;this.strokes=Math.min(10,this.strokes);this.total+=this.strokes;this.card.push(this.strokes);this.score+=(18-this.strokes)*25;this.ball.x=this.cup.x;this.ball.y=this.cup.y;this.ball.vx=this.ball.vy=0;this.state='hole';this.charge=0;this.emit('holed',{pickedUp});}
 step(dt=STEP){
  if(this.state==='ready'||this.state==='over')return;if(dt>STEP+1e-9){let left=Math.min(.1,dt);while(left>1e-9){const part=Math.min(left,STEP);this.step(part);left-=part;}return;}
  this.time+=dt;this.swing=Math.max(0,this.swing-dt);
  if(this.state==='aim'){this.angle+=(Number(this.input.right)-Number(this.input.left))*1.1*dt;if(this.input.launch)this.charge=Math.min(1,this.charge+dt*.55);return;}
  if(this.state!=='rolling')return;
  this.rollingTime+=dt;const b=this.ball,lie=this.lie;
  if(lie==='Water'||b.x<26||b.x>574||b.y<78||b.y>1033){this.penalty();return;}
  const drag={Green:.95,Fairway:1.45,Rough:3.2,Bunker:5.4}[lie]||1.45;
  if(this.club!==2&&Math.hypot(b.vx,b.vy)>100)b.vx+=this.hole.wind*dt;
  const friction=Math.exp(-drag*dt);b.vx*=friction;b.vy*=friction;b.x+=b.vx*dt;b.y+=b.vy*dt;
  const speed=Math.hypot(b.vx,b.vy);if(Math.hypot(b.x-this.cup.x,b.y-this.cup.y)<14&&speed<125){this.finishHole();return;}
  if(speed<7||this.rollingTime>15)this.stop();
 }
}
const api={Game,STEP,holes,clubs};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.OldCourse=api;
})(globalThis);
