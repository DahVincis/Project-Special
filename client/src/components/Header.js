import React, { useEffect, useState } from 'react';
import './Header.css';
import logo from './logo.png';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <div className="logo">
                <img src={logo} alt="Special Finishes" />
                <span>Special Finishes</span>
            </div>
            <nav>
                <a href="#about">About</a>
                <a href="#work">Work</a>
                <a href="#owner">Team</a>
                <a href="#contact">Contact</a>
            </nav>
            <div className="header-actions">
                <a href="tel:2034436007" className="header-phone">203-443-6007</a>
                <a href="#contact" className="header-cta">Free Estimate</a>
            </div>
        </header>
    );
};

export default Header;
