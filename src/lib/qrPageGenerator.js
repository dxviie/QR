// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

const GROUPS_TO_REMOVE = ['cutting-lines', 'qr-codes', 'qr-text', 'logos', 'subtext'];
const CUTOUT_GROUPS_TO_REMOVE = ['qr-codes', 'qr-text', 'logos', 'subtext'];
const ALL_GROUPS = ['cutting-lines', 'qr-codes', 'qr-text', 'logos', 'subtext', 'card-rects'];

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
	// await uploadImageForSVG(fullCopy, artworkTitle + '-business-card-layout.png');
	// await uploadImageForSVG(artworkCopy, artworkTitle + '-artwork.png');

	const results = [];
	const cards = qrData.length;
	let cardCount = 1;
	for (const item of qrData) {
		if (cardCount > 1) {
			// return;
		}
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

			let cropXRatio = 0;
			let cropYRatio = 0;
			let cropWidthRatio = 1;
			let cropHeightRatio = 1;
			if (targetRect) {
				const x = parseFloat(targetRect.getAttribute('x'));
				const y = parseFloat(targetRect.getAttribute('y'));
				const width = parseFloat(targetRect.getAttribute('width'));
				const height = parseFloat(targetRect.getAttribute('height'));
				const fullWidth = parseFloat(svg.getAttribute('width'));
				const fullHeight = parseFloat(svg.getAttribute('height'));
				targetRect.remove();

				cropXRatio = x / fullWidth;
				cropYRatio = y / fullHeight;
				cropWidthRatio = width / fullWidth;
				cropHeightRatio = height / fullHeight;
				//
				// // Find the original image definition and copy it
				// const originalDefs = svg.querySelector('defs');
				// const flippedImageDef = originalDefs.querySelector('#flipped-image');
				//
				// // Make sure we have defs in our copy
				// let copyDefs = cardCutOutCopy.querySelector('defs');
				// if (!copyDefs) {
				// 	copyDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
				// 	cardCutOutCopy.insertBefore(copyDefs, cardCutOutCopy.firstChild);
				// }
				//
				// // Copy the image definition
				// if (flippedImageDef) {
				// 	copyDefs.appendChild(flippedImageDef.cloneNode(true));
				// }
				//
				// cardCutOutCopy.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
				// cardCutOutCopy.setAttribute('width', width);
				// cardCutOutCopy.setAttribute('height', height);
			}
			// Upload Image
			const fileId = await uploadImageForSVG(
				cardCutOutCopy,
				item.code + '-card.png',
				cropXRatio,
				cropYRatio,
				cropWidthRatio,
				cropHeightRatio
			);
			console.debug('Uploaded blank-out image', fileId);

			// console.debug('Creating blank-out image for', item.code);
			// const blankOutCopy = svg.cloneNode(true);
			// blankOutCopy.querySelectorAll('g').forEach((g) => {
			// 	const id = g.getAttribute('id');
			// 	if (id && GROUPS_TO_REMOVE.some((pattern) => id.includes(pattern))) {
			// 		g.remove();
			// 	}
			// });
			// blankOutCopy.querySelectorAll('rect').forEach((rect) => {
			// 	const id = rect.getAttribute('id');
			// 	if (id && id !== `card-${item.code}`) {
			// 		rect.remove();
			// 	} else {
			// 		rect.setAttribute('fill', '#FFFFFFFF');
			// 	}
			// });
			// // Upload Image
			// const fileId = await uploadImageForSVG(blankOutCopy, item.code + '-blank.png');
			// console.debug('Uploaded blank-out image', fileId);
			//
			// // Create Outline Image
			// console.debug('Creating outline image for', item.code);
			// let outlineCopy = svg.cloneNode(true);
			// outlineCopy.querySelectorAll('g').forEach((g) => {
			// 	const id = g.getAttribute('id');
			// 	if (id && GROUPS_TO_REMOVE.some((pattern) => id.includes(pattern))) {
			// 		g.remove();
			// 	}
			// });
			// outlineCopy.querySelectorAll('rect').forEach((rect) => {
			// 	const id = rect.getAttribute('id');
			// 	if (id && id !== `card-${item.code}`) {
			// 		rect.remove();
			// 	} else {
			// 		rect.setAttribute('fill', 'none');
			// 		rect.setAttribute('stroke', '#FFFFFF');
			// 		rect.setAttribute('stroke-width', '3');
			// 	}
			// });
			// const outlineFileId = await uploadImageForSVG(outlineCopy, item.code + '-outline.png');
			// console.debug('Uploaded outline image', outlineFileId);

			// Create QR Page
			// const pageResponse = await fetch('/api/create-page', {
			// 	method: 'POST',
			// 	body: JSON.stringify({
			// 		action: 'createQRPage',
			// 		data: {
			// 			title: `${artworkTitle} ${cardCount}/${cards}`,
			// 			image: fileId,
			// 			message: outlineFileId,
			// 			slug: `${item.code.toLowerCase()}`
			// 		}
			// 	})
			// });
			// const { page } = await pageResponse.json();
			// console.debug('Created page', page.id, 'for', item.code);
			//
			// results.push({
			// 	success: true,
			// 	code: item.code,
			// 	pageId: page.id
			// });
			cardCount++;
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

async function uploadImageForSVG(
	svgElement,
	filename,
	cropXRatio,
	cropYRatio,
	cropWidthRatio,
	cropHeightRatio
) {
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
				console.debug('Cropping', cropXRatio, cropYRatio, cropWidthRatio, cropHeightRatio);
				const dw = width * cropWidthRatio * scale;
				const dh = height * cropHeightRatio * scale;
				const dx = canvas.width * cropXRatio;
				const dy = canvas.height * cropYRatio;

				console.debug(
					'Crop dimensions',
					width,
					height,
					dx,
					dy,
					dw,
					dh,
					canvas.width,
					canvas.height
				);
				ctx.drawImage(img, dx, dy, dw, dh, 0, 0, dw, dh);
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
