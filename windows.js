const execa = require('execa');

const isOn = () => 
	execa.shell('ping google.com -n 1 -w 1000').then(() => true).catch(() => false);

const device = () => 
	execa.shell('netsh interface show interface').then((stdout) => {
		let data = new Array(stdout);
		data = data[0].stdout.split(' ');
		
		return data[data.length - 1].trim();
	});


const toggleDevice = (turnOn = null) => {
	return device().then(deviceInterface => {
		if(turnOn != null) 
		return execa.shell(`netsh interface set interface "${deviceInterface}" ${(turnOn) ? 'enabled' : 'disabled'}`)
				.catch(err => {throw new Error('Error: Run this with administrator privilegies!')});
	
		return isOn().then(isOn => execa.shell(`netsh interface set interface "${deviceInterface}" ${(isOn) ? 'disabled' : 'enabled'}`).catch(err => {throw new Error('Error: Run this with administrator privilegies!')}));
	});
};

const toggle = (turnOn) => {
	if (typeof turnOn === 'boolean') {
		return new Promise((resolve) => resolve(toggleDevice(turnOn)));
	}

	return toggleDevice();
};

module.exports.on = () => toggle(true);
module.exports.off = () => toggle(false);
module.exports.toggle = () => toggle();
module.exports.isOn = () => isOn();
module.exports.restart = () => toggle(false).then(() => toggle(true));
module.exports.device = device();