const execa = require('execa');

const isOn = () => 
	execa.shell('ping google.com -n 1 -w 1000').then(() => true).catch(() => false);

const device = () => 
	execa.shell('netsh interface show interface').then((stdout) => {
		let data = new Array(stdout);
		data = data[0].stdout.split(' ');

		if(data == undefined)
			throw new Error('Couldn\'t find a Wi-Fi device');
		// console.log(data);

		return data[data.length - 1].trim();
	});

const toggleDevice = (turnOn) => 
	device().then(deviceInterface => execa.shell(`netsh interface set interface "${deviceInterface}" ${(turnOn) ? 'enabled' : 'disabled'}`).catch(err => {throw new Error('You don\'t have any WI-FI device or your run this without administrator privilegies!')}));

const toggle = (turnOn) => {
	if (typeof turnOn === 'boolean') {
		return toggleDevice(turnOn);
	}

	return isOn().then(isOn => toggleDevice(!isOn));
};

module.exports.on = () => toggle(true);
module.exports.off = () => toggle(false);
module.exports.toggle = toggle;
module.exports.isOn = () => isOn();
module.exports.restart = () => toggle(false).then(() => toggle(true));
module.exports.device = device;
