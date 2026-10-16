const selects=new Map(),colors=new Map();let popup=null,owner=null;
function close(focus=false){if(!popup)return;popup.remove();popup=null;owner?.setAttribute('aria-expanded','false');if(focus)owner?.focus({preventScroll:true});owner=null;}
function open(trigger,content){close();owner=trigger;popup=content;content.classList.add('control-popover');document.body.append(content);trigger.setAttribute('aria-expanded','true');const r=trigger.getBoundingClientRect(),width=Math.min(Math.max(r.width,280),380,innerWidth-24);content.style.width=width+'px';content.style.left=Math.max(12,Math.min(r.left,innerWidth-width-12))+'px';const maxHeight=Math.min(330,innerHeight-24);content.style.maxHeight=maxHeight+'px';const height=Math.min(content.scrollHeight,maxHeight);content.style.top=(r.bottom+8+height<=innerHeight-12?r.bottom+8:Math.max(12,r.top-height-8))+'px';}
function emit(input){input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));}
function label(input){return input.getAttribute('aria-label')||input.closest('label')?.childNodes[0]?.textContent?.trim()||'Choose option';}
function selectControl(select){
 const button=document.createElement('button');button.type='button';button.className='select-trigger';button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');select.after(button);select.classList.add('native-control');select.tabIndex=-1;select.setAttribute('aria-hidden','true');selects.set(select,button);
 button.onclick=()=>{
  if(owner===button){close();return;}
  const panel=document.createElement('div');panel.className='select-popover';const all=[...select.options],search=document.createElement('input'),list=document.createElement('div');list.role='listbox';list.setAttribute('aria-label',label(select));list.id='active-options';button.setAttribute('aria-controls',list.id);
  let active=Math.max(0,select.selectedIndex),visible=all;
  const choose=option=>{if(option.disabled)return;select.value=option.value;close(true);emit(select);sync();};
  function render(){list.replaceChildren();visible=all.filter(o=>o.text.toLowerCase().includes(search.value.toLowerCase()));visible.forEach((option,i)=>{const item=document.createElement('button');item.type='button';item.role='option';item.id='custom-option-'+i;item.setAttribute('aria-selected',String(option.selected));item.disabled=option.disabled;item.className='select-option';item.textContent=option.text;item.tabIndex=-1;item.onclick=()=>choose(option);list.append(item);});if(!visible.length){const empty=document.createElement('p');empty.className='no-options';empty.textContent='No matching options';list.append(empty);}active=Math.max(0,Math.min(active,visible.length-1));highlight();}
  function highlight(){[...list.querySelectorAll('[role=option]')].forEach((item,i)=>item.classList.toggle('active',i===active));search.setAttribute('aria-activedescendant','custom-option-'+active);list.querySelector('.active')?.scrollIntoView({block:'nearest'});}
  search.type='search';search.placeholder='Find an option…';search.setAttribute('aria-label','Search '+label(select));search.setAttribute('aria-controls',list.id);search.setAttribute('role','combobox');search.setAttribute('aria-expanded','true');search.autocomplete='off';search.oninput=()=>{active=0;render();};
  panel.append(search,list);render();open(button,panel);search.focus({preventScroll:true});highlight();
  search.onkeydown=event=>{if(['ArrowDown','ArrowUp','Home','End','Enter'].includes(event.key)){event.preventDefault();if(event.key==='Enter'){if(visible[active])choose(visible[active]);return;}active=event.key==='Home'?0:event.key==='End'?visible.length-1:(active+(event.key==='ArrowDown'?1:-1)+visible.length)%visible.length;highlight();}};
 };
 button.onkeydown=event=>{if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();button.click();}};
}
function colorControl(input){
 const button=document.createElement('button');button.type='button';button.className='color-trigger';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-expanded','false');input.after(button);input.classList.add('native-control');input.tabIndex=-1;input.setAttribute('aria-hidden','true');colors.set(input,button);
 button.onclick=()=>{
  if(owner===button){close();return;}
  const panel=document.createElement('div');panel.className='color-popover';panel.role='dialog';panel.setAttribute('aria-label',label(input));
  const title=document.createElement('div');title.className='color-heading';title.textContent='Choose a color';const done=document.createElement('button');done.type='button';done.className='color-done';done.textContent='Done';done.onclick=()=>close(true);title.append(done);
  const palette=document.createElement('div');palette.className='color-palette';const hexLabel=document.createElement('label');hexLabel.textContent='HEX';const hex=document.createElement('input');hex.type='text';hex.maxLength=7;hex.setAttribute('aria-label','Hex color');hexLabel.append(hex);const channels=[];
  function update(value){input.value=value;emit(input);paint();sync();}
  for(const value of ['#ff5252','#ff9b54','#ffd166','#b5e56b','#57d9a3','#68dfdc','#64b5ff','#818cf8','#ba8dff','#f38bcc','#ffffff','#131b24']){const swatch=document.createElement('button');swatch.type='button';swatch.className='palette-swatch';swatch.style.background=value;swatch.setAttribute('aria-label','Use '+value);swatch.onclick=()=>update(value);palette.append(swatch);}
  const rows=document.createElement('div');rows.className='color-channels';
  for(const [index,name] of ['Red','Green','Blue'].entries()){const row=document.createElement('label');row.textContent=name;const range=document.createElement('input'),output=document.createElement('output');range.type='range';range.min=0;range.max=255;range.setAttribute('aria-label',name);range.oninput=()=>update('#'+channels.map(c=>Number(c.range.value).toString(16).padStart(2,'0')).join(''));row.append(range,output);rows.append(row);channels.push({range,output,index});}
  function paint(){hex.value=input.value.toUpperCase();hex.setCustomValidity('');channels.forEach(({range,output,index})=>{range.value=parseInt(input.value.slice(1+index*2,3+index*2),16);output.value=range.value;});}
  hex.oninput=()=>{if(/^#[0-9a-f]{6}$/i.test(hex.value))update(hex.value.toLowerCase());else hex.setCustomValidity('Use # followed by six hex digits');};
  panel.append(title,palette,hexLabel,rows);paint();open(button,panel);hex.focus({preventScroll:true});
 };
}
function sync(){
 for(const [input,button] of selects){if(!input.isConnected){button.remove();selects.delete(input);continue;}button.textContent=input.selectedOptions[0]?.text||'Select…';button.setAttribute('aria-label',label(input)+': '+button.textContent);button.disabled=input.matches(':disabled');}
 for(const [input,button] of colors){if(!input.isConnected){button.remove();colors.delete(input);continue;}button.textContent=input.value.toUpperCase();button.style.setProperty('--swatch',input.value);button.setAttribute('aria-label',label(input)+': '+input.value);button.disabled=input.matches(':disabled');}
}
function discover(){document.querySelectorAll('select:not(.native-control)').forEach(selectControl);document.querySelectorAll('input[type=color]:not(.native-control)').forEach(colorControl);sync();}
document.addEventListener('pointerdown',event=>{if(popup&&!popup.contains(event.target)&&!owner.contains(event.target))close();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&popup){event.preventDefault();close(true);}else if(event.key==='Tab'&&popup){close(true);}});
document.addEventListener('change',sync);window.addEventListener('resize',()=>close());document.addEventListener('scroll',event=>{if(popup&&!popup.contains(event.target))close();},true);
// Observe structural/disabled changes, not our own trigger text or styles.
let scheduled=false;new MutationObserver(records=>{if(records.some(r=>(r.type==='attributes'&&r.target.matches('select,input,fieldset'))||(r.type==='childList'&&[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&(n.matches('select,option,input[type=color]')||n.querySelector?.('select,input[type=color]')))))){if(!scheduled){scheduled=true;queueMicrotask(()=>{scheduled=false;discover();});}}}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled']});
discover();
