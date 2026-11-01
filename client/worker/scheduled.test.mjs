import assert from 'node:assert/strict';
import { test } from 'node:test';
import worker from './index.mjs';

const SUMMARY = [
    'totalUsers',
    'newUsers',
    'sessions',
    'screenPageViews',
    'userEngagementDuration',
    'engagementRate',
    'activeUsers',
];

function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json' },
    });
}

function toPem(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
    const lines = btoa(binary).match(/.{1,64}/g).join('\n');
    return `-----BEGIN PRIVATE KEY-----\n${lines}\n-----END PRIVATE KEY-----\n`;
}

function base64urlToBytes(value) {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

async function serviceAccount() {
    const pair = await crypto.subtle.generateKey(
        {
            name: 'RSASSA-PKCS1-v1_5',
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256',
        },
        true,
        ['sign', 'verify'],
    );
    const pkcs8 = await crypto.subtle.exportKey('pkcs8', pair.privateKey);
    return {
        publicKey: pair.publicKey,
        json: JSON.stringify({
            client_email: 'reporter@example.iam.gserviceaccount.com',
            private_key: toPem(pkcs8),
        }),
    };
}

function summaryBody(startDate) {
    const currentStarts = new Set(['2026-10-26', '2026-06-29']);
    const values = currentStarts.has(startDate)
        ? [10, 8, 12, 20, 600, 0.5, 10]
        : [5, 4, 6, 9, 200, 0.4, 5];
    return {
        metricHeaders: SUMMARY.map((name) => ({ name })),
        rows: [{ metricValues: values.map((value) => ({ value: String(value) })) }],
    };
}

function installFetch(impl) {
    const previous = globalThis.fetch;
    const calls = [];
    globalThis.fetch = async (url, init) => {
        calls.push({ url: String(url), init });
        return impl(String(url), init);
    };
    return {
        calls,
        restore() {
            globalThis.fetch = previous;
        },
    };
}

function controllerAt(iso, cron = '0 13 * * 1') {
    const state = { cancelled: false };
    return {
        state,
        cron,
        scheduledTime: Date.parse(iso),
        noRetry() {
            state.cancelled = true;
        },
    };
}

test('a Monday 8 AM Eastern cron signs in, asks GA4, and sends one email', async () => {
    const account = await serviceAccount();
    let resendBody;
    const mock = installFetch(async (url, init) => {
        if (url === 'https://oauth2.googleapis.com/token') {
            const params = new URLSearchParams(init.body);
            assert.equal(params.get('grant_type'), 'urn:ietf:params:oauth:grant-type:jwt-bearer');
            const assertion = params.get('assertion');
            assert.equal(assertion.includes('PRIVATE KEY'), false);
            const [header, payload, signature] = assertion.split('.');
            const verified = await crypto.subtle.verify(
                'RSASSA-PKCS1-v1_5',
                account.publicKey,
                base64urlToBytes(signature),
                new TextEncoder().encode(`${header}.${payload}`),
            );
            assert.equal(verified, true);
            const claims = JSON.parse(new TextDecoder().decode(base64urlToBytes(payload)));
            assert.equal(claims.iss, 'reporter@example.iam.gserviceaccount.com');
            assert.equal(claims.scope, 'https://www.googleapis.com/auth/analytics.readonly');
            assert.equal(claims.aud, 'https://oauth2.googleapis.com/token');
            return jsonResponse({ access_token: 'ya29.test-token' });
        }
        if (url === 'https://analyticsdata.googleapis.com/v1beta/properties/551164486:runReport') {
            assert.equal(init.headers.Authorization, 'Bearer ya29.test-token');
            assert.equal(init.redirect, 'manual');
            const body = JSON.parse(init.body);
            if (body.dimensionFilter) return jsonResponse({ rows: [] });
            if (!body.dimensions) return jsonResponse(summaryBody(body.dateRanges[0].startDate));
            return jsonResponse({ rows: [] });
        }
        if (url === 'https://api.resend.com/emails') {
            resendBody = JSON.parse(init.body);
            assert.equal(init.headers.Authorization, 'Bearer re_test_key');
            assert.equal(init.headers['Idempotency-Key'], 'weekly-report/2026-10-26');
            assert.equal(JSON.stringify(resendBody).includes('PRIVATE KEY'), false);
            assert.equal(JSON.stringify(resendBody).includes('ya29.test-token'), false);
            return jsonResponse({ id: 'email_123' });
        }
        throw new Error(`unexpected ${url}`);
    });
    try {
        const result = await worker.scheduled(controllerAt('2026-11-02T13:00:00Z'), {
            GA4_SA_KEY: account.json,
            RESEND_API_KEY: 're_test_key',
            REPORT_TO: 'ph.leao2099@gmail.com',
            GOOGLE_MAPS_KEY: 'reviews-key',
        });
        assert.equal(result.sent, true);
        assert.equal(result.id, 'email_123');
        assert.equal(resendBody.from, 'Special Finishes Reports <reports@specialfinisheshi.com>');
        assert.deepEqual(resendBody.to, ['ph.leao2099@gmail.com']);
        assert.deepEqual(resendBody.reply_to, ['specialfinisheshi@gmail.com']);
        assert.equal(resendBody.subject, 'Your website this week: Oct 26 - Nov 1');
        assert.match(resendBody.html, /Visits are up 100% this week/);
        assert.match(resendBody.text, /Visits are up 100% this week/);
        assert.doesNotMatch(resendBody.html, /Customer actions/);
        const hosts = mock.calls.map((call) => new URL(call.url).host);
        assert.deepEqual(hosts.filter((host) => host === 'oauth2.googleapis.com'), ['oauth2.googleapis.com']);
        assert.equal(hosts.filter((host) => host === 'analyticsdata.googleapis.com').length, 9);
    } finally {
        mock.restore();
    }
});

test('the summer cron sends at 12:00 UTC and the winter twin does not', async () => {
    const calls = [];
    const previous = globalThis.fetch;
    globalThis.fetch = async (url) => {
        calls.push(String(url));
        throw new Error('should not fetch');
    };
    try {
        const skipped = await worker.scheduled(controllerAt('2026-07-06T13:00:00Z', '0 13 * * 1'), {
            GA4_SA_KEY: '{"client_email":"a@b.c","private_key":"x"}',
            RESEND_API_KEY: 're_test_key',
            REPORT_TO: 'a@b.com',
        });
        assert.equal(skipped.reason, 'not_monday_8am_eastern');
        assert.equal(calls.length, 0);

        const winterSkip = await worker.scheduled(controllerAt('2026-11-02T12:00:00Z', '0 12 * * 1'), {
            GA4_SA_KEY: '{"client_email":"a@b.c","private_key":"x"}',
            RESEND_API_KEY: 're_test_key',
            REPORT_TO: 'a@b.com',
        });
        assert.equal(winterSkip.reason, 'not_monday_8am_eastern');
        assert.equal(calls.length, 0);
    } finally {
        globalThis.fetch = previous;
    }
});

test('missing report secrets skip the send and do not retry', async () => {
    const calls = [];
    const previous = globalThis.fetch;
    globalThis.fetch = async (url) => {
        calls.push(String(url));
        throw new Error('should not fetch');
    };
    const scheduled = controllerAt('2026-11-02T13:00:00Z');
    try {
        const result = await worker.scheduled(scheduled, { GOOGLE_MAPS_KEY: 'reviews-key', REPORT_TO: 'a@b.com' });
        assert.equal(result.reason, 'missing_config');
        assert.deepEqual(result.missing, ['GA4_SA_KEY', 'RESEND_API_KEY']);
        assert.equal(scheduled.state.cancelled, true);
        assert.equal(calls.length, 0);
    } finally {
        globalThis.fetch = previous;
    }
});

test('an unreadable service account does not throw or call Google', async () => {
    const calls = [];
    const previous = globalThis.fetch;
    globalThis.fetch = async () => {
        calls.push(1);
        throw new Error('should not fetch');
    };
    const scheduled = controllerAt('2026-11-02T13:00:00Z');
    try {
        const result = await worker.scheduled(scheduled, {
            GA4_SA_KEY: '{not json',
            RESEND_API_KEY: 're_test_key',
            REPORT_TO: 'a@b.com',
        });
        assert.equal(result.reason, 'ga4_key_unreadable');
        assert.equal(scheduled.state.cancelled, true);
        assert.equal(calls.length, 0);
    } finally {
        globalThis.fetch = previous;
    }
});

test('a Google failure rejects so the cron can retry', async () => {
    const account = await serviceAccount();
    const scheduled = controllerAt('2026-11-02T13:00:00Z');
    const previous = globalThis.fetch;
    globalThis.fetch = async () => jsonResponse({ error: 'nope' }, 500);
    try {
        await assert.rejects(
            () => worker.scheduled(scheduled, {
                GA4_SA_KEY: account.json,
                RESEND_API_KEY: 're_test_key',
                REPORT_TO: 'a@b.com',
            }),
            /ga4_token_500/,
        );
        assert.equal(scheduled.state.cancelled, false);
    } finally {
        globalThis.fetch = previous;
    }
});

test('a failed actions query still sends the rest of the report', async () => {
    const account = await serviceAccount();
    const mock = installFetch(async (url, init) => {
        if (url === 'https://oauth2.googleapis.com/token') return jsonResponse({ access_token: 'ya29.test-token' });
        if (url.includes(':runReport')) {
            const body = JSON.parse(init.body);
            if (body.dimensionFilter) return jsonResponse({ error: 'bad filter' }, 400);
            if (!body.dimensions) return jsonResponse(summaryBody(body.dateRanges[0].startDate));
            return jsonResponse({ rows: [] });
        }
        if (url === 'https://api.resend.com/emails') {
            const body = JSON.parse(init.body);
            assert.doesNotMatch(body.html, /Customer actions/);
            assert.match(body.html, /Visits are up 100%/);
            return jsonResponse({ id: 'email_456' });
        }
        throw new Error(`unexpected ${url}`);
    });
    try {
        const result = await worker.scheduled(controllerAt('2026-07-06T12:00:00Z', '0 12 * * 1'), {
            GA4_SA_KEY: account.json,
            RESEND_API_KEY: 're_test_key',
            REPORT_TO: 'a@b.com, second@example.com',
        });
        assert.equal(result.id, 'email_456');
    } finally {
        mock.restore();
    }
});
