// Estimate-request handoff. The visitor picks the channel, because not everyone
// has WhatsApp — the Supabase row is written either way, so the lead is never
// lost to the choice.
const PHONE = '12034436007';
const EMAIL = 'specialfinisheshi@gmail.com';

const waLink = (text) =>
    `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;

// Generic prefill for the floating chat button.
export const WHATSAPP_URL = waLink(
    "Hi Special Finishes — I'd like a free estimate."
);

// iPadOS reports itself as MacIntel, so touch points are the only way to tell it
// from a desktop Mac — which wants the Android-style separator.
const isIOS = () =>
    /iP(hone|od|ad)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const bodyFromForm = ({ name, email, project_type, message }) => {
    const lines = [
        "Hi Special Finishes — I'd like a free estimate.",
        '',
        `Name: ${name}`,
        `Email: ${email}`,
    ];
    if (project_type) lines.push(`Project: ${project_type}`);
    if (message) lines.push('', message);
    return lines.join('\n');
};

export const CHANNELS = {
    // Email leads: it is the channel everyone has. WhatsApp and SMS are offered
    // alongside rather than instead, since plenty of this client's customers do
    // use WhatsApp.
    email: {
        label: 'Send by email',
        icon: 'mail',
        primary: true,
        newTab: false,
        url: (form) =>
            `mailto:${EMAIL}?subject=${encodeURIComponent(
                'Estimate request — ' + (form.project_type || form.name)
            )}&body=${encodeURIComponent(bodyFromForm(form))}`,
    },
    whatsapp: {
        label: 'WhatsApp',
        icon: 'whatsapp',
        // wa.me has to be a new tab; mail and SMS hand off to a native app and
        // would leave a blank tab behind, so those navigate in place.
        newTab: true,
        url: (form) => waLink(bodyFromForm(form)),
    },
    sms: {
        label: 'Text us',
        icon: 'sms',
        newTab: false,
        // RFC 5724 says `?body=`, and that is what Android and macOS Messages
        // want — but iOS only fills the message in when the separator is `&`.
        // The `?&body=` hybrid is widely repeated and works on neither reliably.
        url: (form) =>
            `sms:+${PHONE}${isIOS() ? '&' : '?'}body=${encodeURIComponent(
                bodyFromForm(form)
            )}`,
    },
};
