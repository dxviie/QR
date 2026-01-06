// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// const GROUPS_TO_REMOVE = ['cutting-lines', 'qr-codes', 'qr-text', 'extra-text', 'logos', 'subtext', 'name'];
const GROUPS_TO_REMOVE = ['cutting-lines', 'qr-codes', 'qr-text', 'extra-text', 'logos', 'subtext', 'name'];
const ALL_GROUPS = [
	'cutting-lines',
	'qr-codes',
	'qr-text',
	'logos',
	'extra-text',
	'subtext',
	'card-rects'
];

export async function generateQrPages(qrData, svg, artworkTitle) {
	console.log('[generateQrPages] Starting QR page generation:', {
		artworkTitle: artworkTitle,
		qrDataCount: qrData?.length || 0,
		hasSvg: !!svg,
		timestamp: new Date().toISOString()
	});

	if (!svg) {
		console.error('[generateQrPages] ERROR: SVG element is null or undefined');
		throw new Error('SVG element is required');
	}
	
	if (!artworkTitle) {
		console.error('[generateQrPages] ERROR: Artwork title is required');
		throw new Error('Artwork title is required');
	}

	console.log('[generateQrPages] Creating full copy and artwork copy of SVG...');
	const fullCopy = svg.cloneNode(true);
	const artworkCopy = svg.cloneNode(true);
	
	console.log('[generateQrPages] Removing groups from artwork copy...');
	const removedGroups = [];
	artworkCopy.querySelectorAll('g').forEach((g) => {
		const id = g.getAttribute('id');
		if (id && ALL_GROUPS.some((pattern) => id.includes(pattern))) {
			removedGroups.push(id);
			g.remove();
		}
	});
	console.log('[generateQrPages] Removed groups from artwork copy:', removedGroups);
	
	console.log('[generateQrPages] Uploading full business card layout...');
	const fullLayoutId = await uploadImageForSVG(fullCopy, artworkTitle + '-business-card-layout.png');
	console.log('[generateQrPages] Full layout uploaded, fileId:', fullLayoutId);
	
	console.log('[generateQrPages] Uploading artwork-only image...');
	const artworkId = await uploadImageForSVG(artworkCopy, artworkTitle + '-artwork.png');
	console.log('[generateQrPages] Artwork uploaded, fileId:', artworkId);

	const results = [];
	const cards = qrData.length;
	let cardCount = 1;
	for (const item of qrData) {
		try {
			console.debug('Creating card cut-out image for', item.code);
			let targetRect = null;
			const cardCutOutCopy = svg.cloneNode(true);
			cardCutOutCopy.querySelectorAll('g').forEach((g) => {
				const id = g.getAttribute('id');
				if (id && GROUPS_TO_REMOVE.some((pattern) => id.includes(pattern))) {
					g.remove();
				}
			});
			cardCutOutCopy.querySelectorAll('rect').forEach((rect) => {
				const id = rect.getAttribute('id');
				if (id && id !== `card-${item.code}`) {
					rect.remove();
				} else {
					targetRect = rect;
				}
			});

			if (targetRect) {
				const x = parseFloat(targetRect.getAttribute('x'));
				const y = parseFloat(targetRect.getAttribute('y'));
				const width = parseFloat(targetRect.getAttribute('width'));
				const height = parseFloat(targetRect.getAttribute('height'));
				cardCutOutCopy.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
				cardCutOutCopy.setAttribute('width', width);
				cardCutOutCopy.setAttribute('height', height);
				targetRect.remove();
			}
			// Upload Image
			const cardCutOutId = await uploadImageForSVG(cardCutOutCopy, item.code + '-card.png');
			console.debug('Uploaded blank-out image', cardCutOutId);

			// Create Outline Image
			console.debug('Creating outline image for', item.code);
			let outlineCopy = svg.cloneNode(true);
			outlineCopy.querySelectorAll('g').forEach((g) => {
				const id = g.getAttribute('id');
				if (id && GROUPS_TO_REMOVE.some((pattern) => id.includes(pattern))) {
					g.remove();
				}
			});
			outlineCopy.querySelectorAll('rect').forEach((rect) => {
				const id = rect.getAttribute('id');
				if (id && id !== `card-${item.code}`) {
					rect.remove();
				} else {
					rect.setAttribute('fill', 'none');
					rect.setAttribute('stroke', '#FFFFFF');
					rect.setAttribute('stroke-width', '3');
				}
			});
			const outlineFileId = await uploadImageForSVG(outlineCopy, item.code + '-outline.png');
			console.debug('Uploaded outline image', outlineFileId);

			// Create QR Page
			const pageData = {
				action: 'createQRPage',
				data: {
					title: `${artworkTitle} - (card ${cardCount}/${cards})`,
					image: cardCutOutId,
					message: outlineFileId,
					slug: `${item.code.toLowerCase()}`
				}
			};
			
			console.log(`[generateQrPages] Creating QR page for ${item.code}:`, pageData);
			
			const pageResponse = await fetch('/api/create-page', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(pageData)
			});
			
			console.log(`[generateQrPages] Page creation response for ${item.code}:`, {
				status: pageResponse.status,
				statusText: pageResponse.statusText,
				ok: pageResponse.ok
			});
			
			const pageResult = await pageResponse.json();
			console.log(`[generateQrPages] Page creation result for ${item.code}:`, pageResult);
			
			if (!pageResult.success) {
				throw new Error(pageResult.error || 'Failed to create page');
			}
			
			const { page } = pageResult;
			console.log(`[generateQrPages] Successfully created page ${page.id} for ${item.code}`);
			cardCount++;

			results.push({
				success: true,
				code: item.code,
				pageId: page.id
			});
		} catch (error) {
			console.error(`[generateQrPages] ERROR processing card ${item.code}:`, {
				code: item.code,
				error: error.message,
				stack: error.stack,
				cardCount: cardCount,
				totalCards: cards
			});
			results.push({
				success: false,
				code: item.code,
				error: error.message
			});
		}
	}

	console.log('[generateQrPages] QR page generation completed:', {
		totalCards: cards,
		successful: results.filter(r => r.success).length,
		failed: results.filter(r => !r.success).length,
		results: results
	});
	
	return results;
}

