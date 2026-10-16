export function isSc650(device){
  return device.vendorId===0x1d57&&device.productId===0xfa60&&device.collections.some(c=>c.usagePage===11&&c.usage===0&&c.featureReports.some(r=>r.reportId===8&&r.items.reduce((n,i)=>n+i.reportSize*i.reportCount,0)===464));
}
export async function connectSc650(hid,choose=false,automatic=false){
  if(automatic&&!hid)return null;
  if(!hid)throw new Error('Open Mouser in Brave or Chrome to connect your mouse.');
  const granted=choose?[]:(await hid.getDevices()).filter(isSc650);
  if(automatic&&!granted.length)return null;
  const selected=granted[0]||(await hid.requestDevice({filters:[{vendorId:0x1d57,productId:0xfa60,usagePage:11,usage:0}]}))[0];
  if(!selected)return null;
  if(!isSc650(selected))throw new Error('This device does not expose the expected SC650 controls.');
  if(!selected.opened)await selected.open();return selected;
}
