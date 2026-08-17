import React, { useState } from 'react';
import { whatsappUrlFromForm } from '../whatsapp';
import './ContactUs.css';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

const initialForm = { name: '', email: '', project_type: '', message: '' };

const ContactUs = () => {
    const [form, setForm] = useState(initialForm);
    const [status, setStatus] = useState('idle');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Hand off to WhatsApp first and synchronously: a window opened after an
        // await has lost the user-gesture context and gets blocked as a popup.
        window.open(whatsappUrlFromForm(form), '_blank', 'noopener');

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
                <div className="contact-info">
                    <span className="section-label">Get In Touch</span>
                    <h2>Let's Create<br />Something Special</h2>
                    <p>Ready to transform your space? Reach out and let's discuss your project.</p>
                    <div className="contact-detail">
                        <a href="tel:2034436007">203-443-6007</a>
                        <a href="mailto:info@specialfinisheshi.com">info@specialfinisheshi.com</a>
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
                    <button type="submit" disabled={status === 'submitting'}>
                        {status === 'submitting' ? 'Sending…' : 'Send via WhatsApp'}
                    </button>
                    {status === 'success' && (
                        <p className="form-status form-status-success">
                            WhatsApp is opening with your details — hit send there and
                            we'll be in touch.
                        </p>
                    )}
                    {status === 'error' && (
                        <p className="form-status form-status-error">
                            WhatsApp should have opened with your details. If it didn't,
                            call or email us directly.
                        </p>
                    )}
                </form>
            </div>
        </section>
    );
};

export default ContactUs;
