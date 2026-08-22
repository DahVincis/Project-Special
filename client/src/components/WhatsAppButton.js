import React from 'react';
import { WHATSAPP_URL } from '../whatsapp';
import './WhatsAppButton.css';
import { WhatsAppIcon } from './Icons';

const WhatsAppButton = () => (
    <a
        className="whatsapp-fab"
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message Special Finishes on WhatsApp"
    >
        <WhatsAppIcon />
    </a>
);

export default WhatsAppButton;
