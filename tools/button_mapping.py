"""SC650 button-table experiment, traced from the supplied Windows executable."""
import argparse
import datetime
import fcntl
import json
import os
from pathlib import Path
from read_settings import find_device

# Mouse.exe 0x416ad0 default actions, translated using table 0x41e478.
DEFAULT_CODES = [2, 3, 4, 13, 13, 60, 5, 6, 60, 1, 1, 1, 1, 1, 1, 1, 10, 9]
REAR_SLOT = 6  # UI ms_1_btn_key_7; default action Backward.


def build_report(action):
    if action not in ("rear-f8", "rear-alt-j", "defaults"):
        raise ValueError("Unsupported assignment")
    report = bytearray([8, 59, 1])
    for slot, code in enumerate(DEFAULT_CODES):
        if slot == REAR_SLOT and action == "rear-f8":
            report.extend([17, 0, 0x41])
        elif slot == REAR_SLOT and action == "rear-alt-j":
            report.extend([17, 4, 0x0D])
        else:
            report.extend([code, 0, 0])
    checksum = sum(report[3:57]) & 0xFFFF
    report.extend(checksum.to_bytes(2, "big"))
    return bytes(report)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["rear-f8", "rear-alt-j", "defaults"])
    parser.add_argument("--apply", action="store_true", help="Send the traced report; otherwise preview only")
    args = parser.parse_args()
    report = build_report(args.action)
    print("Button table:", report.hex(" "))
    if not args.apply:
        print("Preview only. Other button assignments use vendor defaults; DPI/RGB are not sent.")
        return
    device, product = find_device()
    if product not in (0x205E, 0xFA60):
        raise RuntimeError("Unsupported device")
    record = {"timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(), "device": str(device),
              "product_id": product, "action": args.action, "operation": "SET_FEATURE", "hex": report.hex(" "), "behavior_verified": False}
    # Save the exact attempt before touching hardware; every restore is defaults, not a backup.
    directory = Path(__file__).resolve().parents[1] / "docs/evidence"
    filename = directory / ("button-write-" + datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%S%f") + ".json")
    filename.write_text(json.dumps(record, indent=2) + "\n")
    fd = os.open(device, os.O_RDWR | os.O_NONBLOCK)
    try:
        # HIDIOCSFEATURE(len), Linux asm-generic. Only report 8 is allowed here.
        transferred = fcntl.ioctl(fd, (3 << 30) | (len(report) << 16) | (ord("H") << 8) | 6, bytearray(report), True)
        record["transferred"] = transferred
        record["transport_succeeded"] = transferred == len(report)
        print("SET_FEATURE returned:", transferred, "bytes. Physical button behavior still needs checking.")
    except OSError as error:
        record.update(error=str(error), errno=error.errno, transport_succeeded=False)
        raise
    finally:
        os.close(fd)
        filename.write_text(json.dumps(record, indent=2) + "\n")


if __name__ == "__main__":
    main()
