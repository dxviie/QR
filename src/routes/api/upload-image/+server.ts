// src/routes/api/directus/+server.ts
import { createDirectus, rest, authentication, uploadFiles } from '@directus/sdk';
import { json, type RequestHandler } from '@sveltejs/kit';
import { DIRECTUS_URL, DIRECTUS_LOGIN, DIRECTUS_PASS } from '$env/static/private';

const directus = createDirectus(DIRECTUS_URL).with(authentication('json')).with(rest());

// Handle POST requests
export const POST: RequestHandler = async ({ request }) => {
	const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	console.log(`[upload-image API] [${requestId}] Request received`);
	
	try {
		// Make sure we're authenticated
		console.log(`[upload-image API] [${requestId}] Attempting Directus login...`);
		const result = await directus.login(DIRECTUS_LOGIN, DIRECTUS_PASS);
		console.log(`[upload-image API] [${requestId}] Directus login successful:`, {
			access_token: result?.access_token ? 'present' : 'missing',
			expires: result?.expires
		});
		
		try {
			// Get the form data from the request
			console.log(`[upload-image API] [${requestId}] Parsing request body...`);
			const rb = await request.json();
			
			console.log(`[upload-image API] [${requestId}] Request body parsed:`, {
				title: rb.title,
				filename_download: rb.filename_download,
				type: rb.type,
				width: rb.width,
				height: rb.height,
				storage: rb.storage,
				fileLength: rb.file ? rb.file.length : 0,
				filePrefix: rb.file ? rb.file.substring(0, 50) + '...' : 'null'
			});

			// Validate required fields
			if (!rb.file) {
				console.error(`[upload-image API] [${requestId}] ERROR: Missing file in request body`);
				return json({ success: false, error: 'Missing file in request body' }, { status: 400 });
			}
			
			if (!rb.filename_download) {
				console.error(`[upload-image API] [${requestId}] ERROR: Missing filename_download in request body`);
				return json({ success: false, error: 'Missing filename_download in request body' }, { status: 400 });
			}

			// Convert base64 to file
			console.log(`[upload-image API] [${requestId}] Converting base64 to buffer...`);
			const base64Data = rb.file.split(',')[1];
			if (!base64Data) {
				console.error(`[upload-image API] [${requestId}] ERROR: Invalid base64 data format (missing comma separator)`);
				return json({ success: false, error: 'Invalid base64 data format' }, { status: 400 });
			}
			
			console.log(`[upload-image API] [${requestId}] Base64 data extracted:`, {
				base64Length: base64Data.length,
				expectedPrefix: base64Data.substring(0, 20)
			});
			
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			const buffer = Buffer.from(base64Data, 'base64');
			console.log(`[upload-image API] [${requestId}] Buffer created:`, {
				bufferLength: buffer.length,
				bufferType: buffer.constructor.name
			});
			
			const file = new Blob([buffer], { type: 'image/png' });
			console.log(`[upload-image API] [${requestId}] Blob created:`, {
				blobSize: file.size,
				blobType: file.type
			});

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
			formData.append('file_1_width', String(rb.width));
			formData.append('file_1_height', String(rb.height));
			formData.append('file', file, rb.filename_download);

			console.log(`[upload-image API] [${requestId}] FormData prepared:`, {
				filename: rb.filename_download,
				title: rb.title,
				type: rb.type,
				width: rb.width,
				height: rb.height,
				fileSize: file.size
			});

			// Upload using the SDK
			console.log(`[upload-image API] [${requestId}] Uploading to Directus...`);
			const uploadedFile = await directus.request(uploadFiles(formData));
			console.log(`[upload-image API] [${requestId}] Directus upload successful:`, {
				fileId: uploadedFile?.id,
				filename: uploadedFile?.filename_download,
				title: uploadedFile?.title,
				type: uploadedFile?.type,
				width: uploadedFile?.width,
				height: uploadedFile?.height
			});

			const response = {
				success: true,
				fileId: uploadedFile ? uploadedFile.id : ''
			};
			
			console.log(`[upload-image API] [${requestId}] Returning success response:`, response);
			return json(response);
		} catch (error) {
			console.error(`[upload-image API] [${requestId}] ERROR in upload processing:`, {
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
				name: error instanceof Error ? error.name : undefined
			});
			return json({ 
				success: false, 
				error: error instanceof Error ? error.message : String(error) 
			}, { status: 500 });
		}
	} catch (error) {
		console.error(`[upload-image API] [${requestId}] ERROR in Directus authentication:`, {
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
