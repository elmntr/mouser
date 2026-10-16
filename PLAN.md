# AULA SC650 Linux configurator

## Goal

Create a web-based configurator with parity with the original Windows application's supported features. No Windows installation is currently available. Start with static binary analysis and read-only hardware discovery.

## Confirmed findings

- The supplied RAR contains three byte-identical Inno Setup installers (SHA-256 `e1d0a3d4cb8728952e6aecb18bba3dc752f9d67da8666c26545d2f17127b2c0b`). Extracted without running the installer.
- The application includes readable XML UI resources, `Mouse.exe`, `hidapi.dll`, and `hiddriver_1.dll` / `hiddriver_2.dll`.
- The attached USB dongle identifies as `1d57:fa60`, product `2.4G Wireless Device`. These VID/PID strings also occur in `Mouse.exe`.
- Four HID interfaces are visible in sysfs: keyboard, mouse, composite controls/configuration, and another keyboard interface.
- The composite interface (`input2`, currently sysfs hidraw3) exposes feature reports in a separate top-level collection on usage page `0x0b`, usage `0`. This is a candidate configuration channel; it is not a vendor-defined usage page. Browser exposure remains untested.
- Feature report IDs and payload lengths, excluding the report ID byte: `04:55`, `05:14`, `06:8`, `07:7`, `08:58`, `09:63`, `0a:7`, `0b:7`, `0c:9`, `10:7`, `a0:7`, `22:133`, `23:133`, `24:7`, `25:14`, `26:8`, `27:7`, `28:132`, `29:63`, `2a:132`, `2b:7`, `2c:9`, `2d:132`, `2e:6`. These are descriptor declarations, not decoded commands.
- The driver DLL exports include `GetFeature`, `SetFeature`, `Hid_Read`, `Hid_Write`, and `Set_VIDPID`; Windows HID feature APIs are imported.
- The execution environment can read sysfs but does not expose `/dev/hidraw*`. Device communication is not yet tested; this is not proof of a host permission problem.

## Feature inventory to verify

UI resources mention editable DPI stages; RGB modes, brightness, speed and color; button remapping and shortcuts; macro actions/delays/repetition/import/export; profile add/rename/delete/import/export/reset; polling rate; battery and sleep management. Localization also mentions debounce, lift-off distance, angle snapping, ripple control and motion sync. Some controls are hidden or shared-template resources; verify actual SC650 availability and limits before implementing.

## Milestones

1. Trace device selection and report construction in the binaries. Document settings layouts, lengths, checksum rules and read/write/save behavior, with evidence and confidence levels.
2. Establish browser visibility of the configuration collection. Prefer direct WebHID; retain a small localhost helper as a fallback if browser restrictions or required host features demand it. Scope Linux device permissions to the verified hardware.
3. Read existing configuration using understood requests; preserve original report bytes. A read request may still require a protocol command write, so classify by verified semantics rather than USB transfer direction.
4. Verify one reversible DPI change, then reconnect persistence. Preserve unknown fields and avoid firmware, pairing or factory-reset commands during discovery.
5. Implement DPI, lighting, buttons, profiles and macros incrementally. Validate actual mouse behavior, timing, limits, and persistence. Determine which features require a running host process.
6. Revisit wired and Bluetooth transports separately; do not assume USB configuration reports work over Bluetooth.

## Current next step

Direct WebHID connection to the dongle is confirmed. Dongle GET_FEATURE reads returned mismatched-report-ID data. The user installed the expanded rule and reconnected wired mode (1d57:205e): access now works, but DPI and lighting GET_FEATURE requests both time out with errno 110. These are not usable settings backups. No settings writes were performed. Stop blind reads and continue static tracing of initialization/query/reset behavior; a proprietary read sequence or a deliberately constructed replacement profile may be necessary. A stdlib read-only diagnostic and four passing offline tests are in tools/. See docs/PROTOCOL.md for evidence and limits.

Latest: user authorized a first button experiment and selected rear side button to F8. A traced report-8 builder and vendor-default restore are implemented; all six offline tests pass. Hardware execution was blocked by auto-review because report 8 replaces the entire button table, potentially losing other custom assignments. Await explicit whole-table-replacement approval before any retry. No settings write occurred. README.md explains the exact scope and commands.

Follow-up: user explicitly approved whole-table replacement. The wired SET_FEATURE attempt executed once and returned errno 71 (Protocol error); success is not established. Do not assume the mouse stayed unchanged solely from this error. A local key tester is prepared at http://127.0.0.1:8766 to verify rear-button behavior before any further writes. No blind retry or default restore has been sent.

Breakthrough: user confirmed Alt+J was an older onboard assignment and remained after the failed wired attempt. After switching to dongle mode, the same report-8 write returned 59 bytes and the user confirmed rear-button F8 output. A working single-feature local web utility is implemented at buttons.html / server.mjs (localhost:8767), offering rear-button F8, known previous Alt+J, or Back. Browser serialization matches the successful native packet exactly; seven Python offline tests plus JS packet checks pass. Page rendering and key-event tester were checked in Brave. Hardware write through the new page itself remains untested; native write and WebHID device access are separately confirmed. Scope remains rear-button assignment; other features require further work.

User then confirmed the web page successfully applied Alt+J. Latest requested expansion is complete: both side buttons now support custom standard keyboard keys plus Ctrl/Shift/Alt/Super, Back, Forward and Disabled. Choices are saved together as browser-local drafts. Front button uses SC650 slot 7; rear uses verified slot 6. Packet validation tests cover both slots, full modifier masks, checksums, unchanged other slots and rejection of invalid input. Browser tests verified edits and persistence through reload, then restored suggested choices rear Alt+J/front Forward without writing hardware. Expanded custom combinations and front-slot physical behavior still need user verification. No new hardware writes were made during this expansion.

Latest expansion: user requested DPI/RGB implementation using existing Beken projects as references. Added settings-protocol.mjs with SC650 binary-derived reports 4 (56 bytes) and 5 (15 bytes), validation/checksums, and settings-ui.mjs with separate reviewed Apply actions and local drafts. UI exposes shared sensor settings for DPI and shared sleep/debounce for lighting, rather than silently replacing them. Related X11 code corroborates framing but differs in DPI encoding and RGB checksum, so it was not copied. Offline tests and browser rendering/confirmation/disconnected handling pass. Hardware validation of DPI/RGB is still pending; no new settings writes occurred. First suggested user test: connect dongle and apply static green lighting after reviewing shared fields.

User confirmed DPI works on hardware. RGB success is not yet explicitly confirmed. User requested a compact UI without scrolling/default-heavy presentation. Replaced stacked sections with Buttons/DPI/Lighting tabs, retained local drafts, removed redundant per-apply checkboxes (explicit Apply remains), and moved scope explanations into What gets applied disclosures. Actual packet contents/reset behavior remain unchanged and are disclosed. Verified all three collapsed-detail tabs fit the current desktop viewport (919px high); mobile or expanded details may scroll. No settings writes occurred during the redesign.
