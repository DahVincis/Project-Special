import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import worker, { shapePlace } from './index.mjs';

const PLACE_ID = 'ChIJk0gR5uMP6IkRsc_qKOkMSEk';
const KEY = 'test-google-key';

function placePayload(overrides = {}) {
    return {
        rating: 4.9,
        userRatingCount: 31,
        googleMapsUri: 'https://maps.google.com/?cid=1',
        formattedAddress: '123 Private St',
        internationalPhoneNumber: '+1-555-0100',
        reviews: [
            {
                rating: 5,
                text: { text: 'Great work', languageCode: 'en' },
                originalText: { text: 'Great work', languageCode: 'en' },
                authorAttribution: {
                    displayName: 'Ann A.',
                    uri: 'https://maps.google.com/contrib/1',
                    photoUri: 'https://example.com/photo.jpg',
                },
                relativePublishTimeDescription: 'a month ago',
                flagContentUri: 'https://example.com/flag',
                name: 'places/x/reviews/y',
                publishTime: '2026-09-01T00:00:00Z',
            },
            {
                rating: 4,
                text: { text: 'Good', languageCode: 'en' },
                authorAttribution: { displayName: 'Bob', uri: 'javascript:alert(1)' },
                relativePublishTimeDescription: 'a week ago',
            },
            ...Array.from({ length: 4 }, (_, i) => ({
                rating: 5,
                text: { text: `extra ${i}`, languageCode: 'en' },
                authorAttribution: { displayName: `Person ${i}`, uri: 'https://maps.google.com/contrib/x' },
                relativePublishTimeDescription: 'yesterday',
            })),
        ],
        ...overrides,
    };
}

async function call(pathname, { method = 'GET', key = KEY, search = '', google } = {}) {
    const calls = [];
    const previous = globalThis.fetch;
    globalThis.fetch = async (url, init) => {
        calls.push({ url: String(url), init });
        if (google) return google(url, init);
        return new Response(JSON.stringify(placePayload()), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });
    };
    const assets = [];
    try {
        const response = await worker.fetch(
            new Request(`https://specialfinisheshi.com${pathname}${search}`, { method }),
            {
                GOOGLE_MAPS_KEY: key,
                ASSETS: {
                    fetch: async (request) => {
                        assets.push(request.url);
                        return new Response('asset', { status: 200 });
                    },
                },
            },
        );
        const text = await response.text();
        return { response, text, calls, assets };
    } finally {
        globalThis.fetch = previous;
    }
}

test('returns only the fields the reviews section renders', async () => {
    const { response, text, calls } = await call('/api/reviews');
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'public, max-age=3600, s-maxage=21600');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');

    assert.equal(calls.length, 1);
    const [{ url, init }] = calls;
    assert.equal(url, `https://places.googleapis.com/v1/places/${PLACE_ID}?languageCode=en`);
    assert.equal(init.method, 'GET');
    assert.equal(init.redirect, 'manual');
    assert.equal(init.headers['X-Goog-Api-Key'], KEY);
    assert.equal(init.cf.cacheTtl, 0);
    assert.equal(init.headers['X-Goog-FieldMask'], 'rating,userRatingCount,googleMapsUri,reviews');
    assert.equal(url.includes(KEY), false);
    assert.equal(JSON.stringify(init).includes('formattedAddress'), false);

    const body = JSON.parse(text);
    assert.deepEqual(Object.keys(body), ['rating', 'ratingCount', 'mapsUrl', 'reviews']);
    assert.equal(body.rating, 4.9);
    assert.equal(body.ratingCount, 31);
    assert.equal(body.mapsUrl, 'https://maps.google.com/?cid=1');
    assert.equal(body.reviews.length, 5);
    assert.deepEqual(Object.keys(body.reviews[0]).sort(), ['author', 'authorUrl', 'rating', 'text', 'when']);
    assert.equal(body.reviews[0].text, 'Great work');
    assert.equal(body.reviews[0].author, 'Ann A.');
    assert.equal(body.reviews[0].authorUrl, 'https://maps.google.com/contrib/1');
    assert.equal(body.reviews[1].authorUrl, undefined);
    assert.equal(text.includes('photo.jpg'), false);
    assert.equal(text.includes('Private'), false);
    assert.equal(text.includes('flag'), false);
    assert.equal(text.includes(KEY), false);
    assert.equal(text.includes(PLACE_ID), false);
});

