import React from 'react';
import { storageUrl } from '../storage';
import './Hero.css';

// Split editorial hero: type on one side, a single full-bleed photograph on the
// other. Replaces the old react-parallax hero — the parallax needed a separate
// static-background code path on phones because it stuttered, and this needs
// neither. No scroll math, nothing to jank.
const Hero = () => (
    <section className="hero">
        <div className="hero-type">
            <span className="hero-eyebrow">Interior &amp; Exterior Specialty Finishes</span>
            <h1>
                Transforming<br />
                Spaces.<br />
                <em>Defining</em><br />
                Excellence.
            </h1>
            <p className="hero-lede">
                Gut renovations, plaster and decorative coatings, kitchens and baths —
                built to a finish standard that holds up close.
            </p>
            <div className="hero-actions">
                <a href="#contact" className="hero-cta">Get a Free Estimate</a>
                <a href="#work" className="hero-cta-secondary">See the Work</a>
            </div>
            <dl className="hero-meta">
                <div>
                    <dt>Based in</dt>
                    <dd>Connecticut</dd>
                </div>
                <div>
                    <dt>Experience</dt>
                    <dd>15+ years</dd>
                </div>
                <div>
                    <dt>Direct</dt>
                    <dd><a href="tel:2034436007">203-443-6007</a></dd>
                </div>
            </dl>
        </div>
        <div className="hero-figure">
            <img
                src={storageUrl('wilton-hero.jpg')}
                alt="Double-height living room of a renovated modernist home in Wilton, Connecticut"
                fetchpriority="high"
            />
            <span className="hero-figure-caption">Wilton, CT — gut renovation in 70 days</span>
        </div>
    </section>
);

export default Hero;
