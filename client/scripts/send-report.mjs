#!/usr/bin/env node
// Preview or send the weekly Special Finishes report from a laptop.
// From client/:
//   node scripts/send-report.mjs --sa /path/sa.json --resend-key-file /path/key.txt --to a@b.com
//   node scripts/send-report.mjs --sa /path/sa.json --dry-run --out report.html
//   node scripts/send-report.mjs --example --dry-run --out report.html

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
    exampleReport,
    loadReport,
    renderHtml,
    sendWeeklyEmail,
    subjectFor,
} from '../worker/report.mjs';

function parseArgs(argv) {
    const args = {};
    for (let i = 0; i < argv.length; i += 1) {
        const token = argv[i];
        if (!token.startsWith('--')) continue;
        const key = token.slice(2);
        const next = argv[i + 1];
        if (next === undefined || next.startsWith('--')) {
            args[key] = true;
        } else {
            args[key] = next;
            i += 1;
        }
    }
    return args;
}

function fail(message) {
    console.error(message);
    process.exit(1);
}

const USAGE = `Usage:
  node scripts/send-report.mjs --sa /path/sa.json --resend-key-file /path/key.txt --to a@b.com
  node scripts/send-report.mjs --sa /path/sa.json --dry-run --out report.html
  node scripts/send-report.mjs --example --dry-run --out report.html

--dry-run writes the HTML email and does not call Resend.
--example fills the layout with made-up numbers and never sends.`;

const args = parseArgs(process.argv.slice(2));
if (args.help) {
    console.log(USAGE);
    process.exit(0);
}

const dryRun = args['dry-run'] === true;

let report;
if (args.example === true) {
    if (!dryRun) fail('--example only writes a sample. Pass --dry-run so it is not emailed.');
    report = exampleReport();
} else {
    if (typeof args.sa !== 'string') fail(`Pass --sa /path/sa.json.\n\n${USAGE}`);
    let serviceAccount;
    try {
        serviceAccount = JSON.parse(readFileSync(resolve(args.sa), 'utf8'));
    } catch (error) {
        if (error && error.code === 'ENOENT') fail(`Service account file not found: ${args.sa}`);
        fail('Could not read the service account JSON. The file was not printed.');
    }
    try {
        report = await loadReport(serviceAccount, new Date());
    } catch (error) {
        fail(error instanceof Error ? error.message : 'Could not load the report.');
    }
}

const html = renderHtml(report);
const subject = subjectFor(report);

if (dryRun) {
    if (typeof args.out === 'string') {
        writeFileSync(resolve(args.out), html);
        console.log(`Wrote ${args.out}`);
        console.log(subject);
    } else {
        console.error(subject);
        process.stdout.write(html);
    }
    process.exit(0);
}

if (typeof args['resend-key-file'] !== 'string' || typeof args.to !== 'string') {
    fail(`Sending requires --resend-key-file and --to. Add --dry-run to write HTML without sending.\n\n${USAGE}`);
}

let apiKey;
try {
    apiKey = readFileSync(resolve(args['resend-key-file']), 'utf8').trim();
} catch {
    fail('Could not read the Resend key file.');
}

try {
    // A new key every run. The cron keeps a stable key so the two UTC triggers
    // cannot deliver the same week twice.
    const result = await sendWeeklyEmail({ apiKey, to: args.to, report, uniqueKey: true });
    if (result.sent) console.log(result.id ? `Sent ${result.id}` : 'Sent');
    else console.log('Already sent for this week.');
} catch (error) {
    fail(error instanceof Error ? error.message : 'Send failed.');
}
