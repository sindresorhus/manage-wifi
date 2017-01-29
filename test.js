import test from 'ava';
import m from '.';

if (process.env.CI) { // Travis doesn't have Wi-Fi
	test('travis', t => {
		t.pass();
	});
} else {
	test.after(async () => {
		await m.on();
	});

	test('main', async t => {
		t.regex(await m.device(), /en\d/);
		await m.off();
		t.false(await m.isOn());
		await m.on();
		t.true(await m.isOn());
		await m.toggle();
		t.false(await m.isOn());
		await m.toggle(false);
		t.false(await m.isOn());
		await m.on();
		t.true(await m.isOn());
		await m.restart();
		t.true(await m.isOn());
	});
}
