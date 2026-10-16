# Local 3D resources

## Mouse foundation

User-provided archive: `defender-dila-mm-282-mouse.zip`, containing `source/MM-282.glb` (3,001,060 bytes), identified by the user as a Sketchfab download. Saved as `assets/mouse-mm282.glb`. The GLB metadata identifies Blender glTF export but includes no creator or license. No license or attribution file was supplied in the archive. The app preserves the original GLB; its display uses new plain materials without the model's branded base-color textures, partitions the combined top shell into selectable click plates, and adds two SC650-style side keys. It is a visual guide, not a dimensional replica of the SC650. Obtain the original creator/license details before redistributing the model.

## Three.js

Three.js 0.186.1, MIT license in `vendor/three/LICENSE`. Runtime modules copied from the already installed package in the local nexusrigs workspace. Imports in the loader/control/helper modules use relative paths to the included build so they work offline. No global dependencies or Python packages were installed.

## Historical assets

The earlier extracted AULA PNGs remain in assets for research provenance; the current interface neither references nor serves them.

## SC650 reconstruction update

sc650-model.mjs transforms the donor geometry in world coordinates, widens the front/shoulders, lowers the crown, separates and offsets click plates, replaces donor center and thumb controls, and adds SC650-inspired RGB/status lights and technical surface graphics. New labels and a neutral palm emblem use Mouser branding. The source GLB remains unchanged. This is a reconstruction from the reference artwork, not a scan or dimensionally verified SC650 mesh.

## Closed-shell replacement

The stretched donor shell is superseded. The current chassis, palm, click plates and center channel are newly constructed closed indexed solids, fitted to a shared analytic SC650-style outline and crown. The donor GLB supplies the wheel, resized and seated in the center channel. Side keys are closed beveled extrusions mounted against the side wall. RGB and graphics follow the same crown surface. No exact physical dimensions or side reference photographs were supplied, so this remains an approximate reconstruction. `tools/test_sc650_geometry.mjs` checks every indexed shell edge is shared by exactly two triangles, all coordinates are finite, and top/side raycasts select the intended buttons.
