import React, { useEffect, useState } from 'react';
import './Header.css';
import logo from './logo.png';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const closeMenu = () => setMenuOpen(false);

    return (
        <header className={`header ${scrolled ? 'scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`}>
            <div className="logo">
                <img src={logo} alt="Special Finishes" />
                <span>Special Finishes</span>
            </div>
            <nav>
                <a href="#about" onClick={closeMenu}>About</a>
                <a href="#work" onClick={closeMenu}>Work</a>
                <a href="#owner" onClick={closeMenu}>Team</a>
                <a href="#contact" onClick={closeMenu}>Contact</a>
            </nav>
            <div className="header-actions">
                <a href="tel:2034436007" className="header-phone">203-443-6007</a>
                <a href="#contact" className="header-cta">Free Estimate</a>
                <button
                    className="header-menu-toggle"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                >
                    <span />
                    <span />
                    <span />
                </button>
            </div>
        </header>
    );
};

export default Header;
