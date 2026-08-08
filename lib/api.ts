import type { Product } from '@/components/ProductCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export type DBProduct = Product & {
  vendorSlug: string;
  needsRestock: boolean;
  activo: boolean;
  orden: number;
  createdAt: string;
};

type ApiRow = {
  id: string;
  name: string;
  slug: string;
  price: string;
  tag: string;
  image: string;
  images: string[];
  description: string;
  vendor_slug: string;
  stock: number;
  needs_restock: boolean;
  activo: boolean;
  orden: number;
  created_at: string;
};

function fromRow(row: ApiRow): DBProduct {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: row.price,
    tag: row.tag,
    image: row.image,
    images: row.images,
    description: row.description,
    vendorSlug: row.vendor_slug,
    stock: row.stock,
    needsRestock: row.needs_restock,
    activo: row.activo,
    orden: row.orden,
    createdAt: row.created_at,
  };
}

function toBody(product: Partial<DBProduct>) {
  const body: Record<string, unknown> = {};
  if (product.name !== undefined) body.name = product.name;
  if (product.slug !== undefined) body.slug = product.slug;
  if (product.price !== undefined) body.price = product.price;
  if (product.tag !== undefined) body.tag = product.tag;
  if (product.image !== undefined) body.image = product.image;
  if (product.images !== undefined) body.images = product.images;
  if (product.description !== undefined) body.description = product.description;
  if (product.vendorSlug !== undefined) body.vendor_slug = product.vendorSlug;
  if (product.stock !== undefined) body.stock = product.stock;
  if (product.needsRestock !== undefined) body.needs_restock = product.needsRestock;
  if (product.activo !== undefined) body.activo = product.activo;
  if (product.orden !== undefined) body.orden = product.orden;
  return body;
}

export type DBVendor = {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  cover: string;
  coverBanner: string;
  rating: number;
  sales: number;
  activo: boolean;
  orden: number;
  createdAt: string;
};

type VendorApiRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  cover: string;
  cover_banner: string;
  rating: number;
  sales: number;
  activo: boolean;
  orden: number;
  created_at: string;
};

function vendorFromRow(row: VendorApiRow): DBVendor {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    logo: row.logo,
    cover: row.cover,
    coverBanner: row.cover_banner,
    rating: row.rating,
    sales: row.sales,
    activo: row.activo,
    orden: row.orden,
    createdAt: row.created_at,
  };
}

function vendorToBody(vendor: Partial<DBVendor>) {
  const body: Record<string, unknown> = {};
  if (vendor.name !== undefined) body.name = vendor.name;
  if (vendor.slug !== undefined) body.slug = vendor.slug;
  if (vendor.description !== undefined) body.description = vendor.description;
  if (vendor.logo !== undefined) body.logo = vendor.logo;
  if (vendor.cover !== undefined) body.cover = vendor.cover;
  if (vendor.coverBanner !== undefined) body.cover_banner = vendor.coverBanner;
  if (vendor.rating !== undefined) body.rating = vendor.rating;
  if (vendor.sales !== undefined) body.sales = vendor.sales;
  if (vendor.activo !== undefined) body.activo = vendor.activo;
  if (vendor.orden !== undefined) body.orden = vendor.orden;
  return body;
}

export type DeliveryMethod = 'delivery' | 'pickup';
export type PaymentMethod = 'transfer' | 'yape' | 'plin' | 'cash';
export type OrderStatus = 'pending_payment' | 'pending_confirmation' | 'confirmed' | 'delivered' | 'cancelled';

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
};

export type DBOrder = {
  id: string;
  customer_name: string;
  phone: string;
  dni: string;
  department: string;
  province: string;
  district: string;
  address: string;
  address_reference: string;
  delivery_method: DeliveryMethod;
  payment_method: PaymentMethod;
  payment_proof_url: string;
  notes: string;
  subtotal: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  items: OrderItem[];
};

export type CreateOrderPayload = {
  customer: { name: string; phone: string; dni?: string };
  delivery: {
    department?: string;
    province?: string;
    district?: string;
    address?: string;
    addressReference?: string;
    method: DeliveryMethod;
  };
  payment: { method: PaymentMethod; proofUrl?: string };
  notes?: string;
  items: { productId: string; quantity: number }[];
};

