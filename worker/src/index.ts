import { DEFAULT_CONFIG, generatePlottableQrSvg, type QRConfig } from './plottableQr.ts';

// Val Town added these to every response; keep them so browser callers keep working.
const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

function respond(body: string | null, status: number, headers: Record<string, string> = {}) {
	return new Response(body, { status, headers: { ...CORS_HEADERS, ...headers } });
}

export default {
	async fetch(request: Request): Promise<Response> {
		if (request.method === 'OPTIONS') {
			return respond(null, 204, {
				'Access-Control-Allow-Headers':
					request.headers.get('Access-Control-Request-Headers') ?? 'Content-Type',
				'Access-Control-Max-Age': '86400'
			});
		}

		if (request.method !== 'POST' && request.method !== 'GET') {
			return respond('Method Not Allowed', 405);
		}

		try {
			let config: QRConfig = DEFAULT_CONFIG;
			try {
				config = await request.json<QRConfig>();
			} catch {
				console.error('bad config using default');
			}

			return respond(generatePlottableQrSvg(config), 200, { 'Content-Type': 'image/svg+xml' });
		} catch {
			return respond('Bad Request', 400);
		}
	}
} satisfies ExportedHandler;
