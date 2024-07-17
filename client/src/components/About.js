import React, { useEffect, useState } from 'react';
import { fetchAboutCompany } from '../api';
import './About.css';

const About = () => {
    const [about, setAbout] = useState({});

    useEffect(() => {
        const getAbout = async () => {
            const data = await fetchAboutCompany();
            setAbout(data);
        };

        getAbout();
    }, []);

    return (
        <div className="about-section">
            <h2>About Special Finishes</h2>
            <p>{about.data}</p>
        </div>
    );
}

export default About;
