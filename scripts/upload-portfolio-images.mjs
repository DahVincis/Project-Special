// Uploads the given image files to the public Supabase Storage bucket, keyed by
// their basename. Run locally with your own service role key —
// never commit it, never paste it into chat:
//
//   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
//     node scripts/upload-portfolio-images.mjs path/to/photo.jpg [more.jpg ...]
//
// Requires Node 18+ (built-in fetch). No dependencies.

import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

const SUPABASE_URL = 'https://xmppgfzkkmlqhvufvtff.supabase.co';
const BUCKET = 'Special';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY in your shell before running this script.');
  process.exit(1);
}

const FILES = process.argv.slice(2);

if (FILES.length === 0) {
  console.error('Usage: node scripts/upload-portfolio-images.mjs <file> [file ...]');
  process.exit(1);
}

const contentType = (name) => (name.endsWith('.png') ? 'image/png' : 'image/jpeg');

async function upload(filePath) {
  const name = basename(filePath);
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

for (const filePath of FILES) {
  try {
    await upload(filePath);
  } catch (err) {
    console.error(`FAILED ${filePath}:`, err.message);
  }
}

console.log('\nDone. Public URLs look like:');
console.log(`${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/<filename>`);
