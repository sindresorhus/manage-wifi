import execa from 'execa';
import pMemoize from 'p-memoize';
import delay from 'delay';

const getDevice = pMemoize(async () => {
	if (process.platform == 'darwin') {
		const { stdout } = await execa('networksetup', ['-listallhardwareports']);
		const result = /Hardware Port: Wi-Fi\nDevice: (?<device>en\d)/.exec(stdout);
		if (!result) {
			throw new Error('Couldn\'t find a Wi-Fi device');
		}

		return result.groups.device;
	} else if (process.platform == 'win32') {
		const { stdout } = await execa('powershell', [
			'-command',
			'Get-NetAdapter -Name Wi-Fi | Format-List -Property PnPDeviceID',
		]);

		const result = /(?<=PnPDeviceID : ).*/.exec(stdout);

		if (!result) {
			throw new Error('Couldn\'t find a Wi-Fi device');
		}

		return result[0];
	} else {
		throw new Error('macOS or Windows only');
	}
});

const isOn = async (device) => {
	if (process.platform == 'darwin') {
		const { stdout } = await execa('ifconfig', [device]);
		return stdout.includes('status: active');
	} else if (process.platform == 'win32') {
		const { stdout } = await execa('powershell', [
			'-command',
			'Get-NetAdapterAdvancedProperty -Name Wi-Fi -RegistryKeyword RFOff -AllProperties | Format-List -Property RegistryValue',
		]);
		const status = /(?<=\{).+?(?=\})/.exec(stdout);
		return !parseInt(status);
	}
};

const toggleDevice = async (device, turnOn) => {
	if (process.platform == 'darwin') {
		await execa('networksetup', [
			'-setairportpower',
			device,
			turnOn ? 'on' : 'off',
		]);
		await delay(100);
	} else if (process.platform == 'win32') {
		var setStatus = turnOn ? 0 : 1;
		//console.log("Testing..."); // Odd Issue: Without this log statement, tests fail on Windows 10

		await execa(
			'powershell -command Start-Process PowerShell -Verb RunAs -WindowStyle Hidden',
			[
				`-ArgumentList "Set-NetAdapterAdvancedProperty -Name Wi-Fi -RegistryKeyword RFOff -AllProperties -RegistryValue ${setStatus}"`,
			]
		);
		await delay(6000);
	}
	
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
