const execa = require('execa');
const pMemoize = require('p-memoize');

const device = pMemoize(() => {
	return execa.stdout('networksetup', ['-listallhardwareports']).then(stdout => {
		const result = stdout.match(/Hardware Port: Wi-Fi\nDevice: (en\d)/);

		if (!result) {
			throw new Error('Couldn\'t find a Wi-Fi device');
		}

		return result[1];
	});
});

const isOn = device =>
	execa.stdout('networksetup', ['-getairportpower', device]).then(stdout => /: On$/.test(stdout));

const toggleDevice = (device, turnOn) =>
	execa('networksetup', ['-setairportpower', device, (turnOn ? 'on' : 'off')]).then(() => {});

const toggle = turnOn =>
	device().then(device => {
		if (typeof turnOn === 'boolean') {
			return toggleDevice(device, turnOn);
		}

		return isOn(device).then(isOn => toggleDevice(device, !isOn));
	});


module.exports.on = () => toggle(true);
module.exports.off = () => toggle(false);
module.exports.toggle = toggle;
module.exports.isOn = () => device().then(isOn);
module.exports.restart = () => toggle(false).then(() => toggle(true));
module.exports.device = device;