import React from 'react';
import { services } from '../api';
import './Services.css';

const Services = () => (
    <section id="services" className="services">
        <div className="rule-header" data-num="02">
            <span className="section-label">What We Do</span>
            <h2>Services</h2>
        </div>
        <ul className="services-list">
            {services.map((name) => (
                <li key={name}>{name}</li>
            ))}
        </ul>
        <a href="#contact" className="services-cta">Get a Free Estimate</a>
    </section>
);

export default Services;
