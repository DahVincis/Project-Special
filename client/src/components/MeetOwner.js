import React, { useState, useEffect } from 'react';
import { fetchMeetOwner } from '../api';
import { storageUrl } from '../storage';
import './MeetOwner.css';

const MeetOwner = () => {
    const [owner, setOwner] = useState({});

    useEffect(() => {
        fetchMeetOwner().then(data => setOwner(data.owner));
    }, []);

    return (
        <section id="owner" className="meet-owner-section">
            <div className="meet-owner-inner">
                <div className="owner-image-wrap">
                    <img src={storageUrl('RF.png')} alt={owner.name || 'Owner'} />
                </div>
                <div className="owner-text-wrap" data-num="06">
                    <span className="section-label">The Team</span>
                    <h2>{owner.name || 'Ruiter Fernandes'}</h2>
                    <div className="owner-title">Founder &amp; Master Craftsman</div>
                    <div className="owner-rule" />
                    <p>{owner.description}</p>
                </div>
            </div>
        </section>
    );
};

export default MeetOwner;
