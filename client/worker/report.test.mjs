import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
    ACTION_EVENT_FILTER,
    assembleReport,
    changeParts,
    exampleReport,
    fetchGa4,
    formatShortRange,
    googleErrorDetail,
    isEasternMondayAtEight,
    parseRecipients,
    reportIdempotencyKey,
    renderHtml,
    renderText,
    reportRequests,
    sendWeeklyEmail,
    subjectFor,
    weekRanges,
} from './report.mjs';

const clientRoot = fileURLToPath(new URL('..', import.meta.url));

test('the send window is Monday 8 AM Eastern in both EST and EDT', () => {
    // July is EDT (UTC-4): 12:00 UTC is 8 AM, 13:00 UTC is 9 AM.
    assert.equal(isEasternMondayAtEight(new Date('2026-07-06T12:00:00Z')), true);
    assert.equal(isEasternMondayAtEight(new Date('2026-07-06T13:00:00Z')), false);
    // November is EST (UTC-5): 12:00 UTC is 7 AM, 13:00 UTC is 8 AM.
    assert.equal(isEasternMondayAtEight(new Date('2026-11-02T12:00:00Z')), false);
    assert.equal(isEasternMondayAtEight(new Date('2026-11-02T13:00:00Z')), true);
    assert.equal(isEasternMondayAtEight(new Date('2026-11-02T13:30:00Z')), true);
    // The week after the clocks change is still Monday at 12:00 UTC in March (EDT).
    assert.equal(isEasternMondayAtEight(new Date('2026-03-09T12:00:00Z')), true);
    assert.equal(isEasternMondayAtEight(new Date('2026-03-09T13:00:00Z')), false);
    // Tuesday 8 AM Eastern does not send.
    assert.equal(isEasternMondayAtEight(new Date('2026-11-03T13:00:00Z')), false);
    assert.equal(isEasternMondayAtEight(new Date('not-a-date')), false);
});

test('week ranges are the last seven full Eastern days and the seven before', () => {
    const ranges = weekRanges(new Date('2026-11-02T13:00:00Z'));
    assert.deepEqual(ranges.current, { startDate: '2026-10-26', endDate: '2026-11-01' });
    assert.deepEqual(ranges.previous, { startDate: '2026-10-19', endDate: '2026-10-25' });
    assert.equal(subjectFor({ current: ranges.current }), 'Your website this week: Oct 26 - Nov 1');
    assert.equal(formatShortRange('2026-12-28', '2027-01-03'), 'Dec 28, 2026 - Jan 3, 2027');
});

test('visitor change uses a whole percent and an arrow', () => {
    assert.deepEqual(changeParts(186, 151), { direction: 'up', label: '↑ 23%' });
    assert.deepEqual(changeParts(10, 20), { direction: 'down', label: '↓ 50%' });
    assert.equal(changeParts(5, 5).label, 'No change');
    assert.equal(changeParts(4, 0).label, 'New');
});

