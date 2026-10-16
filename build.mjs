import {mkdir,cp,copyFile,rm} from 'node:fs/promises';
const out=new URL('./dist/',import.meta.url);
await rm(out,{recursive:true,force:true});
await mkdir(new URL('assets/',out),{recursive:true});
await copyFile(new URL('./buttons.html',import.meta.url),new URL('index.html',out));
for(const name of ['bluetooth.html','bluetooth-read.mjs','bluetooth-probe.mjs','favicon.svg','studio.css','customization.css','custom-controls.css','buttons-ui.mjs','button-protocol.mjs','settings-ui.mjs','settings-protocol.mjs','tabs-ui.mjs','macros-ui.mjs','macro-protocol.mjs','profiles-ui.mjs','profile-format.mjs','mouse-view.mjs','mouse-selection.mjs','sc650-model.mjs','custom-controls.mjs','hid-connection.mjs'])await copyFile(new URL(name,import.meta.url),new URL(name,out));
await copyFile(new URL('./assets/mouse-mm282.glb',import.meta.url),new URL('assets/mouse-mm282.glb',out));
await cp(new URL('./vendor/',import.meta.url),new URL('vendor/',out),{recursive:true});
console.log('Built static site in dist/');
