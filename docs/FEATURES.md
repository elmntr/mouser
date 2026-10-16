# Original software feature coverage

Implemented from the supplied Mouse.exe, without running it:

| Area | Available | Status / limit |
|---|---|---|
| Buttons | Five buttons; key combinations; clicks; scroll; DPI; media; editing shortcuts | Rear keyboard mapping confirmed; other actions need individual hardware testing. Profile-cycle opcode may require vendor host software. |
| DPI | Six values, active stage, enable/disable stages, stage colors, angle snapping, ripple control | DPI confirmed. Range currently 50–12000; not every new option tested. |
| Polling | 125 / 250 / 500 / 1000 Hz | Report 6 traced; hardware unverified. |
| Lighting | Twelve modes, color, speed, brightness, normal/deep sleep, click response | Report 5 traced; hardware unverified. |
| Macros | Local library, keyboard recording, key/mouse events, reorder, delay, repeat/hold/toggle, side-button upload, JSON import/export | Hardware unverified. Maximum 47 events, delays 2–127 ms; balanced presses/releases required. Original longer macros/delays not yet supported. |
| Configurations | Add, save/rename, switch, delete, reset draft, JSON import/export, apply all | Browser-local profiles, not vendor binary files or device profile readback. |

No automatic device writes. Connecting, editing, loading or resetting drafts changes no hardware. Apply profile sends the full button table, DPI, RGB, polling, and any bound macros; failure can leave a partially applied configuration. Button reports reset unexposed slots to vendor defaults. Existing mouse settings cannot be read or backed up reliably.

Macro constructor constants at Mouse.exe VA 0x422890 / 0x4228a0 give button-specific indices [1,5,9,13,0,0,17,21]; rear slot 6 uses macro 17 and front slot 7 uses 21. Logical report 9 is 131 bytes including checksum, carried in three 64-byte feature reports (last declared length 12). Playback must be tested before assuming this reconstruction works.

Unimplemented: reliable settings/battery readback, wired/Bluetooth configuration, full original macro limits, Windows binary profile import, and any hidden/untraced sensor or firmware controls. This is not yet full feature parity.

Validation: tools/test_button_protocol.mjs, tools/test_settings_protocol.mjs, tools/test_feature_parity.mjs and seven Python standard-library tests. Browser checked five-button controls, six DPI columns, macro and profile panels; collapsed desktop layout fits without page scrolling. No new hardware reports were sent during this expansion.

## Mouser customization

The current UI removes vendor branding and uses a locally served 3D preview based on the supplied Defender model. Five button hotspots and direct click-plate/wheel/side-key hits open one editor at a time. Drag rotates the model; top, side and reset views are available. Keyboard users can use the five button selectors, or focus the canvas and use Left/Right then Enter to focus the selected editor. The library and model are local; no CDN is used. If WebGL fails, the button selector and settings stay available. See THIRD_PARTY.md for provenance.

Connection reuses matching devices returned by WebHID getDevices; requestDevice is called only for first pairing or explicit Choose device. The browser owns the pairing dialog and its styling. Verified a real paired-dongle reconnect without that dialog. No settings reports were sent. New connection validation and region selection checks: node tools/test_customization.mjs. Browser verified direct right-plate selection, hotspot selection, rotation, saved-tab restoration, clean console, 1366×768 collapsed desktop layouts without page scrolling, and a stacked narrow layout with no horizontal overflow.

Custom page-owned searchable selectors replace native select popups throughout the interface, including dynamically created macro events. A page-owned color palette with RGB sliders and hex input replaces the native color dialog. These controls dispatch the existing input/change events and retain protocol validation and local draft storage. Browser checks exercised action search/selection, color palette edits and restoration, and profile dropdowns without hardware writes.

## Supplied photo reference pass

Black finish retained across all shell/side-key materials; selecting a button no longer adds colored emissive tint. Left click is shortened above the inset display, while the right click extends lower as in the supplied SC650 photos. Added a recessed front USB-C bezel/opening/tongue and surface markings. The model screen is explicitly labeled DRAFT and shows browser-local DPI and polling selections. It does not fabricate battery, temperature or device readback. Geometry tests cover the staggered plates, display placement, connector presence and black material bounds.

Thumb-button correction: both keys now follow the actual side-wall curvature along their full length, with a 2.8 mm face height and less than 0.5 mm outward projection. Anchors follow the fitted key centers. Geometry tests enforce the projection limit and side-ray selection.
