// WhatsApp handoff for estimate requests. wa.me wants a bare country-code number.
const WHATSAPP_NUMBER = '12034436007';

const waLink = (text) =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

// Generic prefill for the floating chat button.
export const WHATSAPP_URL = waLink(
    "Hi Special Finishes — I'd like a free estimate."
);

// Prefill built from the contact form so the lead arrives as a readable message.
export const whatsappUrlFromForm = ({ name, email, project_type, message }) => {
    const lines = [
        "Hi Special Finishes — I'd like a free estimate.",
        '',
        `Name: ${name}`,
        `Email: ${email}`,
    ];
    if (project_type) lines.push(`Project: ${project_type}`);
    if (message) lines.push('', message);
    return waLink(lines.join('\n'));
};
