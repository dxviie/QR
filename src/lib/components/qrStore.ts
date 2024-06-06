import { writable } from 'svelte/store';

export const qrConfigStore = writable({
	size: 512,
	ecl: 'L',
	value: 'https://qr.d17e.dev/1234'
});
