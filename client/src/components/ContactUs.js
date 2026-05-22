import React from 'react';
import './ContactUs.css';

const ContactUs = () => {
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
                <form className="contact-form">
                    <input type="text" placeholder="Your Name" required />
                    <input type="email" placeholder="Email Address" required />
                    <input type="text" placeholder="Project Type" />
                    <textarea placeholder="Tell Us About Your Project" required />
                    <button type="submit">Send Message</button>
                </form>
            </div>
        </section>
    );
};

export default ContactUs;
