import React, { useEffect, useCallback } from 'react';
import './Lightbox.css';

const Lightbox = ({ images, index, onClose, onNavigate }) => {
    const goPrev = useCallback(
        () => onNavigate((index - 1 + images.length) % images.length),
        [index, images.length, onNavigate]
    );
    const goNext = useCallback(
        () => onNavigate((index + 1) % images.length),
        [index, images.length, onNavigate]
    );

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') goPrev();
            if (e.key === 'ArrowRight') goNext();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose, goPrev, goNext]);

    const current = images[index];

    return (
        <div className="lightbox-overlay" onClick={onClose}>
            <button className="lightbox-close" onClick={onClose} aria-label="Close">
                &times;
            </button>
            <button
                className="lightbox-nav lightbox-prev"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                aria-label="Previous image"
            >
                &#8249;
            </button>
            <img
                src={current.src}
                alt={current.alt}
                className="lightbox-image"
                onClick={(e) => e.stopPropagation()}
            />
            <button
                className="lightbox-nav lightbox-next"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                aria-label="Next image"
            >
                &#8250;
            </button>
        </div>
    );
};

export default Lightbox;
