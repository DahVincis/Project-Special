// GA4 events for calls, WhatsApp, email, and quote requests.
// gtag is the snippet in public/index.html. If it never loads, tracking is a no-op
// and the tap still navigates.

export function trackEvent(name, params) {
    try {
        if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
        window.gtag('event', name, params);
    } catch {
        // A broken analytics call must not block a call, a message, or the form handoff.
    }
}

export function eventForHref(href) {
    const value = String(href || '').trim();
    if (/^tel:/i.test(value)) return 'click_to_call';
    if (/^mailto:/i.test(value)) return 'email_click';
    if (/wa\.me|api\.whatsapp\.com|whatsapp\.com/i.test(value)) return 'whatsapp_click';
    return null;
}

export function linkLocation(node) {
    if (!node || typeof node.closest !== 'function') return 'page';
    if (node.closest('.whatsapp-fab')) return 'whatsapp';
    if (node.closest('header')) return 'header';
    if (node.closest('footer')) return 'footer';
    if (node.closest('#contact')) return 'contact';
    if (node.closest('.hero')) return 'hero';
    if (node.closest('#about')) return 'about';
    if (node.closest('#services')) return 'services';
    if (node.closest('#work, .work-selected, .case')) return 'work';
    if (node.closest('#reviews')) return 'reviews';
    if (node.closest('#owner')) return 'owner';
    return 'page';
}

function anchorFromEvent(event) {
    const target = event.target;
    const element = target && target.nodeType === 1 ? target : target?.parentElement;
    if (!element || typeof element.closest !== 'function') return null;
    return element.closest('a[href]');
}

// Capture phase so a later handler that stops bubbling still gets counted.
// The listener never calls preventDefault, so tel:, mailto:, and wa.me keep working.
export function installClickTracking(target = document) {
    if (!target || typeof target.addEventListener !== 'function') return () => {};
    const onClick = (event) => {
        const anchor = anchorFromEvent(event);
        if (!anchor) return;
        const name = eventForHref(anchor.getAttribute('href'));
        if (!name) return;
        trackEvent(name, { link_location: linkLocation(anchor) });
    };
    target.addEventListener('click', onClick, true);
    return () => target.removeEventListener('click', onClick, true);
}
