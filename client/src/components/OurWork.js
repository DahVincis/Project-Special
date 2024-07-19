import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { Element, scroller } from 'react-scroll';
import './OurWork.css';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { fetchTestimonials, fetchInteriorExterior } from '../api';

const OurWork = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [testimonials, setTestimonials] = useState([]);
    const [interiorExterior, setInteriorExterior] = useState({});

    useEffect(() => {
        const getTestimonials = async () => {
            const data = await fetchTestimonials();
            setTestimonials(data.testimonials);
        };

        const getInteriorExterior = async () => {
            const data = await fetchInteriorExterior();
            setInteriorExterior(data.data);
        };

        getTestimonials();
        getInteriorExterior();
    }, []);

    const scrollToNextSection = (section) => {
        scroller.scrollTo(section, {
            duration: 800,
            delay: 0,
            smooth: 'easeInOutQuart'
        });
    };

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: false, // Disable arrows
        beforeChange: (current, next) => setCurrentSlide(next),
    };

    return (
        <div className="our-work">
            {/* Interior and Exterior Section */}
            <Element name="interiorExterior">
                <div className="dynamic-section" onClick={() => scrollToNextSection('special')}>
                    <div className="description">
                        <h2>{interiorExterior.title}</h2>
                        <p>{interiorExterior.description}</p>
                    </div>
                    <div className="grid-container">
                        <div className="grid-item">
                            <img src="/interior.png" alt="Interior Design" className="grid-image" />
                            <div className="overlay">
                                <p>Interior Design</p>
                            </div>
                        </div>
                        <div className="grid-item">
                            <img src="/exterior.png" alt="Exterior Design" className="grid-image" />
                            <div className="overlay">
                                <p>Exterior Design</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Element>

            {/* Before and After Section */}
            <Element name="beforeAfter">
                <div className="before-after-section">
                    <h2>Before and After</h2>
                    <div className="before-after-images">
                        <div className="before-image">
                            <img src="/before.png" alt="Before" className="before-after-image" />
                        </div>
                        <div className="after-image">
                            <img src="/after.png" alt="After" className="before-after-image" />
                        </div>
                    </div>
                </div>
            </Element>

            {/* Nothing But Special Section */}
            <Element name="special">
                <div className="special-section">
                    <h2 className='NBS-H2'>Nothing But Special</h2>
                    <div className="special-content">
                        <div className="gallery-carousel">
                            <Slider {...settings}>
                                <div className="slide">
                                    <img src="/special1.png" alt="Special Project 1" />
                                    <div className="overlay">
                                        <p>Special Project 1</p>
                                    </div>
                                </div>
                                <div className="slide">
                                    <img src="/special2.png" alt="Special Project 2" />
                                    <div className="overlay">
                                        <p>Special Project 2</p>
                                    </div>
                                </div>
                            </Slider>
                        </div>
                        <div className="testimonials">
                            <Slider {...settings} afterChange={(current) => setCurrentSlide(current)}>
                                {testimonials.map((testimonial, index) => (
                                    <div className={`testimonial ${currentSlide === index ? 'fade-in' : ''}`} key={index}>
                                        <p>"{testimonial.text}"</p>
                                        <p>- {testimonial.client}</p>
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    </div>
                </div>
            </Element>
        </div>
    );
};

export default OurWork;
