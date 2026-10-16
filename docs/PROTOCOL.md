# SC650 protocol investigation

Status: static analysis plus read-only connection and GET_FEATURE experiments; no settings writes. Addresses below are virtual addresses in the supplied x86 Mouse.exe (image base 0x400000), not source line numbers. Byte offsets include the report ID unless explicitly stated otherwise.

## Device selection

At 0x4093f3 the application enumerates 1d57:fa60, then checks usage page 0x0b or 0x0a. The 0x0b path additionally requires usage 0 at 0x409464. This matches the attached dongle's configuration collection exactly.

Constructor 0x40eae8 also sets a 1d57:205e pair. Its transport association needs confirmation; do not assume it is the wired SC650 until verified on hardware.

At 0x40f9e7 the program loads GetFeature and stores its pointer at object+0x44. Its presence alone does not establish a working settings-readback operation. No configuration readback sequence has been established yet. Existing profiles might be maintained on the host.

## Message builders

| Purpose | Builder | Report ID | Total bytes passed to sender |
| --- | --- | --- | --- |
| DPI and related settings | 0x414e30 | 0x04 | 56 |
| Lighting | 0x414ba9–0x414c96 | 0x05 | 15 |
| Polling rate | 0x414caa–0x414d08 | 0x06 | 9 |
| Button assignments | 0x415550 | 0x08 | 59 |
| Macro logical message | 0x4151b0 | 0x09 | 131 before transport splitting |

Sender 0x414390 handles transport selection. Report 0x09 is specially transformed into 64-byte packets with a 4-byte header and 60-byte data chunks. This needs further tracing before implementing macros: the logical message length differs from the descriptor's 64-byte report size. Do not send the unsplit logical message directly.

## DPI message (static observations)

Builder 0x414e30 initializes a buffer with `04 38 01`. It processes eight slots, which is a software capacity rather than proof that all eight are enabled on the SC650.

| Offset | Observation |
| --- | --- |
| 0 | Report ID 0x04 |
| 1 | 0x38 (56-byte total message length) |
| 2 | Constant 1; semantic meaning unresolved |
| 3–4 | Values from profile offsets 0x944 and 0x940; meanings unresolved |
| 5 | Bitmask derived from eight profile values at 0x904–0x920 |
| 6–7 | Repeated bitmask identifying internal DPI values greater than 220 |
| 8–15 | Low bytes of eight converted DPI values |
| 16–23 | High bytes of those values |
| 24 | Selected DPI slot plus one (profile offset 0x934) |
| 25–48 | Eight three-byte color values from profile offset 0x960, stride 4 |
| 49 | Constant 1 |
| 50–51 | Big-endian 16-bit sum of bytes 3 through 49 |
| 52–55 | Zero in the initialized buffer |

Conversion of internal slider value n, from 0x414fb0:

- n = 0 leaves its initialized output bytes zero.
- 1 through 200: n × 50.
- 201 through 220: (n − 100) × 100.
- Above 220: ((n − 100) × 100) / 2, with the corresponding high-range mask bit set.

This is the application's encoding calculation, not a calibrated physical DPI claim. Exact user-entered range, rounding, model-specific restrictions, and the role of the second internal DPI array at 0x8e4 remain unresolved.

## Lighting message

The builder starts `05 0f 01`, packs mode and other controls into bytes 3–5, writes a color into bytes 6–8, then additional settings at 9–10. Bytes 11–12 contain the big-endian sum of bytes 3–10; bytes 13–14 remain zero. Mode comes from profile offset 0x94c and is shifted into the high nibble of byte 3. Brightness/speed and mode-dependent packing need validation before exposing controls.

## Polling-rate message

The builder writes `06 09 01 RATE COMPLEMENT 00 00 00 00`, with COMPLEMENT = bitwise NOT of RATE within one byte. UI indices 0–3 map to RATE values 8, 4, 2, 1. The UI assets associate these controls with 125, 250, 500, and 1000 Hz respectively; actual output rates remain unmeasured.

## Access finding

Outside the execution sandbox, /dev/hidraw3 exists as root:root mode 0600. An O_RDONLY | O_NONBLOCK open as the current user returned EACCES, without sending any report. Browser/native access therefore requires a host permission adjustment. No permission was changed.

The current node name is temporary and can change on reconnect. Match the dongle VID/PID in a udev rule, rather than relying on hidraw3. Browser compatibility still needs a real WebHID test after permission setup.

## Evidence

Selected disassembly and the raw HID report descriptor are preserved in docs/evidence. Full extracted installer contents remain in /tmp/mouser-inspect and are temporary. No vendor executable was run and no packages were installed into the system.

SHA-256 of Mouse.exe: `95fd3bd2613bb681e9bcc60e9bb53f2c4aadb67f4f058d793c0f1775ce81174f`.

SHA-256 of hiddriver_1.dll: `f9efbf0630218b3e13e894b132d77ceb16113acef1bc841e25af8ce57eac39f4`.

## Prepared permission rule

