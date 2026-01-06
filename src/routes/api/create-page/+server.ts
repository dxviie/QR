// src/routes/api/directus/+server.ts
import { createDirectus, rest, authentication, createItem } from '@directus/sdk';
import { json, type RequestHandler } from '@sveltejs/kit';
import { DIRECTUS_URL, DIRECTUS_LOGIN, DIRECTUS_PASS } from '$env/static/private';

const directus = createDirectus(DIRECTUS_URL).with(authentication('json')).with(rest());

// Handle POST requests
export const POST: RequestHandler = async ({ request }) => {
	const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	console.log(`[create-page API] [${requestId}] Request received`);
	
	try {
		// Make sure we're authenticated
		console.log(`[create-page API] [${requestId}] Attempting Directus login...`);
		const result = await directus.login(DIRECTUS_LOGIN, DIRECTUS_PASS);
		console.log(`[create-page API] [${requestId}] Directus login successful:`, {
			access_token: result?.access_token ? 'present' : 'missing',
			expires: result?.expires
		});
		
		console.log(`[create-page API] [${requestId}] Parsing request body...`);
		const rb = await request.json();
		
		console.log(`[create-page API] [${requestId}] Request body parsed:`, {
			action: rb.action,
			data: rb.data ? {
				title: rb.data.title,
				slug: rb.data.slug,
				image: rb.data.image,
				message: rb.data.message
			} : 'missing'
		});
		
		if (!rb.data) {
			console.error(`[create-page API] [${requestId}] ERROR: Missing data in request body`);
			return json({ success: false, error: 'Missing data in request body' }, { status: 400 });
		}
		
		console.log(`[create-page API] [${requestId}] Creating QR page in Directus...`);
		const qrPage = await directus.request(createItem('QrPages', rb.data));
		
		console.log(`[create-page API] [${requestId}] QR page created successfully:`, {
			pageId: qrPage?.id,
			title: qrPage?.title,
			slug: qrPage?.slug,
			image: qrPage?.image,
			message: qrPage?.message
		});
		
		const response = { success: true, page: qrPage };
		console.log(`[create-page API] [${requestId}] Returning success response`);
		return json(response);
	} catch (error) {
		console.error(`[create-page API] [${requestId}] ERROR:`, {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
			name: error instanceof Error ? error.name : undefined
		});
		return json({ 
			success: false, 
			error: error instanceof Error ? error.message : String(error) 
		}, { status: 500 });
	}
};
