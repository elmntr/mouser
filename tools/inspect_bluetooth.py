"""Read-only SC650 Bluetooth inventory through BlueZ; Python standard library only."""
import json
import subprocess
from pathlib import Path


def report_layout(data):
    state = {'size': 0, 'count': 0, 'id': 0}
    stack = []
    reports = {'input': {}, 'output': {}, 'feature': {}}
    i = 0
    while i < len(data):
        prefix = data[i]
        i += 1
        if prefix == 0xfe:
            if i + 2 > len(data):
                raise ValueError('Truncated long HID item')
            length = data[i]
            i += 2 + length
            if i > len(data):
                raise ValueError('Truncated long HID item')
            continue
        size = (0, 1, 2, 4)[prefix & 3]
        if i + size > len(data):
            raise ValueError('Truncated HID item')
        value = int.from_bytes(data[i:i + size], 'little')
        i += size
        kind, tag = (prefix >> 2) & 3, prefix >> 4
        if kind == 1:
            if tag in (7, 8, 9):
                state[{7: 'size', 8: 'id', 9: 'count'}[tag]] = value
            elif tag == 10:
                stack.append(state.copy())
            elif tag == 11:
                if not stack:
                    raise ValueError('HID global stack underflow')
                state = stack.pop()
        elif kind == 0 and tag in (8, 9, 11):
            target = reports[{8: 'input', 9: 'output', 11: 'feature'}[tag]]
            target[state['id']] = target.get(state['id'], 0) + state['size'] * state['count']
    return {kind: [{'id': key, 'payload_bits': bits} for key, bits in sorted(values.items())]
            for kind, values in reports.items()}


def call(*args):
    output = subprocess.check_output(['busctl', '--system', '--json=short', *args],
                                     text=True, timeout=8)
    return json.loads(output)['data'][0]


def inventory():
    objects = call('call', 'org.bluez', '/', 'org.freedesktop.DBus.ObjectManager', 'GetManagedObjects')
    devices = [path for path, interfaces in objects.items()
               if interfaces.get('org.bluez.Device1', {}).get('Name', {}).get('data') == 'AULA-SC650'
               and interfaces['org.bluez.Device1'].get('Connected', {}).get('data')]
    if len(devices) != 1:
        raise RuntimeError('Connect exactly one AULA-SC650 over Bluetooth first.')
    device = devices[0]
    result = {'name': 'AULA-SC650', 'transport': 'Bluetooth LE', 'services': [], 'reads': {}, 'hid': []}
    for path, interfaces in sorted(objects.items()):
        if not path.startswith(device + '/'):
            continue
        for interface, props in interfaces.items():
            if interface not in ('org.bluez.GattService1', 'org.bluez.GattCharacteristic1', 'org.bluez.GattDescriptor1'):
                continue
            uuid = props.get('UUID', {}).get('data', '')
            result['services'].append({'path': path[len(device) + 1:], 'uuid': uuid,
                                       'flags': props.get('Flags', {}).get('data', [])})
            permitted = uuid in ('00002a19-0000-1000-8000-00805f9b34fb',
                                 '00002a29-0000-1000-8000-00805f9b34fb',
                                 '00002a24-0000-1000-8000-00805f9b34fb',
                                 '0000fee1-0000-1000-8000-00805f9b34fb')
            permitted |= uuid == '00002901-0000-1000-8000-00805f9b34fb'
            if permitted:
                try:
                    value = bytes(call('call', 'org.bluez', path, interface, 'ReadValue', 'a{sv}', '0'))
                    result['reads'][path[len(device) + 1:]] = {'hex': value.hex(),
                                                              'text': value.decode('utf8', errors='replace')}
                    if uuid.startswith('00002a19') and len(value) == 1 and value[0] <= 100:
                        result['battery_percent'] = value[0]
                except (subprocess.SubprocessError, ValueError) as error:
                    result['reads'][path[len(device) + 1:]] = {'error': type(error).__name__}
    for entry in Path('/sys/class/hidraw').glob('hidraw*'):
        info = dict(line.split('=', 1) for line in (entry / 'device/uevent').read_text().splitlines() if '=' in line)
        if info.get('HID_NAME') == 'AULA-SC650' and info.get('HID_ID', '').startswith('0005:'):
            descriptor = (entry / 'device/report_descriptor').read_bytes()
            result['hid'].append({'identity': info['HID_ID'], 'descriptor_hex': descriptor.hex(),
                                  'reports': report_layout(descriptor)})
    return result


if __name__ == '__main__':
    print(json.dumps(inventory(), indent=2))
