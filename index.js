import execa from 'execa';
import pMemoize from 'p-memoize';
import delay from 'delay';

const powershell = (async (command, args) => {
	if (typeof (command) !== 'string') {
		throw new TypeError('Invalid command');
	}

	return execa(command, args, {shell: 'powershell'});
});

const getDevice = pMemoize(async () => {
	if (process.platform === 'darwin') {
		const {stdout} = await execa('networksetup', ['-listallhardwareports']);
		const result = /Hardware Port: Wi-Fi\nDevice: (?<device>en\d)/.exec(stdout);
		if (!result) {
			throw new Error('Couldn\'t find a Wi-Fi device');
		}

		return result.groups.device;
	}

	if (process.platform === 'win32') {
		const {stdout} = await powershell('Get-NetAdapter', ['-Name Wi-Fi | Format-List -Property PnPDeviceID']);
		/// stdout: `PnPDeviceID : USB\VID_0BRA&PID_8387\00C0CA7B646E`
		const result = /(?<=PnPDeviceID : ).*/.exec(stdout);

		if (!result) {
			throw new Error('Couldn\'t find a Wi-Fi device');
		}

		return result[0];
	}

	throw new Error('macOS or Windows only');
});

const isOn = async device => {
	if (process.platform === 'darwin') {
		const {stdout} = await execa('ifconfig', [device]);
		return stdout.includes('status: active');
	}

	if (process.platform === 'win32') {
		const {stdout} = await powershell('Get-NetAdapterAdvancedProperty', ['-Name Wi-Fi -RegistryKeyword RFOff -AllProperties | Format-List -Property RegistryValue']);
		/// stdout: `RegistryValue : {0}`
		const status = /(?<={).+?(?=})/.exec(stdout);
		return !Number.parseInt(status, 10);
	}
};

const toggleDevice = async (device, turnOn) => {
	if (process.platform === 'darwin') {
		await execa('networksetup', [
			'-setairportpower',
			device,
			turnOn ? 'on' : 'off'
		]);
	} else if (process.platform === 'win32') {
		const setStatus = turnOn ? 0 : 1;
		await powershell('Start-Process', ['PowerShell -Verb RunAs -WindowStyle Hidden', `-ArgumentList "Set-NetAdapterAdvancedProperty -Name Wi-Fi -RegistryKeyword RFOff -AllProperties -RegistryValue ${setStatus}"`]);
	}

	await delay(100);

	const on = await isOn(device);

	const shouldRetry = turnOn ? !on : on;
	if (shouldRetry) {
		await toggleDevice(device, turnOn);
	}
};

const toggle = async turnOn => {
	const device = await getDevice();

	if (typeof turnOn !== 'boolean') {
		turnOn = !(await isOn(device));
	}

	await toggleDevice(device, turnOn);
};

const wifi = {};

wifi.on = () => toggle(true);

wifi.off = () => toggle(false);

wifi.toggle = toggle;

wifi.isOn = async () => isOn(await getDevice());

wifi.restart = async () => {
	await toggle(false);
	await toggle(true);
};

wifi.device = getDevice;

export default wifi;
