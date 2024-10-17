import { writable } from 'svelte/store';
import type { QrConfig, QrOutput } from '$lib/qr';

export const qrConfigStore = writable<QrConfig>({
	value: 'https://qr.d17e.dev/',
	ecl: 'L',
	penMmSize: 0.6,
	overlap: true,
	transparent: false
});

export const qrOutputStore = writable<QrOutput>({
	svg: '',
	outputInfo: '',
	remark: ''
});
