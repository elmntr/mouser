import {keys} from './button-protocol.mjs';
export const macroKeys={...keys,'Mouse left':241,'Mouse right':242,'Mouse middle':243,'Mouse back':244,'Mouse forward':245};
// Logical report at Mouse.exe 0x4151b0; page framing at 0x414390.
export function buildMacroPackets(macro,id){
  if(![17,21].includes(id)||!macro||![0,1,2].includes(macro.mode)||!Number.isInteger(macro.repeat)||macro.repeat<1||macro.repeat>255)throw new Error('Invalid macro playback options');
  if(!Array.isArray(macro.events)||macro.events.length<2||macro.events.length>47)throw new Error('Use 2–47 macro events.');
  const held=new Set(),logical=new Uint8Array(131);logical.set([9,131,id,macro.mode]);logical[7]=macro.repeat;logical[28]=macro.events.length;
  macro.events.forEach((event,i)=>{
    if(!Object.hasOwn(macroKeys,event.key)||!['down','up'].includes(event.action)||!Number.isInteger(event.delay)||event.delay<2||event.delay>127)throw new Error('Use known keys and delays of 2–127 ms per event.');
    if(event.action==='down'){if(held.has(event.key))throw new Error('Release a key before pressing it again.');held.add(event.key);}
    else if(!held.delete(event.key))throw new Error('Each key release needs a preceding press.');
    logical[29+i*2]=event.delay|(event.action==='up'?128:0);logical[30+i*2]=macroKeys[event.key];
  });
  if(held.size)throw new Error('Release every pressed key before ending the macro.');
  const sum=logical.slice(3,129).reduce((a,b)=>a+b,0);logical[129]=sum>>8;logical[130]=sum&255;
  return [0,1,2].map(page=>{const packet=new Uint8Array(64);packet.set([9,page===2?12:64,id,page]);packet.set(logical.slice(3+page*60,Math.min(3+(page+1)*60,131)),4);return packet;});
}
