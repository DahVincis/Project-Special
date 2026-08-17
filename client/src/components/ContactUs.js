import React, { useState } from 'react';
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/contact_submissions`, {
                method: 'POST',
                headers: {
                    apikey: SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    Prefer: 'return=minimal',
                },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error('Request failed');
            setStatus('success');
            setForm(initialForm);
        } catch (err) {
            setStatus('error');
        }
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
                        {status === 'submitting' ? 'Sending…' : 'Send Message'}
                    </button>
                    {status === 'success' && (
                        <p className="form-status form-status-success">
                            Thanks — we'll be in touch soon.
                        </p>
                    )}
                    {status === 'error' && (
                        <p className="form-status form-status-error">
                            Something went wrong. Please call or email us directly.
                        </p>
                    )}
                </form>
            </div>
        </section>
    );
};

export default ContactUs;
