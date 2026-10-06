import { randomUUID } from 'node:crypto';
import type { APIRoute } from 'astro';
import { isAuthenticatedEditor } from '../../lib/auth';

export const prerender = false;

// Uploads go to R2 (see the IMAGES binding in wrangler.jsonc) since the
// Workers runtime has no writable filesystem. They're served back out at
// runtime by src/pages/images/[filename].ts, under the same `/images/...`
// path used by every other content image reference (plugin_* avatar/logo/
// thumbnail text fields, etc).
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
};

const MAX_BYTES = 5 * 1024 * 1024;

function slugifyBase(name: string): string {
  return (
    name
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, '-')
      .replace(/^[-_]+|[-_]+$/g, '')
      .slice(0, 60) || 'image'
  );
}

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  if (!(await isAuthenticatedEditor(cookies))) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 403 });
  }

  const bucket = locals.runtime?.env?.IMAGES;
  if (!bucket) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Image storage is not configured' }),
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ ok: false, error: 'No file provided' }), { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Unsupported file type. Use JPG, PNG, WEBP, GIF, or SVG.' }),
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return new Response(JSON.stringify({ ok: false, error: 'File too large (max 5MB)' }), { status: 400 });
  }

  const filename = `${slugifyBase(file.name)}-${randomUUID().slice(0, 8)}${ext}`;
  const buffer = await file.arrayBuffer();

  await bucket.put(filename, buffer, {
    httpMetadata: { contentType: file.type },
  });

  return new Response(JSON.stringify({ ok: true, path: `/images/${filename}` }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