export type CreateOrderResult =
  | { ok: true; id: string; status: OrderStatus; total: number }
  | { ok: false; unavailable: { productId: string; name: string; stock: number }[] };

export type CashClosing = {
  id: string;
  date: string;
  total_orders: number;
  total_amount: number;
  top_payment_method: string;
  created_at: string;
};

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`);
  return res.json();
}

function authHeaders(password: string) {
  return { 'X-Admin-Password': password };
}

export const api = {
  listProducts: async (options?: { all?: boolean; password?: string; revalidate?: number }): Promise<DBProduct[]> => {
    const all = options?.all ?? false;
    const res = await fetch(`${API_URL}/api/products${all ? '?all=1' : ''}`, {
      headers: options?.password ? authHeaders(options.password) : undefined,
      next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
      cache: options?.revalidate === undefined ? 'no-store' : undefined,
    });
    if (!res.ok) throw new Error(`API error ${res.status} listing products`);
    const rows = (await res.json()) as ApiRow[];
    return rows.map(fromRow);
  },

  createProduct: async (product: Partial<DBProduct>, password: string) => {
    return request('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(password) },
      body: JSON.stringify(toBody(product)),
    });
  },

  updateProduct: async (id: string, product: Partial<DBProduct>, password: string) => {
    return request(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders(password) },
      body: JSON.stringify(toBody(product)),
    });
  },

  deleteProduct: async (id: string, password: string) => {
    return request(`/api/products/${id}`, { method: 'DELETE', headers: authHeaders(password) });
  },

  listVendors: async (options?: { all?: boolean; password?: string; revalidate?: number }): Promise<DBVendor[]> => {
    const all = options?.all ?? false;
    const res = await fetch(`${API_URL}/api/vendors${all ? '?all=1' : ''}`, {
      headers: options?.password ? authHeaders(options.password) : undefined,
      next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
      cache: options?.revalidate === undefined ? 'no-store' : undefined,
    });
    if (!res.ok) throw new Error(`API error ${res.status} listing vendors`);
    const rows = (await res.json()) as VendorApiRow[];
    return rows.map(vendorFromRow);
  },

  createVendor: async (vendor: Partial<DBVendor>, password: string) => {
    return request('/api/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(password) },
      body: JSON.stringify(vendorToBody(vendor)),
    });
  },

  updateVendor: async (id: string, vendor: Partial<DBVendor>, password: string) => {
    return request(`/api/vendors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders(password) },
      body: JSON.stringify(vendorToBody(vendor)),
    });
  },

  deleteVendor: async (id: string, password: string) => {
    return request(`/api/vendors/${id}`, { method: 'DELETE', headers: authHeaders(password) });
  },

  upload: async (file: File, password: string): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: authHeaders(password),
      body: form,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    const data = await res.json();
    return data.url as string;
  },

  uploadProof: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_URL}/api/upload-proof`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    const data = await res.json();
    return data.url as string;
  },

  createOrder: async (payload: CreateOrderPayload): Promise<CreateOrderResult> => {
    const res = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, unavailable: data.unavailable ?? [] };
    }
    return { ok: true, id: data.id, status: data.status, total: data.total };
  },

  listOrders: async (password: string): Promise<DBOrder[]> => {
    const res = await fetch(`${API_URL}/api/orders`, { headers: authHeaders(password), cache: 'no-store' });
    if (!res.ok) throw new Error(`API error ${res.status} listing orders`);
    return res.json();
  },

  updateOrderStatus: async (id: string, status: 'confirmed' | 'cancelled' | 'delivered', password: string) => {
    return request(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders(password) },
      body: JSON.stringify({ status }),
    });
  },

  createCashClosing: async (date: string, password: string): Promise<CashClosing> => {
    return request('/api/cash-closings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(password) },
      body: JSON.stringify({ date }),
    });
  },

  listCashClosings: async (password: string): Promise<CashClosing[]> => {
    const res = await fetch(`${API_URL}/api/cash-closings`, { headers: authHeaders(password), cache: 'no-store' });
    if (!res.ok) throw new Error(`API error ${res.status} listing cash closings`);
    return res.json();
  },
};
