import {macroKeys,buildMacroPackets} from './macro-protocol.mjs';
import {buildButtonReport} from './button-protocol.mjs';
import {sendSettingsReport,currentButtons,setMacroButton} from './buttons-ui.mjs';
const get=id=>document.getElementById(id),storage='mouser.macros.v1';
let library=[{name:'Macro 1',mode:0,repeat:1,events:[{key:'J',action:'down',delay:20},{key:'J',action:'up',delay:20}]}],index=0,recording=false,lastTime=0;
try{const parsed=JSON.parse(localStorage.getItem(storage));if(Array.isArray(parsed)&&parsed.length&&parsed.length<=30){parsed.forEach(m=>buildMacroPackets(m,17));library=parsed;}}catch{}
function status(text){get('macro-status').textContent=text;}
function read(){const value={name:get('macro-name').value.trim(),mode:Number(get('macro-mode').value),repeat:Number(get('macro-repeat').value),events:[...get('macro-events').children].map(row=>({key:row.querySelector('.key').value,action:row.querySelector('.event-action').value,delay:Number(row.querySelector('.delay').value)}))};if(!value.name||value.name.length>60)throw new Error('Name must be 1–60 characters.');return value;}
function save(){const value=read();buildMacroPackets(value,17);library[index]=value;localStorage.setItem(storage,JSON.stringify(library));options();status('Macro saved in this browser. Not uploaded.');}
function options(){const select=get('macro-list');select.replaceChildren(...library.map((m,i)=>new Option(m.name,String(i))));select.value=index;}
function add(event={key:'J',action:'down',delay:20}){
  if(get('macro-events').children.length>=47){status('Maximum 47 events per macro.');return;}
  const row=document.createElement('div');row.className='macro-event';
  row.innerHTML='<select class="key" aria-label="Event key"></select><select class="event-action" aria-label="Event action"><option value="down">Press</option><option value="up">Release</option></select><input class="delay" aria-label="Delay after event in milliseconds" type="number" min="2" max="127"><button class="up" type="button" aria-label="Move event up">↑</button><button class="down" type="button" aria-label="Move event down">↓</button><button class="remove" type="button" aria-label="Remove event">×</button>';
  row.querySelector('.key').replaceChildren(...Object.keys(macroKeys).map(key=>new Option(key,key)));row.querySelector('.key').value=event.key;row.querySelector('.event-action').value=event.action;row.querySelector('.delay').value=event.delay;
  row.querySelector('.remove').onclick=()=>row.remove();row.querySelector('.up').onclick=()=>{if(row.previousElementSibling)row.before(row.previousElementSibling);};row.querySelector('.down').onclick=()=>{if(row.nextElementSibling)row.after(row.nextElementSibling);};get('macro-events').append(row);
}
function render(){options();const macro=library[index];get('macro-name').value=macro.name;get('macro-mode').value=macro.mode;get('macro-repeat').value=macro.repeat;get('macro-events').replaceChildren();macro.events.forEach(add);}
get('macro-list').onchange=()=>{index=Number(get('macro-list').value);render();status('Loaded local macro.');};
get('macro-save').onclick=()=>{try{save();}catch(error){status(error.message);}};
get('macro-new').onclick=()=>{if(library.length>=30){status('Maximum 30 local macros.');return;}library.push({name:'Macro '+(library.length+1),mode:0,repeat:1,events:[]});index=library.length-1;render();};
get('macro-delete').onclick=()=>{if(library.length===1){status('Keep at least one macro.');return;}library.splice(index,1);index=0;localStorage.setItem(storage,JSON.stringify(library));render();};
get('macro-add').onclick=()=>add();get('macro-clear').onclick=()=>get('macro-events').replaceChildren();
get('macro-record').onclick=()=>{recording=!recording;get('macro-record').textContent=recording?'Stop recording':'Record keyboard';if(recording){lastTime=performance.now();get('macro-capture').focus();}status(recording?'Recording inside the capture box. Delays are limited to 2–127 ms.':'Recording stopped. Review press/release pairs, then save.');};
for(const action of ['keydown','keyup'])get('macro-capture').addEventListener(action,event=>{
  if(!recording)return;event.preventDefault();if(event.repeat)return;
  const aliases={ControlLeft:'Left Ctrl',ControlRight:'Right Ctrl',ShiftLeft:'Left Shift',ShiftRight:'Right Shift',AltLeft:'Left Alt',AltRight:'Right Alt',MetaLeft:'Left Super',MetaRight:'Right Super',ArrowUp:'Up',ArrowDown:'Down',ArrowLeft:'Left',ArrowRight:'Right',Space:'Space'};
  const key=aliases[event.code]??(event.code.startsWith('Key')?event.code.slice(3):event.code.startsWith('Digit')?event.code.slice(5):event.code);
  if(!Object.hasOwn(macroKeys,key)){status('Unsupported recording key: '+event.code);return;}
  const now=performance.now(),previous=get('macro-events').lastElementChild;if(previous)previous.querySelector('.delay').value=Math.max(2,Math.min(127,Math.round(now-lastTime)));lastTime=now;add({key,action:action==='keydown'?'down':'up',delay:20});
});
get('macro-apply').onclick=async()=>{
  const button=get('macro-apply');button.disabled=true;recording=false;get('macro-record').textContent='Record keyboard';
  try{save();const side=get('macro-target').value,id=side==='rear'?17:21;const assignments=currentButtons();assignments[side]={type:'macro',macroId:id};const packets=buildMacroPackets(library[index],id);await sendSettingsReport([...packets,buildButtonReport(assignments)]);setMacroButton(side);let bindings={};try{bindings=JSON.parse(localStorage.getItem('mouser.macroBindings.v1'))||{};}catch{}bindings[side]=library[index];localStorage.setItem('mouser.macroBindings.v1',JSON.stringify(bindings));status('Macro upload and assignment sent. Test playback; this feature is hardware-unverified.');}
  catch(error){status(error.message+' A failed multi-part upload may be partial.');}finally{button.disabled=false;}
};
get('macro-export').onclick=()=>{try{const value=read();buildMacroPackets(value,17);const url=URL.createObjectURL(new Blob([JSON.stringify({format:'mouser-macro-v1',macro:value},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='mouser-macro.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){status(error.message);}};
get('macro-import').onchange=async event=>{try{const file=event.target.files[0];if(!file)return;if(file.size>50000)throw new Error('Macro file too large');const value=JSON.parse(await file.text());if(value.format!=='mouser-macro-v1'||typeof value.macro?.name!=='string'||value.macro.name.length>60)throw new Error('Invalid macro file');buildMacroPackets(value.macro,17);if(library.length>=30)throw new Error('Macro library full');library.push(value.macro);index=library.length-1;render();save();}catch(error){status(error.message);}finally{event.target.value='';}};
render();
