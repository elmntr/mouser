import unittest
from inspect_bluetooth import report_layout


class BluetoothDescriptorTests(unittest.TestCase):
    def test_separates_reports_and_restores_global_state(self):
        data = bytes.fromhex('8501750895028102a4850595019102b4b102')
        result = report_layout(data)
        self.assertEqual(result['input'], [{'id': 1, 'payload_bits': 16}])
        self.assertEqual(result['output'], [{'id': 5, 'payload_bits': 8}])
        self.assertEqual(result['feature'], [{'id': 1, 'payload_bits': 16}])

    def test_rejects_truncated_and_invalid_stack(self):
        for data in (b'\x85', b'\xb4', b'\xfe\x04\x01\x00'):
            with self.assertRaises(ValueError):
                report_layout(data)
