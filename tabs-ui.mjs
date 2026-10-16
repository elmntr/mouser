const tabs=[...document.querySelectorAll('[role=tab]')];
function select(tab){
  for(const item of tabs){const active=item===tab;item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;document.getElementById(item.getAttribute('aria-controls')).hidden=!active;}
  try{localStorage.setItem('mouser.tab',tab.id);}catch{}
}
for(const [index,tab] of tabs.entries()){
  tab.addEventListener('click',()=>select(tab));
  tab.addEventListener('keydown',event=>{
    const target=event.key==='ArrowRight'?tabs[(index+1)%tabs.length]:event.key==='ArrowLeft'?tabs[(index+tabs.length-1)%tabs.length]:event.key==='Home'?tabs[0]:event.key==='End'?tabs.at(-1):null;
    if(target){event.preventDefault();select(target);target.focus();}
  });
}
try{const saved=localStorage.getItem('mouser.tab');const tab=tabs.find(item=>item.id===saved);if(tab)select(tab);}catch{}
