import type { APIRoute } from 'astro';

export const prerender = false;

// Cloudflare's assets layer serves anything that exists in dist/client/images
// directly, without invoking the Worker. This route only gets hit for images
// that aren't in the static build — i.e. ones uploaded at runtime via
// src/pages/api/upload-image.ts and stored in the IMAGES R2 bucket.
export const GET: APIRoute = async ({ params, locals }) => {
  const bucket = locals.runtime?.env?.IMAGES;
  if (!bucket || !params.filename) {
    return new Response('Not found', { status: 404 });
  }

  const object = await bucket.get(params.filename);
  if (!object) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      ETag: object.httpEtag,
    },
  });
};
