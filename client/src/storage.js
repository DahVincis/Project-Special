// All three of these values ship inside the public JS bundle no matter what:
// the project URL, the bucket name, and the anon key are public by design, and
// contact_submissions is insert-only RLS, so the anon key can write a lead but
// never read one back. The env vars therefore never protected a secret — they
// were just a deploy step that silently shipped a site with every image 404ing
// and a dead contact form whenever someone forgot to set them, which happened
// on two consecutive deploys. These defaults make production work with nothing
// configured; the env vars still win, so pointing the site at a different
// Supabase project needs no code change.
export const SUPABASE_URL =
    process.env.REACT_APP_SUPABASE_URL || 'https://xmppgfzkkmlqhvufvtff.supabase.co';

export const SUPABASE_ANON_KEY =
    process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtcHBnZnpra21scWh2dWZ2dGZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MjA3NzMsImV4cCI6MjEwMjQ5Njc3M30.skvMczqcEDN5C3l6HC0Vi6yDltY-3L1C5CyHHbp_58M';

const BUCKET = process.env.REACT_APP_SUPABASE_BUCKET || 'Special';

export const storageUrl = (filename) =>
    `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
