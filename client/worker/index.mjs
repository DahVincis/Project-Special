// GET /api/reviews — Place Details for the reviews section.
// The Google key is env.GOOGLE_MAPS_KEY (a Worker secret). The place id is
// fixed here so the client cannot ask for any other place or field.

const PLACE_ID = 'ChIJk0gR5uMP6IkRsc_qKOkMSEk';
const REVIEWS_PATH = '/api/reviews';

// Place Details (New). `reviews` is one field; anything inside it that the page
// does not render (photo, flag link, resource name) is dropped in shapePlace.
const FIELD_MASK = ['rating', 'userRatingCount', 'googleMapsUri', 'reviews'].join(',');

// Browser: 1 hour. Shared edge cache (Workers Caching honors s-maxage): 6 hours.
// Reviews do not change faster than that, and each miss is a billed Place Details call.
const SUCCESS_CACHE = 'public, max-age=3600, s-maxage=21600';
const ERROR_CACHE = 'public, max-age=60, s-maxage=60';

const placesUrl = `https://places.googleapis.com/v1/places/${PLACE_ID}?languageCode=en`;

function json(body, status, cacheControl, extraHeaders) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': cacheControl,
            'X-Content-Type-Options': 'nosniff',
            ...extraHeaders,
        },
    });
}

function httpsUrl(value) {
    return typeof value === 'string' && value.startsWith('https://') ? value : undefined;
}

function reviewText(text) {
    if (typeof text === 'string') return text;
    if (text && typeof text.text === 'string') return text.text;
    return '';
}

// Plain data the page already renders. Nothing else from Place Details.
export function shapePlace(place) {
    const reviews = Array.isArray(place?.reviews) ? place.reviews.slice(0, 5) : [];
    return {
        rating: typeof place?.rating === 'number' ? place.rating : null,
        ratingCount: typeof place?.userRatingCount === 'number' ? place.userRatingCount : null,
        mapsUrl: httpsUrl(place?.googleMapsUri) ?? null,
        reviews: reviews.map((review) => ({
            rating: typeof review?.rating === 'number' ? review.rating : null,
            text: reviewText(review?.text),
            author: typeof review?.authorAttribution?.displayName === 'string'
                ? review.authorAttribution.displayName
                : '',
            authorUrl: httpsUrl(review?.authorAttribution?.uri),
            when: typeof review?.relativePublishTimeDescription === 'string'
                ? review.relativePublishTimeDescription
                : '',
        })),
    };
}

async function handleReviews(request, env, url) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        return json({ error: 'method_not_allowed' }, 405, 'no-store', { Allow: 'GET, HEAD' });
    }
    // Query strings are not part of this resource. Rejecting them keeps a
    // cache-buster from turning into another Place Details call.
    if (url.search) {
        return json({ error: 'not_found' }, 404, 'no-store');
    }
    if (!env.GOOGLE_MAPS_KEY) {
        console.error(JSON.stringify({ message: 'GOOGLE_MAPS_KEY is not configured' }));
        return json({ error: 'reviews_unavailable' }, 503, 'no-store');
    }

    let googleResponse;
    try {
        googleResponse = await globalThis.fetch(placesUrl, {
            method: 'GET',
            redirect: 'manual',
            headers: {
                Accept: 'application/json',
                'X-Goog-Api-Key': env.GOOGLE_MAPS_KEY,
                'X-Goog-FieldMask': FIELD_MASK,
            },
            signal: AbortSignal.timeout(8000),
            // The shaped response is what gets cached, not this subrequest.
            cf: { cacheTtl: 0 },
        });
    } catch (error) {
        console.error(JSON.stringify({
            message: 'places request failed',
            error: error instanceof Error ? error.name : 'Error',
        }));
        return json({ error: 'reviews_unavailable' }, 502, ERROR_CACHE);
    }

    if (!googleResponse.ok) {
        console.error(JSON.stringify({
            message: 'places request failed',
            status: googleResponse.status,
        }));
        return json({ error: 'reviews_unavailable' }, 502, ERROR_CACHE);
    }

    let place;
    try {
        place = await googleResponse.json();
    } catch {
        console.error(JSON.stringify({ message: 'places response was not json' }));
        return json({ error: 'reviews_unavailable' }, 502, ERROR_CACHE);
    }

    if (!place || typeof place !== 'object' || place.error) {
        console.error(JSON.stringify({ message: 'places response was unusable' }));
        return json({ error: 'reviews_unavailable' }, 502, ERROR_CACHE);
    }

    const body = JSON.stringify(shapePlace(place));
    if (body.includes(env.GOOGLE_MAPS_KEY)) {
        console.error(JSON.stringify({ message: 'refusing to send a response that contains the API key' }));
        return json({ error: 'reviews_unavailable' }, 502, 'no-store');
    }

    const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': SUCCESS_CACHE,
        'X-Content-Type-Options': 'nosniff',
    };
    if (request.method === 'HEAD') {
        return new Response(null, { status: 200, headers });
    }
    return new Response(body, { status: 200, headers });
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        if (url.pathname === REVIEWS_PATH) {
            return handleReviews(request, env, url);
        }
        if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
            return env.ASSETS.fetch(request);
        }
        return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
    },
};
