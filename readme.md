# manage-wifi

> Turn your Wi-Fi on and off

*macOS and Windows only, but pull request welcome for Linux support.*

## Install

```
$ npm install manage-wifi
```

## Usage

```js
import wifi from 'manage-wifi';

await wifi.off();
console.log('Wi-Fi is off');

await wifi.on();
console.log('Wi-Fi is on');

const name = await wifi.device();
console.log(name);
// MacOS => 'en0';
// Windows => 'USB\VID_0BD...'
```

**NOTE**: In Windows, User Account Control (UAC) Pop-Up may displayed on wifi status change. It is by default behavior and related to the user account control settings.


## API

### wifi

All the methods return a `Promise`.

#### on()

Turn Wi-Fi on.

#### off()

Turn Wi-Fi off.

#### toggle(force?)

Invert the Wi-Fi state.

Optionally pass a `boolean` to force a state.

#### restart()

Turn Wi-Fi off and on.

#### isOn()

Returns a `Promise<boolean>` of whether the Wi-Fi is on.

#### device()

Returns a `Promise<string>` with the Wi-Fi device name.

## Related

- [manage-wifi-cli](https://github.com/sindresorhus/manage-wifi-cli) - CLI for this module
