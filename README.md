# SC650 Linux experiments

Rear-side-button to F8 is confirmed working on the SC650 via USB dongle 1d57:fa60: a native report-8 transfer returned 59 bytes and the user confirmed F8 output. Wired mode 1d57:205e returned a protocol error and is not supported by the web controls.

## Local web controls

The Mouser interface has its own branding and an interactive local 3D mouse. Drag to rotate, select a numbered hotspot or click a button surface, then edit that button in the adjacent panel. Top/side/reset views and a keyboard-accessible button selector are included. The supplied Defender MM-282 model is a visual foundation, not an exact SC650 replica. See docs/THIRD_PARTY.md for asset provenance. No CDN or runtime package installation is required.

Run `node server.mjs` from this directory and open http://127.0.0.1:8767 in Brave or Chrome. No dependencies or package installation are needed. Click Connect mouse to reuse an authorized dongle without reopening the browser chooser. First pairing and Choose device use the browser-owned HID dialog, whose appearance cannot be customized. Connecting never sends settings. Connect the dongle, choose actions for the five numbered buttons and click Apply. Buttons support keyboard shortcuts, clicks, scrolling, media controls, DPI actions and editing shortcuts. At least one button must retain Left click. Letters, digits, F1–F12, navigation keys and common punctuation are included. HID key positions follow the active OS keyboard layout.

Both selections are saved together in this browser's local storage when edited and reloaded on future visits. Saved choices are a draft, not mouse readback or proof of a successful apply; connecting or reloading never sends them automatically. The first-use suggestions are rear Alt+J and front Forward. A local key tester is included. The user confirmed the original page successfully applied Alt+J over WebHID. The expanded front-button/custom-key controls use the same traced packet format, but their individual hardware combinations remain unverified. Browser persistence and control behavior were tested without sending new assignments.

The Windows application's report 8 replaces all 18 button/action slots. The mapping sets the rear side button (slot 6, default Backward) and fills other slots using the supplied application's default profile. Any other custom button assignments are replaced. Existing configuration could not be backed up; restoring defaults does not restore custom settings. The user reported the previous rear shortcut was Alt+J, now offered explicitly as a restore option.

Offline checks (Python standard library only, no package installation):

```sh
python3 -m unittest discover -s tools -p 'test_*.py'
python3 tools/button_mapping.py rear-f8
python3 tools/button_mapping.py defaults
```

The tested native write command (dongle mode) is:

```sh
python3 tools/button_mapping.py rear-f8 --apply
```

To restore the known previous rear shortcut (other buttons still use vendor defaults):

```sh
python3 tools/button_mapping.py rear-alt-j --apply
```

The vendor-default button-table restore command is:

```sh
python3 tools/button_mapping.py defaults --apply
```

All write commands target only report 8, leave DPI/RGB/macro reports unsent, and log the exact attempted bytes in docs/evidence. Restore assignments use the traced format but have not individually been verified on hardware. A successful USB transfer alone does not prove the mapping worked; verify in the key tester and check normal clicks and scrolling.

## Experimental DPI and lighting

The page has compact Buttons, DPI and Lighting tabs with separate Apply actions. The user confirmed DPI works on the SC650; lighting still needs explicit hardware confirmation. Nothing is sent automatically. Settings scope is available under What gets applied; Apply sends the visible tab's settings without an extra checkbox. Local drafts and the selected tab are remembered. The normal collapsed-detail layout fits the tested desktop viewport; smaller screens and expanded details can scroll.

DPI sends six stages (50–12000, steps of 50 through 10000 then 100), active stage, angle snapping, ripple control and editable stage colors and enabled stages. It replaces existing custom stages/colors. Lighting sends effect/color/brightness/speed together with the displayed normal sleep, deep sleep and click-response values; these share a report and cannot currently be preserved through readback. Values are browser-local drafts, not current device readings. Neither operation sends the button table or macro data.

Serializers follow the supplied Aula executable, not the incompatible X11 DPI lookup table or its RGB checksum shortcuts. Run `node tools/test_settings_protocol.mjs` for DPI bounds, checksum, layout and RGB fixture checks. Browser confirmation/disconnected-device handling has been checked without a hardware write. Expanded original-style features and remaining limits are listed in docs/FEATURES.md. See PLAN.md and docs/PROTOCOL.md for evidence.

UI checks: `node tools/test_customization.mjs` covers granted-device reuse, explicit device selection, cancellation, device validation and mouse region classification. Browser checks verified direct mesh selection, hotspot/editor synchronization, rotation, paired-device reconnection and 1366×768 layouts without page scrolling. Narrow screens use a stacked layout.

## Bluetooth investigation

The main interface now has **Connect Bluetooth**. Rear side button → F8 was confirmed on the physical SC650 over Bluetooth on 2026-10-16. Button mappings use the original app's FEE3 write path. DPI and lighting can be applied experimentally and still need physical confirmation over Bluetooth. Polling, macro uploads and full profile apply remain dongle-only; local profile editing still works. Connecting never applies saved settings.

The separate /bluetooth.html page retains the battery/service diagnostic and explicit F8 test. Brave on Linux needs its Web Bluetooth API flag enabled. See docs/BLUETOOTH.md for evidence and limitations.

Mouser automatically reconnects to previously authorized mice on load, when returning to the page, and every 10 seconds while the page is visible. It prefers the last successful connection type. Automatic attempts never display a chooser or apply settings. First-time permission still requires Connect; browsers without Bluetooth.getDevices need a manual Bluetooth connection.
