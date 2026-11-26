import QRCode from 'qrcode-svg';

export interface QRConfig {
	value: string;
	ecl: 'L' | 'M' | 'Q' | 'H';
	penMmSize: number;
}

// Used when the request carries no parseable JSON body (e.g. a plain GET).
export const DEFAULT_CONFIG: QRConfig = {
	value: 'https://qr.d17e.dev',
	ecl: 'L',
	penMmSize: 20
};

// Ported unchanged from the Val Town webhook (d17e/qrCodeWebhook) so the API keeps
// returning byte-identical SVGs. It is the site's src/lib/qrPathGenerator.ts with
// `overlap` fixed to true, no opacity attribute and no total path length; the two
// differ in float rounding, so don't swap one for the other without checking the
// fixtures in test/.
export function generateQrSVGPaths(qrData: boolean[][], penWidth: number): string[] {
	const paths = [];
	const visited = new Array(qrData.length)
		.fill(0)
		.map(() => new Array(qrData[0].length).fill(false));
	const width = qrData[0].length;
	const pathAdjustment = penWidth / 2;
	const height = qrData.length;
	const overlap = true;

	function createPath(
		startX: number,
		startY: number,
		endX: number,
		endY: number,
		penWidth: number
	): string {
		return `<path d="M${startX},${startY}H${endX}V${endY}" fill="none" stroke="black" stroke-width="${penWidth}" stroke-linecap="round"/>`;
	}

	function visitRow(visited: boolean[][], y: number, startX: number, endX: number) {
		for (let x = startX; x <= endX; x++) {
			visited[y][x] = true;
		}
	}

	function visitColumn(visited: boolean[][], x: number, startY: number, endY: number) {
		for (let y = startY; y <= endY; y++) {
			visited[y][x] = true;
		}
	}

	// Scan horizontally
	for (let y = 0; y < height; y++) {
		let startX = null;
		for (let x = 0; x < width; x++) {
			if (qrData[y][x] && startX === null) {
				startX = x;
			} else if ((!qrData[y][x] || x === width - 1) && startX !== null) {
				const endX = qrData[y][x] ? x : x - 1;
				if (startX !== endX) {
					paths.push(
						createPath(
							startX * penWidth + pathAdjustment,
							y * penWidth + pathAdjustment,
							(endX + 1) * penWidth - pathAdjustment,
							y * penWidth + pathAdjustment,
							penWidth
						)
					);
					visitRow(visited, y, startX, endX);
				}
				startX = null;
			}
		}
	}

	// Scan vertically
	for (let x = 0; x < width; x++) {
		let startY = null;
		for (let y = 0; y < height; y++) {
			if (qrData[y][x] && startY === null && (!visited[y][x] || overlap)) {
				startY = y;
			} else if (
				(!qrData[y][x] || y === height - 1 || (visited[y][x] && !overlap)) &&
				startY !== null
			) {
				const endY = qrData[y][x] ? (overlap ? y : y - 1) : y - 1;
				if (startY !== endY) {
					paths.push(
						createPath(
							x * penWidth + pathAdjustment,
							startY * penWidth + pathAdjustment,
							x * penWidth + pathAdjustment,
							(endY + 1) * penWidth - pathAdjustment,
							penWidth
						)
					);
					visitColumn(visited, x, startY, endY);
				}
				startY = null;
			}
		}
	}

	// Scan for all single black pixels
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if (qrData[y][x] && !visited[y][x]) {
				paths.push(
					createPath(
						x * penWidth + pathAdjustment,
						y * penWidth + pathAdjustment,
						x * penWidth + (penWidth - pathAdjustment),
						y * penWidth + pathAdjustment,
						penWidth
					)
				);
			}
		}
	}
	return paths;
}

// Throws (via qrcode-svg) when `value` is empty or `ecl` is missing or invalid.
export function generatePlottableQrSvg(config: QRConfig): string {
	let dimension = 21;
	let plottableQrSize = dimension * (config.penMmSize || 0);
	let plottableQrViewBox = `0 0 ${plottableQrSize} ${plottableQrSize}`;

	const qr = new QRCode({
		content: config.value,
		padding: 0,
		width: dimension,
		height: dimension,
		color: '#000000',
		background: '#ffffff',
		ecl: config.ecl,
		join: false,
		predefined: false
	});

	const qrData = qr.qrcode.modules;
	if (qrData && qrData.length > dimension) {
		dimension = qrData.length;
		plottableQrSize = dimension * (config.penMmSize || 0);
		plottableQrViewBox = `0 0 ${plottableQrSize} ${plottableQrSize}`;
	}

	const paths = generateQrSVGPaths(qrData, config.penMmSize);

	return (
		`<svg width="${plottableQrSize}" height="${plottableQrSize}" viewBox="${plottableQrViewBox}" xmlns="http://www.w3.org/2000/svg">\n` +
		`      ${paths.join('')}\n` +
		`    </svg>`
	);
}
