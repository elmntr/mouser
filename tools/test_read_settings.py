"""Offline checks; no device access."""
import unittest
from unittest.mock import patch
import read_settings as reader


class ReadSettingsTests(unittest.TestCase):
    def test_get_feature_ioctl_matches_linux_header_encoding(self):
        self.assertEqual(reader.get_feature_request(56), 0xC0384807)
        with self.assertRaises(ValueError):
            reader.get_feature_request(0)

    def test_failed_request_closes_device(self):
        with patch.object(reader.os, "open", return_value=19), patch.object(reader.os, "close") as close, patch.object(reader.fcntl, "ioctl", side_effect=OSError(32, "unsupported")):
            with self.assertRaises(OSError):
                reader.read_report("/dev/fake", 4)
            close.assert_called_once_with(19)

    def test_mismatched_response_is_not_a_settings_backup(self):
        def fake_ioctl(fd, request, buffer, mutate):
            buffer[:] = bytes([1]) + bytes(len(buffer) - 1)
            return len(buffer)
        with patch.object(reader.os, "open", return_value=19), patch.object(reader.os, "close"), patch.object(reader.fcntl, "ioctl", side_effect=fake_ioctl):
            result = reader.read_report("/dev/fake", 4)
        self.assertFalse(result["matches_requested_report_id"])
        self.assertFalse(result["verified_settings_backup"])
        self.assertEqual(result["returned_length"], 56)

    def test_wired_length_comes_from_wired_descriptor(self):
        def fake_ioctl(fd, request, buffer, mutate):
            self.assertEqual(len(buffer), 52)
            self.assertEqual(request, 0xC0344807)
            return len(buffer)
        with patch.object(reader.os, "open", return_value=19), patch.object(reader.os, "close"), patch.object(reader.fcntl, "ioctl", side_effect=fake_ioctl):
            result = reader.read_report("/dev/fake", 4, 0x205E)
        self.assertTrue(result["matches_requested_report_id"])
        self.assertFalse(result["verified_settings_backup"])


if __name__ == "__main__":
    unittest.main()
