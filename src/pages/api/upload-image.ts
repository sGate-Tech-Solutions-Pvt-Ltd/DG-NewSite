import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { APIRoute } from 'astro';
import { isAuthenticatedEditor } from '../../lib/auth';

export const prerender = false;

// Uploads are saved into `public/images/` so they're rsynced + rebuilt on the
// next cPanel deploy (see .cpanel.yml) and survive it, same as every other
// content image path (see plugin_* `avatar`/`logo`/`thumbnail` text fields).
//
// In production the running @astrojs/node server never reads from `public/`
// though — it only serves static files out of the built `dist/client/`
// (resolved relative to the compiled server entry, not `process.cwd()`; see
// `resolveClientDir` in @astrojs/node/dist/shared.js). So an upload also has
// to be written straight into `dist/client/images` or it's invisible on the
// live site until the next full rebuild.
const SOURCE_IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
const SERVED_IMAGES_DIR = import.meta.env.PROD
  ? fileURLToPath(new URL('../../../client/images/', import.meta.url))
  : SOURCE_IMAGES_DIR;

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

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!(await isAuthenticatedEditor(cookies))) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 403 });
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
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(SERVED_IMAGES_DIR, { recursive: true });
  await writeFile(path.join(SERVED_IMAGES_DIR, filename), buffer);

  if (SERVED_IMAGES_DIR !== SOURCE_IMAGES_DIR) {
    await mkdir(SOURCE_IMAGES_DIR, { recursive: true });
    await writeFile(path.join(SOURCE_IMAGES_DIR, filename), buffer);
  }

  return new Response(JSON.stringify({ ok: true, path: `/images/${filename}` }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
