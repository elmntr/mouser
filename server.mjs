import http from 'node:http';
import { readFile } from 'node:fs/promises';
const files = new Map([['/', ['buttons.html', 'text/html']], ['/button-protocol.mjs', ['button-protocol.mjs', 'text/javascript']], ['/probe', ['probe.html', 'text/html']], ['/key-test', ['key-test.html', 'text/html']]]);
files.set('/bluetooth.html',['bluetooth.html','text/html']);
files.set('/bluetooth-read.mjs',['bluetooth-read.mjs','text/javascript']);
files.set('/bluetooth-probe.mjs',['bluetooth-probe.mjs','text/javascript']);
files.set('/favicon.svg', ['favicon.svg', 'image/svg+xml']);
files.set('/buttons-ui.mjs', ['buttons-ui.mjs', 'text/javascript']);
files.set('/settings-protocol.mjs', ['settings-protocol.mjs', 'text/javascript']);
files.set('/settings-ui.mjs', ['settings-ui.mjs', 'text/javascript']);
files.set('/tabs-ui.mjs', ['tabs-ui.mjs', 'text/javascript']);
files.set('/studio.css', ['studio.css', 'text/css']);
files.set('/customization.css', ['customization.css', 'text/css']);
files.set('/custom-controls.css',['custom-controls.css','text/css']);
for(const name of ['sc650-model','custom-controls','mouse-view','mouse-selection','hid-connection','macro-protocol','macros-ui','profile-format','profiles-ui'])files.set('/'+name+'.mjs',[name+'.mjs','text/javascript']);
files.set('/assets/mouse-mm282.glb',['assets/mouse-mm282.glb','model/gltf-binary']);
for(const name of ['build/three.module.js','build/three.core.js','examples/jsm/loaders/GLTFLoader.js','examples/jsm/controls/OrbitControls.js','examples/jsm/utils/BufferGeometryUtils.js','examples/jsm/utils/SkeletonUtils.js'])files.set('/vendor/three/'+name,['vendor/three/'+name,'text/javascript']);
const server = http.createServer(async (request, response) => {
  const file = files.get(request.url);
  if (request.method !== 'GET' || !file) {response.writeHead(404);response.end();return;}
  try {
    const content = await readFile(new URL(file[0], import.meta.url));
    response.writeHead(200, {'Content-Type': file[1]+'; charset=utf-8', 'Cache-Control':'no-store', 'Permissions-Policy':'hid=(self)', 'Content-Security-Policy':"default-src 'none'; img-src 'self' blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' blob:; frame-ancestors 'none'"});
    response.end(content);
  } catch {response.writeHead(500);response.end('Unable to read local page.');}
});
server.on('error', error => {console.error(error.message);process.exitCode=1;});
server.listen(8767, '127.0.0.1', () => console.log('Mouser: http://127.0.0.1:8767'));
