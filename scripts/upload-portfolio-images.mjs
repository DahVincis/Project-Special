// One-off utility: uploads client/public's portfolio JPEGs to a public
// Supabase Storage bucket. Run locally with your own service role key —
// never commit it, never paste it into chat:
//
//   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key node scripts/upload-portfolio-images.mjs
//
// Requires Node 18+ (built-in fetch). No dependencies.

import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SUPABASE_URL = 'https://xmppgfzkkmlqhvufvtff.supabase.co';
const BUCKET = 'Special';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY in your shell before running this script.');
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'client', 'public');

const FILES = [
  'interior.jpg',
  'exterior.jpg',
  'before.jpg',
  'after.jpg',
  'stair-before.jpg',
  'stair-after.jpg',
  'driveway.jpg',
  'wainscoting.jpg',
  'kitchen2.jpg',
  'bathroom1.jpg',
  'bathroom2.jpg',
  'bathroom3.jpg',
  'sp8.jpg',
  'RF.png',
];

const contentType = (name) => (name.endsWith('.png') ? 'image/png' : 'image/jpeg');

async function upload(name) {
  const filePath = join(PUBLIC_DIR, name);
  const body = await readFile(filePath);
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${name}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
      'Content-Type': contentType(name),
      'x-upsert': 'true',
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${name}: ${res.status} ${text}`);
  }
  console.log(`uploaded ${name} (${(body.length / 1024).toFixed(0)}KB)`);
}

for (const name of FILES) {
  try {
    await upload(name);
  } catch (err) {
    console.error(`FAILED ${name}:`, err.message);
  }
}

console.log('\nDone. Public URLs look like:');
console.log(`${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/<filename>`);
