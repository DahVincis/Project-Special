// Google reviews for the Reviews section. The browser calls our Worker,
// which holds the Places API key. Nothing in this file is a credential.

// Verified on 2026-10-10 both via a Maps URL and through the API on the live
// site: the place resolves to "Special Finishes Home Improvement".
export const PLACE_ID = 'ChIJk0gR5uMP6IkRsc_qKOkMSEk';

export const WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${PLACE_ID}`;
// Used when the reviews endpoint did not return a maps link.
export const MAPS_FALLBACK_URL = `https://www.google.com/maps/search/?api=1&query=Special%20Finishes%20Home%20Improvement&query_place_id=${PLACE_ID}`;

const httpsUrl = (value) => (typeof value === 'string' && value.startsWith('https://') ? value : undefined);

// Resolves to plain data: { rating, ratingCount, mapsUrl, reviews[] }.
// Rejects if the endpoint is missing, failing, or not the shape the section renders.
export async function loadReviews() {
    const response = await fetch('/api/reviews', {
        headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
        throw new Error(`Reviews request failed (${response.status})`);
    }

    const data = await response.json();
    if (!data || typeof data !== 'object' || !Array.isArray(data.reviews)) {
        throw new Error('Unexpected reviews payload');
    }

    return {
        rating: typeof data.rating === 'number' ? data.rating : null,
        ratingCount: typeof data.ratingCount === 'number' ? data.ratingCount : null,
        mapsUrl: httpsUrl(data.mapsUrl),
        reviews: data.reviews.slice(0, 5).map((review) => ({
            rating: typeof review?.rating === 'number' ? review.rating : null,
            text: typeof review?.text === 'string' ? review.text : '',
            author: typeof review?.author === 'string' ? review.author : '',
            authorUrl: httpsUrl(review?.authorUrl),
            when: typeof review?.when === 'string' ? review.when : '',
        })),
    };
}
