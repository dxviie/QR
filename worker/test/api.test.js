import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker from '../src/index.ts';

// The fixtures are responses captured from the Val Town webhook this worker replaces
// (https://d17e-qrcodewebhook.web.val.run) for the same request bodies.
const fixture = (name) => readFileSync(new URL(`./fixtures/${name}.svg`, import.meta.url), 'utf8');

const call = (method, body) =>
	worker.fetch(
		new Request('https://qr.example/', {
			method,
			headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
			body: body === undefined || typeof body === 'string' ? body : JSON.stringify(body)
		})
	);

const matchesValTown = [
	['basic', { value: 'https://qr.d17e.dev', ecl: 'L', penMmSize: 0.5 }],
	['float-pen-size', { value: 'https://qr.d17e.dev/', ecl: 'M', penMmSize: 0.6 }],
	['unicode-ecl-q', { value: 'héllo wörld ✏️ plotter', ecl: 'Q', penMmSize: 0.7 }]
];

for (const [name, body] of matchesValTown) {
	test(`POST returns the same SVG as Val Town: ${name}`, async () => {
		const res = await call('POST', body);
		assert.equal(res.status, 200);
		assert.equal(res.headers.get('Content-Type'), 'image/svg+xml');
		assert.equal(res.headers.get('Access-Control-Allow-Origin'), '*');
		assert.equal(await res.text(), fixture(name));
	});
}

test('GET without a body returns the default QR code', async () => {
	const res = await call('GET');
	assert.equal(res.status, 200);
	assert.equal(await res.text(), fixture('default'));
});

test('POST with a body that is not JSON falls back to the default QR code', async () => {
	const res = await call('POST', 'not json');
	assert.equal(res.status, 200);
	assert.equal(await res.text(), fixture('default'));
});

for (const [name, body] of [
	['missing ecl', { value: 'abc' }],
	['invalid ecl', { value: 'abc', ecl: 'Z', penMmSize: 1 }],
	['empty value', { value: '', ecl: 'L', penMmSize: 1 }]
]) {
	test(`POST with ${name} is a 400`, async () => {
		const res = await call('POST', body);
		assert.equal(res.status, 400);
		assert.equal(await res.text(), 'Bad Request');
	});
}

test('other methods are a 405', async () => {
	for (const method of ['PUT', 'DELETE', 'HEAD']) {
		const res = await call(method);
		assert.equal(res.status, 405, method);
	}
});

test('CORS preflight is answered', async () => {
	const res = await worker.fetch(
		new Request('https://qr.example/', {
			method: 'OPTIONS',
			headers: {
				Origin: 'https://example.com',
				'Access-Control-Request-Method': 'POST',
				'Access-Control-Request-Headers': 'content-type'
			}
		})
	);
	assert.equal(res.status, 204);
	assert.equal(res.headers.get('Access-Control-Allow-Origin'), '*');
	assert.equal(res.headers.get('Access-Control-Allow-Headers'), 'content-type');
	assert.match(res.headers.get('Access-Control-Allow-Methods'), /POST/);
});
