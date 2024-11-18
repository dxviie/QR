// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

const GROUPS_TO_REMOVE = ['cutting-lines', 'qr-codes', 'qr-text', 'extra-text', 'logos', 'subtext'];
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
	console.debug('Generating QR pages', 'data:', qrData, 'svg:', svg);

	const fullCopy = svg.cloneNode(true);
	const artworkCopy = svg.cloneNode(true);
	artworkCopy.querySelectorAll('g').forEach((g) => {
		const id = g.getAttribute('id');
		if (id && ALL_GROUPS.some((pattern) => id.includes(pattern))) {
			g.remove();
		}
	});
	await uploadImageForSVG(fullCopy, artworkTitle + '-business-card-layout.png');
	await uploadImageForSVG(artworkCopy, artworkTitle + '-artwork.png');

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
			const pageResponse = await fetch('/api/create-page', {
				method: 'POST',
				body: JSON.stringify({
					action: 'createQRPage',
					data: {
						title: `${artworkTitle} - (card ${cardCount}/${cards})`,
						image: cardCutOutId,
						message: outlineFileId,
						slug: `${item.code.toLowerCase()}`
					}
				})
			});
			const { page } = await pageResponse.json();
			console.debug('Created page', page.id, 'for', item.code);
			cardCount++;

			results.push({
				success: true,
				code: item.code,
				pageId: page.id
			});
		} catch (error) {
			results.push({
				success: false,
				code: item.code,
				error: error.message
			});
		}
	}

	return results;
}

async function uploadImageForSVG(svgElement, filename) {
	if (!svgElement) {
		console.error('SVG not found');
		return;
	}
	return new Promise((resolve, reject) => {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		// Get SVG dimensions and viewBox
		let width, height;
		if (svgElement.viewBox.baseVal) {
			width = svgElement.viewBox.baseVal.width;
			height = svgElement.viewBox.baseVal.height;
		} else {
			width = svgElement.width.baseVal.value;
			height = svgElement.height.baseVal.value;
		}

		// Set a high fixed width and scale height proportionally
		const targetWidth = 1280;
		const scale = targetWidth / width;
		canvas.width = targetWidth;
		canvas.height = height * scale;

		const svgString = new XMLSerializer().serializeToString(svgElement);
		const svgBlob = new Blob(
			[`<?xml version="1.0" encoding="UTF-8" standalone="no"?>`, svgString],
			{ type: 'image/svg+xml;charset=utf-8' }
		);
		const url = URL.createObjectURL(svgBlob);

		const img = new Image();
		img.onload = async () => {
			try {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.scale(scale, scale);
				ctx.drawImage(img, 0, 0, width, height);
				URL.revokeObjectURL(url);

				// Get the blob for upload-image
				const blob = await new Promise((resolve) => {
					canvas.toBlob((b) => resolve(b), 'image/png', 1.0);
				});

				// Convert blob to base64
				const base64 = await new Promise((resolve) => {
					const reader = new FileReader();
					reader.onloadend = () => resolve(reader.result);
					reader.readAsDataURL(blob);
				});

				// Upload to server
				const response = await fetch('/api/upload-image', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						title: 'Generated Image',
						filename_download: filename,
						type: 'image/png',
						storage: 'local',
						file: base64,
						width: canvas.width,
						height: canvas.height
					})
				});

				const result = await response.json();
				if (!result.success) {
					throw new Error(result.error);
				}
				resolve(result.fileId);
			} catch (error) {
				reject(error);
			}
		};

		img.onerror = reject;
		img.src = url;
	});
}
