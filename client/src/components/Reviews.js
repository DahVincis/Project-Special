import React, { useEffect, useRef, useState } from 'react';
import { loadReviews, MAPS_FALLBACK_URL, WRITE_REVIEW_URL } from '../googleReviews';
import './Reviews.css';

// Text past this length gets a "Read more" toggle. A character count rather
// than measuring the DOM: it is close enough for a CSS line clamp and works
// the same where there is no layout (tests).
const LONG_REVIEW = 220;

// Five ★ underneath, five on top clipped to the rating, so 4.9 shows nearly
// full. The glyphs are decoration; the text alternative is the aria-label.
const Stars = ({ value }) => (
    <span className="stars" role="img" aria-label={`${value} out of 5`}>
        <span className="stars-base" aria-hidden="true">★★★★★</span>
        <span className="stars-fill" aria-hidden="true" style={{ width: `${(value / 5) * 100}%` }}>★★★★★</span>
    </span>
);

const ReviewCard = ({ review }) => {
    const [open, setOpen] = useState(false);
    const long = (review.text || '').length > LONG_REVIEW;

    return (
        <li className="review">
            <Stars value={review.rating} />
            <p className={`review-text${long && !open ? ' is-clamped' : ''}`}>{review.text}</p>
            {long && (
                <button className="review-more" aria-expanded={open} onClick={() => setOpen(!open)}>
                    {open ? 'Show less' : 'Read more'}
                </button>
            )}
            <div className="review-meta">
                {review.authorUrl ? (
                    <a href={review.authorUrl} target="_blank" rel="noopener noreferrer">{review.author}</a>
                ) : (
                    <span>{review.author}</span>
                )}
                <span className="review-when">{review.when}</span>
            </div>
        </li>
    );
};

const Reviews = () => {
    const sectionRef = useRef(null);
    // null while loading or after any failure; there are no stand-in reviews.
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const load = () => {
            loadReviews()
                .then((d) => !cancelled && setData(d))
                .catch(() => {}) // fallback links are the error UI
                .finally(() => !cancelled && setLoading(false));
        };

        // Fetch only when the section nears the viewport, so Google's script
        // and the API call stay off the first load. No IntersectionObserver
        // (old browsers, jsdom): just load.
        if (!('IntersectionObserver' in window)) {
            load();
            return () => { cancelled = true; };
        }
        const io = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                io.disconnect();
                load();
            }
        }, { rootMargin: '400px 0px' });
        io.observe(sectionRef.current);
        return () => {
            cancelled = true;
            io.disconnect();
        };
    }, []);

    const reviews = data?.reviews || [];
    const hasReviews = reviews.length > 0;

    return (
        <section id="reviews" className="reviews" ref={sectionRef}>
            <div className="rule-header" data-num="05">
                <span className="section-label">Google Reviews</span>
                <h2>What our clients<br /><em>say about us.</em></h2>
            </div>

            {loading && <div className="reviews-loading" aria-busy="true" />}

            {hasReviews && (
                <>
                    <div className="reviews-summary">
                        <span className="reviews-score" aria-hidden="true">{data.rating.toFixed(1)}</span>
                        <Stars value={data.rating} />
                        <span className="reviews-count">
                            {data.ratingCount} {data.ratingCount === 1 ? 'review' : 'reviews'}
                        </span>
                    </div>
                    <ul className="review-list">
                        {reviews.map((r, i) => <ReviewCard key={i} review={r} />)}
                    </ul>
                </>
            )}

            <div className="reviews-links">
                <a href={data?.mapsUrl || MAPS_FALLBACK_URL} target="_blank" rel="noopener noreferrer">
                    See all reviews on Google
                </a>
                <a href={WRITE_REVIEW_URL} target="_blank" rel="noopener noreferrer">Leave a review</a>
            </div>

            {/* Google's text attribution: unaltered "Google Maps", no translation. */}
            {hasReviews && <p className="reviews-attrib">Reviews from <span translate="no">Google Maps</span></p>}
        </section>
    );
};

export default Reviews;
