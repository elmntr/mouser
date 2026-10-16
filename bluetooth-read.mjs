import {buildButtonReport} from './button-protocol.mjs';
export const bluetoothServices=Object.freeze({battery:'battery_service',information:'device_information',vendor:'0000fee0-0000-1000-8000-00805f9b34fb'});
export async function inspectBluetooth(bluetooth){
 if(!bluetooth?.requestDevice)throw new Error('Web Bluetooth is unavailable in this browser. The Linux desktop Bluetooth connection still works, but this page cannot access GATT.');
 const device=await bluetooth.requestDevice({filters:[{name:'AULA-SC650'}],optionalServices:Object.values(bluetoothServices)});
 if(device.name!=='AULA-SC650')throw new Error('Select the AULA-SC650 mouse.');
 const server=await device.gatt.connect(),summary={name:device.name,battery:null,manufacturer:null,vendorCharacteristics:[],vendorRead:null,settingsSupported:false,errors:[]};
 try{const service=await server.getPrimaryService(bluetoothServices.battery),characteristic=await service.getCharacteristic('battery_level'),value=await characteristic.readValue();if(value.byteLength!==1||value.getUint8(0)>100)throw new Error('Invalid battery value');summary.battery=value.getUint8(0);}catch(error){summary.errors.push('Battery: '+error.message);}
 try{const service=await server.getPrimaryService(bluetoothServices.information),characteristic=await service.getCharacteristic('manufacturer_name_string');summary.manufacturer=new TextDecoder().decode(await characteristic.readValue());}catch(error){summary.errors.push('Device information: '+error.message);}
 try{
  const service=await server.getPrimaryService(bluetoothServices.vendor),characteristics=await service.getCharacteristics();
  summary.vendorCharacteristics=characteristics.map(c=>({uuid:c.uuid,read:!!c.properties.read,write:!!c.properties.write,writeWithoutResponse:!!c.properties.writeWithoutResponse,notify:!!c.properties.notify,indicate:!!c.properties.indicate}));
  const readOnly=characteristics.find(c=>c.uuid==='0000fee1-0000-1000-8000-00805f9b34fb'&&c.properties.read);
  if(readOnly){const value=await readOnly.readValue();summary.vendorRead=Array.from(new Uint8Array(value.buffer,value.byteOffset,value.byteLength),v=>v.toString(16).padStart(2,'0')).join(' ');}
 }catch(error){summary.errors.push('Vendor metadata: '+error.message);}
 return {device,summary};
}

// Mouse.exe 0x4146d7 → 0x405880 → 0x405f43 copies the complete report to FEE3.
// Experimental: a successful ATT write does not confirm firmware applied the mapping.
export async function testBluetoothRearF8(device){
 if(device?.name!=='AULA-SC650'||!device.gatt?.connected)throw new Error('Connect the SC650 Bluetooth mouse first.');
 const service=await device.gatt.getPrimaryService(bluetoothServices.vendor);
 const characteristic=await service.getCharacteristic('0000fee3-0000-1000-8000-00805f9b34fb');
 if(!characteristic.properties.write||!characteristic.writeValueWithResponse)throw new Error('Expected Bluetooth settings writer is unavailable.');
 const report=buildButtonReport('f8');
 await characteristic.writeValueWithResponse(report);
 return Array.from(report,v=>v.toString(16).padStart(2,'0')).join(' ');
}

export async function connectBluetoothSettings(bluetooth,automatic=false){
 if(automatic&&!bluetooth?.getDevices)return null;
 if(!bluetooth?.requestDevice)throw new Error('Enable Web Bluetooth in your browser first.');
 const granted=bluetooth.getDevices?(await bluetooth.getDevices()).find(d=>d.name==='AULA-SC650'):null;
 if(automatic&&!granted)return null;
 const device=granted||await bluetooth.requestDevice({filters:[{name:'AULA-SC650'}],optionalServices:[bluetoothServices.vendor]});
 if(device.name!=='AULA-SC650')throw new Error('Select the AULA-SC650 mouse.');
 await device.gatt.connect();
 try{
  const service=await device.gatt.getPrimaryService(bluetoothServices.vendor);
  const writer=await service.getCharacteristic('0000fee3-0000-1000-8000-00805f9b34fb');
  if(!writer.properties.write||!writer.writeValueWithResponse)throw new Error('Expected SC650 Bluetooth writer is unavailable.');
  return {device,writer};
 }catch(error){device.gatt.disconnect();throw error;}
}
export function validateBluetoothReport(report){
 const lengths={4:56,5:15,8:59},checksumEnds={4:50,5:11,8:57};
 if(!(report instanceof Uint8Array)||report.length!==lengths[report[0]]||report[1]!==report.length||report[2]!==1)throw new Error('Bluetooth supports button, DPI and lighting reports only. Polling, macros and complete profiles require the dongle.');
 const end=checksumEnds[report[0]],sum=report.slice(3,end).reduce((a,b)=>a+b,0)&65535;
 if(report[end]!==sum>>>8||report[end+1]!== (sum&255))throw new Error('Invalid Bluetooth settings checksum.');
}
export async function writeBluetoothSettings(connection,report){
 validateBluetoothReport(report);
 if(connection?.device?.name!=='AULA-SC650'||!connection.device.gatt?.connected)throw new Error('Bluetooth mouse disconnected. Reconnect before applying.');
 if(!connection.writer?.properties.write||!connection.writer.writeValueWithResponse)throw new Error('Expected Bluetooth writer is unavailable.');
 await connection.writer.writeValueWithResponse(report);
}
