import execa from 'execa';
import pMemoize from 'p-memoize';
import delay from 'delay';

const getDevice = pMemoize(async () => {
	if (process.platform !== 'darwin') {
		throw new Error('macOS only');
	}

	const {stdout} = await execa('networksetup', ['-listallhardwareports']);

	const result = /Hardware Port: Wi-Fi\nDevice: (?<device>en\d)/.exec(stdout);
	if (!result) {
		throw new Error('Couldn\'t find a Wi-Fi device');
	}

	return result.groups.device;
});

const isOn = async device => {
	const {stdout} = await execa('ifconfig', [device]);
	return stdout.includes('status: active');
};

const toggleDevice = async (device, turnOn) => {
	await execa('networksetup', ['-setairportpower', device, (turnOn ? 'on' : 'off')]);

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
