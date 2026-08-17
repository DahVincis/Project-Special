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

const galleryImages = [
    { src: storageUrl('interior.jpg'), alt: 'Interior Design' },
    { src: storageUrl('exterior.jpg'), alt: 'Exterior Design' },
    { src: storageUrl('before.jpg'), alt: 'Pool construction before' },
    { src: storageUrl('after.jpg'), alt: 'Finished pool and spa' },
    { src: storageUrl('stair-before.jpg'), alt: 'Entryway staircase before' },
    { src: storageUrl('stair-after.jpg'), alt: 'Finished entryway staircase' },
    { src: storageUrl('driveway.jpg'), alt: 'Driveway paving project' },
    { src: storageUrl('wainscoting.jpg'), alt: 'Wainscoting wall finish' },
    { src: storageUrl('kitchen2.jpg'), alt: 'Kitchen remodel' },
    { src: storageUrl('bathroom1.jpg'), alt: 'Bathroom remodel with glass shower' },
    { src: storageUrl('bathroom2.jpg'), alt: 'Bathroom remodel with vanity' },
    { src: storageUrl('bathroom3.jpg'), alt: 'Bathroom remodel' },
];

const indexOf = (alt) => galleryImages.findIndex((img) => img.alt === alt);

const OurWork = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [interiorExterior, setInteriorExterior] = useState({});
    const [lightboxIndex, setLightboxIndex] = useState(null);

    useEffect(() => {
        fetchTestimonials().then(data => setTestimonials(data.testimonials));
        fetchInteriorExterior().then(data => setInteriorExterior(data.data));
    }, []);

    const openLightbox = (alt) => setLightboxIndex(indexOf(alt));

    return (
        <div id="work" className="our-work">
            <Element name="interiorExterior">
                <div className="dynamic-section">
                    <div className="section-header">
                        <span className="section-label">Our Expertise</span>
                        <h2>{interiorExterior.title || 'Interior & Exterior Design'}</h2>
                        <p>{interiorExterior.description}</p>
                    </div>
                    <div className="grid-container">
                        <button className="grid-item" onClick={() => openLightbox('Interior Design')}>
                            <img src={storageUrl('interior.jpg')} alt="Interior Design" className="grid-image" />
                            <div className="overlay"><p>Interior Design</p></div>
                        </button>
                        <button className="grid-item" onClick={() => openLightbox('Exterior Design')}>
                            <img src={storageUrl('exterior.jpg')} alt="Exterior Design" className="grid-image" />
                            <div className="overlay"><p>Exterior Design</p></div>
                        </button>
                    </div>
                </div>
            </Element>

            <Element name="beforeAfter">
                <div className="before-after-section">
                    <div className="section-header">
                        <span className="section-label">Transformations</span>
                        <h2>Before &amp; After</h2>
                    </div>
                    <div className="before-after-images">
                        <button className="before-image" onClick={() => openLightbox('Pool construction before')}>
                            <img src={storageUrl('before.jpg')} alt="Pool construction before" className="before-after-image" />
                            <span className="ba-label">Before</span>
                        </button>
                        <button className="after-image" onClick={() => openLightbox('Finished pool and spa')}>
                            <img src={storageUrl('after.jpg')} alt="Finished pool and spa" className="before-after-image" />
                            <span className="ba-label">After</span>
                        </button>
                        <button className="before-image" onClick={() => openLightbox('Entryway staircase before')}>
                            <img src={storageUrl('stair-before.jpg')} alt="Entryway staircase before" className="before-after-image" />
                            <span className="ba-label">Before</span>
                        </button>
                        <button className="after-image" onClick={() => openLightbox('Finished entryway staircase')}>
                            <img src={storageUrl('stair-after.jpg')} alt="Finished entryway staircase" className="before-after-image" />
                            <span className="ba-label">After</span>
                        </button>
                    </div>
                </div>
            </Element>

            <Element name="portfolio">
                <div className="special-section">
                    <div className="section-header">
                        <span className="section-label">Portfolio</span>
                        <h2>Nothing But Special</h2>
                    </div>
                    <div className="gallery-carousel">
                        <Slider {...sliderSettings}>
                            <button className="slide" onClick={() => openLightbox('Driveway paving project')}>
                                <img src={storageUrl('driveway.jpg')} alt="Driveway paving project" />
                            </button>
                            <button className="slide" onClick={() => openLightbox('Wainscoting wall finish')}>
                                <img src={storageUrl('wainscoting.jpg')} alt="Wainscoting wall finish" />
                            </button>
                            <button className="slide" onClick={() => openLightbox('Kitchen remodel')}>
                                <img src={storageUrl('kitchen2.jpg')} alt="Kitchen remodel" />
                            </button>
                            <button className="slide" onClick={() => openLightbox('Bathroom remodel with glass shower')}>
                                <img src={storageUrl('bathroom1.jpg')} alt="Bathroom remodel with glass shower" />
                            </button>
                            <button className="slide" onClick={() => openLightbox('Bathroom remodel with vanity')}>
                                <img src={storageUrl('bathroom2.jpg')} alt="Bathroom remodel with vanity" />
                            </button>
                            <button className="slide" onClick={() => openLightbox('Bathroom remodel')}>
                                <img src={storageUrl('bathroom3.jpg')} alt="Bathroom remodel" />
                            </button>
                        </Slider>
                    </div>
                </div>
            </Element>

            <Element name="testimonials">
                <div className="special-section">
                    <div className="section-header">
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

            {lightboxIndex !== null && (
                <Lightbox
                    images={galleryImages}
                    index={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onNavigate={setLightboxIndex}
                />
            )}
        </div>
    );
};

export default OurWork;
