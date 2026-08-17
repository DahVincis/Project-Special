const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const BUCKET = process.env.REACT_APP_SUPABASE_BUCKET;

export const storageUrl = (filename) =>
  `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
