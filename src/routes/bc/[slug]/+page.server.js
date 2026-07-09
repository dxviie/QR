// @ts-nocheck
import { createDirectus, rest, authentication, readItems } from '@directus/sdk';
import { error } from '@sveltejs/kit';
import { building } from '$app/environment';
import { DIRECTUS_URL, DIRECTUS_LOGIN, DIRECTUS_PASS } from '$env/static/private';

export const prerender = true;

const directus = createDirectus(DIRECTUS_URL).with(authentication('json')).with(rest());

let pagesPromise = null;

async function fetchAllPages() {
	const result = await directus.login(DIRECTUS_LOGIN, DIRECTUS_PASS);
	console.debug('Logged in:', result);
	const pages = await directus.request(
		readItems('QrPages', {
			limit: -1,
			fields: ['slug', 'title', 'image', 'message']
		})
	);
	console.debug('Read items:', pages.length);
	return pages;
}

// During prerendering every load() runs in the same process, so one login and
// one fetch serve entries() and all pages. In dev, fetch fresh per request.
function getAllPages() {
	if (building) {
		pagesPromise ??= fetchAllPages();
		return pagesPromise;
	}
	return fetchAllPages();
}

/** @type {import('./$types').EntryGenerator} */
export async function entries() {
	let pages;
	try {
		pages = await getAllPages();
	} catch (e) {
		throw error(404, 'Not found');
	}
	if (pages.length === 0) {
		throw error(404, 'Not found');
	}
	return pages.map((p) => ({
		slug: p.slug
	}));
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const { slug } = params;
	let pages;
	try {
		pages = await getAllPages();
	} catch (e) {
		throw error(404, 'Not found');
	}
	const page = pages.find((p) => p.slug === slug);
	if (!page) {
		throw error(404, 'Not found');
	}
	const { title, image, message } = page;

	return {
		slug,
		title: title,
		content: message,
		blankOutImage: image,
		outlineImage: message
	};
}
