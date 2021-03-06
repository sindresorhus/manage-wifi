import {expectType} from 'tsd';
import manageWifi from './index.js';

expectType<Promise<void>>(manageWifi.on());
expectType<Promise<void>>(manageWifi.off());
expectType<Promise<void>>(manageWifi.toggle());
expectType<Promise<void>>(manageWifi.restart());
expectType<Promise<boolean>>(manageWifi.isOn());
expectType<Promise<string>>(manageWifi.device());
