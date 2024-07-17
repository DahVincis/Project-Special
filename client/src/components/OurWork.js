import React, { useState } from 'react';
import Slider from 'react-slick';
import { Parallax } from 'react-parallax';
import { Element, scroller } from 'react-scroll';
import './OurWork.css';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const OurWork = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

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

    const testimonials = [
        { text: "Ruiter runs a very efficient business. Everyone that works for him is a Professional. The workers arrive on time and the work is done to perfection. He just renovated the bathroom in our rental condo. We suspected undetected problems with pipes due to a neighbor's renovation. No surprise when the bathroom was gutted to find a broken pipe. The problem was handled quickly, efficiently and didn't break the bank. I rate our experience 5 stars. I would hire him again in a second. Thank you for a beautiful job!", client: "Valerie" },
        { text: "The team at Special Finishes is amazing. They brought our vision to life with such creativity and professionalism.", client: "John Doe" },
    ];

    return (
        <div className="our-work">
            {/* Interior and Exterior Section */}
            <Element name="interiorExterior">
                <div className="dynamic-section" onClick={() => scrollToNextSection('special')}>
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
                    <div className="description">
                        <h2>Our Work in Interior and Exterior Design</h2>
                        <p>We specialize in creating beautiful and functional interior and exterior spaces. Our team of experienced designers and craftsmen work together to bring your vision to life. Whether it's a cozy living room or a stunning outdoor patio, we ensure every detail is perfect.</p>
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
