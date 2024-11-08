// src/routes/api/directus/+server.ts
import { createDirectus, rest, authentication, uploadFiles } from '@directus/sdk';
import { json, type RequestHandler } from '@sveltejs/kit';
import { DIRECTUS_URL, DIRECTUS_LOGIN, DIRECTUS_PASS } from '$env/static/private';

const directus = createDirectus(DIRECTUS_URL).with(authentication('json')).with(rest());

// Handle POST requests
export const POST: RequestHandler = async ({ request }) => {
	try {
		// Make sure we're authenticated
		const result = await directus.login(DIRECTUS_LOGIN, DIRECTUS_PASS);
		console.debug('Logged in:', result);
		try {
			// Get the form data from the request
			const rb = await request.json();

			// Convert base64 to file
			const base64Data = rb.file.split(',')[1];
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			const buffer = Buffer.from(base64Data, 'base64');
			const file = new Blob([buffer], { type: 'image/png' });

			// Create payload object for Directus
			const payload = {
				title: rb.title,
				filename_download: rb.filename_download,
				type: rb.type,
				// folder: rb.folder,
				width: rb.width,
				height: rb.height,
				file: file,
				storage: 'local'
			};

			const formData = new FormData();
			formData.append('file_1_title', rb.title);
			formData.append('file_1_type', rb.type);
			formData.append('file_1_width', rb.width);
			formData.append('file_1_height', rb.height);
			formData.append('file_1_filename_download', rb.filename_download);
			formData.append('file', file, 'hello.png');

			console.debug('Uploading file:', payload);

			// Upload using the SDK
			const uploadedFile = await directus.request(uploadFiles(formData));
			console.debug('Uploaded file:', uploadedFile);

			return json({
				success: true,
				fileId: uploadedFile ? uploadedFile.id : ''
			});
		} catch (error) {
			console.error('Upload error:', error);
			return json({ success: false, error: error }, { status: 500 });
		}
	} catch (error) {
		console.error('Directus error:', error);
		return json({ success: false, error: error }, { status: 500 });
	}
};
