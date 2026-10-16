import unittest
from button_mapping import build_report


class ButtonMappingTests(unittest.TestCase):
    def test_rear_only_changes_one_assignment_and_checksum(self):
        default = build_report("defaults")
        mapped = build_report("rear-f8")
        self.assertEqual(len(mapped), 59)
        self.assertEqual(mapped[:3], bytes([8, 59, 1]))
        self.assertEqual(mapped[21:24], bytes([17, 0, 0x41]))
        self.assertEqual(mapped[:21], default[:21])
        self.assertEqual(mapped[24:57], default[24:57])
        self.assertEqual(int.from_bytes(mapped[57:], "big"), sum(mapped[3:57]))
        self.assertEqual(mapped[3:12], bytes([2, 0, 0, 3, 0, 0, 4, 0, 0]))

    def test_unrecognized_assignment_rejected(self):
        with self.assertRaises(ValueError):
            build_report("arbitrary")

    def test_known_previous_shortcut_can_be_reconstructed(self):
        report = build_report("rear-alt-j")
        self.assertEqual(report[21:24], bytes([17, 4, 13]))
        self.assertEqual(int.from_bytes(report[57:], "big"), sum(report[3:57]))


if __name__ == "__main__":
    unittest.main()
