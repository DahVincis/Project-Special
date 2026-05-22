import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { Element } from 'react-scroll';
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
                            <img src="./interior.png" alt="Interior Design" className="grid-image" />
                            <div className="overlay"><p>Interior Design</p></div>
                        </div>
                        <div className="grid-item">
                            <img src="./exterior.png" alt="Exterior Design" className="grid-image" />
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
                            <img src="./before.png" alt="Before" className="before-after-image" />
                            <span className="ba-label">Before</span>
                        </div>
                        <div className="after-image">
                            <img src="./after.png" alt="After" className="before-after-image" />
                            <span className="ba-label">After</span>
                        </div>
                    </div>
                </div>
            </Element>

            <Element name="special">
                <div className="special-section">
                    <div className="section-header">
                        <span className="section-label">Portfolio</span>
                        <h2>Nothing But Special</h2>
                    </div>
                    <div className="special-content">
                        <div className="gallery-carousel">
                            <Slider {...sliderSettings}>
                                <div className="slide">
                                    <img src="./special1.png" alt="Special Project 1" />
                                </div>
                                <div className="slide">
                                    <img src="./special2.png" alt="Special Project 2" />
                                </div>
                            </Slider>
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
                </div>
            </Element>
        </div>
    );
};

export default OurWork;
