'use strict';
let platform = null;

switch(process.platform) {
	case 'darwin':
		platform = require('./macos.js');
		break;

	case 'win32':
		platform = require('./windows.js');
		break;

	default: 
		return Promise.reject(new Error('You OS don\'t support this library!'));
};

module.exports = platform;
