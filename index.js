'use strict';
const execa = require('execa');
const pMemoize = require('p-memoize');

if(process.platform == 'darwin') {

	const device = pMemoize(() => {
		if (process.platform !== 'darwin') {
			return Promise.reject(new Error('macOS only'));
		}

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
} else if(process.platform == 'win32') {
	
	const isOn = () => {
		let isOnline = execa.shell('ping google.com -n 1 -w 1000').then(() => {
			return new Promise((resolve) => resolve(true));
		}).catch(() => {
			return new Promise((resolve) => resolve(false));
		});

		return isOnline;
	}

	const device = () => {
		let deviceInterface = execa.shell('netsh interface show interface').then((stdout) => {
			let data = new Array(stdout);
			data = data[0].stdout.split(' ');
			
			return new Promise((resolve) => resolve(data[data.length - 1].trim()));
		});

		return deviceInterface;
	}

	const toggleDevice = (turnOn = null) => {
		execa.shell('netsh interface show interface').then((stdout) => {
			let data = new Array(stdout);
			data = data[0].stdout.split(' ');
			
			let deviceInterface = data[data.length - 1].trim().toLowerCase();

			if(turnOn != null) 
				return execa.shell(`netsh interface set interface "${deviceInterface}" ${(turnOn) ? 'enabled' : 'disabled'}`)
						.catch(err => {throw new Error('Error: Run this with administrator privilegies!')});
			
			execa.shell('ping google.com -n 1 -w 1000').then(() => {
				execa.shell(`netsh interface set interface "${deviceInterface}" disabled`)
				.catch(err => {throw new Error('Error: Run this with administrator privilegies!')});
			}).catch(() => {
				execa.shell(`netsh interface set interface "${deviceInterface}" enabled`)
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

	const restart = () => {
		execa.shell('netsh interface show interface').then((stdout) => {
			let data = new Array(stdout);
			data = data[0].stdout.split(' ');
			
			let deviceInterface = data[data.length - 1].trim().toLowerCase();

			execa.shell(`netsh interface set interface "${deviceInterface}" disabled`).then(() => {
				execa.shell(`netsh interface set interface "${deviceInterface}" enabled`).then(() => {	
				}).catch(err => {throw new Error('Error: Run this with administrator privilegies!')});
			}).catch(err => {throw new Error('Error: Run this with administrator privilegies!')});

			return new Promise((resolve) => resolve(true));
		});
	}

	module.exports.on = () => toggle(true);
	module.exports.off = () => toggle(false);
	module.exports.toggle = () => toggle();
	module.exports.isOn = () => isOn();
	module.exports.restart = () => restart();
	module.exports.device = device();
}

