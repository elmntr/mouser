import assert from 'node:assert/strict';
import * as THREE from '../vendor/three/build/three.module.js';
import {buildSc650,sc650Width,sc650Surface,sc650SideX} from '../sc650-model.mjs';
const targets=new Map();const model=buildSc650(null,(mesh,id)=>{mesh.userData.button=id;targets.set(id,[...(targets.get(id)??[]),mesh]);},{graphics:false});
assert.deepEqual([...targets.keys()].sort(),['front','left','middle','rear','right']);
for(const mesh of model.children.filter(m=>m.name.startsWith('Closed'))){
 const edges=new Map(),index=mesh.geometry.index.array;
 for(let i=0;i<index.length;i+=3)for(const [a,b] of [[index[i],index[i+1]],[index[i+1],index[i+2]],[index[i+2],index[i]]]){const key=a<b?a+':'+b:b+':'+a;edges.set(key,(edges.get(key)??0)+1);}
 assert([...edges.values()].every(n=>n===2),mesh.name+' must be watertight');
 assert([...mesh.geometry.attributes.position.array].every(Number.isFinite));
}
model.updateMatrixWorld(true);
for(const [id,x] of [['left',-.015],['right',.015]]){
 const ray=new THREE.Raycaster(new THREE.Vector3(x,.1,.025),new THREE.Vector3(0,-1,0));const hit=ray.intersectObject(model,true)[0];assert.equal(hit.object.userData.button,id);
}
for(const [id,z] of [['front',.017],['rear',-.002]]){
 const y=sc650Surface(-sc650Width(z),z)-.0024;const ray=new THREE.Raycaster(new THREE.Vector3(-.1,y,z),new THREE.Vector3(1,0,0));assert.equal(ray.intersectObject(model,true)[0].object.userData.button,id);
}
assert(sc650Surface(0,-.02)>sc650Surface(0,.045));
console.log('Chassis, palm and click plates are closed solids. Top/side rays hit all four matching buttons.');

const displayRay=new THREE.Raycaster(new THREE.Vector3(-.014,.1,.002),new THREE.Vector3(0,-1,0));assert.equal(displayRay.intersectObject(model,true)[0].object.name,'Display bezel');
const longPlateRay=new THREE.Raycaster(new THREE.Vector3(.014,.1,.002),new THREE.Vector3(0,-1,0));assert.equal(longPlateRay.intersectObject(model,true)[0].object.userData.button,'right');
assert(model.getObjectByName('USB-C opening'));assert(model.getObjectByName('USB-C tongue'));
for(const mesh of model.children.filter(m=>m.name.startsWith('Closed'))){const c=mesh.material.color;assert(Math.max(c.r,c.g,c.b)<.02,'Shell must stay black');}
console.log('Reference details: shorter left click, inset display, longer right click, USB-C connector and black shell pass.');

for(const id of ['front','rear']){const p=targets.get(id)[0].geometry.attributes.position;for(let i=0;i<p.count;i++)assert(sc650SideX(p.getY(i),p.getZ(i))-p.getX(i)<.0005,'Side keys must stay within 0.5 mm of the wall');}
console.log('Slim side keys follow the curved wall and project less than 0.5 mm.');
