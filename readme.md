# manage-wifi [![Build Status](https://travis-ci.org/sindresorhus/manage-wifi.svg?branch=master)](https://travis-ci.org/sindresorhus/manage-wifi)

> Turn your Wi-Fi on and off

*macOS only, but pull request welcome for Linux and Windows support.*


## Install

```
$ npm install --save manage-wifi
```


## Usage

```js
const manageWifi = require('manage-wifi');

manageWifi
	.off()
	.then(() => {
		console.log('Wi-Fi is off');
	})
	.then(manageWifi.on)
	.then(() => {
		console.log('Wi-Fi is on');
	})
	.then(manageWifi.device)
	.then(name => {
		console.log(name);
		//=> 'en0'
	});
```


## API

### manageWifi

All the methods return a `Promise`.

#### on()

Turn Wi-Fi on.

#### off()

Turn Wi-Fi off.

#### toggle([force])

Inverse the Wi-Fi state.

Optionally pass a `boolean` to force a state.

#### restart()

Turn Wi-Fi off and on.

#### isOn()

Returns a `Promise<boolean>` of whether the Wi-Fi is on.

#### device()

Returns a `Promise<string>` with the Wi-Fi device name.


## Related

- [manage-wifi-cli](https://github.com/sindresorhus/manage-wifi-cli) - CLI for this module


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
