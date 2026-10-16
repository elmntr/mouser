export const mouseButtons = Object.freeze([
  {id:'left',number:1,label:'Left button',point:[-.015,.031,.028]},
  {id:'right',number:2,label:'Right button',point:[.015,.031,.028]},
  {id:'middle',number:3,label:'Wheel button',point:[0,.029,.035]},
  {id:'front',number:4,label:'Front side button',point:[-.032,.024,.017]},
  {id:'rear',number:5,label:'Rear side button',point:[-.031,.027,-.002]},
]);
// The supplied mesh combines both click plates and the palm shell.
export function clickPlate(x,z){return z>-.0005?(x<0?'left':'right'):null;}
export function getMouseButton(id){return mouseButtons.find(button=>button.id===id);}