The initial 90-aula-sc650.rules was installed by the user, but verification after reconnect still returned EACCES. The device had the uaccess tag but no user ACL: the rule ran after 73-seat-late.rules, which schedules the uaccess builtin. The corrected repository file is 70-aula-sc650.rules, which runs before that rule and matches only USB 1d57:fa60 interface 02 (confirmed ID_USB_INTERFACE_NUM from udev properties). The installed rule still needs replacement and reloading, then a reconnect. This enables access but does not send reports or confirm WebHID support.

Follow-up verification after the user installed the corrected rule and reconnected: configuration node /dev/hidraw3 has user:justin:rw-, and O_RDONLY | O_NONBLOCK open succeeds. Other dongle interfaces remain root-only. The standalone probe.html requests only the matching configuration collection, opens it, summarizes exposed report metadata and closes it. It contains no sendReport, sendFeatureReport or receiveFeatureReport calls. Browser selection/result is pending.

Browser result verified in Brave: opened=true for vendorId 7511 (0x1d57), productId 64096 (0xfa60). Usage page 11 / usage 0 exposes all 24 expected feature report IDs with matching payload bit lengths, including DPI report 4 (440 bits), lighting report 5 (112 bits), polling report 6 (64 bits), button report 8 (464 bits), and macro report 9 (504 bits). Browser connection and metadata visibility are confirmed. No actual report transfer, settings readback, write acceptance or persistence has been tested.

## Readback experiments and recovery investigation

Linux HIDIOCGFEATURE was issued on an O_RDONLY handle for dongle report 4 twice (56 bytes), then report 5 once (15 bytes). Both DPI responses were identical; the lighting response was exactly their first 15 bytes. Every response began `01 00 c9 00`, rather than the requested report ID and expected layout. Returned bytes are saved in evidence/readback-*.json, explicitly marked as unverified backups. These requests produced data but did not establish configuration readback. Do not replay these responses as writes. No HIDIOCSFEATURE was issued.

The stdlib-only tools/read_settings.py performs only GET_FEATURE for allowlisted configuration IDs 4, 5, 6 and 8, automatically selects exactly one matching configuration interface, saves raw results without overwriting existing evidence, and closes the device even when a request fails. Four offline unit tests cover request encoding, error cleanup, mismatched responses and wired report sizing.

The bundled pro.data is 263620 bytes: a four-byte header, five empty 43936-byte records, then one populated record of that size. Its last record contains internal DPI steps [16,32,48,64,128,220,0,0] and enabled flags [1,1,1,1,1,1,0,0], corresponding under the traced conversion to 800/1600/2400/3200/6400/12000. This is a vendor-supplied profile, not a backup of the user's mouse. The reset UI path calls 0x416820 to initialize a host profile and then schedules an apply. Thus the application's reset appears to reapply host defaults; this does not establish a standalone hardware recovery sequence or preserve user settings.

## Wired discovery

After the user switched to USB-C and removed the dongle, the mouse enumerated as 1d57:205e, HID name Beken USB Gaming Mouse. The binary's second ID is therefore confirmed as wired mode. Configuration is again USB interface 02, usage page 0x0b / usage 0.

Important: the wired report descriptor differs from the dongle descriptor. Wired report 4 has 51 payload bytes (52 including ID), report 5 has 12 payload bytes (13 including ID), while reports 6 and 8 remain 9 and 59 bytes including ID. A browser connection to the dongle does not validate the wired write format. Preserve these transport differences; do not blindly reuse or truncate the previously traced message builders.

The wired descriptor is saved as evidence/wired-config-report-descriptor.bin. The wired configuration interface is currently root-only, without a user ACL. A second exact-device line for 1d57:205e/interface 02 has been added to the repository's 70-aula-sc650.rules; it still needs installation, rule reload and wired reconnect before the wired read test. Hardware writes remain disabled pending a trustworthy backup or established recovery method.

After the user installed the expanded rule and reconnected, wired configuration access succeeded (the read-only open reached the ioctl). GET_FEATURE report 4 (52 bytes) and report 5 (13 bytes) each returned errno 110, Connection timed out. Both results are saved in evidence/readback-wired-*.json. This is a device/transfer response failure, not another permissions issue. Standard GET_FEATURE has not yielded a usable settings backup on either transport; this does not prove all proprietary readback mechanisms are unsupported. Avoid further blind report scanning. Continue static tracing of any initialization/query and reset sequences before a write experiment.

## Button assignment candidate

User selected rear side button to F8. UI ms_1_btn_key_7 corresponds to zero-based slot 6, with the vendor default action Backward (internal ID 5). Menu handler 0x412fc7 assigns internal ID 1 to Left Click; 0x41301b assigns ID 5 to Backward; 0x413084 assigns ID 16 to a keyboard shortcut. This distinguishes internal action IDs from wire opcodes.

Table at 0x41e478 maps internal ID 1 to wire opcode 2 (Left Click), ID 2 to 3 (Right Click), ID 3 to 4 (Middle Click), ID 5 to 5 (Backward), ID 4 to 6 (Forward), and ID 16 to 17 (shortcut). Builder 0x415638 overrides the second and third shortcut bytes with modifier mask and HID key usage respectively. F8 is HID usage 0x41, so its triple is `11 00 41`.

