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
	execa.shell('netsh interface show interface').then((stdout) => {
		let data = new Array(stdout);
		data = data[0].stdout.split(' ');
		
		let deviceInterface = data[data.length - 1].trim().toLowerCase();

		if(turnOn != null) 
			return execa.shell(`netsh interface set interface "${deviceInterface}" ${(turnOn) ? 'enabled' : 'disabled'}`)
					.catch(err => {throw new Error('Error: Run this with administrator privilegies!')});
		
		return isOn().then(isOn => {
			execa.shell(`netsh interface set interface "${deviceInterface}" ${(isOn) ? 'disabled' : 'enabled'}`)
			.catch(err => {throw new Error('Error: Run this with administrator privilegies!')});
		});
	});
};

const toggle = (turnOn) => {
	if (typeof turnOn === 'boolean') {
		return new Promise((resolve) => resolve(toggleDevice(turnOn)));
	}

	return new Promise((resolve) => resolve(toggleDevice()));
};

const restart = () => 
	execa.shell('netsh interface show interface').then((stdout) => {
		let data = new Array(stdout);
		data = data[0].stdout.split(' ');
		
		let deviceInterface = data[data.length - 1].trim().toLowerCase();

		execa.shell(`netsh interface set interface "${deviceInterface}" disabled`).then(() => {
			execa.shell(`netsh interface set interface "${deviceInterface}" enabled`).catch(err => {throw new Error('Error: Run this with administrator privilegies!')});
		}).catch(err => {throw new Error('Error: Run this with administrator privilegies!')});

		return true;
	});



module.exports.on = () => toggle(true);
module.exports.off = () => toggle(false);
module.exports.toggle = () => toggle();
module.exports.isOn = () => isOn();
module.exports.restart = () => restart();
module.exports.device = device();
