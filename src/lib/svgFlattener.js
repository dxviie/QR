// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
export function flattenSVGToPaths(svgString) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(svgString, 'text/xml');
	let output = [];

	function processElement(element) {
		if (element.tagName === 'g') {
			// Start group
			const groupAttrs = element.attributes;
			let groupOpen = '<g';
			for (let i = 0; i < groupAttrs.length; i++) {
				const attr = groupAttrs[i];
				groupOpen += ` ${attr.name}="${attr.value}"`;
			}
			groupOpen += '>';
			output.push(groupOpen);

			// Process children
			Array.from(element.children).forEach((child) => {
				processElement(child);
			});

			// Close group
			output.push('</g>');
		} else if (element.tagName === 'path') {
			// Process path directly
			const d = element.getAttribute('d') || '';
			const transform = element.getAttribute('transform') || '';
			const style = element.getAttribute('style') || '';
			output.push(`<path 
                d="${d}"
                transform="${transform}"
                style="${style}"
                ${element.getAttribute('fill') ? `fill="${element.getAttribute('fill')}"` : ''}
                ${element.getAttribute('stroke') ? `stroke="${element.getAttribute('stroke')}"` : ''}
                ${element.getAttribute('stroke-width') ? `stroke-width="${element.getAttribute('stroke-width')}"` : ''}
                ${element.getAttribute('stroke-linecap') ? `stroke-linecap="${element.getAttribute('stroke-linecap')}"` : ''}
            />`);
		} else {
			// Process other elements' children
			Array.from(element.children).forEach((child) => {
				processElement(child);
			});
		}
	}

	processElement(doc.documentElement);
	return output.join('\n');
}