Report 8 is 59 bytes: header `08 3b 01`, 18 triples (bytes 3–56), then a big-endian sum of bytes 3–56 at 57–58. Vendor default wire opcodes are [2,3,4,13,13,60,5,6,60,1,1,1,1,1,1,1,10,9], each with zero argument bytes. The candidate changes only slot 6 relative to that vendor profile. It cannot preserve unknown user-customized assignments because readback is unresolved.

tools/button_mapping.py implements this one candidate and a vendor-default table restore, with preview as the default and explicit --apply required. Six total offline tests pass, including exact changed-slot boundaries, checksum, primary-click triples, invalid-action rejection and read-only diagnostic tests.

The first requested hardware write was rejected by automatic approval review BEFORE execution: whole-table replacement is broader than the user-selected rear-button change and could discard custom assignments without a verified backup. No SET_FEATURE was issued. Explicit approval of the complete replacement is required before retrying; do not bypass the rejection through browser or another execution path. The restore command is prepared but hardware-unverified.

After explicit user approval of whole-table replacement, the candidate wired report was sent once via HIDIOCSFEATURE(59). The ioctl returned errno 71 (Protocol error). The exact attempt is recorded in evidence/button-write-*.json. Command acceptance and behavior are unverified; an error is not proof that no device state changed. No further write, guessed packet variant or restore was issued. key-test.html observes browser input only and is served at localhost port 8766 to establish actual rear-button behavior.

User subsequently confirmed rear output remained Alt+J, assigned previously on Windows. On switching back to dongle 1d57:fa60, the identical 59-byte candidate report succeeded through HIDIOCSFEATURE and the user confirmed F8 output. Report 8 and rear slot 6 are therefore hardware validated on the SC650 dongle. Wired writes remain unvalidated; do not assume firmware compatibility from matching report IDs.

An independent Beken implementation was inspected (not executed): https://github.com/akawazak/attack-shark-x11-community-driver at commit 49ecf8e6d3bd83bf71e231209d28c5e0e8b71d12. src/main/driver/protocols/MacrosBuilder.ts corroborates 59-byte report 8 with header 08 3b 01 and USB class SET_REPORT wValue 0x0308 / interface 2. src/shared/macro-templates.ts corroborates keyboard opcode 0x11, F8 usage 0x41 and Alt modifier 4. That project's slot ordering/defaults and checksum treatment differ, so its table was NOT copied over the SC650-specific binary-derived packet. Its main/index.ts skips wired DPI reads; this supports investigating transport limits but does not prove SC650 readback impossible.

button-protocol.mjs builds the hardware-validated SC650 packet. buttons.html uses WebHID sendFeatureReport(8, packet.slice(1)), because the browser takes the report ID separately. The page validates the selected dongle and exposed report-8 payload size, requires an explicit full-table checkbox per apply, handles disconnect/errors, and offers F8, Alt+J and Back. All commands remain whole-table writes. The local server exposes only an explicit file allowlist on 127.0.0.1:8767, with no upload or network/device backend. JS golden-packet checks and seven Python tests pass. Browser UI/key-event handling verified; a WebHID write from this particular page is still pending user use.

## Experimental DPI/RGB web controls

settings-protocol.mjs follows the supplied Aula serializer. DPI is restricted to six enabled stages and 50–12000 DPI, avoiding the unvalidated greater-than-12000 high-range path. It writes 16-bit DPI values split across low/high arrays, default stage colors, angle-snap and ripple flags, active stage and the sum at bytes 50–51. Related X11 code uses a sensor-specific lookup table; it is not substituted for Aula's direct calculation.

RGB packing: byte 3 = mode index << 4; byte 4 = 9 − speed (deep-sleep high nibble is zero for supported 1–15-minute range); byte 5 = (deepSleepMinutes << 4) | (brightness for modes 1 or 9, otherwise 8); bytes 6–8 = RGB; byte 9 = normal sleep in half-minute units; byte 10 = click response in 2ms units. Sum bytes 3–10 is big-endian at 11–12; bytes 13–14 are zero. This reproduces the Aula branch at 0x414bc4–0x414c96. The related X11 implementation handles the checksum high byte differently, so it was not copied.

UI applies these blocks independently, validates descriptor sizes, shows associated settings and requires explicit block confirmation. Local storage is drafts only. A normal-sleep UI value of 0.5 minutes serializes as 1; an 8ms click response serializes as 4. RGB and DPI commands are hardware-unverified. Tests cover bounds, split DPI arrays, masks, checksum, default colors and RGB fixture `05 0f 01 10 03 a8 00 ff 00 01 04 01 bf 00 00`. Browser test verified that confirmation survives checking, resets after a failed disconnected apply, and no command is sent while disconnected. Do not treat passing serialization checks as proof of physical DPI/RGB behavior.


## Expanded feature reconstruction
See [FEATURES.md](FEATURES.md) for report 6 polling, report 9 macro framing, button-specific macro IDs 17/21, and implementation limits. These additions are hardware-unverified.
