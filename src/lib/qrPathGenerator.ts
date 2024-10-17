export function generateQrSVGPaths(
	qrData: boolean[][],
	penWidth: number,
	overlap: boolean,
	transparent: boolean
): string[] {
	const paths = [];
	const visited = new Array(qrData.length)
		.fill(0)
		.map(() => new Array(qrData[0].length).fill(false));
	const width = qrData[0].length;
	const pathAdjustment = penWidth / 2;
	const height = qrData.length;

	function createPath(
		startX: number,
		startY: number,
		endX: number,
		endY: number,
		penWidth: number,
		transparent: boolean
	): string {
		return `<path d="M${startX},${startY}H${endX}V${endY}" fill="none" stroke="black" stroke-width="${penWidth}" stroke-linecap="round" opacity="${transparent ? 0.5 : 1}"/>`;
	}

	function calculatePathLength(startX: number, startY: number, endX: number, endY: number): number {
		return Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
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

	let totalPathLength = 0;
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
							penWidth,
							transparent
						)
					);
					totalPathLength += calculatePathLength(
						startX * penWidth + pathAdjustment,
						y * penWidth + pathAdjustment,
						(endX + 1) * penWidth - pathAdjustment,
						y * penWidth + pathAdjustment
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
							penWidth,
							transparent
						)
					);
					totalPathLength += calculatePathLength(
						x * penWidth + pathAdjustment,
						startY * penWidth + pathAdjustment,
						x * penWidth + pathAdjustment,
						(endY + 1) * penWidth - pathAdjustment
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
						x * penWidth + penWidth - pathAdjustment,
						y * penWidth + pathAdjustment,
						penWidth,
						transparent
					)
				);
				totalPathLength += calculatePathLength(
					x * penWidth + pathAdjustment,
					y * penWidth + pathAdjustment,
					x * penWidth + penWidth - pathAdjustment,
					y * penWidth + pathAdjustment
				);
			}
		}
	}
	paths.push(totalPathLength.toFixed(0));
	return paths;
}
