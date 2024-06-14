import React from 'react';
import { Parallax } from 'react-parallax';
import { Element, scroller } from 'react-scroll';
import './OurWork.css';

const OurWork = () => {
    const scrollToNextSection = (section) => {
        scroller.scrollTo(section, {
            duration: 800,
            delay: 0,
            smooth: 'easeInOutQuart'
        });
    };

    return (
        <div className="our-work">
            {/* Interior and Exterior Section */}
            <Element name="interiorExterior">
                <div className="dynamic-section" onClick={() => scrollToNextSection('special')}>
                    <div className="image" style={{ backgroundImage: "url('/interior.png')" }}>
                        <h2>Interior Design</h2>
                    </div>
                    <div className="image" style={{ backgroundImage: "url('/exterior.png')" }}>
                        <h2>Exterior Design</h2>
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
                    <div className="image" style={{ backgroundImage: "url('/special1.jpg')" }}></div>
                    <div className="image" style={{ backgroundImage: "url('/special2.jpg')" }}></div>
                </div>
            </Element>
        </div>
    );
};

export default OurWork;
