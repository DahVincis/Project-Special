import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Parallax } from 'react-parallax';
import { storageUrl } from '../storage';
import './ParallaxSection.css';

const MOBILE = '(max-width: 768px)';
const heroImage = storageUrl('sp8.jpg');

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE).matches);

    useEffect(() => {
        const mq = window.matchMedia(MOBILE);
        const onChange = (e) => setIsMobile(e.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    return isMobile;
};

const heroContent = (
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
);

const ParallaxSection = () => {
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
    const isMobile = useIsMobile();

    return (
        <div ref={ref} className={`parallax-wrapper ${inView ? 'fade-in' : ''}`}>
            {/* react-parallax stutters badly on phones — mobile gets a plain
                cover background instead, same image, no scroll math. */}
            {isMobile ? (
                <div
                    className="hero-static"
                    style={{ backgroundImage: `url(${heroImage})` }}
                >
                    {heroContent}
                </div>
            ) : (
                <Parallax bgImage={heroImage} strength={350}>
                    <div>{heroContent}</div>
                </Parallax>
            )}
        </div>
    );
};

export default ParallaxSection;
