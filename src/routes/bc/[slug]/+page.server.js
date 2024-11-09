// @ts-nocheck
import { createDirectus, rest, authentication, uploadFiles, readItems } from '@directus/sdk';
import { error } from '@sveltejs/kit';
import { DIRECTUS_URL, DIRECTUS_LOGIN, DIRECTUS_PASS } from '$env/static/private';

const directus = createDirectus(DIRECTUS_URL).with(authentication('json')).with(rest());

function extractUUID(markdownImage) {
	const regex = /!\[.*?\]\((.*?)\)/;
	const match = markdownImage.match(regex);
	return match ? match[1] : null;
}

/** @type {import('./$types').PageServerLoad} */
export async function entries() {
	const result = await directus.login(DIRECTUS_LOGIN, DIRECTUS_PASS);
	console.debug('Logged in:', result);
	try {
		const result = await directus.request(
			readItems('QrPages', {
				limit: -1
			})
		);
		console.debug('Read items:', result.length);
		if (result.length === 0) {
			throw error(404, 'Not found');
		}
		return result.map((p) => ({
			slug: p.slug
		}));
	} catch (e) {
		throw error(404, 'Not found');
	}
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const { slug } = params;
	const result = await directus.login(DIRECTUS_LOGIN, DIRECTUS_PASS);
	console.debug('Logged in:', result);
	try {
		const result = await directus.request(
			readItems('QrPages', {
				filter: {
					slug: {
						_eq: slug
					}
				}
			})
		);
		console.debug('Read items:', result.length);
		if (result.length === 0) {
			throw error(404, 'Not found');
		}
		const { title, image, message } = result[0];
		const outline = extractUUID(message);

		return {
			slug,
			title: title,
			content: message,
			blankOutImage: image,
			outlineImage: outline
		};
	} catch (e) {
		throw error(404, 'Not found');
	}
}
