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

    const projects = [
        { img: "/special1.png", description: "Special Project 1 Description" },
        { img: "/special2.png", description: "Special Project 2 Description" },
    ];

    const testimonials = [
        { text: "Special Finishes transformed our home beyond our expectations. Their attention to detail is unparalleled.", client: "Client Name 1" },
        { text: "The team at Special Finishes is amazing. They brought our vision to life with such creativity and professionalism.", client: "Client Name 2" },
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
                <Parallax bgImage="/before.png" strength={500} onClick={() => scrollToNextSection('interiorExterior')}>
                    <div className="parallax-content">
                        <h2>Before</h2>
                    </div>
                </Parallax>
                <Parallax bgImage="/after.png" strength={500} onClick={() => scrollToNextSection('interiorExterior')}>
                    <div className="parallax-content">
                        <h2>After</h2>
                    </div>
                </Parallax>
            </Element>

            {/* Nothing But Special Section */}
            <Element name="special">
                <div className="special-section">
                    <h2>Nothing But Special</h2>
                    <div className="special-content">
                        <div className="gallery-carousel">
                            <Slider {...settings}>
                                {projects.map((project, index) => (
                                    <div className="slide" key={index}>
                                        <img src={project.img} alt={`Special Project ${index + 1}`} />
                                    </div>
                                ))}
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