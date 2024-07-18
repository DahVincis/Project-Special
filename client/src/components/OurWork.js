import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { Parallax } from 'react-parallax';
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
                    <div className="slideshow-container">
                        <Slider {...settings}>
                            <div className="slide">
                                <img src="/interior.png" alt="Interior Design" />
                            </div>
                            <div className="slide">
                                <img src="/exterior.png" alt="Exterior Design" />
                            </div>
                        </Slider>
                    </div>
                </div>
            </Element>

            {/* Before and After Parallax Section */}
            <Element name="beforeAfter">
                <div className="parallax-container">
                    <Parallax bgImage="/before.png" strength={250}>
                        <div className="parallax-ba"></div>
                    </Parallax>
                    <Parallax bgImage="/after.png" strength={250}>
                        <div className="parallax-ba"></div>
                    </Parallax>
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
                                </div>
                                <div className="slide">
                                    <img src="/special2.png" alt="Special Project 2" />
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
