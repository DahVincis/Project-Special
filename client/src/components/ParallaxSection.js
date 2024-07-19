import React from 'react';
import { useInView } from 'react-intersection-observer';
import { Parallax } from 'react-parallax';
import './ParallaxSection.css';

const ParallaxSection = () => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <div ref={ref} className={`parallax-wrapper ${inView ? 'fade-in' : ''}`}>
            <Parallax bgImage="/sp8.png" strength={350}>
                <div>
                    <div className="parallax-content">
                        {/* Centered content */}
                    </div>
                </div>
            </Parallax>
        </div>
    );
}

export default ParallaxSection;
