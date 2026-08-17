import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { Element } from 'react-scroll';
import { storageUrl } from '../storage';
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

const OurWork = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [interiorExterior, setInteriorExterior] = useState({});

    useEffect(() => {
        fetchTestimonials().then(data => setTestimonials(data.testimonials));
        fetchInteriorExterior().then(data => setInteriorExterior(data.data));
    }, []);

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
                        <div className="grid-item">
                            <img src={storageUrl('interior.jpg')} alt="Interior Design" className="grid-image" />
                            <div className="overlay"><p>Interior Design</p></div>
                        </div>
                        <div className="grid-item">
                            <img src={storageUrl('exterior.jpg')} alt="Exterior Design" className="grid-image" />
                            <div className="overlay"><p>Exterior Design</p></div>
                        </div>
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
                        <div className="before-image">
                            <img src={storageUrl('before.jpg')} alt="Pool construction before" className="before-after-image" />
                            <span className="ba-label">Before</span>
                        </div>
                        <div className="after-image">
                            <img src={storageUrl('after.jpg')} alt="Finished pool and spa" className="before-after-image" />
                            <span className="ba-label">After</span>
                        </div>
                        <div className="before-image">
                            <img src={storageUrl('stair-before.jpg')} alt="Entryway staircase before" className="before-after-image" />
                            <span className="ba-label">Before</span>
                        </div>
                        <div className="after-image">
                            <img src={storageUrl('stair-after.jpg')} alt="Finished entryway staircase" className="before-after-image" />
                            <span className="ba-label">After</span>
                        </div>
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
                            <div className="slide">
                                <img src={storageUrl('driveway.jpg')} alt="Driveway paving project" />
                            </div>
                            <div className="slide">
                                <img src={storageUrl('wainscoting.jpg')} alt="Wainscoting wall finish" />
                            </div>
                            <div className="slide">
                                <img src={storageUrl('kitchen2.jpg')} alt="Kitchen remodel" />
                            </div>
                            <div className="slide">
                                <img src={storageUrl('bathroom1.jpg')} alt="Bathroom remodel with glass shower" />
                            </div>
                            <div className="slide">
                                <img src={storageUrl('bathroom2.jpg')} alt="Bathroom remodel with vanity" />
                            </div>
                            <div className="slide">
                                <img src={storageUrl('bathroom3.jpg')} alt="Bathroom remodel" />
                            </div>
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
        </div>
    );
};

export default OurWork;
