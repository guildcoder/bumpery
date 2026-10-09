import * as T from './vendor/three.module.js';
import './neon-3d.js';
const E=globalThis.Eschaton,point=(x,y,h=0)=>new T.Vector3((x-300)/100,h,(y-550)/100);
class Renderer extends globalThis.NeonRenderer{
 constructor(canvas){super(canvas,E.cfg,globalThis.EschatonArt);this.scene.background.set('#080611');this.scene.fog.color.set('#080611');this.r.toneMappingExposure=1.55;this.routeLamps=[];this.gates=[];
 const metal=new T.MeshStandardMaterial({color:'#b0a8ca',metalness:.92,roughness:.24});
 E.routes.forEach((route,index)=>{const samples=Array.from({length:97},(_,i)=>point(...E.sample(index,i/96))),vertices=[],indices=[],edges=[[],[]];
 for(let i=0;i<samples.length;i++){const p=samples[i],d=samples[Math.min(i+1,96)].clone().sub(samples[Math.max(0,i-1)]);const n=new T.Vector3(-d.z,0,d.x).normalize().multiplyScalar(.185);const a=p.clone().add(n),b=p.clone().sub(n);vertices.push(a.x,a.y+.025,a.z,b.x,b.y+.025,b.z);edges[0].push(a.clone().add(new T.Vector3(0,.13,0)));edges[1].push(b.clone().add(new T.Vector3(0,.13,0)));if(i<96){const k=i*2;indices.push(k,k+2,k+1,k+1,k+2,k+3);}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const deck=new T.Mesh(geo,new T.MeshPhysicalMaterial({color:route.color,metalness:.3,roughness:.25,clearcoat:1,transparent:true,opacity:.55,side:T.DoubleSide,depthWrite:false}));deck.receiveShadow=true;this.scene.add(deck);
 edges.forEach(points=>{const curve=new T.CatmullRomCurve3(points);const rail=new T.Mesh(new T.TubeGeometry(curve,100,.025,6,false),metal);rail.castShadow=true;this.scene.add(rail);const neon=new T.Mesh(new T.TubeGeometry(curve,100,.011,5,false),new T.MeshBasicMaterial({color:route.color}));neon.position.y=.045;this.scene.add(neon);});
 for(let i=12;i<87;i+=15){const p=samples[i];this.rod(new T.Vector3(p.x,.03,p.z),p,.035,metal);this.cylinder(p.x*100+300,p.z*100+550,.09,.03,.02,this.brass);}
 const [x,y]=route.points[0];const lamp=this.cylinder(x,y,.22,.018,.022,new T.MeshStandardMaterial({color:route.color,emissive:route.color,emissiveIntensity:.6,roughness:.22}));this.routeLamps.push(lamp);
 for(const side of [-1,1])this.rod(point(x+side*24,y-9,.02),point(x+side*24,y-9,.42),.035,metal);
 const gate=new T.Group();gate.position.copy(point(x-24,y-9,.34));const bar=new T.Mesh(new T.BoxGeometry(.48,.045,.045),metal);bar.position.x=.24;gate.add(bar);this.scene.add(gate);this.gates.push(gate);
 this.label(route.name,x,y+40,route.color,.9);
 });
 // Original world-eating reactor, with counter-rotating orbital machinery.
 this.core=new T.Group();this.core.position.copy(point(296,205,.75));this.scene.add(this.core);
 const sphere=new T.Mesh(new T.IcosahedronGeometry(.43,2),new T.MeshPhysicalMaterial({color:'#11081c',metalness:.82,roughness:.15,clearcoat:1,emissive:'#44116a',emissiveIntensity:.6}));sphere.castShadow=true;this.core.add(sphere);this.orbits=[];
 for(let i=0;i<3;i++){const ring=new T.Mesh(new T.TorusGeometry(.55+i*.1,.035,8,64),new T.MeshStandardMaterial({color:i%2?'#9af3e0':'#d491fa',metalness:.6,roughness:.2,emissive:i%2?'#287c71':'#6c258c',emissiveIntensity:.9}));ring.rotation.set(Math.PI/3+i*.7,i*.9,0);this.core.add(ring);this.orbits.push(ring);}
 for(let i=0;i<6;i++){const a=i*Math.PI/3;this.rod(point(296+Math.cos(a)*52,205+Math.sin(a)*52,.03),point(296+Math.cos(a)*35,205+Math.sin(a)*35,.65),.045,metal);}
 this.coreLight=new T.PointLight('#b35fff',2,4,2);this.coreLight.position.copy(point(296,205,1.1));this.scene.add(this.coreLight);
 this.planet=new T.Mesh(new T.SphereGeometry(.24,24,16),new T.MeshStandardMaterial({color:'#67aca8',roughness:.7,emissive:'#214842',emissiveIntensity:.3}));this.planet.position.copy(point(380,120,1.1));this.scene.add(this.planet);
 // Stand-up reactor buttons and their individual status lenses.
 this.buttons=globalThis.Expansion.targets.map((p,i)=>{const m=this.box(.24,.23,.08,(p.x-300)/100,.15,(p.y-550)/100,new T.MeshStandardMaterial({color:'#3d244e',emissive:'#a146cb',emissiveIntensity:.12,metalness:.4,roughness:.25}));return m;});
 this.label('REACTOR',104,322,'#ddb2ff',.65);this.label('BUTTONS',465,346,'#ddb2ff',.65);
 this.lastGate=false;
 }
 label(text,x,y,color,width){const c=document.createElement('canvas');c.width=512;c.height=80;const g=c.getContext('2d');g.fillStyle='#080d20';g.fillRect(0,0,512,80);g.strokeStyle=color;g.lineWidth=4;g.strokeRect(2,2,508,76);g.fillStyle=color;g.font='bold 34px sans-serif';g.textAlign='center';g.fillText(text,256,52);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const mesh=new T.Mesh(new T.PlaneGeometry(width,width*80/512),new T.MeshBasicMaterial({map:tex}));mesh.rotation.x=-Math.PI/2;mesh.position.copy(point(x,y,.018));this.scene.add(mesh);}
 beforeRender(g,dt,paused){const t=this.reduced.matches?0:g.time;this.orbits.forEach((r,i)=>{r.rotation.z=t*(i%2?-.35:.27)+i;});this.coreLight.intensity=g.coreReady?5:g.special?3:1.4;const consumed=g.coreUntil>g.time;const amount=consumed?Math.max(.01,(g.coreUntil-g.time)/2.2):1;this.planet.scale.setScalar(amount);this.planet.position.copy(point(296+84*amount,205-85*amount,1.1));this.core.scale.setScalar(consumed?1+.13*Math.sin(g.time*12):1);
 this.routeLamps.forEach((m,i)=>m.material.emissiveIntensity=g.rampLights[i]?2.4:i===2&&!g.thirdGate?.06:.55);
 this.gates.forEach((m,i)=>{m.rotation.z=i===2&&!g.thirdGate?0:1.25;});this.buttons.forEach((m,i)=>m.material.emissiveIntensity=g.targetLights[i]?2.3:.12);
 }
}
globalThis.EschatonRenderer=Renderer;
globalThis.bootEschaton();
