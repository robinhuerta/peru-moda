export interface Env {
  DB: D1Database;
  IMAGES: R2Bucket;
  ADMIN_PASSWORD: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,X-Admin-Password',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function requireAuth(req: Request, env: Env): Response | null {
  if (req.headers.get('X-Admin-Password') !== env.ADMIN_PASSWORD) {
    return json({ error: 'unauthorized' }, 401);
  }
  return null;
}

const PRODUCT_COLUMNS = [
  'name', 'slug', 'price', 'tag', 'image', 'images', 'description',
  'vendor_slug', 'activo', 'orden',
];

const VENDOR_COLUMNS = [
  'name', 'slug', 'description', 'logo', 'cover', 'cover_banner', 'rating', 'sales', 'activo', 'orden',
];

const JSON_FIELDS = new Set(['images']);

function rowOut(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...row };
  for (const f of JSON_FIELDS) {
    if (typeof out[f] === 'string') {
      try { out[f] = JSON.parse(out[f] as string); } catch { out[f] = []; }
    }
  }
  out.activo = !!out.activo;
  return out;
}

function fieldIn(key: string, value: unknown): unknown {
  if (JSON_FIELDS.has(key)) return JSON.stringify(value ?? []);
  if (key === 'activo') return value ? 1 : 0;
  return value ?? '';
}

function slugify(value: string): string {
  const accents: Record<string, string> = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ñ: 'n', ü: 'u' };
  return value
    .toLowerCase()
    .split('')
    .map((c) => accents[c] ?? c)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function listRows(env: Env, table: string, activeOnly: boolean) {
  const q = activeOnly
    ? `SELECT * FROM ${table} WHERE activo = 1 ORDER BY orden, created_at`
    : `SELECT * FROM ${table} ORDER BY orden, created_at`;
  const { results } = await env.DB.prepare(q).all();
  return results.map(rowOut);
}

async function createRow(req: Request, env: Env, table: string, columns: string[]) {
  const body = (await req.json()) as Record<string, unknown>;
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const hasSlug = columns.includes('slug');
  const slug = hasSlug ? String(body.slug || slugify(String(body.name || ''))) || id : undefined;
  const cols = ['id', ...columns, 'created_at'];
  const values = [
    id,
    ...columns.map((c) => (c === 'slug' && slug !== undefined ? slug : fieldIn(c, body[c]))),
    createdAt,
  ];
  const placeholders = cols.map(() => '?').join(',');
  await env.DB.prepare(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${placeholders})`)
    .bind(...values)
    .run();
  return { id, slug, created_at: createdAt };
}

async function updateRow(req: Request, env: Env, table: string, columns: string[], id: string) {
  const body = (await req.json()) as Record<string, unknown>;
  const keys = columns.filter((c) => c in body);
  if (keys.length === 0) return;
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => fieldIn(k, body[k]));
  await env.DB.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`)
    .bind(...values, id)
    .run();
}

async function deleteRow(env: Env, table: string, id: string) {
  await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
}

async function handleUpload(req: Request, env: Env): Promise<Response> {
  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return json({ error: 'no file' }, 400);
  const ext = file.name.split('.').pop() || 'jpg';
  const key = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  await env.IMAGES.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });
  const url = new URL(req.url);
  return json({ url: `${url.origin}/images/${key}` });
}

async function handleImageGet(env: Env, key: string): Promise<Response> {
  const obj = await env.IMAGES.get(key);
  if (!obj) return new Response('Not found', { status: 404 });
  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      ...CORS_HEADERS,
    },
  });
}

async function handleTable(req: Request, env: Env, table: string, columns: string[], id: string | undefined, url: URL): Promise<Response | null> {
  if (req.method === 'GET' && !id) {
    const activeOnly = url.searchParams.get('all') !== '1';
    if (!activeOnly) {
      const authErr = requireAuth(req, env);
      if (authErr) return authErr;
    }
    return json(await listRows(env, table, activeOnly));
  }

  if (req.method === 'POST' && !id) {
    const authErr = requireAuth(req, env);
    if (authErr) return authErr;
    return json(await createRow(req, env, table, columns), 201);
  }

  if (req.method === 'PATCH' && id) {
    const authErr = requireAuth(req, env);
    if (authErr) return authErr;
    await updateRow(req, env, table, columns, id);
    return json({ ok: true });
  }

  if (req.method === 'DELETE' && id) {
    const authErr = requireAuth(req, env);
    if (authErr) return authErr;
    await deleteRow(env, table, id);
    return json({ ok: true });
  }

  return null;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

    const url = new URL(req.url);
    const parts = url.pathname.split('/').filter(Boolean);

    try {
      if (parts[0] === 'images' && parts[1]) {
        return handleImageGet(env, parts[1]);
      }

      if (parts[0] === 'api' && parts[1] === 'upload' && req.method === 'POST') {
        const authErr = requireAuth(req, env);
        if (authErr) return authErr;
        return await handleUpload(req, env);
      }

      if (parts[0] === 'api' && parts[1] === 'products') {
        const res = await handleTable(req, env, 'products', PRODUCT_COLUMNS, parts[2], url);
        if (res) return res;
      }

      if (parts[0] === 'api' && parts[1] === 'vendors') {
        const res = await handleTable(req, env, 'vendors', VENDOR_COLUMNS, parts[2], url);
        if (res) return res;
      }

      return json({ error: 'not found' }, 404);
    } catch (err) {
      return json({ error: String(err) }, 500);
    }
  },
};
