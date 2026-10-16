"""Read only known configuration feature reports using Linux hidraw; stdlib only."""
import argparse
import datetime
import fcntl
import json
import os
from pathlib import Path

REPORT_LENGTHS = {4: 56, 5: 15, 6: 9, 8: 59}
WIRED_REPORT_LENGTHS = {4: 52, 5: 13, 6: 9, 8: 59}


def get_feature_request(length):
    # Linux asm-generic ioctl encoding; HIDIOCGFEATURE, never HIDIOCSFEATURE.
    if not 1 <= length <= 0x3FFF:
        raise ValueError("Invalid report length")
    return (3 << 30) | (length << 16) | (ord("H") << 8) | 7


def find_device():
    candidates = []
    for entry in Path("/sys/class/hidraw").glob("hidraw*"):
        properties = dict(line.split("=", 1) for line in (entry / "device/uevent").read_text().splitlines() if "=" in line)
        hid_id = properties.get("HID_ID", "")
        if hid_id in ("0003:00001D57:0000FA60", "0003:00001D57:0000205E") and properties.get("HID_PHYS", "").endswith("/input2"):
            candidates.append((Path("/dev") / entry.name, int(hid_id.split(":")[-1], 16)))
    if len(candidates) != 1:
        raise RuntimeError(f"Expected one SC650 configuration interface, found {len(candidates)}")
    return candidates[0]


def read_report(device, report_id, product_id=0xFA60):
    length = (WIRED_REPORT_LENGTHS if product_id == 0x205E else REPORT_LENGTHS)[report_id]
    buffer = bytearray(length)
    buffer[0] = report_id
    fd = os.open(device, os.O_RDONLY | os.O_NONBLOCK)
    try:
        returned = fcntl.ioctl(fd, get_feature_request(length), buffer, True)
    finally:
        os.close(fd)
    if not 1 <= returned <= length:
        raise RuntimeError(f"Unexpected returned length: {returned}")
    data = bytes(buffer[:returned])
    return {"report_id": report_id, "requested_length": length,
            "returned_length": returned, "hex": data.hex(" "),
            "matches_requested_report_id": data[0] == report_id,
            "verified_settings_backup": False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("report", type=int, choices=REPORT_LENGTHS)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    device, product_id = find_device()
    result = {"timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(), "device": str(device), "product_id": product_id, "operation": "GET_FEATURE"}
    try:
        result.update(read_report(device, args.report, product_id))
    except OSError as error:
        result.update({"report_id": args.report, "error": str(error), "errno": error.errno})
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("x") as handle:
        json.dump(result, handle, indent=2)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
