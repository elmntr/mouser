// SC650 serialization traced from Mouse.exe 0x414e30 and 0x414ba9.
function integer(value,min,max,name){if(!Number.isInteger(value)||value<min||value>max)throw new Error(`Invalid ${name}`);return value;}
function checksum(packet,start,end,offset){const sum=packet.slice(start,end).reduce((a,b)=>a+b,0);packet[offset]=sum>>8;packet[offset+1]=sum&255;return packet;}
export function buildDpiReport(config){
  if(!Array.isArray(config.stages)||config.stages.length!==6)throw new Error('Enter six DPI stages.');
  const p=new Uint8Array(56);p.set([4,56,1]);
  if(typeof config.angleSnap!=='boolean'||typeof config.ripple!=='boolean')throw new Error('Invalid sensor options');
  p[3]=Number(config.angleSnap);p[4]=Number(config.ripple);p[5]=63;
  const enabled=config.enabled??[true,true,true,true,true,true];
  if(!Array.isArray(enabled)||enabled.length!==6||enabled.some(v=>typeof v!=='boolean')||!enabled.some(Boolean))throw new Error('Enable at least one DPI stage.');
  p[5]=enabled.reduce((mask,v,i)=>mask|(v?1<<i:0),0);
  config.stages.forEach((dpi,i)=>{
    integer(dpi,50,12000,'DPI');
    if(dpi%50||dpi>10000&&dpi%100)throw new Error('Use steps of 50 DPI up to 10000, then steps of 100.');
    // This Aula serializer sends the resulting DPI value, unlike the X11 sensor lookup table.
    p[8+i]=dpi&255;p[16+i]=dpi>>8;
  });
  p[24]=integer(config.active,1,6,'active stage');
  if(!enabled[config.active-1])throw new Error('The active DPI stage must be enabled.');
  const colors=[0x0000ff,0x00ff00,0xff0000,0x00ffff,0xffff00,0xff00ff,0x0040ff,0xffffff];
  colors.forEach((color,i)=>p.set([color&255,(color>>8)&255,(color>>16)&255],25+i*3));
  if(config.colors){if(!Array.isArray(config.colors)||config.colors.length!==6)throw new Error('Expected six DPI colors');config.colors.forEach((color,i)=>{if(!/^#[a-f\d]{6}$/i.test(color))throw new Error('Invalid DPI color');p.set([1,3,5].map(n=>parseInt(color.slice(n,n+2),16)),25+i*3);});}
  p[49]=1;return checksum(p,3,50,50);
}
export function buildPollingReport(hz){const rates={125:8,250:4,500:2,1000:1};if(!Number.isInteger(hz)||!Object.hasOwn(rates,hz))throw new Error('Invalid polling rate');const rate=rates[hz];return new Uint8Array([6,9,1,rate,(~rate)&255,0,0,0,0]);}
export function buildRgbReport(c){
  const mode=integer(c.mode,0,11,'lighting mode'),brightness=integer(c.brightness,1,8,'brightness'),speed=integer(c.speed,1,8,'speed');
  integer(c.sleep,1,60,'sleep interval');integer(c.deepSleep,1,60,'deep sleep interval');integer(c.response,2,25,'click response');
  if(!/^#[0-9a-f]{6}$/i.test(c.color))throw new Error('Invalid RGB color');
  const p=new Uint8Array(15);p.set([5,15,1]);p[3]=mode<<4;p[4]=(c.deepSleep&0xf0)|(9-speed);
  p[5]=((c.deepSleep&15)<<4)|((mode===1||mode===9)?brightness:8);
  p[6]=parseInt(c.color.slice(1,3),16);p[7]=parseInt(c.color.slice(3,5),16);p[8]=parseInt(c.color.slice(5,7),16);
  p[9]=c.sleep;p[10]=c.response;return checksum(p,3,11,11);
}
