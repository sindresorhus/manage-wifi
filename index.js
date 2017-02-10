'use strict';
let platform = null;

switch(process.platform) {
	case 'darwin':
		platform = require('./macos');
		break;

	case 'win32':
		platform = require('./windows');
		break;

	default: 
		return Promise.reject(new Error('Only macOS and Windows are supported'));
};

module.exports = platform;