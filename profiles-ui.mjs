import {currentButtons,sendSettingsReport} from './buttons-ui.mjs';
import {currentSettings} from './settings-ui.mjs';
import {validateProfile,profileReports} from './profile-format.mjs';
const get=id=>document.getElementById(id),key='mouser.profiles.v1';
const readLocal=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
let library={current:0,profiles:[]};
function snapshot(name){return validateProfile({name,buttons:currentButtons(),...currentSettings(),macros:readLocal('mouser.macros.v1',[]),bindings:readLocal('mouser.macroBindings.v1',{})});}
function status(text){get('profile-status').textContent=text;}
function persist(){localStorage.setItem(key,JSON.stringify(library));}
function render(){get('profile-select').replaceChildren(...library.profiles.map((profile,i)=>new Option(profile.name,String(i))));get('profile-select').value=library.current;get('profile-name').value=library.profiles[library.current].name;}
function save(){library.profiles[library.current]=snapshot(get('profile-name').value.trim());persist();render();}
function load(profile){
  validateProfile(profile);
  localStorage.setItem('mouser.side-buttons.v1',JSON.stringify(profile.buttons));localStorage.setItem('mouser.dpi.v1',JSON.stringify(profile.dpi));localStorage.setItem('mouser.rgb.v1',JSON.stringify(profile.rgb));localStorage.setItem('mouser.polling.v1',JSON.stringify(profile.polling));localStorage.setItem('mouser.macros.v1',JSON.stringify(profile.macros??[]));localStorage.setItem('mouser.macroBindings.v1',JSON.stringify(profile.bindings??{}));persist();location.reload();
}
try{
  const saved=readLocal(key,null);
  if(saved&&Array.isArray(saved.profiles)&&saved.profiles.length&&saved.profiles.length<=30&&Number.isInteger(saved.current)&&saved.current>=0&&saved.current<saved.profiles.length){saved.profiles.forEach(validateProfile);library=saved;}
  else library.profiles=[snapshot('Configuration 1')];
  render();
}catch(error){status('Profiles unavailable: '+error.message);}
get('profile-save').onclick=()=>{try{save();status('Profile saved locally. No device changes.');}catch(error){status(error.message);}};
get('profile-select').onchange=()=>{const next=Number(get('profile-select').value);try{save();library.current=next;load(library.profiles[next]);}catch(error){status(error.message);render();}};
get('profile-add').onclick=()=>{try{if(library.profiles.length>=30)throw new Error('Maximum 30 profiles');save();library.profiles.push(snapshot('Configuration '+(library.profiles.length+1)));library.current=library.profiles.length-1;persist();render();status('New profile uses your current choices.');}catch(error){status(error.message);}};
get('profile-delete').onclick=()=>{try{if(library.profiles.length<2)throw new Error('Keep at least one configuration.');library.profiles.splice(library.current,1);library.current=0;load(library.profiles[0]);}catch(error){status(error.message);}};
get('profile-reset').onclick=()=>{try{const profile={name:get('profile-name').value.trim(),buttons:{left:{type:'left'},right:{type:'right'},middle:{type:'middle'},rear:{type:'back'},front:{type:'forward'}},dpi:{stages:[800,1600,2400,3200,6400,12000],active:2,angleSnap:false,ripple:true},rgb:{mode:7,brightness:8,speed:6,color:'#00ff00',sleep:1,deepSleep:10,response:4},polling:500,macros:[],bindings:{}};validateProfile(profile);library.profiles[library.current]=profile;load(profile);}catch(error){status(error.message);}};
get('profile-export').onclick=()=>{try{save();const url=URL.createObjectURL(new Blob([JSON.stringify({format:'mouser-profile-v1',profile:library.profiles[library.current]},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='mouser-profile.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){status(error.message);}};
get('profile-import').onchange=async event=>{try{const file=event.target.files[0];if(!file)return;if(file.size>1000000)throw new Error('Profile file too large');const data=JSON.parse(await file.text());if(data.format!=='mouser-profile-v1')throw new Error('Unsupported profile format');validateProfile(data.profile);if(library.profiles.length>=30)throw new Error('Profile library full');save();library.profiles.push(data.profile);library.current=library.profiles.length-1;load(data.profile);}catch(error){status(error.message);}finally{event.target.value='';}};
get('profile-apply').onclick=async()=>{const button=get('profile-apply');button.disabled=true;try{save();const reports=profileReports(library.profiles[library.current]);await sendSettingsReport(reports);status('Profile commands sent. Check mouse behavior. A failed upload may be partial.');}catch(error){status(error.message);}finally{button.disabled=false;}};
