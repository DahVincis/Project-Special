import React from 'react';

// Shared inline SVGs. Inline rather than an icon package: three glyphs do not
// justify a dependency, and these inherit currentColor so they follow whatever
// the button is doing on hover.

const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};

export const MailIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...stroke}>
        <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
        <path d="m3.2 6.2 8.8 6.8 8.8-6.8" />
    </svg>
);

export const SmsIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...stroke}>
        <path d="M21 11.5a8.5 8.5 0 0 1-9.1 8.4 9.6 9.6 0 0 1-2.7-.4L3.5 21l1.6-4.1A8.3 8.3 0 0 1 3.5 11.5 8.5 8.5 0 0 1 12.2 3 8.5 8.5 0 0 1 21 11.5Z" />
    </svg>
);

// The brand mark, so the WhatsApp button is recognisable at a glance.
export const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">
        <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.15-.15.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.63-.93-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.03 1.01-1.03 2.46 0 1.45 1.06 2.85 1.2 3.05.15.2 2.07 3.16 5.02 4.43.7.3 1.25.48 1.68.62.7.22 1.34.19 1.85.12.55-.08 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.86 9.86 0 0 0 4.78 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.11.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.25-4.37c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.26.86 5.81 2.42a8.17 8.17 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.24 8.23z" />
    </svg>
);
