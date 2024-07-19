import React, { useState, useEffect } from 'react';
import './MeetOwner.css';
import { fetchMeetOwner } from '../api';

const MeetOwner = () => {
    const [owner, setOwner] = useState({});

    useEffect(() => {
        const getOwner = async () => {
            const data = await fetchMeetOwner();
            setOwner(data.owner);
        };

        getOwner();
    }, []);

    return (
        <div className="meet-owner-section">
            <h2>Meet the Owner</h2>
            {owner ? (
                <div className="owner-content">
                    <div className="owner-text">
                        <h3>{owner.name}</h3>
                        <p>{owner.description}</p>
                    </div>
                    <div className="owner-image">
                        <img src={"/RF.png"} alt="Owner" />
                    </div>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default MeetOwner;
