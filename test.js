import test from 'ava';
import manageWifi from '.';

if (process.env.CI || process.platform !== 'darwin') { // CI doesn't have Wi-Fi
	test('ci', t => {
		t.pass();
	});
} else {
	test.after(async () => {
		await manageWifi.on();
	});

	test('main', async t => {
		t.regex(await manageWifi.device(), /en\d/);
		await manageWifi.off();
		t.false(await manageWifi.isOn());
		await manageWifi.on();
		t.true(await manageWifi.isOn());
		await manageWifi.toggle();
		t.false(await manageWifi.isOn());
		await manageWifi.toggle(false);
		t.false(await manageWifi.isOn());
		await manageWifi.on();
		t.true(await manageWifi.isOn());
		await manageWifi.restart();
		t.true(await manageWifi.isOn());
	});
}
