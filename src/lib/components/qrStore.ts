import { writable } from 'svelte/store';
import type { QrConfig } from '$lib/qr';

export const qrConfigStore = writable<QrConfig>({
	value: 'https://qr.d17e.dev/',
	mmSize: 15,
	ecl: 'L',
	penMmSize: 0.8,
	penTip: 'Round',
	overlap: false
});