async function uploadImageForSVG(svgElement, filename) {
	console.log('[uploadImageForSVG] Starting upload process for filename:', filename);
	
	if (!svgElement) {
		console.error('[uploadImageForSVG] ERROR: SVG element not found');
		return;
	}
	
	console.log('[uploadImageForSVG] SVG element found:', {
		tagName: svgElement.tagName,
		hasViewBox: !!svgElement.viewBox,
		viewBox: svgElement.viewBox?.baseVal,
		width: svgElement.width?.baseVal?.value,
		height: svgElement.height?.baseVal?.value
	});
	
	return new Promise((resolve, reject) => {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		// Get SVG dimensions and viewBox
		let width, height;
		if (svgElement.viewBox.baseVal) {
			width = svgElement.viewBox.baseVal.width;
			height = svgElement.viewBox.baseVal.height;
			console.log('[uploadImageForSVG] Using viewBox dimensions:', { width, height });
		} else {
			width = svgElement.width.baseVal.value;
			height = svgElement.height.baseVal.value;
			console.log('[uploadImageForSVG] Using width/height attributes:', { width, height });
		}

		// Set a high fixed width and scale height proportionally
		const targetWidth = 1280;
		const scale = targetWidth / width;
		canvas.width = targetWidth;
		canvas.height = height * scale;
		
		console.log('[uploadImageForSVG] Canvas dimensions set:', {
			canvasWidth: canvas.width,
			canvasHeight: canvas.height,
			scale: scale,
			originalWidth: width,
			originalHeight: height
		});

		const svgString = new XMLSerializer().serializeToString(svgElement);
		const svgBlob = new Blob(
			[`<?xml version="1.0" encoding="UTF-8" standalone="no"?>`, svgString],
			{ type: 'image/svg+xml;charset=utf-8' }
		);
		const url = URL.createObjectURL(svgBlob);
		
		console.log('[uploadImageForSVG] SVG serialized:', {
			svgStringLength: svgString.length,
			blobSize: svgBlob.size,
			blobType: svgBlob.type,
			objectURL: url.substring(0, 50) + '...'
		});

		const img = new Image();
		img.onload = async () => {
			try {
				console.log('[uploadImageForSVG] Image loaded successfully:', {
					naturalWidth: img.naturalWidth,
					naturalHeight: img.naturalHeight
				});
				
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.scale(scale, scale);
				ctx.drawImage(img, 0, 0, width, height);
				URL.revokeObjectURL(url);
				
				console.log('[uploadImageForSVG] Image drawn to canvas');

				// Get the blob for upload-image
				const blob = await new Promise((resolve, reject) => {
					canvas.toBlob((b) => {
						if (b) {
							console.log('[uploadImageForSVG] Canvas converted to blob:', {
								blobSize: b.size,
								blobType: b.type
							});
							resolve(b);
						} else {
							console.error('[uploadImageForSVG] ERROR: Failed to convert canvas to blob');
							reject(new Error('Failed to convert canvas to blob'));
						}
					}, 'image/png', 1.0);
				});

				// Convert blob to base64
				const base64 = await new Promise((resolve, reject) => {
					const reader = new FileReader();
					reader.onloadend = () => {
						const result = reader.result;
						console.log('[uploadImageForSVG] Blob converted to base64:', {
							base64Length: result ? result.length : 0,
							base64Prefix: result ? result.substring(0, 50) + '...' : 'null'
						});
						resolve(result);
					};
					reader.onerror = (error) => {
						console.error('[uploadImageForSVG] ERROR: FileReader error:', error);
						reject(error);
					};
					reader.readAsDataURL(blob);
				});

				// Upload to server
				const uploadPayload = {
					title: 'Generated Image',
					filename_download: filename,
					type: 'image/png',
					storage: 'local',
					file: base64,
					width: canvas.width,
					height: canvas.height
				};
				
				console.log('[uploadImageForSVG] Sending upload request:', {
					filename: filename,
					width: uploadPayload.width,
					height: uploadPayload.height,
					fileSize: base64 ? base64.length : 0,
					timestamp: new Date().toISOString()
				});
				
				const response = await fetch('/api/upload-image', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(uploadPayload)
				});

				console.log('[uploadImageForSVG] Upload response received:', {
					status: response.status,
					statusText: response.statusText,
					ok: response.ok,
					headers: Object.fromEntries(response.headers.entries())
				});

				const result = await response.json();
				console.log('[uploadImageForSVG] Upload response JSON:', result);
				
				if (!result.success) {
					console.error('[uploadImageForSVG] ERROR: Upload failed:', result.error);
					throw new Error(result.error || 'Upload failed');
				}
				
				console.log('[uploadImageForSVG] Upload successful, fileId:', result.fileId);
				resolve(result.fileId);
			} catch (error) {
				console.error('[uploadImageForSVG] ERROR in image processing/upload:', {
					error: error.message,
					stack: error.stack,
					filename: filename
				});
				reject(error);
			}
		};

		img.onerror = (error) => {
			console.error('[uploadImageForSVG] ERROR: Image load failed:', {
				error: error,
				filename: filename,
				src: url.substring(0, 50) + '...'
			});
			URL.revokeObjectURL(url);
			reject(new Error('Failed to load image from SVG'));
		};
		
		img.src = url;
		console.log('[uploadImageForSVG] Image source set, waiting for load...');
	});
}
