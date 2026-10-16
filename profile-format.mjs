import {buildButtonReport} from './button-protocol.mjs';
import {buildDpiReport,buildRgbReport,buildPollingReport} from './settings-protocol.mjs';
import {buildMacroPackets} from './macro-protocol.mjs';
export function validateProfile(value){
  if(!value||typeof value.name!=='string'||!value.name.trim()||value.name.length>60)throw new Error('Profile name must be 1–60 characters');
  if(!value.buttons?.rear||!value.buttons?.front)throw new Error('Missing button configuration');
  buildButtonReport(value.buttons);buildDpiReport(value.dpi);buildRgbReport(value.rgb);buildPollingReport(value.polling);
  if(value.macros){if(!Array.isArray(value.macros)||value.macros.length>30)throw new Error('Invalid macro library');value.macros.forEach(m=>{if(typeof m.name!=='string'||m.name.length>60)throw new Error('Invalid macro name');buildMacroPackets(m,17);});}
  for(const [side,id] of [['rear',17],['front',21]])if(value.buttons[side]?.type==='macro'){
    if(!value.bindings?.[side])throw new Error('A macro assignment needs its saved macro definition.');
    buildMacroPackets(value.bindings[side],id);
  }
  return value;
}
export function profileReports(value){validateProfile(value);const reports=[];for(const [side,id] of [['rear',17],['front',21]])if(value.buttons[side]?.type==='macro')reports.push(...buildMacroPackets(value.bindings[side],id));return [...reports,buildButtonReport(value.buttons),buildDpiReport(value.dpi),buildRgbReport(value.rgb),buildPollingReport(value.polling)];}
