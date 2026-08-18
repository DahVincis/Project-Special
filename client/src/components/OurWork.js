import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { Element } from 'react-scroll';
import { storageUrl } from '../storage';
import Lightbox from './Lightbox';
import './OurWork.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { fetchTestimonials, fetchInteriorExterior } from '../api';

const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
};

const expertiseImages = [
    { src: storageUrl('interior.jpg'), alt: 'Interior Design' },
    { src: storageUrl('exterior.jpg'), alt: 'Exterior Design' },
];

const beforeAfterImages = [
    { src: storageUrl('before.jpg'), alt: 'Pool construction before' },
    { src: storageUrl('after.jpg'), alt: 'Finished pool and spa' },
    { src: storageUrl('stair-before.jpg'), alt: 'Entryway staircase before' },
    { src: storageUrl('stair-after.jpg'), alt: 'Finished entryway staircase' },
];

const portfolioImages = [
    { src: storageUrl('wainscoting.jpg'), alt: 'Wainscoting wall finish' },
    { src: storageUrl('kitchen2.jpg'), alt: 'Kitchen remodel' },
    { src: storageUrl('bathroom1.jpg'), alt: 'Bathroom remodel with glass shower' },
    { src: storageUrl('bathroom2.jpg'), alt: 'Bathroom remodel with vanity' },
];

const pad = (n) => String(n).padStart(2, '0');

const OurWork = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [interiorExterior, setInteriorExterior] = useState({});
    const [lightbox, setLightbox] = useState(null);
    const [slide, setSlide] = useState(0);

    useEffect(() => {
        fetchTestimonials().then(data => setTestimonials(data.testimonials));
        fetchInteriorExterior().then(data => setInteriorExterior(data.data));
    }, []);

    // Lightbox is scoped to the section it was opened from, so arrowing through
    // it never wanders into another section's photos.
    const openLightbox = (images, index) => setLightbox({ images, index });

    return (
        <div id="work" className="our-work">
            <Element name="interiorExterior">
                <div className="dynamic-section">
                    <div className="section-header" data-num="02">
                        <span className="section-label">Our Expertise</span>
                        <h2>{interiorExterior.title || 'Interior & Exterior Design'}</h2>
                        <p>{interiorExterior.description}</p>
                    </div>
                    <div className="grid-container">
                        {expertiseImages.map((img, i) => (
                            <button
                                key={img.src}
                                className="grid-item"
                                onClick={() => openLightbox(expertiseImages, i)}
                            >
                                <img src={img.src} alt={img.alt} className="grid-image" loading="lazy" />
                                <div className="overlay"><p>{img.alt}</p></div>
                            </button>
                        ))}
                    </div>
                </div>
            </Element>

            <Element name="beforeAfter">
                <div className="before-after-section">
                    <div className="section-header" data-num="03">
                        <span className="section-label">Transformations</span>
                        <h2>Before &amp; After</h2>
                    </div>
                    <div className="before-after-images">
                        {beforeAfterImages.map((img, i) => (
                            <button
                                key={img.src}
                                className={i % 2 === 0 ? 'before-image' : 'after-image'}
                                onClick={() => openLightbox(beforeAfterImages, i)}
                            >
                                <img
                                    src={img.src}
                                    alt={img.alt}
                                    className="before-after-image"
                                    loading="lazy"
                                />
                                <span className="ba-label">{i % 2 === 0 ? 'Before' : 'After'}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </Element>

            <Element name="portfolio">
                <div className="special-section">
                    <div className="section-header" data-num="04">
                        <span className="section-label">Portfolio</span>
                        <h2>Nothing But Special</h2>
                    </div>
                    <div className="gallery-carousel">
                        <Slider {...sliderSettings} dots={false} afterChange={setSlide}>
                            {portfolioImages.map((img, i) => (
                                <button
                                    key={img.src}
                                    className="slide"
                                    onClick={() => openLightbox(portfolioImages, i)}
                                >
                                    <img src={img.src} alt={img.alt} loading="lazy" />
                                    <span className="slide-caption">{img.alt}</span>
                                </button>
                            ))}
                        </Slider>
                        <div className="carousel-meta" aria-hidden="true">
                            <span className="carousel-count">
                                {pad(slide + 1)} <i>/</i> {pad(portfolioImages.length)}
                            </span>
                            <span className="carousel-track">
                                <i
                                    style={{
                                        width: `${((slide + 1) / portfolioImages.length) * 100}%`,
                                    }}
                                />
                            </span>
                        </div>
                    </div>
                </div>
            </Element>

            <Element name="testimonials">
                <div className="special-section testimonials-section">
                    <div className="section-header" data-num="05">
                        <span className="section-label">Client Feedback</span>
                        <h2>What Our Clients Say</h2>
                    </div>
                    <div className="testimonials">
                        {testimonials.length > 0 && (
                            <Slider {...sliderSettings}>
                                {testimonials.map((t, i) => (
                                    <div key={i}>
                                        <div className="testimonial fade-in">
                                            <p>"{t.text}"</p>
                                            <p>— {t.client}</p>
                                        </div>
                                    </div>
                                ))}
                            </Slider>
                        )}
                    </div>
                </div>
            </Element>

            {lightbox && (
                <Lightbox
                    images={lightbox.images}
                    index={lightbox.index}
                    onClose={() => setLightbox(null)}
                    onNavigate={(index) => setLightbox((lb) => ({ ...lb, index }))}
                />
            )}
        </div>
    );
};

export default OurWork;
