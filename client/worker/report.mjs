// Monday website report for Special Finishes.
// Shared by the Worker scheduled handler and scripts/send-report.mjs.
// No third-party libraries: WebCrypto signs the GA4 JWT, fetch talks to
// Google and Resend, and the email is a table layout both runtimes can render.

export const TIME_ZONE = 'America/New_York';
export const PROPERTY_ID = '551164486';
export const SITE_URL = 'https://specialfinisheshi.com';
export const LOGO_URL = 'https://specialfinisheshi.com/logo192.png';
export const FROM_ADDRESS = 'Special Finishes Reports <reports@specialfinisheshi.com>';
export const REPLY_TO = 'specialfinisheshi@gmail.com';
export const SEND_CRONS = ['0 12 * * 1', '0 13 * * 1'];

const GA4_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const REPORT_URL = `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`;
const RESEND_URL = 'https://api.resend.com/emails';

const SANS = "Montserrat, Arial, Helvetica, sans-serif";
const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const BG = '#0f0d0b';
const TEXT = '#f4f1ec';
const MUTED = '#a39a8e';
const ACCENT = '#e95517';
const INK = '#0f0d0b';
const RULE = '#2a241f';
const TRACK = '#2a241f';
const UP = '#9dd6a8';
const DOWN = '#f0a090';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SUMMARY_METRICS = [
    'totalUsers',
    'newUsers',
    'sessions',
    'screenPageViews',
    'userEngagementDuration',
    'engagementRate',
    'activeUsers',
];

const CHANNEL_LABELS = {
    'Organic Search': 'Search',
    'Paid Search': 'Paid search',
    Direct: 'Direct',
    'Organic Social': 'Social',
    'Paid Social': 'Paid social',
    Referral: 'Other websites',
    Email: 'Email',
    Display: 'Display ads',
    Unassigned: 'Other',
    'Cross-network': 'Ads across networks',
    'Organic Shopping': 'Shopping',
    'Paid Shopping': 'Paid shopping',
    'Organic Video': 'Video',
    'Paid Video': 'Paid video',
    SMS: 'Text messages',
};

// Names the site records. Order is the order they appear in the email.
export const TRACKED_ACTIONS = [
    { name: 'click_to_call', label: 'Calls tapped' },
    { name: 'whatsapp_click', label: 'WhatsApp messages started' },
    { name: 'email_click', label: 'Emails started' },
    { name: 'generate_lead', label: 'Quote requests' },
];

const numberFormat = new Intl.NumberFormat('en-US');

function exactEvent(value) {
    return {
        filter: {
            fieldName: 'eventName',
            stringFilter: { matchType: 'EXACT', value, caseSensitive: false },
        },
    };
}

// Only the four events the site sends. A wide third range tells us the event
// exists in the property even when this week and last week are both zero.
export const ACTION_EVENT_FILTER = {
    orGroup: {
        expressions: TRACKED_ACTIONS.map((action) => exactEvent(action.name)),
    },
};

export function easternParts(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
    const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: TIME_ZONE,
        weekday: 'short',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    });
    const parts = {};
    for (const part of fmt.formatToParts(date)) {
        if (part.type !== 'literal') parts[part.type] = part.value;
    }
    let hour = Number(parts.hour);
    // Some ICU builds report midnight as 24 under hourCycle h23.
    if (hour === 24) hour = 0;
    return {
        weekday: parts.weekday,
        year: Number(parts.year),
        month: Number(parts.month),
        day: Number(parts.day),
        hour,
        minute: Number(parts.minute),
    };
}

// True only for Monday 8:00–8:59 America/New_York. The Worker registers both
// 12:00 and 13:00 UTC because Eastern switches between UTC-4 and UTC-5;
// the other firing is a no-op.
export function isEasternMondayAtEight(date) {
    const parts = easternParts(date);
    return !!parts && parts.weekday === 'Mon' && parts.hour === 8;
}

function parseIso(iso) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!match) return null;
    return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
}

function toIso(civil) {
    return `${civil.y}-${String(civil.m).padStart(2, '0')}-${String(civil.d).padStart(2, '0')}`;
}

function addCivil(civil, days) {
    const utc = new Date(Date.UTC(civil.y, civil.m - 1, civil.d + days));
    return { y: utc.getUTCFullYear(), m: utc.getUTCMonth() + 1, d: utc.getUTCDate() };
}

function weekdayIndex(iso) {
    const civil = parseIso(iso);
    return new Date(Date.UTC(civil.y, civil.m - 1, civil.d)).getUTCDay();
}

export function eachDay(startDate, endDate) {
    const days = [];
    let cursor = parseIso(startDate);
    if (!cursor || !parseIso(endDate)) return days;
    for (let i = 0; i < 14; i += 1) {
        const iso = toIso(cursor);
        days.push(iso);
        if (iso === endDate) break;
        cursor = addCivil(cursor, 1);
    }
    return days;
}

// Last 7 full Eastern days, ending yesterday, plus the 7 days before that.
// At Monday 8 AM the current window is the Monday–Sunday that just finished.
export function weekRanges(now) {
    const parts = easternParts(now);
    if (!parts) throw new Error('invalid_date');
    const today = { y: parts.year, m: parts.month, d: parts.day };
    const end = addCivil(today, -1);
    const start = addCivil(end, -6);
    const prevEnd = addCivil(start, -1);
    const prevStart = addCivil(prevEnd, -6);
    return {
        current: { startDate: toIso(start), endDate: toIso(end) },
        previous: { startDate: toIso(prevStart), endDate: toIso(prevEnd) },
    };
}

export function formatShortRange(startDate, endDate) {
    const start = parseIso(startDate);
    const end = parseIso(endDate);
    if (!start || !end) return '';
    if (start.y !== end.y) {
        return `${MONTHS[start.m - 1]} ${start.d}, ${start.y} - ${MONTHS[end.m - 1]} ${end.d}, ${end.y}`;
    }
    return `${MONTHS[start.m - 1]} ${start.d} - ${MONTHS[end.m - 1]} ${end.d}`;
}

