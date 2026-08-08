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
  'vendor_slug', 'stock', 'activo', 'orden',
];

const VENDOR_COLUMNS = [
  'name', 'slug', 'description', 'logo', 'cover', 'cover_banner', 'rating', 'sales', 'activo', 'orden',
];

const JSON_FIELDS = new Set(['images']);
const NUMBER_FIELDS = new Set(['stock', 'orden', 'rating', 'sales']);

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
  if (NUMBER_FIELDS.has(key)) return Number(value) || 0;
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

async function handleUploadProof(req: Request, env: Env): Promise<Response> {
  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return json({ error: 'no file' }, 400);
  if (!file.type.startsWith('image/')) return json({ error: 'invalid file type' }, 400);
  if (file.size > 5 * 1024 * 1024) return json({ error: 'file too large' }, 400);
  const ext = file.name.split('.').pop() || 'jpg';
  const key = `proof-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  await env.IMAGES.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });
  const url = new URL(req.url);
  return json({ url: `${url.origin}/images/${key}` });
}

type OrderItemInput = { productId: string; quantity: number };

type CreateOrderBody = {
  customer?: { name?: string; phone?: string; dni?: string };
  delivery?: {
    department?: string;
    province?: string;
    district?: string;
    address?: string;
    addressReference?: string;
    method?: string;
  };
  payment?: { method?: string; proofUrl?: string };
  notes?: string;
  items?: OrderItemInput[];
};

async function handleCreateOrder(req: Request, env: Env): Promise<Response> {
  const body = (await req.json()) as CreateOrderBody;
  const items = (body.items || []).filter((i) => i && i.productId && i.quantity > 0);

  if (!body.customer?.name || !body.customer?.phone) return json({ error: 'missing customer data' }, 400);
  if (!body.delivery?.method || !body.payment?.method) return json({ error: 'missing delivery or payment method' }, 400);
  if (items.length === 0) return json({ error: 'empty order' }, 400);

  const ids = items.map((i) => i.productId);
  const placeholders = ids.map(() => '?').join(',');
  const { results } = await env.DB.prepare(
    `SELECT id, name, price, stock FROM products WHERE id IN (${placeholders}) AND activo = 1`
  ).bind(...ids).all();

  const products = new Map(
    (results as { id: string; name: string; price: string; stock: number }[]).map((p) => [p.id, p])
  );

  const unavailable: { productId: string; name: string; stock: number }[] = [];
  for (const item of items) {
    const product = products.get(item.productId);
    if (!product || product.stock < item.quantity) {
      unavailable.push({ productId: item.productId, name: product?.name ?? 'Producto', stock: product?.stock ?? 0 });
    }
  }
  if (unavailable.length > 0) return json({ error: 'insufficient stock', unavailable }, 409);

  const orderId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const paymentMethod = String(body.payment.method);
  const status = paymentMethod === 'cash' ? 'pending_payment' : 'pending_confirmation';

  let subtotal = 0;
  const orderItemStatements = items.map((item) => {
    const product = products.get(item.productId)!;
    const price = parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 0;
    const itemSubtotal = price * item.quantity;
    subtotal += itemSubtotal;
    return env.DB.prepare(
      'INSERT INTO order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(crypto.randomUUID(), orderId, item.productId, product.name, price, item.quantity, itemSubtotal);
  });

  const stockStatements = items.map((item) =>
    env.DB.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?')
      .bind(item.quantity, item.productId, item.quantity)
  );

  const orderStatement = env.DB.prepare(
    `INSERT INTO orders (id, customer_name, phone, dni, department, province, district, address, address_reference, delivery_method, payment_method, payment_proof_url, notes, subtotal, total, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    orderId,
    body.customer.name,
    body.customer.phone,
    body.customer.dni ?? '',
    body.delivery.department ?? '',
    body.delivery.province ?? '',
    body.delivery.district ?? '',
    body.delivery.address ?? '',
    body.delivery.addressReference ?? '',
    body.delivery.method,
    paymentMethod,
    body.payment.proofUrl ?? '',
    body.notes ?? '',
    subtotal,
    subtotal,
    status,
    createdAt
  );

  const batchResults = await env.DB.batch([orderStatement, ...orderItemStatements, ...stockStatements]);
  const stockResults = batchResults.slice(1 + orderItemStatements.length);
  const failedIndex = stockResults.findIndex((r) => (r.meta?.changes ?? 0) === 0);

  if (failedIndex !== -1) {
    const restoreStatements = items
      .map((item, i) => (i === failedIndex ? null : env.DB.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').bind(item.quantity, item.productId)))
      .filter((s): s is D1PreparedStatement => s !== null);
    const cancelStatement = env.DB.prepare("UPDATE orders SET status = 'cancelled' WHERE id = ?").bind(orderId);
    await env.DB.batch([...restoreStatements, cancelStatement]);
    return json({ error: 'insufficient stock', unavailable: [{ productId: items[failedIndex].productId, name: '', stock: 0 }] }, 409);
  }

  return json({ id: orderId, status, total: subtotal }, 201);
}

async function handleListOrders(env: Env): Promise<Response> {
  const { results: orders } = await env.DB.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  const { results: items } = await env.DB.prepare('SELECT * FROM order_items').all();
  const itemsByOrder = new Map<string, unknown[]>();
  for (const item of items as { order_id: string }[]) {
    const list = itemsByOrder.get(item.order_id) ?? [];
    list.push(item);
    itemsByOrder.set(item.order_id, list);
  }
  const out = (orders as { id: string }[]).map((o) => ({ ...o, items: itemsByOrder.get(o.id) ?? [] }));
  return json(out);
}

async function handleUpdateOrderStatus(req: Request, env: Env, id: string): Promise<Response> {
  const body = (await req.json()) as { status?: string };
  if (body.status !== 'confirmed' && body.status !== 'cancelled') return json({ error: 'invalid status' }, 400);

  const order = await env.DB.prepare('SELECT status FROM orders WHERE id = ?').bind(id).first<{ status: string }>();
  if (!order) return json({ error: 'not found' }, 404);

  if (body.status === 'cancelled' && order.status !== 'cancelled') {
    const { results: items } = await env.DB.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').bind(id).all();
    const restoreStatements = (items as { product_id: string; quantity: number }[]).map((item) =>
      env.DB.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').bind(item.quantity, item.product_id)
    );
    const statusStatement = env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?').bind(body.status, id);
    await env.DB.batch([...restoreStatements, statusStatement]);
  } else {
    await env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?').bind(body.status, id).run();
  }

  return json({ ok: true });
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

      if (parts[0] === 'api' && parts[1] === 'upload-proof' && req.method === 'POST') {
        return await handleUploadProof(req, env);
      }

      if (parts[0] === 'api' && parts[1] === 'orders') {
        if (req.method === 'POST' && !parts[2]) {
          return await handleCreateOrder(req, env);
        }
        if (req.method === 'GET' && !parts[2]) {
          const authErr = requireAuth(req, env);
          if (authErr) return authErr;
          return await handleListOrders(env);
        }
        if (req.method === 'PATCH' && parts[2]) {
          const authErr = requireAuth(req, env);
          if (authErr) return authErr;
          return await handleUpdateOrderStatus(req, env, parts[2]);
        }
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
