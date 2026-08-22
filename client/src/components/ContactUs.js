import React, { useState } from 'react';
import { CHANNELS } from '../whatsapp';
import { MailIcon, SmsIcon, WhatsAppIcon } from './Icons';
import './ContactUs.css';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../storage';

const initialForm = { name: '', email: '', project_type: '', message: '' };

const ICONS = { mail: MailIcon, sms: SmsIcon, whatsapp: WhatsAppIcon };

const ContactUs = () => {
    const [form, setForm] = useState(initialForm);
    const [status, setStatus] = useState('idle');
    const [sentVia, setSentVia] = useState('email');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Every button in this form is a submit, so the browser's own required-field
        // validation runs whichever channel the visitor picks. `submitter` tells us
        // which one they used; it predates no browser we support, but default anyway.
        const key = e.nativeEvent.submitter?.value || 'email';
        const channel = CHANNELS[key] || CHANNELS.email;
        setSentVia(key);

        // Hand off first and synchronously: a window opened after an await has lost
        // the user-gesture context and gets blocked as a popup.
        if (channel.newTab) {
            window.open(channel.url(form), '_blank', 'noopener');
        } else {
            window.location.href = channel.url(form);
        }

        // The Supabase row is the backup record of the lead. It must never gate
        // the WhatsApp handoff, so its failure only downgrades the status message.
        setStatus('submitting');
        fetch(`${SUPABASE_URL}/rest/v1/contact_submissions`, {
            method: 'POST',
            headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal',
            },
            body: JSON.stringify(form),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Request failed');
                setStatus('success');
                setForm(initialForm);
            })
            .catch(() => setStatus('error'));
    };

    return (
        <section id="contact" className="contact-us-section">
            <div className="contact-inner">
                <div className="contact-info" data-num="06">
                    <span className="section-label">Get In Touch</span>
                    <h2>Let's Create<br />Something Special</h2>
                    <p>Ready to transform your space? Reach out and let's discuss your project.</p>
                    <div className="contact-detail">
                        <a href="tel:2034436007">203-443-6007</a>
                        <a href="mailto:specialfinisheshi@gmail.com">specialfinisheshi@gmail.com</a>
                    </div>
                </div>
                <form className="contact-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="project_type"
                        placeholder="Project Type"
                        value={form.project_type}
                        onChange={handleChange}
                    />
                    <textarea
                        name="message"
                        placeholder="Tell Us About Your Project"
                        value={form.message}
                        onChange={handleChange}
                        required
                    />
                    <div className="contact-actions">
                        {Object.entries(CHANNELS).map(([key, channel]) => {
                            const Icon = ICONS[channel.icon];
                            return (
                                <button
                                    key={key}
                                    type="submit"
                                    name="channel"
                                    value={key}
                                    className={channel.primary ? 'is-primary' : undefined}
                                    disabled={status === 'submitting'}
                                >
                                    <Icon />
                                    {channel.label}
                                </button>
                            );
                        })}
                    </div>
                    {status === 'success' && (
                        <p className="form-status form-status-success">
                            {sentVia === 'whatsapp'
                                ? 'WhatsApp is opening with your details — hit send there and we\u2019ll be in touch.'
                                : sentVia === 'email'
                                ? 'Your email app is opening with your details — hit send there and we\u2019ll be in touch.'
                                : 'Your messages app is opening with your details — hit send there and we\u2019ll be in touch.'}
                        </p>
                    )}
                    {status === 'error' && (
                        <p className="form-status form-status-error">
                            We have your details. If nothing opened, call 203-443-6007 or
                            email specialfinisheshi@gmail.com directly.
                        </p>
                    )}
                </form>
            </div>
        </section>
    );
};

export default ContactUs;