export function formatLongRange(startDate, endDate) {
    const start = parseIso(startDate);
    const end = parseIso(endDate);
    if (!start || !end) return '';
    const left = `${MONTHS_LONG[start.m - 1]} ${start.d}`;
    const right = `${MONTHS_LONG[end.m - 1]} ${end.d}`;
    if (start.y !== end.y) return `${left}, ${start.y} through ${right}, ${end.y}`;
    return `${left} through ${right}, ${end.y}`;
}

export function subjectFor(report) {
    return `Your website this week: ${formatShortRange(report.current.startDate, report.current.endDate)}`;
}

export function formatCount(value) {
    return numberFormat.format(Math.round(Number(value) || 0));
}

export function formatDuration(seconds) {
    const total = Math.max(0, Math.round(Number(seconds) || 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
}

export function formatRate(fraction) {
    return `${Math.round((Number(fraction) || 0) * 100)}%`;
}

export function changeParts(current, previous) {
    const cur = Number(current) || 0;
    const prev = Number(previous) || 0;
    if (prev === 0 && cur === 0) return { direction: 'flat', label: 'No change' };
    if (prev === 0) return { direction: 'up', label: 'New' };
    const pct = Math.round(((cur - prev) / prev) * 100);
    if (pct === 0) return { direction: 'flat', label: 'No change' };
    if (pct > 0) return { direction: 'up', label: `↑ ${pct}%` };
    return { direction: 'down', label: `↓ ${Math.abs(pct)}%` };
}

function changeColor(direction) {
    if (direction === 'up') return UP;
    if (direction === 'down') return DOWN;
    return MUTED;
}

function cleanLabel(value, max = 120) {
    return String(value ?? '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function shorten(value, max) {
    const clean = cleanLabel(value, 300);
    if (clean.length <= max) return clean;
    return `${clean.slice(0, max - 1).trimEnd()}…`;
}

function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function safeDecode(value) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

export function reportRequests(ranges) {
    const metrics = SUMMARY_METRICS.map((name) => ({ name }));
    return {
        current: { dateRanges: [ranges.current], metrics },
        previous: { dateRanges: [ranges.previous], metrics },
        daily: {
            dateRanges: [ranges.current],
            dimensions: [{ name: 'date' }],
            metrics: [{ name: 'totalUsers' }],
            orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
            keepEmptyRows: true,
            limit: '14',
        },
        pages: {
            dateRanges: [ranges.current],
            dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
            metrics: [{ name: 'screenPageViews' }],
            orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
            limit: '8',
        },
        channels: {
            dateRanges: [ranges.current],
            dimensions: [{ name: 'sessionDefaultChannelGroup' }],
            metrics: [{ name: 'sessions' }],
            orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
            limit: '8',
        },
        sources: {
            dateRanges: [ranges.current],
            dimensions: [{ name: 'sessionSource' }],
            metrics: [{ name: 'sessions' }],
            orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
            limit: '8',
        },
        devices: {
            dateRanges: [ranges.current],
            dimensions: [{ name: 'deviceCategory' }],
            metrics: [{ name: 'sessions' }],
            orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
            limit: '8',
        },
        cities: {
            dateRanges: [ranges.current],
            dimensions: [{ name: 'city' }],
            metrics: [{ name: 'totalUsers' }],
            orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
            limit: '8',
        },
        events: {
            dateRanges: [
                { ...ranges.current, name: 'current' },
                { ...ranges.previous, name: 'previous' },
                { startDate: '2020-01-01', endDate: ranges.current.endDate, name: 'all' },
            ],
            dimensions: [{ name: 'eventName' }, { name: 'dateRange' }],
            metrics: [{ name: 'eventCount' }],
            dimensionFilter: ACTION_EVENT_FILTER,
            limit: '30',
        },
    };
}

function rowsToObjects(report) {
    const dims = (report?.dimensionHeaders || []).map((header) => header.name);
    const mets = (report?.metricHeaders || []).map((header) => header.name);
    return (report?.rows || []).map((row) => {
        const obj = {};
        dims.forEach((name, index) => {
            obj[name] = row.dimensionValues?.[index]?.value ?? '';
        });
        mets.forEach((name, index) => {
            const value = Number(row.metricValues?.[index]?.value ?? 0);
            obj[name] = Number.isFinite(value) ? value : 0;
        });
        return obj;
    });
}

function metricMap(report) {
    const names = (report?.metricHeaders || []).map((header) => header.name);
    const values = report?.rows?.[0]?.metricValues || [];
    const out = {};
    for (const name of SUMMARY_METRICS) out[name] = 0;
    names.forEach((name, index) => {
        const value = Number(values[index]?.value ?? 0);
        out[name] = Number.isFinite(value) ? value : 0;
    });
    return out;
}

function normalizeGaDate(value) {
    const digits = String(value || '').replace(/\D/g, '');
    if (digits.length !== 8) return '';
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

function averageEngagement(summary) {
    const users = summary.activeUsers || 0;
    if (users <= 0) return 0;
    return summary.userEngagementDuration / users;
}

function channelLabel(name) {
    if (!name || name === '(not set)') return null;
    return CHANNEL_LABELS[name] || name;
}

function sourceLabel(name) {
    const raw = cleanLabel(name, 80);
    const key = raw.toLowerCase();
    if (!key || key === '(not set)' || key === '(none)') return null;
    if (key === '(direct)' || key === 'direct') return 'Direct';
    if (key === 'google' || key === 'google.com') return 'Google';
    if (key === 'bing') return 'Bing';
    if (key === 'yahoo') return 'Yahoo';
    if (key.includes('duckduckgo')) return 'DuckDuckGo';
    if (key.includes('facebook') || key === 'fb') return 'Facebook';
    if (key.includes('instagram') || key === 'ig') return 'Instagram';
    return raw;
}

function deviceLabel(name) {
    const key = String(name || '').toLowerCase();
    if (key === 'mobile') return 'Phone';
    if (key === 'desktop') return 'Computer';
    if (key === 'tablet') return 'Tablet';
    if (key === 'smart tv') return 'TV';
    return 'Other';
}

function dateRangeKey(value) {
    const key = String(value || '').toLowerCase();
    if (key === 'current' || key === 'date_range_0') return 'current';
    if (key === 'previous' || key === 'date_range_1') return 'previous';
    if (key === 'all' || key === 'date_range_2') return 'all';
    if (!key) return 'current';
    return '';
}

function assembleActions(rows) {
    const tracked = new Map(TRACKED_ACTIONS.map((action) => [action.name, action.label]));
    const counts = new Map();
    const seen = new Set();
    for (const row of rows || []) {
        const name = String(row.eventName || '').toLowerCase();
        if (!tracked.has(name)) continue;
        const count = Number(row.eventCount) || 0;
        const range = dateRangeKey(row.dateRange);
        if (!counts.has(name)) counts.set(name, { current: 0, previous: 0 });
        const bucket = counts.get(name);
        if (range === 'current' || range === 'previous') bucket[range] += count;
        if (count > 0) seen.add(name);
    }
    const actions = TRACKED_ACTIONS
        .filter((action) => seen.has(action.name))
        .map((action) => ({
            name: action.name,
            label: action.label,
            current: counts.get(action.name)?.current || 0,
            previous: counts.get(action.name)?.previous || 0,
        }));
    return {
        actions,
        actionsFresh: actions.length > 0 && actions.every((action) => action.previous === 0),
    };
}

function mostlyFrom(channels, sources) {
    const sourceTotal = sources.reduce((sum, row) => sum + row.sessions, 0);
    const channelTotal = channels.reduce((sum, row) => sum + row.sessions, 0);
    const topSource = sources[0];
    const topChannel = channels[0];
    const sourceShare = topSource && sourceTotal ? topSource.sessions / sourceTotal : 0;
    const channelShare = topChannel && channelTotal ? topChannel.sessions / channelTotal : 0;
    if (sourceShare < 0.4 && channelShare < 0.4) return null;
    const sourceName = (topSource?.name || '').toLowerCase();
    const channelName = (topChannel?.name || '').toLowerCase();
    const google = sourceName === 'google' || sourceName === 'google.com';
    if (google && channelName === 'organic search') return 'Google search';
    if (google && (channelName === 'paid search' || channelName === 'cross-network')) return 'Google ads';
    if (google) return 'Google';
    if (sourceName === 'bing' && channelName === 'organic search') return 'Bing search';
    if (sourceName === '(direct)' || channelName === 'direct') return 'people who came directly';
    if (sourceName.includes('facebook')) return 'Facebook';
    if (sourceName.includes('instagram')) return 'Instagram';
    if (channelName === 'organic search') return 'search';
    if (channelName === 'organic social') return 'social media';
    if (channelName === 'referral') return 'links on other sites';
    if (channelName === 'email') return 'email';
    if (topSource?.label) return topSource.label;
    if (topChannel?.label) return topChannel.label.toLowerCase();
    return null;
}

export function buildHeadline(visitors, phrase) {
    const cur = Number(visitors?.current) || 0;
    const prev = Number(visitors?.previous) || 0;
    const from = phrase ? `, mostly from ${phrase}` : '';
    if (cur === 0 && prev === 0) return 'No visits were recorded this week.';
    if (cur === 0) return `No visits were recorded this week, down from ${formatCount(prev)} the week before.`;
    if (prev === 0) {
        return `The site had ${formatCount(cur)} ${cur === 1 ? 'visit' : 'visits'} this week, up from none the week before${from}.`;
    }
    const pct = Math.round(((cur - prev) / prev) * 100);
    if (pct > 0) return `Visits are up ${pct}% this week${from}.`;
    if (pct < 0) {
        const still = phrase ? ` Most visits still came from ${phrase}.` : '';
        return `Visits are down ${Math.abs(pct)}% this week.${still}`;
    }
    return `Visits held steady this week${from}.`;
}

function sumBy(rows, labelOf, valueKey, limit) {
    const buckets = new Map();
    for (const row of rows) {
        const name = row.name ?? row[valueKey];
        const label = labelOf(name);
        if (!label) continue;
        const value = Number(row.value) || 0;
        if (value <= 0) continue;
        const current = buckets.get(label) || { name, label, value: 0 };
        current.value += value;
        buckets.set(label, current);
    }
    return [...buckets.values()].sort((a, b) => b.value - a.value).slice(0, limit);
}

export function assembleReport(raw, ranges, options = {}) {
    const current = raw.current || {};
    const previous = raw.previous || {};
    const dailyLookup = new Map();
    for (const row of raw.daily || []) {
        const iso = normalizeGaDate(row.date);
        if (iso) dailyLookup.set(iso, (dailyLookup.get(iso) || 0) + (row.totalUsers || 0));
    }
    const daily = eachDay(ranges.current.startDate, ranges.current.endDate).map((iso) => ({
        date: iso,
        label: WEEKDAYS[weekdayIndex(iso)],
        visitors: dailyLookup.get(iso) || 0,
    }));

    const pages = [];
    for (const row of raw.pages || []) {
        const path = safeDecode(cleanLabel(row.pagePath, 180) || '/');
        const normalized = path === '' ? '/' : path;
        const titleRaw = cleanLabel(row.pageTitle, 180);
        const documentTitle = !titleRaw || titleRaw === '(not set)' ? '' : titleRaw;
        const views = row.screenPageViews || 0;
        if (views <= 0) continue;
        const home = normalized === '/';
        const title = home ? 'Home' : shorten(documentTitle || normalized, 64);
        const detail = home && documentTitle
            ? `${normalized} · ${shorten(documentTitle, 72)}`
            : normalized;
        pages.push({ path: normalized, title, detail, views });
        if (pages.length === 5) break;
    }

    const channels = (raw.channels || [])
        .map((row) => ({
            name: row.sessionDefaultChannelGroup,
            label: channelLabel(row.sessionDefaultChannelGroup),
            sessions: row.sessions || 0,
        }))
        .filter((row) => row.label && row.sessions > 0)
        .sort((a, b) => b.sessions - a.sessions);

    const sources = (raw.sources || [])
        .map((row) => ({
            name: row.sessionSource,
            label: sourceLabel(row.sessionSource),
            sessions: row.sessions || 0,
        }))
        .filter((row) => row.label && row.sessions > 0)
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 5);

    const deviceRows = sumBy(
        (raw.devices || []).map((row) => ({ name: row.deviceCategory, value: row.sessions || 0 })),
        deviceLabel,
        'name',
        6,
    ).map((row) => ({ name: row.name, label: row.label, sessions: row.value }));

    const cities = [];
    for (const row of raw.cities || []) {
        const name = cleanLabel(row.city, 80);
        if (!name || name === '(not set)') continue;
        const visitors = row.totalUsers || 0;
        if (visitors <= 0) continue;
        cities.push({ name, visitors });
        if (cities.length === 5) break;
    }

    const { actions, actionsFresh } = assembleActions(raw.events);

    const phrase = mostlyFrom(channels, sources);
    const metrics = {
        visitors: { current: current.totalUsers || 0, previous: previous.totalUsers || 0 },
        newVisitors: { current: current.newUsers || 0, previous: previous.newUsers || 0 },
        sessions: { current: current.sessions || 0, previous: previous.sessions || 0 },
        pageViews: { current: current.screenPageViews || 0, previous: previous.screenPageViews || 0 },
        engagementSeconds: { current: averageEngagement(current), previous: averageEngagement(previous) },
        engagementRate: { current: current.engagementRate || 0, previous: previous.engagementRate || 0 },
    };

    return {
        example: !!options.example,
        timezone: TIME_ZONE,
        current: ranges.current,
        previous: ranges.previous,
        metrics,
        daily,
        pages,
        channels,
        sources,
        devices: deviceRows,
        cities,
        actions,
        actionsFresh,
        mostlyFrom: phrase,
        headline: buildHeadline(metrics.visitors, phrase),
    };
}

export function exampleReport() {
    const ranges = {
        current: { startDate: '2026-10-26', endDate: '2026-11-01' },
        previous: { startDate: '2026-10-19', endDate: '2026-10-25' },
    };
    return assembleReport({
        current: {
            totalUsers: 186,
            newUsers: 142,
            sessions: 240,
            screenPageViews: 510,
            userEngagementDuration: 186 * 72,
            engagementRate: 0.58,
            activeUsers: 186,
        },
        previous: {
            totalUsers: 151,
            newUsers: 116,
            sessions: 198,
            screenPageViews: 430,
            userEngagementDuration: 151 * 64,
            engagementRate: 0.51,
            activeUsers: 151,
        },
        daily: [
            { date: '20261026', totalUsers: 22 },
            { date: '20261027', totalUsers: 24 },
            { date: '20261028', totalUsers: 30 },
            { date: '20261029', totalUsers: 28 },
            { date: '20261030', totalUsers: 36 },
            { date: '20261031', totalUsers: 26 },
            { date: '20261101', totalUsers: 20 },
        ],
        pages: [
            { pagePath: '/', pageTitle: 'Special Finishes HI | Premium Interior & Exterior Finishes', screenPageViews: 286 },
            { pagePath: '/work', pageTitle: 'Our work', screenPageViews: 92 },
            { pagePath: '/contact', pageTitle: 'Contact', screenPageViews: 64 },
            { pagePath: '/services', pageTitle: 'Services', screenPageViews: 41 },
            { pagePath: '/about', pageTitle: 'About', screenPageViews: 27 },
        ],
        channels: [
            { sessionDefaultChannelGroup: 'Organic Search', sessions: 160 },
            { sessionDefaultChannelGroup: 'Direct', sessions: 48 },
            { sessionDefaultChannelGroup: 'Organic Social', sessions: 32 },
        ],
        sources: [
            { sessionSource: 'google', sessions: 168 },
            { sessionSource: '(direct)', sessions: 48 },
            { sessionSource: 'instagram', sessions: 24 },
        ],
        devices: [
            { deviceCategory: 'mobile', sessions: 149 },
            { deviceCategory: 'desktop', sessions: 78 },
            { deviceCategory: 'tablet', sessions: 13 },
        ],
        cities: [
            { city: 'Wilton', totalUsers: 48 },
            { city: 'Stamford', totalUsers: 31 },
            { city: 'Norwalk', totalUsers: 22 },
            { city: 'Greenwich', totalUsers: 18 },
            { city: 'Ridgefield', totalUsers: 14 },
        ],
        events: [
            { eventName: 'click_to_call', dateRange: 'current', eventCount: 4 },
            { eventName: 'click_to_call', dateRange: 'previous', eventCount: 2 },
            { eventName: 'click_to_call', dateRange: 'all', eventCount: 6 },
            { eventName: 'whatsapp_click', dateRange: 'current', eventCount: 7 },
            { eventName: 'whatsapp_click', dateRange: 'previous', eventCount: 3 },
            { eventName: 'whatsapp_click', dateRange: 'all', eventCount: 10 },
            { eventName: 'email_click', dateRange: 'previous', eventCount: 3 },
            { eventName: 'email_click', dateRange: 'all', eventCount: 3 },
            { eventName: 'generate_lead', dateRange: 'current', eventCount: 2 },
            { eventName: 'generate_lead', dateRange: 'previous', eventCount: 1 },
            { eventName: 'generate_lead', dateRange: 'all', eventCount: 3 },
        ],
    }, ranges, { example: true });
}

const METRIC_ROWS = [
    ['visitors', 'Visitors', 'count'],
    ['newVisitors', 'New visitors', 'count'],
    ['sessions', 'Sessions', 'count'],
    ['pageViews', 'Page views', 'count'],
    ['engagementSeconds', 'Average engagement time', 'duration'],
    ['engagementRate', 'Engagement rate', 'rate'],
];

function displayMetric(kind, value) {
    if (kind === 'duration') return formatDuration(value);
    if (kind === 'rate') return formatRate(value);
    return formatCount(value);
}

function previousPhrase(kind, value) {
    return `${displayMetric(kind, value)} the week before`;
}

function percentWidth(value, max) {
    if (value <= 0 || max <= 0) return 0;
    return Math.min(100, Math.max(2, Math.round((value / max) * 100)));
}

function barCells(value, max) {
    const filled = percentWidth(value, max);
    const rest = 100 - filled;
    const bar = filled > 0
        ? `<td width="${filled}%" bgcolor="${ACCENT}" style="width:${filled}%;height:14px;background-color:${ACCENT};font-size:0;line-height:14px;">&nbsp;</td>`
        : '';
    const track = rest > 0
        ? `<td width="${rest}%" bgcolor="${TRACK}" style="width:${rest}%;height:14px;background-color:${TRACK};font-size:0;line-height:14px;">&nbsp;</td>`
        : '';
    return `${bar}${track}`;
}

function sectionHeading(title) {
    return `<h2 style="margin:28px 0 12px;font-family:${SERIF};font-size:28px;font-weight:500;line-height:1.15;color:${TEXT};">${esc(title)}</h2>`;
}

function stackRow(label, primary, secondary) {
    const sub = secondary
        ? `<div style="margin-top:2px;font-family:${SANS};font-size:12px;line-height:1.4;color:${MUTED};overflow-wrap:anywhere;">${esc(secondary)}</div>`
        : '';
    return `<tr>
      <td style="padding:10px 8px 10px 0;border-bottom:1px solid ${RULE};font-family:${SANS};font-size:15px;line-height:1.4;color:${TEXT};">${esc(label)}${sub}</td>
      <td align="right" valign="top" style="padding:10px 0 10px 12px;border-bottom:1px solid ${RULE};font-family:${SANS};font-size:15px;line-height:1.4;color:${TEXT};white-space:nowrap;">${esc(primary)}</td>
    </tr>`;
}

const DEVICE_COLORS = {
    Phone: ACCENT,
    Computer: TEXT,
    Tablet: MUTED,
    TV: '#c4b8a8',
    Other: '#5c564e',
};

export function renderHtml(report) {
    const subject = subjectFor(report);
    const title = report.example ? `Example: ${subject}` : subject;
    const preheader = report.example
        ? `Example report with sample numbers. ${report.headline}`
        : report.headline;
    const maxDaily = Math.max(...report.daily.map((day) => day.visitors), 0);
    const deviceTotal = report.devices.reduce((sum, row) => sum + row.sessions, 0);
    const metricRows = METRIC_ROWS.map(([key, label, kind]) => {
        const pair = report.metrics[key];
        const change = changeParts(pair.current, pair.previous);
        return `<tr>
          <th scope="row" align="left" style="padding:14px 8px 14px 0;border-bottom:1px solid ${RULE};font-family:${SANS};font-size:14px;font-weight:500;line-height:1.35;color:${TEXT};">
            ${esc(label)}
            <div style="margin-top:3px;font-size:12px;font-weight:400;color:${MUTED};">${esc(previousPhrase(kind, pair.previous))}</div>
          </th>
          <td align="right" valign="top" style="padding:14px 8px;border-bottom:1px solid ${RULE};font-family:${SERIF};font-size:28px;line-height:1;color:${TEXT};white-space:nowrap;">${esc(displayMetric(kind, pair.current))}</td>
          <td align="right" valign="top" style="padding:16px 0 14px 8px;border-bottom:1px solid ${RULE};font-family:${SANS};font-size:14px;font-weight:600;line-height:1.3;color:${changeColor(change.direction)};white-space:nowrap;">${esc(change.label)}</td>
        </tr>`;
    }).join('');

    const dailyRows = report.daily.map((day) => `<tr>
      <td width="36" valign="middle" style="padding:5px 8px 5px 0;font-family:${SANS};font-size:13px;color:${MUTED};">${esc(day.label)}</td>
      <td valign="middle" style="padding:5px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
          <tr>${barCells(day.visitors, maxDaily)}</tr>
        </table>
      </td>
      <td width="40" align="right" valign="middle" style="padding:5px 0 5px 8px;font-family:${SANS};font-size:13px;color:${TEXT};">${esc(formatCount(day.visitors))}</td>
    </tr>`).join('');

    const pageRows = report.pages.length
        ? report.pages.map((page) => stackRow(page.title, `${formatCount(page.views)} views`, page.detail || page.path)).join('')
        : `<tr><td style="font-family:${SANS};font-size:14px;color:${MUTED};">No pages were opened this week.</td></tr>`;

    const channelRows = report.channels.length
        ? report.channels.map((row) => stackRow(row.label, `${formatCount(row.sessions)} sessions`)).join('')
        : `<tr><td style="font-family:${SANS};font-size:14px;color:${MUTED};">No source data for this week.</td></tr>`;

    const sourceRows = report.sources.length
        ? report.sources.map((row) => stackRow(row.label, `${formatCount(row.sessions)} sessions`)).join('')
        : '';

    const deviceSegments = report.devices
        .map((row) => {
            const width = deviceTotal > 0 ? Math.max(1, Math.round((row.sessions / deviceTotal) * 100)) : 0;
            return { ...row, width };
        })
        .filter((row) => row.width > 0);
    const widthSum = deviceSegments.reduce((sum, row) => sum + row.width, 0);
    if (deviceSegments.length && widthSum !== 100) {
        const last = deviceSegments[deviceSegments.length - 1];
        last.width = Math.max(1, last.width + (100 - widthSum));
    }
    const deviceBar = deviceSegments.map((row) => (
        `<td width="${row.width}%" bgcolor="${DEVICE_COLORS[row.label] || TRACK}" style="width:${row.width}%;height:14px;background-color:${DEVICE_COLORS[row.label] || TRACK};font-size:0;line-height:14px;">&nbsp;</td>`
    )).join('');
    const deviceLegend = report.devices.map((row) => {
        const share = deviceTotal > 0 ? Math.round((row.sessions / deviceTotal) * 100) : 0;
        return stackRow(row.label, `${share}%`, `${formatCount(row.sessions)} sessions`);
    }).join('');

    const cityRows = report.cities.length
        ? report.cities.map((city) => stackRow(city.name, `${formatCount(city.visitors)} visitors`)).join('')
        : `<tr><td style="font-family:${SANS};font-size:14px;color:${MUTED};">No city data for this week.</td></tr>`;

    const actionRows = report.actions.map((action) => {
        const change = changeParts(action.current, action.previous);
        return `<tr>
          <th scope="row" align="left" style="padding:14px 8px 14px 0;border-bottom:1px solid ${RULE};font-family:${SANS};font-size:14px;font-weight:500;line-height:1.35;color:${TEXT};">
            ${esc(action.label)}
            <div style="margin-top:3px;font-size:12px;font-weight:400;color:${MUTED};">${esc(formatCount(action.previous))} the week before</div>
          </th>
          <td align="right" valign="top" style="padding:14px 8px;border-bottom:1px solid ${RULE};font-family:${SERIF};font-size:28px;line-height:1;color:${TEXT};white-space:nowrap;">${esc(formatCount(action.current))}</td>
          <td align="right" valign="top" style="padding:16px 0 14px 8px;border-bottom:1px solid ${RULE};font-family:${SANS};font-size:14px;font-weight:600;line-height:1.3;color:${changeColor(change.direction)};white-space:nowrap;">${esc(change.label)}</td>
        </tr>`;
    }).join('');
    const freshNote = report.actionsFresh
        ? `<p style="margin:0 0 8px;font-family:${SANS};font-size:14px;line-height:1.5;color:${MUTED};">Tracking just started, so last week was zero and the change is not a comparison yet.</p>`
        : '';
    const actionBlock = report.actions.length
        ? `${sectionHeading('Customer actions')}
        <p style="margin:0 0 8px;font-family:${SANS};font-size:14px;line-height:1.5;color:${MUTED};">Things people did besides reading a page.</p>
        ${freshNote}
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
          <tbody>${actionRows}</tbody>
        </table>`
        : '';

    const exampleBanner = report.example
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;border-collapse:collapse;">
            <tr>
              <td bgcolor="#2a160f" style="background-color:#2a160f;border-left:3px solid ${ACCENT};padding:12px 14px;font-family:${SANS};font-size:13px;line-height:1.45;color:${TEXT};">
                <strong style="color:${ACCENT};">Example only.</strong> These numbers are made up so you can preview the layout. This is not live data.
              </td>
            </tr>
          </table>`
        : '';

    return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${esc(title)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Montserrat:wght@400;500;600&display=swap">
</head>
<body style="margin:0;padding:0;background-color:${BG};">
  <div lang="en" dir="ltr" style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${esc(preheader)}</div>
  <div lang="en" dir="ltr" style="background-color:${BG};">
    <table role="presentation" width="100%" bgcolor="${BG}" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:${BG};border-collapse:collapse;">
      <tr>
        <td align="center" bgcolor="${BG}" style="background-color:${BG};padding:24px 12px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;">
            <tr>
              <td bgcolor="${ACCENT}" height="3" style="height:3px;background-color:${ACCENT};font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td bgcolor="${BG}" style="background-color:${BG};padding:28px 8px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td valign="middle" style="padding:0 12px 0 0;">
                      <a href="${SITE_URL}" style="text-decoration:none;">
                        <img src="${LOGO_URL}" width="64" height="64" alt="Special Finishes website" style="display:block;border:0;width:64px;height:64px;">
                      </a>
                    </td>
                    <td valign="middle">
                      <a href="${SITE_URL}" style="font-family:${SERIF};font-size:28px;line-height:1;color:${TEXT};text-decoration:none;">Special Finishes</a>
                      <div style="margin-top:4px;font-family:${SANS};font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:${ACCENT};">Weekly report</div>
                    </td>
                  </tr>
                </table>
                ${exampleBanner.replace('margin:0 0 22px', 'margin:22px 0 0')}
                <p style="margin:22px 0 0;font-family:${SANS};font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">${esc(formatShortRange(report.current.startDate, report.current.endDate))}</p>
                <h1 style="margin:8px 0 0;font-family:${SERIF};font-size:34px;font-weight:500;line-height:1.15;color:${TEXT};">${esc(report.headline)}</h1>
                <p style="margin:12px 0 0;font-family:${SANS};font-size:14px;line-height:1.5;color:${MUTED};">${esc(formatLongRange(report.current.startDate, report.current.endDate))} (Eastern time). Compared with ${esc(formatLongRange(report.previous.startDate, report.previous.endDate))}.</p>
                <p style="margin:8px 0 0;font-family:${SANS};font-size:13px;line-height:1.5;color:${MUTED};">Engagement rate is the share of visits that lasted longer than 10 seconds, opened another page, or counted as a conversion. Average engagement time is how long the site stayed open, per visitor.</p>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;border-collapse:collapse;">
                  <caption style="text-align:left;caption-side:bottom;padding-top:8px;font-family:${SANS};font-size:12px;color:${MUTED};">This week compared with the week before. Arrows show the percent change.</caption>
                  <thead>
                    <tr>
                      <th scope="col" align="left" style="padding:0 8px 8px 0;font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">Measure</th>
                      <th scope="col" align="right" style="padding:0 8px 8px;font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">This week</th>
                      <th scope="col" align="right" style="padding:0 0 8px 8px;font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${metricRows}
                  </tbody>
                </table>

                ${sectionHeading('Visitors each day')}
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  ${dailyRows}
                </table>

                ${sectionHeading('Pages people opened')}
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  ${pageRows}
                </table>

                ${sectionHeading('Where visits came from')}
                <p style="margin:0 0 8px;font-family:${SANS};font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">Channels</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  ${channelRows}
                </table>
                ${sourceRows ? `<p style="margin:16px 0 8px;font-family:${SANS};font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">Top sources</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  ${sourceRows}
                </table>` : ''}

                ${sectionHeading('Phones, computers, and tablets')}
                ${deviceBar ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;border-collapse:collapse;"><tr>${deviceBar}</tr></table>` : ''}
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  ${deviceLegend || `<tr><td style="font-family:${SANS};font-size:14px;color:${MUTED};">No device data for this week.</td></tr>`}
                </table>

                ${sectionHeading('Cities')}
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  ${cityRows}
                </table>

                ${actionBlock}

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0 0;border-collapse:collapse;">
                  <tr>
                    <td bgcolor="${ACCENT}" style="background-color:${ACCENT};border-radius:2px;">
                      <a href="${SITE_URL}" style="display:inline-block;padding:12px 18px;font-family:${SANS};font-size:14px;font-weight:600;line-height:1;color:${INK};text-decoration:none;">Visit the Special Finishes website</a>
                    </td>
                  </tr>
                </table>

                <p style="margin:28px 0 0;padding-top:16px;border-top:1px solid ${RULE};font-family:${SANS};font-size:12px;line-height:1.5;color:${MUTED};">Prepared for Special Finishes by Ouroboros Studios</p>
                <p style="margin:6px 0 0;font-family:${SANS};font-size:12px;line-height:1.5;color:${MUTED};">Numbers are from Google Analytics for the Special Finishes website. Days are counted in Eastern time.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

function textChange(current, previous) {
    const change = changeParts(current, previous);
    if (change.direction === 'flat') return 'no change';
    if (change.label === 'New') return 'new';
    if (change.direction === 'up') return `up ${change.label.replace('↑ ', '')}`;
    return `down ${change.label.replace('↓ ', '')}`;
}

export function renderText(report) {
    const lines = [];
    if (report.example) {
        lines.push('EXAMPLE ONLY. These numbers are made up so you can preview the layout. This is not live data.');
        lines.push('');
    }
    lines.push('Special Finishes');
    lines.push(subjectFor(report));
    lines.push('');
    lines.push(report.headline);
    lines.push('');
    lines.push(`${formatLongRange(report.current.startDate, report.current.endDate)} (Eastern time).`);
    lines.push(`Compared with ${formatLongRange(report.previous.startDate, report.previous.endDate)}.`);
    lines.push('');
    lines.push('This week');
    for (const [key, label, kind] of METRIC_ROWS) {
        const pair = report.metrics[key];
        lines.push(`${label}: ${displayMetric(kind, pair.current)} (${displayMetric(kind, pair.previous)} the week before, ${textChange(pair.current, pair.previous)})`);
    }
    lines.push('');
    lines.push('Visitors each day');
    for (const day of report.daily) {
        lines.push(`${day.label} ${day.date}: ${formatCount(day.visitors)}`);
    }
    lines.push('');
    lines.push('Pages people opened');
    if (report.pages.length === 0) lines.push('No pages were opened this week.');
    for (const page of report.pages) {
        lines.push(`${page.title} (${page.detail || page.path}): ${formatCount(page.views)} views`);
    }
    lines.push('');
    lines.push('Where visits came from');
    if (report.channels.length === 0) lines.push('No source data for this week.');
    for (const row of report.channels) lines.push(`${row.label}: ${formatCount(row.sessions)} sessions`);
    if (report.sources.length) {
        lines.push('');
        lines.push('Top sources');
        for (const row of report.sources) lines.push(`${row.label}: ${formatCount(row.sessions)} sessions`);
    }
    lines.push('');
    lines.push('Phones, computers, and tablets');
    const deviceTotal = report.devices.reduce((sum, row) => sum + row.sessions, 0);
    if (report.devices.length === 0) lines.push('No device data for this week.');
    for (const row of report.devices) {
        const share = deviceTotal > 0 ? Math.round((row.sessions / deviceTotal) * 100) : 0;
        lines.push(`${row.label}: ${share}% (${formatCount(row.sessions)} sessions)`);
    }
    lines.push('');
    lines.push('Cities');
    if (report.cities.length === 0) lines.push('No city data for this week.');
    for (const city of report.cities) lines.push(`${city.name}: ${formatCount(city.visitors)} visitors`);
    if (report.actions.length) {
        lines.push('');
        lines.push('Customer actions');
        if (report.actionsFresh) {
            lines.push('Tracking just started, so last week was zero and the change is not a comparison yet.');
        }
        for (const action of report.actions) {
            lines.push(`${action.label}: ${formatCount(action.current)} (${formatCount(action.previous)} the week before, ${textChange(action.current, action.previous)})`);
        }
    }
    lines.push('');
    lines.push('Visit the Special Finishes website');
    lines.push(SITE_URL);
    lines.push('');
    lines.push('Prepared for Special Finishes by Ouroboros Studios');
    lines.push('Numbers are from Google Analytics. Days are counted in Eastern time.');
    return `${lines.join('\n')}\n`;
}

function base64urlFromBytes(bytes) {
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function pemToBytes(pem) {
    const body = pem
        .replace(/-----BEGIN PRIVATE KEY-----/g, '')
        .replace(/-----END PRIVATE KEY-----/g, '')
        .replace(/\s+/g, '');
    const binary = atob(body);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function normalizePem(pem) {
    if (typeof pem !== 'string' || !pem.includes('PRIVATE KEY')) {
        throw new Error('ga4_service_account_incomplete');
    }
    if (pem.includes('\\n') && !pem.includes('\n')) return pem.replace(/\\n/g, '\n');
    return pem;
}

async function readJson(response) {
    try {
        return await response.json();
    } catch {
        return {};
    }
}

export async function googleAccessToken(serviceAccount, fetchImpl = globalThis.fetch, now = new Date()) {
    const clientEmail = serviceAccount?.client_email;
    const privateKey = normalizePem(serviceAccount?.private_key);
    if (typeof clientEmail !== 'string' || !clientEmail) {
        throw new Error('ga4_service_account_incomplete');
    }
    const key = await crypto.subtle.importKey(
        'pkcs8',
        pemToBytes(privateKey),
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign'],
    );
    const issued = Math.floor(now.getTime() / 1000);
    const encoder = new TextEncoder();
    const header = base64urlFromBytes(encoder.encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
    const payload = base64urlFromBytes(encoder.encode(JSON.stringify({
        iss: clientEmail,
        scope: GA4_SCOPE,
        aud: TOKEN_URL,
        iat: issued,
        exp: issued + 3600,
    })));
    const signingInput = `${header}.${payload}`;
    const signature = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        key,
        encoder.encode(signingInput),
    );
    const assertion = `${signingInput}.${base64urlFromBytes(new Uint8Array(signature))}`;
    const response = await fetchImpl(TOKEN_URL, {
        method: 'POST',
        redirect: 'manual',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion,
        }).toString(),
        signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`ga4_token_${response.status}`);
    const body = await readJson(response);
    if (typeof body.access_token !== 'string' || !body.access_token) {
        throw new Error('ga4_token_missing');
    }
    return body.access_token;
}

async function runReport(token, body, fetchImpl) {
    const response = await fetchImpl(REPORT_URL, {
        method: 'POST',
        redirect: 'manual',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`ga4_report_${response.status}`);
    return readJson(response);
}

export async function fetchGa4(token, ranges, fetchImpl = globalThis.fetch) {
    const requests = reportRequests(ranges);
    const keys = Object.keys(requests);
    const reports = await Promise.all(keys.map(async (key) => {
        try {
            return await runReport(token, requests[key], fetchImpl);
        } catch (error) {
            if (key !== 'events') throw error;
            console.error(JSON.stringify({
                message: 'weekly report actions unavailable',
                error: error instanceof Error ? error.message : 'Error',
            }));
            return { rows: [] };
        }
    }));
    const byKey = Object.fromEntries(keys.map((key, index) => [key, reports[index]]));
    return {
        current: metricMap(byKey.current),
        previous: metricMap(byKey.previous),
        daily: rowsToObjects(byKey.daily),
        pages: rowsToObjects(byKey.pages),
        channels: rowsToObjects(byKey.channels),
        sources: rowsToObjects(byKey.sources),
        devices: rowsToObjects(byKey.devices),
        cities: rowsToObjects(byKey.cities),
        events: rowsToObjects(byKey.events),
    };
}

export async function loadReport(serviceAccount, now = new Date(), fetchImpl = globalThis.fetch) {
    const ranges = weekRanges(now);
    const token = await googleAccessToken(serviceAccount, fetchImpl, now);
    const raw = await fetchGa4(token, ranges, fetchImpl);
    return assembleReport(raw, ranges);
}

export function parseRecipients(value) {
    return String(value || '')
        .split(',')
        .map((part) => part.trim())
        .filter((part) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part))
        .slice(0, 50);
}

export async function sendWeeklyEmail({ apiKey, to, report, fetchImpl = globalThis.fetch }) {
    const recipients = Array.isArray(to) ? to : parseRecipients(to);
    if (!apiKey || recipients.length === 0) throw new Error('report_send_incomplete');
    const subject = subjectFor(report);
    const response = await fetchImpl(RESEND_URL, {
        method: 'POST',
        redirect: 'manual',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Idempotency-Key': `weekly-report/${report.current.startDate}`,
        },
        body: JSON.stringify({
            from: FROM_ADDRESS,
            to: recipients,
            reply_to: [REPLY_TO],
            subject,
            html: renderHtml(report),
            text: renderText(report),
            tags: [{ name: 'email_type', value: 'weekly_report' }],
        }),
        signal: AbortSignal.timeout(15000),
    });
    const body = await readJson(response);
    if (response.status === 409 && body.name === 'invalid_idempotent_request') {
        return { sent: false, duplicate: true, id: null };
    }
    if (!response.ok) throw new Error(`resend_${response.status}`);
    return { sent: true, duplicate: false, id: typeof body.id === 'string' ? body.id : null };
}

function cancelRetry(controller) {
    if (typeof controller?.noRetry === 'function') controller.noRetry();
}

export async function handleScheduled(controller, env, fetchImpl = globalThis.fetch) {
    const scheduled = Number(controller?.scheduledTime);
    const when = Number.isFinite(scheduled) && scheduled > 0 ? new Date(scheduled) : new Date();
    const cron = controller?.cron;
    if (cron && !SEND_CRONS.includes(cron)) {
        console.log(JSON.stringify({ message: 'weekly report skipped', reason: 'unexpected_cron' }));
        return { sent: false, reason: 'unexpected_cron' };
    }
    if (!isEasternMondayAtEight(when)) {
        console.log(JSON.stringify({
            message: 'weekly report skipped',
            reason: 'not_monday_8am_eastern',
            cron: cron || null,
        }));
        return { sent: false, reason: 'not_monday_8am_eastern' };
    }

    const missing = [];
    if (!env?.GA4_SA_KEY) missing.push('GA4_SA_KEY');
    if (!env?.RESEND_API_KEY) missing.push('RESEND_API_KEY');
    if (!parseRecipients(env?.REPORT_TO).length) missing.push('REPORT_TO');
    if (missing.length) {
        console.error(JSON.stringify({ message: 'weekly report not sent', reason: 'missing_config', missing }));
        cancelRetry(controller);
        return { sent: false, reason: 'missing_config', missing };
    }

    let serviceAccount;
    try {
        serviceAccount = JSON.parse(env.GA4_SA_KEY);
    } catch {
        console.error(JSON.stringify({ message: 'weekly report not sent', reason: 'ga4_key_unreadable' }));
        cancelRetry(controller);
        return { sent: false, reason: 'ga4_key_unreadable' };
    }

    try {
        const report = await loadReport(serviceAccount, when, fetchImpl);
        const result = await sendWeeklyEmail({
            apiKey: env.RESEND_API_KEY,
            to: env.REPORT_TO,
            report,
            fetchImpl,
        });
        console.log(JSON.stringify({
            message: 'weekly report finished',
            sent: result.sent,
            duplicate: result.duplicate,
        }));
        return result;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error';
        const permanent = message === 'ga4_service_account_incomplete' || error?.name === 'DataError';
        console.error(JSON.stringify({
            message: permanent ? 'weekly report not sent' : 'weekly report failed',
            error: message,
        }));
        if (permanent) {
            cancelRetry(controller);
            return { sent: false, reason: 'ga4_key_unreadable' };
        }
        throw error;
    }
}
