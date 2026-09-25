import type { APIRoute } from 'astro';
import { getPool } from '../../lib/db';
import { isAuthenticatedAdmin } from '../../lib/auth';
import { withBase } from '../../lib/withBase';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  if (!(await isAuthenticatedAdmin(context.cookies))) {
    return new Response('Unauthorized', { status: 403 });
  }

  const data = await context.request.formData();
  const id = String(data.get('id') ?? '');
  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  await getPool().query('UPDATE contact_submissions SET `read` = 1 WHERE id = ?', [id]);

  return context.redirect(withBase('/dashboard/site_content/submissions'));
};
