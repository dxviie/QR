// src/routes/api/directus/+server.ts
import { createDirectus, rest, authentication, createItem } from '@directus/sdk';
import { json, type RequestHandler } from '@sveltejs/kit';
import { DIRECTUS_URL, DIRECTUS_LOGIN, DIRECTUS_PASS } from '$env/static/private';

const directus = createDirectus(DIRECTUS_URL).with(authentication('json')).with(rest());

// Handle POST requests
export const POST: RequestHandler = async ({ request }) => {
	try {
		// Make sure we're authenticated
		const result = await directus.login(DIRECTUS_LOGIN, DIRECTUS_PASS);
		console.debug('Logged in:', result);
		const rb = await request.json();
		const qrPage = await directus.request(createItem('QrPages', rb.data));
		return json({ success: true, page: qrPage });
	} catch (error) {
		console.error('Directus error:', error);
		return json({ success: false, error: error }, { status: 500 });
	}
};
