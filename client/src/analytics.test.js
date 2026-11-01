import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ContactUs from './components/ContactUs';
import {
    eventForHref,
    installClickTracking,
    linkLocation,
    trackEvent,
} from './analytics';

afterEach(() => {
    delete window.gtag;
    document.body.innerHTML = '';
});

test('event names follow the link the visitor actually tapped', () => {
    expect(eventForHref('tel:2034436007')).toBe('click_to_call');
    expect(eventForHref('mailto:specialfinisheshi@gmail.com')).toBe('email_click');
    expect(eventForHref('https://wa.me/12034436007?text=Hi')).toBe('whatsapp_click');
    expect(eventForHref('https://api.whatsapp.com/send?phone=1')).toBe('whatsapp_click');
    expect(eventForHref('#contact')).toBeNull();
    expect(eventForHref('sms:+12034436007')).toBeNull();
});

test('link location comes from the surrounding section', () => {
    document.body.innerHTML = `
      <header><a id="phone" href="tel:2034436007">Call</a></header>
      <section class="hero"><a id="hero-phone" href="tel:2034436007">Call</a></section>
      <footer><a id="mail" href="mailto:specialfinisheshi@gmail.com">Mail</a></footer>
      <section id="contact"><a id="contact-mail" href="mailto:specialfinisheshi@gmail.com">Mail</a></section>
      <a id="fab" class="whatsapp-fab" href="https://wa.me/12034436007">WhatsApp</a>
    `;
    expect(linkLocation(document.getElementById('phone'))).toBe('header');
    expect(linkLocation(document.getElementById('hero-phone'))).toBe('hero');
    expect(linkLocation(document.getElementById('mail'))).toBe('footer');
    expect(linkLocation(document.getElementById('contact-mail'))).toBe('contact');
    expect(linkLocation(document.getElementById('fab'))).toBe('whatsapp');
});

test('a missing gtag does nothing and does not stop the click', () => {
    document.body.innerHTML = '<header><a href="tel:2034436007">Call</a></header>';
    const stop = installClickTracking();
    const anchor = document.querySelector('a');
    let preventedBefore = true;
    anchor.addEventListener('click', (event) => {
        preventedBefore = event.defaultPrevented;
        event.preventDefault();
    }, true);
    expect(() => anchor.click()).not.toThrow();
    expect(preventedBefore).toBe(false);
    expect(anchor.getAttribute('href')).toBe('tel:2034436007');
    stop();
});

test('document clicks record the event and leave the link alone', () => {
    const calls = [];
    window.gtag = (...args) => calls.push(args);
    document.body.innerHTML = `
      <header><a href="tel:2034436007">Call</a></header>
      <footer><a href="mailto:specialfinisheshi@gmail.com">Mail</a></footer>
      <a class="whatsapp-fab" href="https://wa.me/12034436007"><svg><path /></svg></a>
      <a href="#work">Work</a>
    `;
    const stop = installClickTracking();
    for (const anchor of document.querySelectorAll('a')) {
        anchor.addEventListener('click', (event) => {
            expect(event.defaultPrevented).toBe(false);
            event.preventDefault();
        });
    }
    document.querySelector('header a').click();
    document.querySelector('footer a').click();
    document.querySelector('.whatsapp-fab svg').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.querySelector('a[href="#work"]').click();
    expect(calls).toEqual([
        ['event', 'click_to_call', { link_location: 'header' }],
        ['event', 'email_click', { link_location: 'footer' }],
        ['event', 'whatsapp_click', { link_location: 'whatsapp' }],
    ]);
    stop();
    document.querySelector('header a').click();
    expect(calls).toHaveLength(3);
});

test('trackEvent ignores a missing or broken gtag', () => {
    expect(() => trackEvent('generate_lead', { link_location: 'contact' })).not.toThrow();
    window.gtag = () => {
        throw new Error('blocked');
    };
    expect(() => trackEvent('generate_lead', { link_location: 'contact' })).not.toThrow();
});

test('the quote form records a lead and still opens WhatsApp', async () => {
    const calls = [];
    window.gtag = (...args) => calls.push(args);
    const opened = [];
    jest.spyOn(window, 'open').mockImplementation((...args) => {
        opened.push(args);
        return null;
    });
    const previousFetch = global.fetch;
    global.fetch = () => Promise.resolve({ ok: true });
    try {
        render(<ContactUs />);
        fireEvent.change(screen.getByPlaceholderText('Your Name'), { target: { value: 'Ada', name: 'name' } });
        fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'ada@example.com', name: 'email' } });
        fireEvent.change(screen.getByPlaceholderText('Tell Us About Your Project'), { target: { value: 'Plaster walls', name: 'message' } });
        fireEvent.click(screen.getByRole('button', { name: /WhatsApp/ }));
        expect(calls).toEqual([
            ['event', 'generate_lead', { link_location: 'contact', method: 'whatsapp' }],
            ['event', 'whatsapp_click', { link_location: 'contact' }],
        ]);
        expect(String(opened[0][0])).toContain('https://wa.me/');
        expect(opened[0][1]).toBe('_blank');
        await waitFor(() => expect(screen.getByText(/WhatsApp is opening/)).toBeInTheDocument());
    } finally {
        global.fetch = previousFetch;
        window.open.mockRestore();
    }
});

test('sending the quote by email records a lead and not a second email click', () => {
    const calls = [];
    window.gtag = (...args) => calls.push(args);
    render(<ContactUs />);
    fireEvent.change(screen.getByPlaceholderText('Your Name'), { target: { value: 'Ada', name: 'name' } });
    fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'ada@example.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText('Tell Us About Your Project'), { target: { value: 'Plaster walls', name: 'message' } });
    // jsdom logs "not implemented" when the mailto: handoff assigns location.
    // The event is recorded before that, and the link is not a second email_click.
    fireEvent.click(screen.getByRole('button', { name: /Send by email/ }));
    expect(calls).toEqual([
        ['event', 'generate_lead', { link_location: 'contact', method: 'email' }],
    ]);
});
