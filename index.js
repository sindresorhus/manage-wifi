'use strict';
const execa = require('execa');
const pMemoize = require('p-memoize');
const delay = require('delay');

const getDevice = pMemoize(async () => {
	if (process.platform !== 'darwin') {
		throw new Error('macOS only');
	}

	const {stdout} = await execa('networksetup', ['-listallhardwareports']);

	const result = stdout.match(/Hardware Port: Wi-Fi\nDevice: (en\d)/);
	if (!result) {
		throw new Error('Couldn\'t find a Wi-Fi device');
	}

	return result[1];
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

const manageWifi = module.exports;

manageWifi.on = () => toggle(true);

manageWifi.off = () => toggle(false);

manageWifi.toggle = toggle;

manageWifi.isOn = async () => isOn(await getDevice());

manageWifi.restart = async () => {
	await toggle(false);
	await toggle(true);
};

manageWifi.device = getDevice;
