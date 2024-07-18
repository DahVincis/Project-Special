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
                <>
                    <h3>{owner.name}</h3>
                    <p>{owner.description}</p>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default MeetOwner;
