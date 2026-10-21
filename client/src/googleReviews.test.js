import { loadReviews, MAPS_FALLBACK_URL, PLACE_ID, WRITE_REVIEW_URL } from './googleReviews';

beforeEach(() => {
    global.fetch = jest.fn();
});

test('loadReviews calls the same-origin endpoint and keeps the public fields', async () => {
    global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
            rating: 4.9,
            ratingCount: 31,
            mapsUrl: 'https://maps.google.com/?cid=1',
            reviews: [
                {
                    rating: 5,
                    text: 'Great work',
                    author: 'Ann A.',
                    authorUrl: 'https://maps.google.com/contrib/1',
                    when: 'a month ago',
                    photoUri: 'https://example.com/photo.jpg',
                },
            ],
        }),
    });

    const data = await loadReviews();

    expect(global.fetch).toHaveBeenCalledWith('/api/reviews', {
        headers: { Accept: 'application/json' },
    });
    expect(data).toEqual({
        rating: 4.9,
        ratingCount: 31,
        mapsUrl: 'https://maps.google.com/?cid=1',
        reviews: [{
            rating: 5,
            text: 'Great work',
            author: 'Ann A.',
            authorUrl: 'https://maps.google.com/contrib/1',
            when: 'a month ago',
        }],
    });
});

test('a failed endpoint rejects so the section can show its links', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 503 });
    await expect(loadReviews()).rejects.toThrow('Reviews request failed (503)');
});

test('non-https links are dropped', async () => {
    global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
            rating: 5,
            ratingCount: 1,
            mapsUrl: 'javascript:alert(1)',
            reviews: [{
                rating: 5,
                text: 'Great.',
                author: 'Ed E.',
                authorUrl: 'javascript:alert(1)',
                when: 'today',
            }],
        }),
    });

    const data = await loadReviews();
    expect(data.mapsUrl).toBeUndefined();
    expect(data.reviews[0].authorUrl).toBeUndefined();
});

test('the public maps links still point at this place and carry no key', () => {
    expect(WRITE_REVIEW_URL).toContain(`placeid=${PLACE_ID}`);
    expect(MAPS_FALLBACK_URL).toContain(`query_place_id=${PLACE_ID}`);
    expect(`${WRITE_REVIEW_URL} ${MAPS_FALLBACK_URL}`).not.toMatch(/AIza|key=/);
});