test('HEAD has the same headers and an empty body', async () => {
    const { response, text, calls } = await call('/api/reviews', { method: 'HEAD' });
    assert.equal(response.status, 200);
    assert.equal(text, '');
    assert.equal(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assert.equal(calls.length, 1);
});

test('a non-https maps link is dropped', async () => {
    const { text } = await call('/api/reviews', {
        google: async () => new Response(JSON.stringify(placePayload({
            googleMapsUri: 'http://maps.google.com/?cid=1',
            reviews: [],
        })), { status: 200 }),
    });
    assert.equal(JSON.parse(text).mapsUrl, null);
});

test('query strings and other methods never call Google', async () => {
    const queried = await call('/api/reviews', { search: '?cachebust=1' });
    assert.equal(queried.response.status, 404);
    assert.equal(queried.calls.length, 0);
    assert.equal(queried.response.headers.get('cache-control'), 'no-store');

    const posted = await call('/api/reviews', { method: 'POST' });
    assert.equal(posted.response.status, 405);
    assert.equal(posted.response.headers.get('allow'), 'GET, HEAD');
    assert.equal(posted.calls.length, 0);
});

test('a missing secret does not call Google', async () => {
    const { response, text, calls } = await call('/api/reviews', { key: '' });
    assert.equal(response.status, 503);
    assert.deepEqual(JSON.parse(text), { error: 'reviews_unavailable' });
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(calls.length, 0);
});

test('an upstream failure is a generic cached error and does not echo Google', async () => {
    const { response, text } = await call('/api/reviews', {
        google: async () => new Response(JSON.stringify({
            error: { message: `bad key ${KEY}`, status: 'PERMISSION_DENIED' },
        }), { status: 403 }),
    });
    assert.equal(response.status, 502);
    assert.deepEqual(JSON.parse(text), { error: 'reviews_unavailable' });
    assert.equal(text.includes(KEY), false);
    assert.equal(response.headers.get('cache-control'), 'public, max-age=60, s-maxage=60');
});

test('a response that echoes the key is not sent', async () => {
    const { response, text, calls } = await call('/api/reviews', {
        google: async () => new Response(JSON.stringify(placePayload({
            reviews: [{
                rating: 5,
                text: { text: `the key is ${KEY}`, languageCode: 'en' },
                authorAttribution: { displayName: 'Ann', uri: 'https://maps.google.com/contrib/1' },
                relativePublishTimeDescription: 'today',
            }],
        })), { status: 200 }),
    });
    assert.equal(calls.length, 1);
    assert.equal(response.status, 502);
    assert.equal(text.includes(KEY), false);
    assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('other paths are served as static assets', async () => {
    const { response, text, calls, assets } = await call('/');
    assert.equal(response.status, 200);
    assert.equal(text, 'asset');
    assert.equal(calls.length, 0);
    assert.equal(assets.length, 1);
});

test('shapePlace keeps a string review body', () => {
    const shaped = shapePlace({
        rating: 5,
        userRatingCount: 1,
        googleMapsUri: 'https://maps.google.com/?cid=2',
        reviews: [{ rating: 5, text: 'Plain', authorAttribution: { displayName: 'Cy' }, relativePublishTimeDescription: 'today' }],
    });
    assert.equal(shaped.reviews[0].text, 'Plain');
    assert.equal(shaped.reviews[0].authorUrl, undefined);
});

test('the client bundle source no longer carries a Google key or the Maps loader', () => {
    const client = readFileSync(new URL('../src/googleReviews.js', import.meta.url), 'utf8');
    const workerSource = readFileSync(new URL('./index.mjs', import.meta.url), 'utf8');
    assert.doesNotMatch(client, /AIza|GOOGLE_MAPS_KEY|maps\.googleapis\.com/);
    assert.doesNotMatch(workerSource, /AIza/);
});