test('the example reads as a made-up week and names Google search', () => {
    const report = exampleReport();
    assert.equal(report.example, true);
    assert.equal(report.headline, 'Visits are up 23% this week, mostly from Google search.');
    assert.equal(report.daily.length, 7);
    assert.equal(report.daily[0].label, 'Mon');
    assert.equal(report.daily[6].label, 'Sun');
    assert.equal(report.actions.length, 4);

    const html = renderHtml(report);
    const text = renderText(report);
    assert.match(html, /Example only/);
    assert.match(html, /not live data/);
    assert.match(html, /Visits are up 23% this week, mostly from Google search/);
    assert.match(html, /#0f0d0b/);
    assert.match(html, /#f4f1ec/);
    assert.match(html, /#a39a8e/);
    assert.match(html, /#e95517/);
    assert.match(html, /Cormorant Garamond/);
    assert.match(html, /Montserrat/);
    assert.match(html, /https:\/\/specialfinisheshi\.com\/logo192\.png/);
    assert.match(html, /Prepared for Special Finishes by Ouroboros Studios/);
    assert.match(html, /Visit the Special Finishes website/);
    assert.match(html, /Customer actions/);
    assert.match(html, /Calls tapped/);
    assert.match(html, /WhatsApp messages started/);
    assert.match(html, /Emails started/);
    assert.match(html, /Quote requests/);
    assert.match(html, /↓ 100%/);
    assert.doesNotMatch(html, /Tracking just started/);
    assert.match(html, /lang="en"/);
    assert.match(html, /role="presentation"/);
    assert.match(text, /EXAMPLE ONLY/);
    assert.match(text, /Prepared for Special Finishes by Ouroboros Studios/);
    assert.match(text, /https:\/\/specialfinisheshi\.com/);
    assert.doesNotMatch(text, /<table/);
});

test('customer actions stay hidden when no matching events came back', () => {
    const report = assembleReport({
        current: { totalUsers: 5, activeUsers: 5, userEngagementDuration: 50, engagementRate: 0.4 },
        previous: { totalUsers: 4, activeUsers: 4, userEngagementDuration: 40, engagementRate: 0.5 },
        events: [{ eventName: 'page_view', eventCount: 40 }, { eventName: 'click', eventCount: 0 }],
    }, {
        current: { startDate: '2026-10-26', endDate: '2026-11-01' },
        previous: { startDate: '2026-10-19', endDate: '2026-10-25' },
    });
    assert.equal(report.actions.length, 0);
    assert.doesNotMatch(renderHtml(report), /Customer actions/);
    assert.doesNotMatch(renderText(report), /Customer actions/);
});

test('page titles from analytics are escaped', () => {
    const report = assembleReport({
        current: { totalUsers: 2 },
        previous: { totalUsers: 1 },
        pages: [{
            pagePath: '/<script>',
            pageTitle: '<img src=x onerror=alert(1)>',
            screenPageViews: 2,
        }],
    }, {
        current: { startDate: '2026-10-26', endDate: '2026-11-01' },
        previous: { startDate: '2026-10-19', endDate: '2026-10-25' },
    });
    const html = renderHtml(report);
    assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
    assert.match(html, /\/&lt;script&gt;/);
    assert.doesNotMatch(html, /<script>/);
    assert.doesNotMatch(html, /<img src=x/);
});

test('a quiet week does not invent a percent', () => {
    const report = assembleReport({
        current: { totalUsers: 0 },
        previous: { totalUsers: 0 },
    }, weekRanges(new Date('2026-11-02T13:00:00Z')));
    assert.equal(report.headline, 'No visits were recorded this week.');
});

test('the event query counts the four site events across both weeks', () => {
    const ranges = weekRanges(new Date('2026-11-02T13:00:00Z'));
    const events = reportRequests(ranges).events;
    assert.deepEqual(events.dimensionFilter, ACTION_EVENT_FILTER);
    assert.deepEqual(events.dateRanges.map((range) => range.name), ['current', 'previous']);
    assert.deepEqual(events.dimensions.map((dimension) => dimension.name), ['eventName']);
    assert.equal(JSON.stringify(events.dimensions).includes('dateRange'), false);
    const names = events.dimensionFilter.orGroup.expressions.map((item) => item.filter.stringFilter.value);
    assert.deepEqual(names, ['click_to_call', 'whatsapp_click', 'email_click', 'generate_lead']);
});

test('a known action still shows when this week is zero', () => {
    const ranges = {
        current: { startDate: '2026-10-26', endDate: '2026-11-01' },
        previous: { startDate: '2026-10-19', endDate: '2026-10-25' },
    };
    const quietWeek = assembleReport({
        current: { totalUsers: 5 },
        previous: { totalUsers: 4 },
        events: [
            { eventName: 'click_to_call', dateRange: 'previous', eventCount: 4 },
            { eventName: 'click_to_call', dateRange: 'all', eventCount: 4 },
            { eventName: 'page_view', dateRange: 'all', eventCount: 80 },
        ],
    }, ranges);
    assert.deepEqual(quietWeek.actions, [{
        name: 'click_to_call',
        label: 'Calls tapped',
        current: 0,
        previous: 4,
    }]);
    assert.equal(quietWeek.actionsFresh, false);
    assert.match(renderText(quietWeek), /Calls tapped: 0 \(4 the week before, down 100%\)/);

    const justStarted = assembleReport({
        current: { totalUsers: 5 },
        previous: { totalUsers: 4 },
        events: [
            { eventName: 'whatsapp_click', dateRange: 'current', eventCount: 2 },
            { eventName: 'email_click', dateRange: 'all', eventCount: 1 },
        ],
    }, ranges);
    assert.equal(justStarted.actionsFresh, true);
    assert.equal(justStarted.actions.find((action) => action.name === 'email_click').current, 0);
    assert.match(renderHtml(justStarted), /Tracking just started/);
    assert.match(renderText(justStarted), /Tracking just started/);
});

test('a GA4 error is logged without secrets, and missing events are not an error', async () => {
    assert.equal(
        googleErrorDetail(JSON.stringify({
            error: { message: 'Field dateRange is not a valid dimension. ya29.SUPERSECRET' },
        })),
        'Field dateRange is not a valid dimension. [token]',
    );

    const ranges = weekRanges(new Date('2026-11-02T13:00:00Z'));
    const errors = [];
    const logs = [];
    const previousError = console.error;
    const previousLog = console.log;
    console.error = (line) => errors.push(String(line));
    console.log = (line) => logs.push(String(line));
    const empty = () => new Response(JSON.stringify({ rows: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
    });
    try {
        const failed = await fetchGa4('token', ranges, async (_url, init) => {
            const body = JSON.parse(init.body);
            if (body.dimensionFilter) {
                return new Response(JSON.stringify({
                    error: { message: 'Requested events were not found ya29.SUPERSECRET' },
                }), { status: 400 });
            }
            return empty();
        });
        assert.deepEqual(failed.events, []);
        const loggedError = errors.join('\n');
        assert.match(loggedError, /Requested events were not found/);
        assert.doesNotMatch(loggedError, /SUPERSECRET/);
        assert.doesNotMatch(logs.join('\n'), /no events yet/);

        errors.length = 0;
        logs.length = 0;
        const quiet = await fetchGa4('token', ranges, async () => empty());
        assert.deepEqual(quiet.events, []);
        assert.equal(errors.length, 0);
        assert.match(logs.join('\n'), /no events yet/);
    } finally {
        console.error = previousError;
        console.log = previousLog;
    }
});

test('the cron idempotency key includes recipients and the script key changes every run', () => {
    const report = { current: { startDate: '2026-10-26' } };
    const cron = reportIdempotencyKey(report, 'Ruiterfernandes77@gmail.com, specialfinisheshi@gmail.com');
    assert.equal(cron, reportIdempotencyKey(report, ['specialfinisheshi@gmail.com', 'ruiterfernandes77@gmail.com']));
    assert.equal(cron, 'weekly-report/2026-10-26/ruiterfernandes77@gmail.com,specialfinisheshi@gmail.com');
    const first = reportIdempotencyKey(report, 'a@b.com', { unique: true });
    const second = reportIdempotencyKey(report, 'a@b.com', { unique: true });
    assert.notEqual(first, second);
    assert.ok(first.startsWith('weekly-report/2026-10-26/a@b.com/'));
    assert.equal(reportIdempotencyKey(report, 'a@b.com', { unique: 'run-1' }), 'weekly-report/2026-10-26/a@b.com/run-1');
});

test('recipients are a comma-separated list of addresses', () => {
    assert.deepEqual(parseRecipients('ph.leao2099@gmail.com, other@example.com'), [
        'ph.leao2099@gmail.com',
        'other@example.com',
    ]);
    assert.deepEqual(parseRecipients('not-an-email, a@b.com'), ['a@b.com']);
    assert.deepEqual(parseRecipients(''), []);
});

test('a same-week payload mismatch is not treated as a hard failure', async () => {
    const report = exampleReport();
    const mismatch = await sendWeeklyEmail({
        apiKey: 're_test',
        to: 'a@b.com',
        report,
        fetchImpl: async () => new Response(JSON.stringify({ name: 'invalid_idempotent_request' }), { status: 409 }),
    });
    assert.equal(mismatch.sent, false);
    assert.equal(mismatch.duplicate, true);

    await assert.rejects(
        () => sendWeeklyEmail({
            apiKey: 're_test',
            to: 'a@b.com',
            report,
            fetchImpl: async () => new Response(JSON.stringify({ name: 'concurrent_idempotent_requests' }), { status: 409 }),
        }),
        /resend_409/,
    );
});

test('wrangler keeps the reviews secret required and adds both eastern hours', () => {
    const config = readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8');
    const required = config.match(/"required"\s*:\s*\[([^\]]*)\]/);
    assert.ok(required);
    assert.equal(required[1].replace(/\s/g, ''), '"GOOGLE_MAPS_KEY"');
    assert.match(config, /"0 12 \* \* 1"/);
    assert.match(config, /"0 13 \* \* 1"/);
    assert.match(config, /"REPORT_TO": "specialfinisheshi@gmail.com,ruiterfernandes77@gmail.com"/);
    assert.match(config, /"run_worker_first": \["\/api\/reviews"\]/);
});

test('the example script writes html and does not send', () => {
    const dir = mkdtempSync(join(tmpdir(), 'sf-report-'));
    const out = join(dir, 'report.html');
    const result = spawnSync(process.execPath, [
        'scripts/send-report.mjs',
        '--example',
        '--dry-run',
        '--out',
        out,
    ], { cwd: clientRoot, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const html = readFileSync(out, 'utf8');
    assert.match(html, /Example only/);
    assert.match(html, /Visits are up 23% this week, mostly from Google search/);
    assert.match(result.stdout, /Oct 26 - Nov 1/);
    assert.doesNotMatch(`${result.stdout}\n${result.stderr}`, /private_key|re_live/);

    const refused = spawnSync(process.execPath, [
        'scripts/send-report.mjs',
        '--example',
    ], { cwd: clientRoot, encoding: 'utf8' });
    assert.equal(refused.status, 1);
    assert.match(refused.stderr, /dry-run/);
});
