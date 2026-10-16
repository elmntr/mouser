import {inspectBluetooth,testBluetoothRearF8} from './bluetooth-read.mjs';
const button=document.getElementById('bluetooth-connect'),status=document.getElementById('capability'),result=document.getElementById('bluetooth-result');
let connectedDevice=null;
const writeButton=document.getElementById('bluetooth-f8');
const available=!!navigator.bluetooth?.requestDevice;button.disabled=!available;
status.textContent=available?'Web Bluetooth is available. Select the SC650 to run the read-only check.':'Web Bluetooth is not exposed by this browser. Bluetooth settings cannot be tested from this page; the operating system connection is separate.';
button.onclick=async()=>{button.disabled=true;try{const {device,summary}=await inspectBluetooth(navigator.bluetooth);connectedDevice=device;writeButton.disabled=false;document.getElementById('battery').textContent=summary.battery===null?'Battery unavailable':summary.battery+'% battery';result.textContent=JSON.stringify(summary,null,2);status.textContent='Bluetooth read completed. No settings were sent.';device.addEventListener('gattserverdisconnected',()=>{connectedDevice=null;writeButton.disabled=true;status.textContent='Bluetooth browser connection disconnected.';});}catch(error){status.textContent=/globally disabled/i.test(error.message)?'Brave is blocking Web Bluetooth. Enable Web Bluetooth API at brave://flags/#brave-web-bluetooth-api, relaunch, then retry this read-only check.':error.message;}finally{button.disabled=false;}};

writeButton.onclick=async()=>{
 writeButton.disabled=true;button.disabled=true;
 try{
  const packet=await testBluetoothRearF8(connectedDevice);
  result.textContent+='\n\nFEE3 write acknowledged (59 bytes):\n'+packet;
  status.textContent='Write acknowledged. Click the test box, then press the rear side button. F8 confirms the mapping worked; acknowledgment alone does not.';
 }catch(error){status.textContent='Bluetooth test failed: '+error.message+'. No automatic retry was attempted.';}
 finally{writeButton.disabled=!connectedDevice?.gatt.connected;button.disabled=false;}
};
const tester=document.getElementById('key-test');
tester.addEventListener('keydown',event=>{event.preventDefault();tester.textContent=event.code+(event.altKey?' + Alt':'')+(event.ctrlKey?' + Ctrl':'');});
