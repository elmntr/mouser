import {connectBluetoothSettings,validateBluetoothReport,writeBluetoothSettings} from './bluetooth-read.mjs';
import {connectSc650,isSc650} from './hid-connection.mjs';
import { buildButtonReport, keys, actions } from './button-protocol.mjs';
const get=id=>document.getElementById(id);
const storageKey='mouser.side-buttons.v1';
let device=null,bluetooth=null,busy=false,lines=[];
const connected=()=>!!device?.opened||!!bluetooth?.device.gatt.connected;
let choices={rear:{type:'key',key:'J',modifiers:4},front:{type:'forward',key:'F8',modifiers:0}};
try{
  const saved=localStorage.getItem(storageKey);
  if(saved){const parsed=JSON.parse(saved);buildButtonReport(parsed);choices=parsed;get('saved').textContent='Loaded your saved choices. Click Apply to send them to the mouse.';}
}catch{get('saved').textContent='Saved choices were unavailable or invalid. Showing suggested assignments; nothing has been sent.';}

choices={left:{type:'left'},right:{type:'right'},middle:{type:'middle'},...choices};
for(const [side,title] of [['left','1. Left button'],['right','2. Right button'],['middle','3. Wheel button'],['front','4. Front side button'],['rear','5. Rear side button']]){
  const fieldset=document.createElement('fieldset');fieldset.id=side;
  fieldset.innerHTML=`<legend>${title}</legend><label>Action<select class="type"><option value="key">Keyboard key / shortcut</option><option value="back">Back</option><option value="forward">Forward</option><option value="disabled">Disabled</option></select></label><div class="keyboard"><label>Key<select class="key"></select></label><div class="modifiers"></div></div>`;
  fieldset.querySelector('.type').replaceChildren(new Option('Custom key combination','key'),...Object.entries(actions).map(([id,data])=>new Option(data[0],id)));
  if(side==='rear'||side==='front')fieldset.querySelector('.type').add(new Option('Assigned macro (Macro manager)','macro'));
  const select=fieldset.querySelector('.key');
  for(const key of Object.keys(keys))select.add(new Option(key,key));
  for(const [name,mask] of [['Ctrl',1],['Shift',2],['Alt',4],['Super',8]]){
    const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.value=mask;
    input.checked=!!(choices[side].modifiers&mask);label.append(input,' '+name);fieldset.querySelector('.modifiers').append(label);
  }
  fieldset.querySelector('.type').value=choices[side].type;
  select.value=Object.hasOwn(keys,choices[side].key)?choices[side].key:'F8';
  function refresh(){fieldset.querySelector('.keyboard').hidden=fieldset.querySelector('.type').value!=='key';}
  fieldset.addEventListener('change',()=>{
    choices[side]={type:fieldset.querySelector('.type').value,key:select.value,modifiers:[...fieldset.querySelectorAll('input:checked')].reduce((mask,input)=>mask|Number(input.value),0),macroId:side==='rear'?17:21};
    refresh();update();
    try{localStorage.setItem(storageKey,JSON.stringify(choices));get('saved').textContent='Choices saved in this browser. Click Apply to send them to the mouse.';}
    catch{get('saved').textContent='Browser storage unavailable. Choices work for this session only.';}
  });
  refresh();get('assignments').append(fieldset);
}
function update(){
  const online=connected();
  get('apply').disabled=!online||busy;get('connect').disabled=busy||online;get('choose-device').disabled=busy;
  get('connect').textContent=online?'Connected ✓':busy?'Connecting…':'Connect mouse ↗';
  get('connection-badge').textContent=online?'Connected':'Offline';get('connection-badge').classList.toggle('online',online);
  get('connection-title').textContent=online?'Ready when you are.':'Make it yours.';
  get('connect-bluetooth').disabled=busy||!!bluetooth?.device.gatt.connected;
  get('transport-label').textContent=bluetooth?.device.gatt.connected?'Bluetooth':'2.4 GHz';
  for(const id of ['polling-apply','macro-apply','profile-apply'])get(id).disabled=busy||!!bluetooth?.device.gatt.connected;
  get('bluetooth-note').hidden=!bluetooth?.device.gatt.connected;
  for(const side of ['left','right','middle','rear','front'])get(side).disabled=busy;
}
function rememberTransport(value){try{localStorage.setItem('mouser.transport.v1',value);}catch{}}
async function connect(choose=false,automatic=false){
  if(busy||automatic&&connected())return;
  busy=true;update();
  try{
    if(choose&&device?.opened){await device.close();device=null;}
    const selected=await connectSc650(navigator.hid,choose,automatic);
    if(!selected){if(!automatic)get('status').textContent='No device selected. Your draft is still saved.';return false;}
    if(bluetooth){bluetooth.device.gatt.disconnect();bluetooth=null;}
    device=selected;rememberTransport('dongle');get('status').textContent='Connected via dongle. Choose your settings and apply.';return true;
  }catch(error){if(!automatic)get('status').textContent=error.message;}
  finally{busy=false;update();}
}
async function connectBluetooth(automatic=false){
 if(busy||automatic&&connected())return;busy=true;update();
 try{
  const selected=await connectBluetoothSettings(navigator.bluetooth,automatic);
  if(!selected)return false;
  if(device?.opened)await device.close();device=null;
  bluetooth=selected;rememberTransport('bluetooth');
  selected.device.addEventListener('gattserverdisconnected',()=>{if(bluetooth===selected){bluetooth=null;get('status').textContent='Bluetooth disconnected. Your draft is saved.';update();}});
  get('status').textContent='Connected via Bluetooth. Buttons verified; DPI and lighting experimental.';
  return true;
 }catch(error){if(!automatic)get('status').textContent=error.message;}
 finally{busy=false;update();}
}
get('connect-bluetooth').addEventListener('click',()=>connectBluetooth());
get('connect').addEventListener('click',()=>connect());
get('choose-device').addEventListener('click',()=>connect(true));
// Previously granted devices only: automatic attempts never open a chooser or send settings.
async function autoReconnect(){
 if(connected()||busy||document.hidden)return;
 let preferred='bluetooth';try{preferred=localStorage.getItem('mouser.transport.v1')||preferred;}catch{}
 const attempts=preferred==='dongle'?[()=>connect(false,true),()=>connectBluetooth(true)]:[()=>connectBluetooth(true),()=>connect(false,true)];
 for(const attempt of attempts){if(await attempt())return;}
 if(!busy&&!connected())get('status').textContent='Waiting for your authorized mouse. Wake it or connect once to authorize this site.';
}
window.addEventListener('focus',autoReconnect);
document.addEventListener('visibilitychange',autoReconnect);
if(navigator.hid)navigator.hid.addEventListener('connect',autoReconnect);
setInterval(autoReconnect,10000);
void autoReconnect();
get('apply').addEventListener('click',async()=>{
 try{await sendSettingsReport(buildButtonReport(choices));get('status').textContent='Button assignments sent. Test the mouse below.';}
 catch(error){get('status').textContent='Transfer failed: '+error.message+' Verify button behavior before retrying.';}
});
if(navigator.hid)navigator.hid.addEventListener('disconnect',event=>{if(event.device===device){device=null;get('status').textContent='Dongle disconnected.';update();}});
const test=get('test');
function log(text){lines.unshift(text);get('events').textContent=lines.slice(0,12).join('\n');}
for(const kind of ['keydown','keyup'])test.addEventListener(kind,event=>{event.preventDefault();log(`${kind}: ${event.code} · ${event.key} · modifiers: ${[event.ctrlKey?'Ctrl':'',event.altKey?'Alt':'',event.shiftKey?'Shift':'',event.metaKey?'Super':''].filter(Boolean).join('+')||'none'}`);});
for(const kind of ['mousedown','mouseup'])test.addEventListener(kind,event=>{if(event.button!==0)event.preventDefault();log(`${kind}: mouse button ${event.button}`);});
test.addEventListener('auxclick',event=>event.preventDefault());test.addEventListener('contextmenu',event=>event.preventDefault());
get('clear').addEventListener('click',()=>{lines=[];get('events').textContent='Waiting for input.';test.focus();});
update();
export async function sendSettingsReport(input){
  if(!connected())throw new Error('Connect your mouse first.');
  if(busy)throw new Error('A transfer is already in progress.');
  const reports=Array.isArray(input)?input:[input],expected={4:56,5:15,6:9,8:59,9:64};
  if(!reports.length||reports.length>12)throw new Error('Invalid transfer sequence.');
  for(const report of reports){
    if(!(report instanceof Uint8Array)||!Object.hasOwn(expected,report[0])||report.length!==expected[report[0]])throw new Error('Invalid settings report.');
    if(bluetooth){validateBluetoothReport(report);continue;}
    const available=device.collections.some(c=>c.usagePage===11&&c.featureReports.some(r=>r.reportId===report[0]&&r.items.reduce((n,i)=>n+i.reportSize*i.reportCount,0)===(report.length-1)*8));
    if(!available)throw new Error('Expected settings report not exposed by dongle.');
  }
  busy=true;update();
  try{for(const report of reports){if(bluetooth)await writeBluetoothSettings(bluetooth,report);else await device.sendFeatureReport(report[0],report.slice(1));if(reports.length>1)await new Promise(resolve=>setTimeout(resolve,200));}}
  finally{busy=false;update();}
}
export function currentButtons(){return structuredClone(choices);}
export function setMacroButton(side){
  const fieldset=get(side);fieldset.querySelector('.type').value='macro';fieldset.querySelector('.type').dispatchEvent(new Event('change',{bubbles:true}));
}
