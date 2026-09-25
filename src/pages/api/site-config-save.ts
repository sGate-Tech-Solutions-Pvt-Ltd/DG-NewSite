import type { APIRoute } from 'astro';
import { getPool } from '../../lib/db';
import { isAuthenticatedAdmin } from '../../lib/auth';
// @ts-expect-error - plain .mjs module, no type declarations
import { defaultsRow, toRow } from '../../../plugins/site-content/settings/site-config.mjs';

export const prerender = false;

const columns = Object.keys(defaultsRow).filter((c) => c !== 'id');

export const POST: APIRoute = async (context) => {
  if (!(await isAuthenticatedAdmin(context.cookies))) {
    return new Response('Unauthorized', { status: 403 });
  }

  try {
    const formData = await context.request.formData();
    const row = toRow(formData);
    const cols = ['id', ...columns];
    const placeholders = cols.map(() => '?').join(', ');
    const values = ['default', ...columns.map((c) => row[c])];
    const updateClause = columns.map((c) => `\`${c}\` = VALUES(\`${c}\`)`).join(', ');

    await getPool().query(
      `INSERT INTO plugin_site_config (${cols.map((c) => `\`${c}\``).join(', ')}) VALUES (${placeholders})
       ON DUPLICATE KEY UPDATE ${updateClause}`,
      values
    );

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/site-config-save] failed:', err);
    return new Response(JSON.stringify({ ok: false }), { status: 500 });
  }
};
