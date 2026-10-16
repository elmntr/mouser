import {buildSc650} from './sc650-model.mjs';
import * as THREE from './vendor/three/build/three.module.js';
import {GLTFLoader} from './vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from './vendor/three/examples/jsm/controls/OrbitControls.js';
import {mouseButtons,clickPlate,getMouseButton} from './mouse-selection.mjs';

const get=id=>document.getElementById(id),viewer=get('mouse-viewer'),canvas=get('mouse-canvas');
const fields=[...document.querySelectorAll('#assignments fieldset')];
let selected='left',renderer,scene,camera,controls,model,modelScale=1,center=new THREE.Vector3();
const targets=[],parts=new Map(),markers=new Map(),raycaster=new THREE.Raycaster();

function selectButton(id,focus=false,activate=true){
  const button=getMouseButton(id);if(!button)return;
  selected=id;
  if(activate)get('tab-buttons').click();
  fields.forEach(field=>{field.hidden=field.id!==id;});
  get('selected-button-title').textContent=button.label;
  get('selected-button-number').textContent='BUTTON '+String(button.number).padStart(2,'0');
  document.querySelectorAll('[data-button]').forEach(node=>node.setAttribute('aria-pressed',String(node.dataset.button===id)));
  for(const [key,meshes] of parts)for(const mesh of meshes){mesh.material.emissive.set('#000000');mesh.material.emissiveIntensity=0;}
  if(focus)(get(id).querySelector('.select-trigger')||get(id).querySelector('.type')).focus({preventScroll:true});
  render();
}
for(const node of document.querySelectorAll('#button-picker [data-button]'))node.addEventListener('click',()=>selectButton(node.dataset.button));
for(const button of mouseButtons){
  const marker=document.createElement('button');marker.className='model-hotspot';marker.dataset.button=button.id;marker.textContent=button.number;marker.setAttribute('aria-label','Edit '+button.label.toLowerCase());marker.setAttribute('aria-pressed','false');
  marker.addEventListener('click',()=>selectButton(button.id));get('model-hotspots').append(marker);markers.set(button.id,marker);
}
selectButton('left',false,false);

function register(mesh,id){
  mesh.userData.button=id;targets.push(mesh);if(!parts.has(id))parts.set(id,[]);parts.get(id).push(mesh);
  mesh.material=mesh.material.clone();
}
function worldPoint(point){const p=new THREE.Vector3(...point).sub(center);p.z=-p.z;return p.multiplyScalar(modelScale);}
function render(){
  if(!renderer||!model)return;
  scene.updateMatrixWorld();camera.updateMatrixWorld();
  for(const button of mouseButtons){
    const world=worldPoint(model.userData.buttonPoints?.[button.id]??button.point),projected=world.clone().project(camera),marker=markers.get(button.id);
    marker.style.left=((projected.x+1)*.5*viewer.clientWidth)+'px';marker.style.top=((-projected.y+1)*.5*viewer.clientHeight)+'px';
    marker.hidden=projected.z>1||Math.abs(projected.x)>1||Math.abs(projected.y)>1;
    const direction=world.clone().sub(camera.position);raycaster.set(camera.position,direction.clone().normalize());
    const first=raycaster.intersectObject(model,true).find(hit=>hit.object.material.visible!==false);marker.classList.toggle('occluded',!!first&&first.distance<direction.length()-.18);
  }
  renderer.render(scene,camera);
}
function resize(){if(!renderer)return;const width=viewer.clientWidth,height=viewer.clientHeight;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();render();}
function setView(position){if(!controls)return;camera.position.set(...position);controls.target.set(0,0,0);controls.update();render();}
get('view-reset').onclick=()=>setView([-3.2,4.4,3.9]);get('view-top').onclick=()=>setView([0,8,.01]);get('view-side').onclick=()=>setView([-6,2.2,1.4]);get('view-front').onclick=()=>setView([0,1.8,-6.2]);

async function init(){
  try{
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
    scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(29,1,.01,100);camera.position.set(-3.2,4.4,3.9);
    controls=new OrbitControls(camera,canvas);controls.enablePan=false;controls.minDistance=5.5;controls.maxDistance=14;controls.maxPolarAngle=Math.PI*.48;controls.minPolarAngle=.001;controls.enableDamping=false;controls.zoomSpeed=.6;controls.addEventListener('change',render);
    scene.add(new THREE.HemisphereLight('#e2f9ff','#272b37',2));
    for(const [color,intensity,position] of [['#ffffff',3,[3,6,2]],['#e0e2e5',.8,[-4,3,-2]],['#e0e2e5',1.2,[4,2,-4]],['#c1d1da',1.3,[-4,1,2]]]){const light=new THREE.DirectionalLight(color,intensity);light.position.set(...position);scene.add(light);}
    const gltf=await new GLTFLoader().loadAsync('/assets/mouse-mm282.glb');model=buildSc650(gltf.scene,register);
    model.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(model);bounds.getCenter(center);modelScale=3.8/bounds.getSize(new THREE.Vector3()).z;model.scale.set(modelScale,modelScale,-modelScale);model.position.set(-center.x*modelScale,-center.y*modelScale,center.z*modelScale);scene.add(model);
    get('model-status').hidden=true;viewer.classList.add('ready');resize();selectButton(selected,false,false);
    new ResizeObserver(resize).observe(viewer);
    get('rgb-form').addEventListener('input',render);
    get('dpi-form').addEventListener('input',render);
    get('polling-rate').addEventListener('change',render);
    let down=null;
    canvas.addEventListener('pointerdown',event=>{if(event.button===0)down=[event.clientX,event.clientY];});
    canvas.addEventListener('pointerup',event=>{
      if(!down)return;const distance=Math.hypot(event.clientX-down[0],event.clientY-down[1]);down=null;if(distance>5)return;
      const rect=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1),camera);
      const hit=raycaster.intersectObject(model,true).find(hit=>hit.object.material.visible!==false);
      if(hit?.object.userData.button)selectButton(hit.object.userData.button);
    });
    canvas.addEventListener('pointercancel',()=>{down=null;});
    canvas.addEventListener('keydown',event=>{const index=mouseButtons.findIndex(button=>button.id===selected);const next=event.key==='ArrowRight'?mouseButtons[(index+1)%5]:event.key==='ArrowLeft'?mouseButtons[(index+4)%5]:null;if(next){event.preventDefault();selectButton(next.id);}if(event.key==='Enter'){event.preventDefault();selectButton(selected,true);}});
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();get('model-status').hidden=false;get('model-status').textContent='3D paused. Reload to restore, or use the buttons below.';});
  }catch(error){get('model-status').textContent='3D preview unavailable. Use the button selector below.';get('view-reset').disabled=true;get('view-top').disabled=true;get('view-side').disabled=true;get('view-front').disabled=true;console.error('Mouse preview:',error);}
}
init();
