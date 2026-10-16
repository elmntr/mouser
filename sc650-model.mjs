import * as THREE from './vendor/three/build/three.module.js';

const widths=[[-.058,.001],[-.055,.013],[-.048,.023],[-.035,.028],[-.015,.029],[0,.0275],[.015,.029],[.035,.030],[.046,.027],[.052,.018],[.054,.013]];
const heights=[[-.058,.008],[-.05,.024],[-.035,.034],[-.02,.037],[0,.034],[.025,.028],[.045,.022],[.054,.018]];
function interpolate(table,z){
 for(let i=1;i<table.length;i++)if(z<=table[i][0]){
  const a=table[i-1],b=table[i],prev=table[Math.max(0,i-2)],next=table[Math.min(table.length-1,i+1)],span=b[0]-a[0],t=THREE.MathUtils.clamp((z-a[0])/span,0,1),slope=(b[1]-a[1])/span;
  const m0=i===1?slope:(b[1]-prev[1])/(b[0]-prev[0]),m1=i===table.length-1?slope:(next[1]-a[1])/(next[0]-a[0]);
  return (2*t**3-3*t**2+1)*a[1]+(t**3-2*t**2+t)*(m0*slope>0?m0:0)*span+(-2*t**3+3*t**2)*b[1]+(t**3-t**2)*(m1*slope>0?m1:0)*span;
 }return table.at(-1)[1];
}
export function sc650Width(z){return interpolate(widths,z);}
export function sc650Surface(x,z){return interpolate(heights,z)-.006*Math.min(1,(x/sc650Width(z))**2);}

export function sc650SideX(y,z){
 const width=sc650Width(z),top=sc650Surface(-width,z),t=THREE.MathUtils.clamp((top-y)/(top-.0025),0,1),levels=[0,.2,.5,.8,1];
 for(let i=1;i<levels.length;i++)if(t<=levels[i]){const a=levels[i-1],b=levels[i],f=(t-a)/(b-a);return -width*THREE.MathUtils.lerp(1-.12*a*a,1-.12*b*b,f);}
 return -width*.88;
}

