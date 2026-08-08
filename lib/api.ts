import type { Product } from '@/components/ProductCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export type DBProduct = Product & {
  vendorSlug: string;
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
  if (vendor.rating !== undefined) body.rating = vendor.rating;
  if (vendor.sales !== undefined) body.sales = vendor.sales;
  if (vendor.activo !== undefined) body.activo = vendor.activo;
  if (vendor.orden !== undefined) body.orden = vendor.orden;
  return body;
}

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
};
