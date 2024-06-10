import { writable } from 'svelte/store';
import type { QrConfig, QrOutput } from '$lib/qr';

export const qrConfigStore = writable<QrConfig>({
	value: 'https://qr.d17e.dev/',
	mmSize: 15,
	ecl: 'L',
	penMmSize: 0.5,
	penTip: 'Round',
	overlap: false
});

export const qrOutputStore = writable<QrOutput>({
	svg: '',
	totalPathLength: 0,
	remark: ''
});
