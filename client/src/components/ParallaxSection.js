import React from 'react';
import { useInView } from 'react-intersection-observer';
import { Parallax } from 'react-parallax';
import { storageUrl } from '../storage';
import './ParallaxSection.css';

const ParallaxSection = () => {
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });

    return (
        <div ref={ref} className={`parallax-wrapper ${inView ? 'fade-in' : ''}`}>
            <Parallax bgImage={storageUrl('sp8.jpg')} strength={350}>
                <div>
                    <div className="parallax-content">
                        <div className="hero-text">
                            <span className="hero-tagline">Specialty Finishes</span>
                            <h1>Transforming Spaces.<br />Defining Excellence.</h1>
                            <p>Premium interior &amp; exterior finishing — crafted to last.</p>
                            <div className="hero-actions">
                                <a href="#contact" className="hero-cta">Get a Free Estimate</a>
                                <a href="#work" className="hero-cta-secondary">See Our Work</a>
                            </div>
                        </div>
                    </div>
                </div>
            </Parallax>
        </div>
    );
};

export default ParallaxSection;
