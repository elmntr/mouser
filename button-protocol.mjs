// Report 8, traced from Mouse.exe 0x415550; validated over SC650 dongle 1d57:fa60.
const defaults = [2, 3, 4, 13, 13, 60, 5, 6, 60, 1, 1, 1, 1, 1, 1, 1, 10, 9];
export const keys = Object.freeze(Object.fromEntries([
  ...Array.from({length:26},(_,i)=>[String.fromCharCode(65+i),4+i]),
  ...Array.from({length:9},(_,i)=>[String(i+1),30+i]), ['0',39],
  ...Array.from({length:12},(_,i)=>['F'+(i+1),58+i]),
  ['Enter',40],['Escape',41],['Backspace',42],['Tab',43],['Space',44],
  ['Minus',45],['Equal',46],['Left bracket',47],['Right bracket',48],['Backslash',49],
  ['Semicolon',51],['Quote',52],['Grave',53],['Comma',54],['Period',55],['Slash',56],
  ['Print Screen',70],['Scroll Lock',71],['Pause',72],['Insert',73],['Home',74],['Page Up',75],
  ['Delete',76],['End',77],['Page Down',78],['Right',79],['Left',80],['Down',81],['Up',82],
  ['Left Ctrl',224],['Left Shift',225],['Left Alt',226],['Left Super',227],['Right Ctrl',228],['Right Shift',229],['Right Alt',230],['Right Super',231],
]));
export const buttonSlots={left:0,right:1,middle:2,rear:6,front:7};
// Wire triples taken from Mouse.exe table at 0x41e478.
export const actions=Object.freeze({left:['Left click',2,0,0],right:['Right click',3,0,0],middle:['Middle click',4,0,0],back:['Back',5,0,0],forward:['Forward',6,0,0],double:['Double click',7,0,0],scrollUp:['Scroll up',13,0,0],scrollDown:['Scroll down',14,0,0],scrollRight:['Scroll right',16,0,9],scrollLeft:['Scroll left',41,0,3],dpiCycle:['DPI cycle',10,0,0],dpiUp:['DPI +',11,0,0],dpiDown:['DPI −',12,0,0],profileCycle:['Profile cycle',19,0,0],play:['Play / pause',22,0,0],stop:['Media stop',23,0,0],previous:['Previous track',24,0,0],next:['Next track',25,0,0],volumeUp:['Volume +',26,0,0],volumeDown:['Volume −',27,0,0],mute:['Mute',28,0,0],copy:['Copy',17,1,6],paste:['Paste',17,1,25],cut:['Cut',17,1,27],undo:['Undo',17,1,29],selectAll:['Select all',17,1,4],disabled:['Disabled',1,0,0]});
export function assignmentBytes(value) {
  if (!value || typeof value !== 'object') throw new Error('Invalid button assignment');
  if(Object.hasOwn(actions,value.type))return actions[value.type].slice(1);
  if(value.type==='macro'){if(![17,21].includes(value.macroId))throw new Error('Invalid macro slot');return [18,0,value.macroId];}
  if(value.type!=='key'||!Object.hasOwn(keys,value.key)||!Number.isInteger(value.modifiers)||value.modifiers<0||value.modifiers>15)throw new Error('Invalid key or modifiers');
  return [17,value.modifiers,keys[value.key]];
}
export function buildButtonReport(action) {
  const shortcuts = { f8: [17, 0, 0x41], 'alt-j': [17, 4, 0x0d], back: [5, 0, 0] };
  const assignments=typeof action==='string'
    ? (Object.hasOwn(shortcuts,action)?{rear:shortcuts[action],front:[6,0,0]}:null)
    : Object.fromEntries(Object.entries(buttonSlots).map(([name,slot])=>[name,action?.[name]?assignmentBytes(action[name]):[defaults[slot],0,0]]));
  if(!assignments)throw new Error('Unsupported assignment');
  if(typeof action==='object')for(const [name,value] of Object.entries(action||{}))if(value?.type==='macro'&&value.macroId!==({rear:17,front:21})[name])throw new Error('Macro slot does not match its side button.');
  const report = new Uint8Array(59);
  report.set([8, 59, 1]);
  defaults.forEach((code, slot) => {const name=Object.keys(buttonSlots).find(key=>buttonSlots[key]===slot);report.set(name&&assignments[name]?assignments[name]:[code,0,0],3+slot*3);});
  if(!Object.values(buttonSlots).some(slot=>report[3+slot*3]===2))throw new Error('Keep at least one button assigned to Left click.');
  const sum = report.slice(3, 57).reduce((a, b) => a + b, 0);
  report[57] = (sum >> 8) & 255;
  report[58] = sum & 255;
  return report;
}
