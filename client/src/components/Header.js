import React, { useEffect, useState } from 'react';
import './Header.css';
import favicon from './favicon.ico';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <div className="logo">
                <img src={favicon} alt="Special Finishes" />
                <span>Special Finishes HI</span>
            </div>
            <div className="contact">
                Contact Us: 203-443-6007
            </div>
        </header>
    );
}

export default Header;
