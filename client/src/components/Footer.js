import React from 'react';
import logo from './logo.png';
import './Footer.css';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <div className="footer-logo">
                        <img src={logo} alt="Special Finishes" />
                        <span>Special Finishes</span>
                    </div>
                    <p>Premium interior &amp; exterior finishing, crafted to last.</p>
                </div>

                <div className="footer-badges">
                    <span className="footer-badge">Licensed &amp; Insured</span>
                    <span className="footer-badge">15+ Years Experience</span>
                </div>

                <nav className="footer-nav">
                    <a href="#about">About</a>
                    <a href="#work">Work</a>
                    <a href="#owner">Team</a>
                    <a href="#contact">Contact</a>
                </nav>

                <div className="footer-contact">
                    <a href="tel:2034436007">203-443-6007</a>
                    <a href="mailto:info@specialfinisheshi.com">info@specialfinisheshi.com</a>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {year} Special Finishes HI. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
