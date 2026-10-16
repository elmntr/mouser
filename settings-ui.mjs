import {buildDpiReport,buildRgbReport,buildPollingReport} from './settings-protocol.mjs';
import {sendSettingsReport} from './buttons-ui.mjs';
const get=id=>document.getElementById(id);
const initialDpi={stages:[800,1600,2400,3200,6400,12000],active:2,angleSnap:false,ripple:true};
const initialRgb={mode:1,brightness:8,speed:6,color:'#00ff00',sleep:1,deepSleep:10,response:4};
function load(key,fallback,validate){try{const saved=localStorage.getItem(key);if(saved){const value=JSON.parse(saved);validate(value);return value;}}catch{}return fallback;}
const dpi=load('mouser.dpi.v1',initialDpi,buildDpiReport),rgb=load('mouser.rgb.v1',initialRgb,buildRgbReport);
const stageArea=get('dpi-stages');
const defaultColors=['#ff0000','#00ff00','#0000ff','#ffff00','#00ffff','#ff00ff'];
dpi.stages.forEach((value,i)=>{
  const card=document.createElement('div');card.className='dpi-stage';
  card.innerHTML=`<label class="stage-enable"><input type="checkbox" class="dpi-enabled" ${dpi.enabled?.[i]===false?'':'checked'}> Stage ${i+1}</label><input aria-label="Stage ${i+1} slider" type="range" min="50" max="12000" step="50" class="dpi-slider"><input aria-label="Stage ${i+1} DPI" type="number" min="50" max="12000" step="50" class="dpi-value"><input aria-label="Stage ${i+1} color" type="color" class="dpi-color">`;
  const slider=card.querySelector('.dpi-slider'),number=card.querySelector('.dpi-value');slider.value=number.value=value;card.querySelector('.dpi-color').value=dpi.colors?.[i]??defaultColors[i];
  slider.addEventListener('input',()=>{number.value=Number(slider.value)>10000?Math.round(Number(slider.value)/100)*100:slider.value;slider.value=number.value;});number.addEventListener('input',()=>{slider.value=number.value;});stageArea.append(card);
});
get('dpi-active').value=dpi.active;get('dpi-angle').checked=dpi.angleSnap;get('dpi-ripple').checked=dpi.ripple;
for(const name of ['mode','brightness','speed','color','sleep','deepSleep','response'])get('rgb-'+name).value=name==='sleep'?rgb[name]/2:name==='response'?rgb[name]*2:rgb[name];
const readDpi=()=>({stages:[...stageArea.querySelectorAll('.dpi-value')].map(i=>Number(i.value)),active:Number(get('dpi-active').value),angleSnap:get('dpi-angle').checked,ripple:get('dpi-ripple').checked,enabled:[...stageArea.querySelectorAll('.dpi-enabled')].map(i=>i.checked),colors:[...stageArea.querySelectorAll('.dpi-color')].map(i=>i.value)});
const readRgb=()=>Object.fromEntries(['mode','brightness','speed','color','sleep','deepSleep','response'].map(name=>[name,name==='color'?get('rgb-'+name).value:Number(get('rgb-'+name).value)*(name==='sleep'?2:name==='response'?0.5:1)]));
for(const [name,read,build] of [['dpi',readDpi,buildDpiReport],['rgb',readRgb,buildRgbReport]]){
  const form=get(name+'-form'),status=get(name+'-status'),button=get(name+'-apply');
  form.addEventListener('input',event=>{try{const c=read();build(c);localStorage.setItem('mouser.'+name+'.v1',JSON.stringify(c));status.textContent='Draft saved in this browser. Not applied.';}catch(error){status.textContent=error.message;}});
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    button.disabled=true;const fieldset=form.querySelector('fieldset');fieldset.disabled=true;
    try{const c=read(),report=build(c);await sendSettingsReport(report);status.textContent='Transfer succeeded. Check the mouse to confirm the change.';}
    catch(error){status.textContent=error.message+' Verify behavior before retrying.';}
    finally{button.disabled=false;fieldset.disabled=false;}
  });
}

const polling=document.getElementById('polling-rate');
try{const value=Number(localStorage.getItem('mouser.polling.v1'));buildPollingReport(value);polling.value=value;}catch{}
polling.addEventListener('change',()=>localStorage.setItem('mouser.polling.v1',polling.value));
document.getElementById('polling-apply').addEventListener('click',async()=>{
  const button=document.getElementById('polling-apply'),status=document.getElementById('polling-status');button.disabled=true;
  try{await sendSettingsReport(buildPollingReport(Number(polling.value)));status.textContent='Polling-rate command sent. Hardware rate is unmeasured.';}catch(error){status.textContent=error.message;}finally{button.disabled=false;}
});

export function currentSettings(){return {dpi:readDpi(),rgb:readRgb(),polling:Number(polling.value)};}
