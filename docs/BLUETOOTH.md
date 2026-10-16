# SC650 Bluetooth investigation

Read-only checks on the connected AULA-SC650, 2026-10-16. No mouse configuration reports, firmware commands, HID input reads, or vendor writes were sent. Native inventory excludes Bluetooth addresses. No pairing or system settings changed.

## Confirmed on this device

- Bluetooth LE HID identity: bus 0005, VID 045e, PID 008e, distinct from dongle 1d57:fa60.
- HID descriptor: 266 bytes, no feature reports. Inputs: IDs 1 (64 bits), 2 (56), 4 (152), 5 (152), 6 (16), 8 (8). Outputs: IDs 1 and 5, each 8 bits, described as LED outputs. These are not the dongle settings reports.
- Battery service 180f / characteristic 2a19 reads 69% at capture time.
- Device information reports RivieraWaves SAS / RW-BLE-1.0. This identifies strings in the BLE stack, not proof of the actual chip.
- Vendor service fee0: fee1 read-only (10 zero bytes); fee2 write without response; fee3 write; fee4 notify; fee5 indicate. Descriptor names fee1_only_read. Command format is unknown.
- Service f000ffc0-0451-4000-b000-000000000000: characteristic descriptors Img Identify and Img Block. These match a TI-style firmware-update service. Application does not request or write it.

## Browser result

The initial Brave browser test at localhost did not expose navigator.bluetooth. The desktop Bluetooth connection is working independently. The user chose to enable experimental Web Platform features and relaunch Brave; the follow-up browser battery/GATT test is pending. Browser access alone will not solve the unknown settings protocol.

The standalone bluetooth.html diagnostic requests only the named SC650 and battery/device-information/fee0 services. It reads battery, manufacturer and fee1; other vendor characteristics are described from metadata. It has no characteristic writes, subscriptions, or settings support. The main connection and settings serializer remain dongle-only.

## Reproduce

- Native: python3 tools/inspect_bluetooth.py (uses BlueZ busctl and Python standard library; no packages needed).
- Browser: /bluetooth.html from the local or built static site.
- Tests: node tools/test_bluetooth_read.mjs; python3 -m unittest discover -s tools -p test_bluetooth_inspection.py.
- Evidence: evidence/bluetooth-inventory.json and evidence/bluetooth-report-descriptor.bin.

## Next unknown

Trace a confirmed fee0 command format from compatible firmware/app source or documented behavior. Do not send USB reports to BLE endpoints based only on matching report numbers. Bluetooth button/DPI/RGB/macro writes are not implemented or verified.

Sources:
- Chrome Web Bluetooth and Linux experimental support: https://developer.chrome.com/docs/capabilities/bluetooth
- TI OAD identifiers: https://e2echina.ti.com/blogs_/b/the_process/posts/cc2640r2-ti-ble-oad-ota-android-ios-app

## Brave follow-up
After the experimental-platform flag and relaunch, the API became visible but requestDevice failed with `Web Bluetooth API globally disabled`. Brave has an additional `brave://flags/#brave-web-bluetooth-api` feature switch. The diagnostic now explains that error. See Brave's source: https://github.com/brave/brave-core/blob/master/browser/about_flags.cc (brave-web-bluetooth-api). Browser GATT reads subsequently succeeded after enabling the Brave-specific flag.

## Confirmed browser read
After the Brave-specific flag was enabled, the browser completed all diagnostic reads with no errors: battery 69%, manufacturer RivieraWaves SAS, five fee0 characteristics enumerated, fee1 value 02 00 00 00 00 00 00 00 00 02. Evidence: evidence/bluetooth-browser-read.json. Three immediate native fee1 reads then returned 03…03, 04…04 and 05…05, suggesting a read counter rather than configuration readback. Evidence: evidence/bluetooth-vendor-read-repeat.json. No application writes, subscriptions, or firmware operations were performed. The remaining blocker is an established settings protocol for fee2/fee3; USB report framing cannot be assumed.


## Original Windows Bluetooth write path traced
The actual bundled Mouse.exe contains a Bluetooth path, not merely generic DLL exports. Static disassembly evidence (including binary SHA-256): evidence/bluetooth-windows-write-path.txt.

- Button builder at 0x415759 passes its complete 59-byte report to common sender 0x414390.
- Bluetooth branch 0x4146b5 checks the Bluetooth connection flag and explicitly rejects report 6 (polling rate).
- 0x4146d7–0x4146e1 passes the same pointer and length to 0x405880, without stripping the report ID.
- 0x405eb0 selects characteristic short UUID FEE3 with write property.
- 0x405f14–0x405f24 sets the GATT value length and copies the complete input buffer to its data field.
- 0x405f37–0x405f43 calls BluetoothGATTSetCharacteristicValue with that characteristic and value, flags zero (write with response). No application-layer fragmentation is present in this path.

The diagnostic now exposes a separate, explicit experimental rear → F8 button test using that exact 59-byte format. It sets the remaining button slots to vendor defaults, and does not change DPI, RGB or firmware. It is never triggered by connecting or reading. No automatic retries. An acknowledged GATT write alone does not establish that the firmware applied it; actual rear-button input must confirm that. Hardware write test is pending. The main configuration app remains dongle-only until that check succeeds. Macros and larger packets are not enabled for Bluetooth.


## Physical confirmation and main interface
The user reported F8 from the physical rear side button after the 59-byte FEE3 write was acknowledged. Button mapping over Bluetooth is therefore confirmed for this SC650. The diagnostic's settingsSupported:false remains a conservative read-summary field, not a firmware response.

The main interface now offers Connect Bluetooth and routes complete button/DPI/RGB packets through FEE3. Only button remapping has physical confirmation over Bluetooth; DPI and RGB remain experimental. Polling is rejected as in the original program, and macro/full-profile uploads remain disabled for Bluetooth. All reports in a batch are validated before any write, so unsupported profile reports cannot cause a partial settings upload. No auto-apply on connection; no OTA access. Browser disconnects restore the offline state and keep saved drafts. No Windows runtime is required.
