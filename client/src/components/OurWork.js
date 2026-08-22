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

// The Wilton renovation, told in pairs. Order matters: the grid is two columns,
// so every 'before' has to sit immediately beside its own 'after'.
const beforeAfterImages = [
    { src: storageUrl('wilton-front-before.jpg'), alt: 'Front elevation before renovation' },
    { src: storageUrl('wilton-front-after.jpg'), alt: 'Front elevation after renovation, lit at night' },
    { src: storageUrl('wilton-kitchen-before.jpg'), alt: 'Kitchen stripped back to the studs' },
    { src: storageUrl('wilton-kitchen-after.jpg'), alt: 'Finished galley kitchen with reclaimed beams' },
    { src: storageUrl('wilton-family-before.jpg'), alt: 'Family room down to bare subfloor' },
    { src: storageUrl('wilton-family-after.jpg'), alt: 'Finished family room with stone fireplace' },
    { src: storageUrl('wilton-bath-before.jpg'), alt: 'Master bathroom demolished to the framing' },
    { src: storageUrl('wilton-bath-after.jpg'), alt: 'Finished master bathroom with freestanding tub' },
];

// Carousel crops to 3/2, so every one of these has to be landscape.
const portfolioImages = [
    { src: storageUrl('wilton-rear-night.jpg'), alt: 'Rear elevation at dusk' },
    { src: storageUrl('wilton-living.jpg'), alt: 'Living room seen from the upper landing' },
    { src: storageUrl('wilton-vista.jpg'), alt: 'Double-height living room and gallery wall' },
    { src: storageUrl('wilton-dining.jpg'), alt: 'Dining room beneath the clerestory windows' },
    { src: storageUrl('wilton-bedroom.jpg'), alt: 'Master bedroom with floating bed' },
    { src: storageUrl('wilton-shower.jpg'), alt: 'Master shower in teal penny tile' },
    { src: storageUrl('wilton-entry.jpg'), alt: 'Entryway and open stair' },
    { src: storageUrl('wilton-ceiling.jpg'), alt: 'Living room ceiling and clerestory glazing' },
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
                        <p>
                            A 1970s modernist home in Wilton, Connecticut &mdash; bought with
                            no kitchen and no bathrooms, and no bank willing to finance it.
                            Demolition, permitting, construction and decorating: 70 days.
                        </p>
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
