import type { APIRoute } from 'astro';
import { getPool } from '../../lib/db';
import { isAuthenticatedEditor } from '../../lib/auth';
// @ts-expect-error - plain .mjs module, no type declarations
import { findContentType } from '../../../plugins/site-content/lib/content-types.mjs';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  if (!(await isAuthenticatedEditor(context.cookies))) {
    return new Response('Unauthorized', { status: 403 });
  }

  const type = context.url.searchParams.get('type');
  const pageId = context.url.searchParams.get('pageId');

  if (!type || !pageId) {
    return new Response('Missing type or pageId', { status: 400 });
  }

  const contentType = findContentType(type);
  if (!contentType) {
    return new Response('Unknown content type', { status: 404 });
  }

  const [rows] = await getPool().query(`SELECT * FROM ${contentType.tableName} WHERE pageId = ?`, [
    pageId,
  ]);
  const row = (rows as any[])[0] ?? contentType.defaultsRow;

  return new Response(JSON.stringify(row), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
