import React, { useEffect, useState } from 'react';
import { fetchAboutCompany } from '../api';
import './About.css';

const About = () => {
    const [about, setAbout] = useState({});

    useEffect(() => {
        fetchAboutCompany().then(data => setAbout(data));
    }, []);

    return (
        <section id="about" className="about-section">
            <div className="about-text">
                <span className="about-label">Who We Are</span>
                <h2>Craftsmanship in<br />Every Finish</h2>
                <p>{about.data?.description}</p>
            </div>
            <div className="about-divider" />
            <div className="about-stat-block">
                <div className="about-stat">
                    <div className="about-stat-number">15<span>+</span></div>
                    <div className="about-stat-label">Years Experience</div>
                </div>
                <div className="about-stat">
                    <div className="about-stat-number">500<span>+</span></div>
                    <div className="about-stat-label">Projects Completed</div>
                </div>
                <div className="about-stat">
                    <div className="about-stat-number">100<span>%</span></div>
                    <div className="about-stat-label">Client Satisfaction</div>
                </div>
            </div>
        </section>
    );
};

export default About;
