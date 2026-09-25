import type { APIRoute } from 'astro';
import { getPool } from '../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();
    const fullName = String(data.get('fullName') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const subject = String(data.get('subject') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    const sourcePage = data.get('sourcePage') ? String(data.get('sourcePage')) : null;

    if (!fullName || !email || !message) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing required fields' }), { status: 400 });
    }

    await getPool().query(
      `INSERT INTO contact_submissions (id, fullName, email, subject, message, submittedAt, \`read\`, sourcePage)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
      [crypto.randomUUID(), fullName, email, subject, message, new Date().toISOString(), sourcePage]
    );

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('[api/contact] failed to save submission:', err);
    return new Response(JSON.stringify({ ok: false, error: 'Internal error' }), { status: 500 });
  }
};