// Top, underside and all four perimeter walls are one closed indexed solid.
export function shellPanel({z0,z1,left,right,offset=0,thickness=.0015,body=false,rows=72,columns=28}){
 const vertices=[],indices=[],stride=columns+1,count=(rows+1)*stride;
 for(const bottom of [false,true])for(let row=0;row<=rows;row++){
  const z=THREE.MathUtils.lerp(z0,z1,row/rows),a=left(z),b=right(z);
  for(let col=0;col<=columns;col++){const x=THREE.MathUtils.lerp(a,b,col/columns),y=sc650Surface(x,z)+offset;vertices.push(bottom&&body?x*.88:x,bottom?(body?.0025:y-thickness):y,z);}
 }
 const quad=(a,b,c,d)=>indices.push(a,b,d,b,c,d);
 for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){const a=row*stride+col,b=a+1,c=b+stride,d=a+stride;quad(a,d,c,b);quad(a+count,b+count,c+count,d+count);}
 const perimeter=[];
 for(let col=0;col<=columns;col++)perimeter.push(col);
 for(let row=1;row<=rows;row++)perimeter.push(row*stride+columns);
 for(let col=columns-1;col>=0;col--)perimeter.push(rows*stride+col);
 for(let row=rows-1;row>0;row--)perimeter.push(row*stride);
 let ring=perimeter;
 if(body)for(const t of [.2,.5,.8]){
  const next=[];for(const index of perimeter){next.push(vertices.length/3);const x=vertices[index*3],y=vertices[index*3+1],z=vertices[index*3+2];vertices.push(x*(1-.12*t*t),THREE.MathUtils.lerp(y,.0025,t),z);}
  for(let i=0;i<ring.length;i++){const j=(i+1)%ring.length;quad(ring[i],ring[j],next[j],next[i]);}ring=next;
 }
 for(let i=0;i<ring.length;i++){const j=(i+1)%ring.length;quad(ring[i],ring[j],perimeter[j]+count,perimeter[i]+count);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
function roundedKey(width,height,length){
 const r=Math.min(width,length)*.22,s=new THREE.Shape(),x=-width/2,z=-length/2;
 s.moveTo(x+r,z);s.lineTo(x+width-r,z);s.quadraticCurveTo(x+width,z,x+width,z+r);s.lineTo(x+width,z+length-r);s.quadraticCurveTo(x+width,z+length,x+width-r,z+length);s.lineTo(x+r,z+length);s.quadraticCurveTo(x,z+length,x,z+length-r);s.lineTo(x,z+r);s.quadraticCurveTo(x,z,x+r,z);
 const g=new THREE.ExtrudeGeometry(s,{depth:height,bevelEnabled:true,bevelSize:.00022,bevelThickness:.0002,bevelSegments:3,steps:1,curveSegments:6});g.rotateX(-Math.PI/2);g.translate(0,-height/2,0);return g;
}
export function buildSc650(source,register,{graphics=true}={}){
 const result=new THREE.Group();result.name='SC650 fitted shell';
 const material=(color,roughness=.56)=>new THREE.MeshStandardMaterial({color,roughness,metalness:.06});
 const add=(geometry,mat,name,id)=>{const mesh=new THREE.Mesh(geometry,mat);mesh.name=name;result.add(mesh);if(id)register(mesh,id);return mesh;};
 add(shellPanel({z0:-.058,z1:.054,left:z=>-sc650Width(z),right:sc650Width,body:true}),material('#08090b'),'Closed chassis');
 add(shellPanel({z0:-.0575,z1:-.007,left:z=>-sc650Width(z)+.00045,right:z=>sc650Width(z)-.00045,offset:.00065,thickness:.001} ),material('#0d0e10'),'Closed palm shell');
 for(const [id,sign] of [['left',-1],['right',1]]){
  const a=z=>.0025,b=z=>Math.max(.003,sc650Width(z)-.00055);
  add(shellPanel({z0:id==='left'?.0105:-.0055,z1:.0524,left:sign<0?z=>-b(z):a,right:sign<0?z=>-a(z):b,offset:.00065,thickness:.0012}),material('#111214'),'Closed '+id+' click plate',id);
 }
 // Keep the supplied model's wheel as the donor component; fit it to the new slot.
 let wheel=source?.getObjectByName('Cylinder');
 if(wheel){
  source.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(source.getObjectByName('Cylinder')),size=bounds.getSize(new THREE.Vector3()),origin=bounds.getCenter(new THREE.Vector3());
  const pieces=[];source.getObjectByName('Cylinder').traverse(node=>{if(node.isMesh)pieces.push(node);});
  for(const node of pieces){const geometry=node.geometry.clone().applyMatrix4(node.matrixWorld);geometry.translate(-origin.x,-origin.y,-origin.z);geometry.scale(.005/size.x,.014/size.y,.014/size.z);geometry.translate(0,.021,.035);add(geometry,material('#111419',.85),'Fitted donor wheel','middle');}
 }else{
  const g=new THREE.CylinderGeometry(.007,.007,.005,40);g.rotateZ(Math.PI/2);g.translate(0,.021,.035);add(g,material('#111419',.85),'Wheel','middle');
 }
 for(let i=0;i<24;i++){const angle=i/24*Math.PI*2,mesh=add(new THREE.BoxGeometry(.0052,.00065,.001),material('#353b40',.8),'Wheel tread','middle');mesh.position.set(0,.021+Math.cos(angle)*.007,.035+Math.sin(angle)*.007);mesh.rotation.x=angle;}
 result.userData.buttonPoints={};
 for(const [id,z,length] of [['front',.017,.014],['rear',-.002,.017]]){
  // Follow the actual curved flank; only 0.3 mm projects beyond the shell.
  const geometry=roundedKey(.0028,.0009,length);geometry.rotateZ(Math.PI/2);const p=geometry.attributes.position;
  for(let i=0;i<p.count;i++){const pz=z+p.getZ(i),py=sc650Surface(-sc650Width(pz),pz)-.0024+p.getY(i);p.setXYZ(i,sc650SideX(py,pz)+.00035+p.getX(i),py,pz);}
  geometry.computeVertexNormals();add(geometry,material('#151618'),'Flush '+id+' thumb button',id);
  const y=sc650Surface(-sc650Width(z),z)-.0024;result.userData.buttonPoints[id]=[sc650SideX(y,z)-.00035,y,z];
 }
 const top=(x,z)=>sc650Surface(x,z)+.0009;
 function surfacePlane(x,z,width,length,mat,offset=.001){
  const geometry=new THREE.PlaneGeometry(width,length,12,12),positions=geometry.attributes.position,index=geometry.index;
  for(let i=0;i<positions.count;i++){const px=x+positions.getX(i),pz=z+positions.getY(i);positions.setXYZ(i,px,sc650Surface(px,pz)+offset,pz);}
  for(let i=0;i<index.count;i+=3){const a=index.getX(i+1);index.setX(i+1,index.getX(i+2));index.setX(i+2,a);}geometry.computeVertexNormals();return add(geometry,mat,'Surface detail');
 }
 // The short left click ends above the inset display; the right plate is longer.
 add(shellPanel({z0:-.0058,z1:.0093,left:()=>-.026,right:()=>-.0025,offset:.00055,thickness:.001,rows:24,columns:12}),material('#060709',.28),'Display bezel');
 if(graphics&&typeof document!=='undefined'){
  const screen=document.createElement('canvas');screen.width=768;screen.height=384;const ctx=screen.getContext('2d'),texture=new THREE.CanvasTexture(screen);texture.colorSpace=THREE.SRGBColorSpace;
  const display=surfacePlane(-.0142,.0018,.021,.0124,new THREE.MeshBasicMaterial({map:texture}),.00082);display.name='Draft settings display';
  function screenPreview(){
   const stage=Number(document.getElementById('dpi-active')?.value??2),dpi=document.querySelectorAll('.dpi-value')[stage-1]?.value??1600,rate=document.getElementById('polling-rate')?.value??500;
   ctx.fillStyle='#02070b';ctx.fillRect(0,0,768,384);ctx.strokeStyle='#173648';ctx.lineWidth=4;ctx.strokeRect(8,8,752,368);ctx.fillStyle='#74a6c1';ctx.font='24px monospace';ctx.fillText('SC650',36,52);ctx.textAlign='right';ctx.fillText('DRAFT',726,52);ctx.textAlign='left';ctx.fillStyle='#d2efff';ctx.font='bold 60px monospace';ctx.fillText('DPI '+dpi,36,153);ctx.fillStyle='#8fcbea';ctx.font='35px monospace';ctx.fillText(rate+' Hz',36,225);ctx.fillStyle='#b9e4fa';ctx.font='bold 63px monospace';ctx.fillText('2.4G',36,321);ctx.fillStyle='#506b7b';ctx.font='21px monospace';ctx.fillText('LOCAL PREVIEW',330,317);texture.needsUpdate=true;
  }
  document.getElementById('dpi-form')?.addEventListener('input',screenPreview);document.getElementById('polling-rate')?.addEventListener('change',screenPreview);screenPreview();
  for(const [x,z,main,small] of [[-.014,.034,'SC650','DRAW MATTER'],[.014,.035,'CODE','START PLANNING']]){
   const canvas=document.createElement('canvas');canvas.width=512;canvas.height=768;const c=canvas.getContext('2d');c.translate(256,384);c.rotate(-Math.PI/2);c.fillStyle='#b1b5b8';c.font='bold 85px monospace';c.textAlign='center';c.fillText(main,0,5);c.font='25px monospace';c.fillText(small,0,53);const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;surfacePlane(x,z,.014,.024,new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false}),.00094);
  }
 }
 // Recessed front USB-C opening, including the black connector tongue.
 const port=add(roundedKey(.010,.00055,.0042),new THREE.MeshStandardMaterial({color:'#292c30',roughness:.4,metalness:.5}),'USB-C bezel');port.rotation.x=Math.PI/2;port.position.set(0,.009,.05425);
 const opening=add(roundedKey(.0082,.0002,.0028),new THREE.MeshBasicMaterial({color:'#000000'}),'USB-C opening');opening.rotation.x=Math.PI/2;opening.position.set(0,.009,.05465);
 const tongue=add(new THREE.BoxGeometry(.005,.0005,.0003),material('#111214'),'USB-C tongue');tongue.position.set(0,.0088,.0549);

 add(shellPanel({z0:-.022,z1:.020,left:()=>-.00155,right:()=>.00155,offset:.00012,thickness:.0007,rows:44,columns:4}),material('#101419'),'Fitted center channel');
 const rgbMaterials=[];
 for(let i=0;i<30;i++){
  const z=-.020+i*.0007,mat=new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(.83-i*.016,1,.55)});rgbMaterials.push(mat);
  const curve=new THREE.LineCurve3(new THREE.Vector3(0,top(0,z),z),new THREE.Vector3(0,top(0,z+.00072),z+.00072));add(new THREE.TubeGeometry(curve,1,.00030,8,false),mat,'RGB strip');
 }
 for(let i=0;i<3;i++){const z=.006+i*.004,mesh=add(new THREE.SphereGeometry(.00036,10,8),new THREE.MeshBasicMaterial({color:i===2?'#efae43':'#c7dfd2'}),'DPI indicator');mesh.position.set(0,top(0,z),z);mesh.scale.y=.45;}
 if(graphics){
  const ink=new THREE.LineBasicMaterial({color:'#9fa8ae',transparent:true,opacity:.6});
  function line(points){return result.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(([x,z])=>new THREE.Vector3(x,top(x,z),z))),ink));}
  for(let i=0;i<20;i++){const x=.009+i*.00065,z=.011;line([[x,z+Math.abs(Math.sin(i*1.8))*.007],[x,z+.010-Math.abs(Math.cos(i*.7))*.004]]);}
  for(let i=0;i<6;i++){const z=.012+i*.0012;line([[-.023,z],[-.016,z+.004]]);}
  for(const sign of [-1,1])line([[sign*.021,.042],[sign*.024,.042],[sign*.024,.038]]);
  line([[-.004,-.035],[0,-.033],[.004,-.035],[0,-.041],[-.004,-.035]]);line([[-.002,-.035],[0,-.038],[.002,-.035]]);
 }
 function preview(){const mode=Number(document.getElementById('rgb-mode')?.value??7),color=document.getElementById('rgb-color')?.value??'#68dfdc';rgbMaterials.forEach((m,i)=>{if(mode===0)m.color.set('#101419');else if([1,2,5].includes(mode))m.color.set(color);else m.color.setHSL(.83-i*.016,1,.55);});}
 if(typeof document!=='undefined'){document.getElementById('rgb-form')?.addEventListener('input',preview);preview();}
 return result;
}
