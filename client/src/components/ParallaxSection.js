import React from 'react';
import { Parallax } from 'react-parallax';
import './ParallaxSection.css';  // Create a CSS file for styles

const ParallaxSection = () => {
    return (
        <Parallax bgImage="sf7.png" strength={500}>
            <div className="parallax-content">
            </div>
        </Parallax>
    );
}

export default ParallaxSection;
