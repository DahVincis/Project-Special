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
            <Parallax bgImage="/sf7.png" strength={400}>
                <div style={{ height: '80vh' }}>
                    <div className="parallax-content">
                        {/* Centered content */}
                    </div>
                </div>
            </Parallax>
        </div>
    );
}

export default ParallaxSection;
