import React, { useEffect, useCallback, useRef } from 'react';
import './Lightbox.css';

const Lightbox = ({ images, index, onClose, onNavigate }) => {
    const overlayRef = useRef(null);
    const closeRef = useRef(null);
    const previouslyFocused = useRef(null);

    const goPrev = useCallback(
        () => onNavigate((index - 1 + images.length) % images.length),
        [index, images.length, onNavigate]
    );
    const goNext = useCallback(
        () => onNavigate((index + 1) % images.length),
        [index, images.length, onNavigate]
    );

    useEffect(() => {
        previouslyFocused.current = document.activeElement;
        closeRef.current?.focus();
        return () => previouslyFocused.current?.focus?.();
    }, []);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') goPrev();
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'Tab') {
                const focusable = overlayRef.current.querySelectorAll('button');
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose, goPrev, goNext]);

    const current = images[index];

    return (
        <div
            className="lightbox-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={current.alt}
            ref={overlayRef}
        >
            <button className="lightbox-close" onClick={onClose} aria-label="Close" ref={closeRef}>
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
