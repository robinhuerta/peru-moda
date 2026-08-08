'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { api, type DBProduct, type DBVendor, type DBOrder, type CashClosing } from '@/lib/api';
import { slugify, formatPrice } from '@/lib/utils';

const PW_STORAGE_KEY = 'perumoda-admin-pw';
const STOCK_THRESHOLD_KEY = 'perumoda-stock-threshold';

const EMPTY_PRODUCT: Omit<DBProduct, 'id' | 'createdAt'> = {
  name: '',
  slug: '',
  price: '',
  tag: '',
  image: '',
  images: [],
  description: '',
  vendorSlug: '',
  stock: 0,
  needsRestock: false,
  activo: true,
  orden: 0,
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending_payment: 'Pendiente (contra entrega)',
  pending_confirmation: 'Pendiente de confirmación',
  confirmed: 'Confirmado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  transfer: 'Transferencia',
  yape: 'Yape',
  plin: 'Plin',
  cash: 'Contra entrega',
};

const EMPTY_VENDOR: Omit<DBVendor, 'id' | 'createdAt'> = {
  name: '',
  slug: '',
  description: '',
  logo: '',
  cover: '',
  coverBanner: '',
  rating: 5,
  sales: 0,
  activo: true,
  orden: 0,
};

export default function AdminPage() {
  const [pw, setPw] = useState('');
  const [auth, setAuth] = useState(false);
  const [pwError, setPwError] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [tab, setTab] = useState<'dashboard' | 'products' | 'vendors' | 'orders'>('dashboard');

  const [products, setProducts] = useState<DBProduct[]>([]);
  const [vendors, setVendors] = useState<DBVendor[]>([]);
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderActionId, setOrderActionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Dashboard state
  const [cashClosings, setCashClosings] = useState<CashClosing[]>([]);
  const [closingsLoading, setClosingsLoading] = useState(false);
  const [closingInProgress, setClosingInProgress] = useState(false);
  const [restockActionId, setRestockActionId] = useState<string | null>(null);
  const [stockThreshold, setStockThreshold] = useState(5);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Product form state
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Omit<DBProduct, 'id' | 'createdAt'>>(EMPTY_PRODUCT);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);

  // Vendor form state
  const [vendorModal, setVendorModal] = useState(false);
  const [vendorForm, setVendorForm] = useState<Omit<DBVendor, 'id' | 'createdAt'>>(EMPTY_VENDOR);
  const [vendorEditId, setVendorEditId] = useState<string | null>(null);
  const [vendorSaving, setVendorSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverBannerUploading, setCoverBannerUploading] = useState(false);
  const [vendorDeleteId, setVendorDeleteId] = useState<string | null>(null);

  const mainFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);
  const bulkFileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const coverBannerFileRef = useRef<HTMLInputElement>(null);

  const load = async (password: string) => {
    setLoading(true);
    try {
      const [productData, vendorData] = await Promise.all([
        api.listProducts({ all: true, password }),
        api.listVendors({ all: true, password }),
      ]);
      setProducts(productData);
      setVendors(vendorData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem(PW_STORAGE_KEY);
    if (stored) {
      Promise.all([
        api.listProducts({ all: true, password: stored }),
        api.listVendors({ all: true, password: stored }),
      ])
        .then(([productData, vendorData]) => {
          setPw(stored);
          setAuth(true);
          setProducts(productData);
          setVendors(vendorData);
        })
        .catch(() => sessionStorage.removeItem(PW_STORAGE_KEY))
        .finally(() => setCheckingAuth(false));
    } else {
      setCheckingAuth(false);
    }
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const [productData, vendorData] = await Promise.all([
        api.listProducts({ all: true, password: pw }),
        api.listVendors({ all: true, password: pw }),
      ]);
      sessionStorage.setItem(PW_STORAGE_KEY, pw);
      setAuth(true);
      setProducts(productData);
      setVendors(vendorData);
    } catch {
      setPwError(true);
      setTimeout(() => setPwError(false), 1500);
    }
  };

  const logout = () => {
    sessionStorage.removeItem(PW_STORAGE_KEY);
    setAuth(false);
    setPw('');
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      setOrders(await api.listOrders(pw));
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadClosings = async () => {
    setClosingsLoading(true);
    try {
      setCashClosings(await api.listCashClosings(pw));
    } finally {
      setClosingsLoading(false);
    }
  };

  useEffect(() => {
    if (auth && (tab === 'orders' || tab === 'dashboard')) {
      loadOrders();
    }
    if (auth && tab === 'dashboard') {
      loadClosings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, tab]);

  useEffect(() => {
    const stored = localStorage.getItem(STOCK_THRESHOLD_KEY);
    if (stored) setStockThreshold(Number(stored) || 5);
  }, []);

  const updateThreshold = (value: number) => {
    setStockThreshold(value);
    localStorage.setItem(STOCK_THRESHOLD_KEY, String(value));
  };

  const setOrderStatus = async (id: string, status: 'confirmed' | 'cancelled' | 'delivered') => {
    setOrderActionId(id);
    try {
      await api.updateOrderStatus(id, status, pw);
      await loadOrders();
    } finally {
      setOrderActionId(null);
    }
  };

  const closeCashRegister = async (date: string) => {
    setClosingInProgress(true);
    try {
      await api.createCashClosing(date, pw);
      await loadClosings();
    } finally {
      setClosingInProgress(false);
    }
  };

  const toggleRestock = async (p: DBProduct) => {
    setRestockActionId(p.id);
    try {
      await api.updateProduct(p.id, { needsRestock: !p.needsRestock }, pw);
      await load(pw);
    } finally {
      setRestockActionId(null);
    }
  };

  // ── Product handlers ──────────────────────────────
  const openAdd = () => {
    setForm({ ...EMPTY_PRODUCT, vendorSlug: vendors[0]?.slug ?? '' });
    setEditId(null);
    setModal(true);
  };

  const openEdit = (p: DBProduct) => {
    const { id, createdAt, ...rest } = p;
    setForm(rest);
    setEditId(id);
    setModal(true);
  };

  const field = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: editId ? f.slug : slugify(name) }));
  };

  const handleMainImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await api.upload(file, pw);
      field('image', url);
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (files: FileList) => {
    setGalleryUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await api.upload(file, pw));
      }
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } finally {
      setGalleryUploading(false);
    }
  };

  const removeGalleryImage = (url: string) => {
    setForm((f) => ({ ...f, images: f.images.filter((img) => img !== url) }));
  };

  const save = async () => {
    if (!form.name.trim() || !form.slug.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await api.updateProduct(editId, form, pw);
      } else {
        await api.createProduct(form, pw);
      }
      await load(pw);
      setModal(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p: DBProduct) => {
    await api.updateProduct(p.id, { activo: !p.activo }, pw);
    await load(pw);
  };

  const deleteProduct = async () => {
    if (!deleteId) return;
    await api.deleteProduct(deleteId, pw);
    setDeleteId(null);
    await load(pw);
  };

  const handleBulkUpload = async (files: FileList) => {
    const total = files.length;
    setBulkProgress({ done: 0, total });
    for (let i = 0; i < total; i++) {
      const file = files[i];
      try {
        const url = await api.upload(file, pw);
        await api.createProduct(
          {
            name: file.name.replace(/\.[^/.]+$/, ''),
            slug: slugify(file.name.replace(/\.[^/.]+$/, '')) + '-' + Date.now().toString(36) + i,
            price: '',
            tag: '',
            image: url,
            images: [],
            description: '',
            vendorSlug: vendors[0]?.slug ?? '',
            activo: false,
            orden: products.length + i,
          },
          pw
        );
      } catch {
        // continue with remaining files
      }
      setBulkProgress({ done: i + 1, total });
    }
    await load(pw);
    setBulkProgress(null);
  };

  // ── Vendor handlers ───────────────────────────────
  const openAddVendor = () => {
    setVendorForm(EMPTY_VENDOR);
    setVendorEditId(null);
    setVendorModal(true);
  };

  const openEditVendor = (v: DBVendor) => {
    const { id, createdAt, ...rest } = v;
    setVendorForm(rest);
    setVendorEditId(id);
    setVendorModal(true);
  };

  const vfield = <K extends keyof typeof vendorForm>(key: K, value: (typeof vendorForm)[K]) =>
    setVendorForm((f) => ({ ...f, [key]: value }));

  const handleVendorNameChange = (name: string) => {
    setVendorForm((f) => ({ ...f, name, slug: vendorEditId ? f.slug : slugify(name) }));
  };

  const handleLogoUpload = async (file: File) => {
    setLogoUploading(true);
    try {
      const url = await api.upload(file, pw);
      vfield('logo', url);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleCoverUpload = async (file: File) => {
    setCoverUploading(true);
    try {
      const url = await api.upload(file, pw);
      vfield('cover', url);
    } finally {
      setCoverUploading(false);
    }
  };

  const handleCoverBannerUpload = async (file: File) => {
    setCoverBannerUploading(true);
    try {
      const url = await api.upload(file, pw);
      vfield('coverBanner', url);
    } finally {
      setCoverBannerUploading(false);
    }
  };

  const saveVendor = async () => {
    if (!vendorForm.name.trim() || !vendorForm.slug.trim()) return;
    setVendorSaving(true);
    try {
      if (vendorEditId) {
        await api.updateVendor(vendorEditId, vendorForm, pw);
      } else {
        await api.createVendor(vendorForm, pw);
      }
      await load(pw);
      setVendorModal(false);
    } finally {
      setVendorSaving(false);
    }
  };

  const toggleVendorActive = async (v: DBVendor) => {
    await api.updateVendor(v.id, { activo: !v.activo }, pw);
    await load(pw);
  };

  const deleteVendor = async () => {
    if (!vendorDeleteId) return;
    await api.deleteVendor(vendorDeleteId, pw);
    setVendorDeleteId(null);
    await load(pw);
  };

  if (checkingAuth) {
    return <main className="dark min-h-screen bg-brand-950" />;
  }

  if (!auth) {
    return (
      <main className="dark flex min-h-screen items-center justify-center bg-brand-950 px-6 text-white">
        <form onSubmit={login} className="w-full max-w-sm space-y-4">
          <h1 className="text-center text-2xl font-black tracking-tight">Panel Admin</h1>
          <p className="text-center text-sm text-slate-400">Perú & Moda</p>
          <input
            type="password"
            placeholder="Contraseña"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoFocus
            className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none ${
              pwError ? 'border-red-500' : 'border-white/10 focus:border-[#d12a18]'
            }`}
          />
          {pwError && <p className="text-center text-xs text-red-400">Contraseña incorrecta</p>}
          <button
            type="submit"
            className="w-full rounded-full bg-[#d12a18] py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-red-600"
          >
            Entrar
          </button>
        </form>
      </main>
    );
  }

  // ── Dashboard derived data ──────────────────────────────
  const ordersForSelectedDate = orders.filter((o) => o.created_at.slice(0, 10) === selectedDate);
  const nonCancelledOrders = ordersForSelectedDate.filter((o) => o.status !== 'cancelled');
  const dayRevenue = nonCancelledOrders.reduce((sum, o) => sum + o.total, 0);
  const paymentCounts = nonCancelledOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.payment_method] = (acc[o.payment_method] ?? 0) + 1;
    return acc;
  }, {});
  const topPaymentMethod = Object.entries(paymentCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const statusCounts = ordersForSelectedDate.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  const bestSellers = Object.entries(
    orders
      .filter((o) => o.status !== 'cancelled')
      .flatMap((o) => o.items)
      .reduce<Record<string, number>>((acc, item) => {
        acc[item.product_name] = (acc[item.product_name] ?? 0) + item.quantity;
        return acc;
      }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const lowStockProducts = products
    .filter((p) => p.activo && p.stock <= stockThreshold)
    .sort((a, b) => a.stock - b.stock);

  const restockProducts = products.filter((p) => p.needsRestock);

  const todayClosing = cashClosings.find((c) => c.date === selectedDate);

  return (
    <main className="dark min-h-screen bg-brand-950 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-black tracking-tight">Admin</h1>
          <div className="flex items-center gap-1 rounded-full bg-white/10 p-1">
            <button
              onClick={() => setTab('dashboard')}
              className={`rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest transition ${
                tab === 'dashboard' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setTab('products')}
              className={`rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest transition ${
                tab === 'products' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              Productos
            </button>
            <button
              onClick={() => setTab('vendors')}
              className={`rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest transition ${
                tab === 'vendors' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              Tiendas
            </button>
            <button
              onClick={() => setTab('orders')}
              className={`rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest transition ${
                tab === 'orders' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              Pedidos
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {tab === 'products' ? (
            <>
              <button
                onClick={() => bulkFileRef.current?.click()}
                disabled={!!bulkProgress}
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:border-[#d12a18] disabled:opacity-50"
              >
                {bulkProgress ? `Subiendo ${bulkProgress.done}/${bulkProgress.total}...` : 'Subida masiva'}
              </button>
              <input
                ref={bulkFileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files?.length && handleBulkUpload(e.target.files)}
              />
              <button
                onClick={openAdd}
                className="rounded-full bg-[#d12a18] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-red-600"
              >
                + Nuevo producto
              </button>
            </>
          ) : tab === 'vendors' ? (
            <button
              onClick={openAddVendor}
              className="rounded-full bg-[#d12a18] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-red-600"
            >
              + Nueva tienda
            </button>
          ) : null}
          <button onClick={logout} className="text-xs text-slate-400 transition hover:text-white">
            Salir
          </button>
        </div>
      </div>

      {/* Dashboard */}
      {tab === 'dashboard' && (
        <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs uppercase tracking-widest text-slate-400">Fecha</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            />
            <button
              onClick={() => closeCashRegister(selectedDate)}
              disabled={closingInProgress || !!todayClosing}
              className="rounded-full bg-[#d12a18] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              {todayClosing ? 'Caja ya cerrada' : closingInProgress ? 'Cerrando...' : 'Cerrar caja de este día'}
            </button>
          </div>

          {(ordersLoading || loading) && <p className="text-sm text-slate-400">Cargando...</p>}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-brand-900 p-5">
              <p className="text-xs uppercase tracking-widest text-slate-400">Pedidos del día</p>
              <p className="mt-2 text-2xl font-black">{ordersForSelectedDate.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-brand-900 p-5">
              <p className="text-xs uppercase tracking-widest text-slate-400">Monto recaudado</p>
              <p className="mt-2 text-2xl font-black">{formatPrice(dayRevenue)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-brand-900 p-5">
              <p className="text-xs uppercase tracking-widest text-slate-400">Método más usado</p>
              <p className="mt-2 text-2xl font-black">{PAYMENT_METHOD_LABEL[topPaymentMethod ?? ''] ?? '—'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-brand-900 p-5">
              <p className="text-xs uppercase tracking-widest text-slate-400">Estados</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(statusCounts).length === 0 ? (
                  <span className="text-sm text-slate-500">Sin pedidos</span>
                ) : (
                  Object.entries(statusCounts).map(([status, count]) => (
                    <span key={status} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px]">
                      {ORDER_STATUS_LABEL[status] ?? status}: {count}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-brand-900 p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">Stock bajo</h2>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Umbral ≤</span>
                  <input
                    type="number"
                    min={0}
                    value={stockThreshold}
                    onChange={(e) => updateThreshold(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white"
                  />
                </div>
              </div>
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-slate-500">Ningún producto por debajo del umbral.</p>
              ) : (
                <div className="space-y-2">
                  {lowStockProducts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2 text-sm">
                      <span className="truncate">{p.name} · <span className="text-red-400">stock: {p.stock}</span></span>
                      <button
                        onClick={() => toggleRestock(p)}
                        disabled={restockActionId === p.id}
                        className={`flex-shrink-0 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide transition disabled:opacity-50 ${
                          p.needsRestock ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        {p.needsRestock ? 'Ya solicitado' : 'Solicitar reposición'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-brand-900 p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-300">Pendientes de compra</h2>
              {restockProducts.length === 0 ? (
                <p className="text-sm text-slate-500">No hay productos marcados para reponer.</p>
              ) : (
                <div className="space-y-2">
                  {restockProducts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2 text-sm">
                      <span className="truncate">{p.name} · stock: {p.stock}</span>
                      <button
                        onClick={() => toggleRestock(p)}
                        disabled={restockActionId === p.id}
                        className="flex-shrink-0 rounded-full bg-green-500/15 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-green-400 transition hover:bg-green-500/25 disabled:opacity-50"
                      >
                        Marcar reabastecido
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-brand-900 p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-300">Más vendidos</h2>
              {bestSellers.length === 0 ? (
                <p className="text-sm text-slate-500">Aún no hay ventas registradas.</p>
              ) : (
                <ol className="space-y-2 text-sm">
                  {bestSellers.map(([name, qty], i) => (
                    <li key={name} className="flex items-center justify-between">
                      <span>{i + 1}. {name}</span>
                      <span className="text-slate-400">{qty} vendidos</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-brand-900 p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-300">Historial de cierres</h2>
              {closingsLoading ? (
                <p className="text-sm text-slate-500">Cargando...</p>
              ) : cashClosings.length === 0 ? (
                <p className="text-sm text-slate-500">Aún no se ha cerrado caja.</p>
              ) : (
                <div className="space-y-2 text-sm">
                  {cashClosings.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                      <span>{c.date}</span>
                      <span className="text-slate-400">{c.total_orders} pedidos · {formatPrice(c.total_amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products list */}
      {tab === 'products' && (
        <div className="mx-auto max-w-4xl px-6 py-10">
          {loading ? (
            <p className="text-center text-slate-400">Cargando...</p>
          ) : products.length === 0 ? (
            <p className="text-center text-slate-400">Sin productos aún. Agrega el primero.</p>
          ) : (
            <div className="space-y-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-4 rounded-2xl border border-white/10 bg-brand-900 p-4 transition ${
                    p.activo ? '' : 'opacity-50'
                  }`}
                >
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-900">
                    {p.image && <Image src={p.image} alt={p.name} fill className="object-cover" sizes="64px" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{p.name || 'Sin nombre'}</p>
                    <p className="text-xs text-slate-400">
                      {p.tag || 'Sin tag'} · {p.price || 'Sin precio'} ·{' '}
                      {vendors.find((v) => v.slug === p.vendorSlug)?.name ?? 'Sin tienda'} ·{' '}
                      <span className={p.stock <= 0 ? 'text-red-400' : ''}>{p.stock <= 0 ? 'Agotado' : `Stock: ${p.stock}`}</span>
                      {!p.activo && ' · Oculto'}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition ${
                        p.activo ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      {p.activo ? 'Visible' : 'Oculto'}
                    </button>
                    <button
                      onClick={() => openEdit(p)}
                      className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-white/20"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteId(p.id)}
                      className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-slate-300 transition hover:bg-red-500/20 hover:text-red-400"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vendors list */}
      {tab === 'vendors' && (
        <div className="mx-auto max-w-4xl px-6 py-10">
          {loading ? (
            <p className="text-center text-slate-400">Cargando...</p>
          ) : vendors.length === 0 ? (
            <p className="text-center text-slate-400">Sin tiendas aún. Agrega la primera.</p>
          ) : (
            <div className="space-y-3">
              {vendors.map((v) => (
                <div
                  key={v.id}
                  className={`flex items-center gap-4 rounded-2xl border border-white/10 bg-brand-900 p-4 transition ${
                    v.activo ? '' : 'opacity-50'
                  }`}
                >
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-slate-900">
                    {v.logo ? (
                      <Image src={v.logo} alt={v.name} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-500">Sin logo</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{v.name || 'Sin nombre'}</p>
                    <p className="text-xs text-slate-400">
                      {v.rating.toFixed(1)} ★ · {v.sales} ventas
                      {!v.activo && ' · Oculto'}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <button
                      onClick={() => toggleVendorActive(v)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition ${
                        v.activo ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      {v.activo ? 'Visible' : 'Oculto'}
                    </button>
                    <button
                      onClick={() => openEditVendor(v)}
                      className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-white/20"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setVendorDeleteId(v.id)}
                      className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-slate-300 transition hover:bg-red-500/20 hover:text-red-400"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders list */}
      {tab === 'orders' && (
        <div className="mx-auto max-w-4xl px-6 py-10">
          {ordersLoading ? (
            <p className="text-center text-slate-400">Cargando...</p>
          ) : orders.length === 0 ? (
            <p className="text-center text-slate-400">Sin pedidos aún.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="rounded-2xl border border-white/10 bg-brand-900 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{o.customer_name} · {o.phone}</p>
                      <p className="text-xs text-slate-400">
                        {o.delivery_method === 'delivery'
                          ? `${o.address}, ${o.district}, ${o.province}, ${o.department}${o.address_reference ? ` (${o.address_reference})` : ''}`
                          : 'Recojo en tienda'}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Pago: {PAYMENT_METHOD_LABEL[o.payment_method] ?? o.payment_method}
                        {o.payment_proof_url && (
                          <>
                            {' · '}
                            <a href={o.payment_proof_url} target="_blank" rel="noreferrer" className="text-[#d12a18] hover:underline">
                              Ver comprobante
                            </a>
                          </>
                        )}
                      </p>
                      {o.notes && <p className="mt-1 text-xs text-slate-400">Nota: {o.notes}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">{formatPrice(o.total)}</p>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wide ${
                          o.status === 'delivered'
                            ? 'bg-blue-500/15 text-blue-400'
                            : o.status === 'confirmed'
                              ? 'bg-green-500/15 text-green-400'
                              : o.status === 'cancelled'
                                ? 'bg-red-500/15 text-red-400'
                                : 'bg-yellow-500/15 text-yellow-400'
                        }`}
                      >
                        {ORDER_STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </div>
                  </div>

                  <ul className="mt-3 space-y-1 border-t border-white/10 pt-3 text-xs text-slate-400">
                    {o.items.map((item) => (
                      <li key={item.id}>
                        {item.quantity}× {item.product_name} — {formatPrice(item.subtotal)}
                      </li>
                    ))}
                  </ul>

                  {o.status !== 'delivered' && o.status !== 'cancelled' && (
                    <div className="mt-4 flex gap-2">
                      {o.status !== 'confirmed' && (
                        <button
                          onClick={() => setOrderStatus(o.id, 'confirmed')}
                          disabled={orderActionId === o.id}
                          className="rounded-full bg-green-500/15 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-green-400 transition hover:bg-green-500/25 disabled:opacity-50"
                        >
                          Confirmar
                        </button>
                      )}
                      {o.status === 'confirmed' && (
                        <button
                          onClick={() => setOrderStatus(o.id, 'delivered')}
                          disabled={orderActionId === o.id}
                          className="rounded-full bg-blue-500/15 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-blue-400 transition hover:bg-blue-500/25 disabled:opacity-50"
                        >
                          Marcar entregado
                        </button>
                      )}
                      <button
                        onClick={() => setOrderStatus(o.id, 'cancelled')}
                        disabled={orderActionId === o.id}
                        className="rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-red-400 transition hover:bg-red-500/25 disabled:opacity-50"
                      >
                        Cancelar (recupera stock)
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Product modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-10">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative mb-10 w-full max-w-lg rounded-2xl border border-white/10 bg-brand-900 shadow-soft">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <h2 className="text-lg font-bold text-white">{editId ? 'Editar producto' : 'Nuevo producto'}</h2>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="admin-label">Imagen principal</label>
                <div className="flex items-center gap-3">
                  {form.image ? (
                    <div className="group relative h-20 w-20 flex-shrink-0">
                      <Image src={form.image} alt="" fill className="rounded-xl border-2 border-[#d12a18] object-cover" sizes="80px" />
                      <button
                        onClick={() => field('image', '')}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => mainFileRef.current?.click()}
                      className="flex h-20 w-20 flex-shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 text-slate-400 transition hover:border-[#d12a18] hover:text-[#d12a18]"
                    >
                      <span className="text-2xl leading-none">+</span>
                      <span className="mt-1 text-[9px]">{uploading ? 'Subiendo...' : 'Subir'}</span>
                    </button>
                  )}
                  <input
                    ref={mainFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleMainImageUpload(e.target.files[0])}
                  />
                </div>
              </div>

              <div>
                <label className="admin-label">Galería (imágenes adicionales)</label>
                <div className="flex flex-wrap gap-3">
                  {form.images.map((img) => (
                    <div key={img} className="group relative h-16 w-16 flex-shrink-0">
                      <Image src={img} alt="" fill className="rounded-lg border border-white/10 object-cover" sizes="64px" />
                      <button
                        onClick={() => removeGalleryImage(img)}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => galleryFileRef.current?.click()}
                    className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 text-slate-400 transition hover:border-[#d12a18] hover:text-[#d12a18]"
                  >
                    <span className="text-xl leading-none">+</span>
                    <span className="mt-0.5 text-[8px]">{galleryUploading ? '...' : 'Subir'}</span>
                  </button>
                  <input
                    ref={galleryFileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files?.length && handleGalleryUpload(e.target.files)}
                  />
                </div>
              </div>

              <div>
                <label className="admin-label">Nombre *</label>
                <input value={form.name} onChange={(e) => handleNameChange(e.target.value)} className="admin-input" placeholder="Ej: Snapback Lima Edition" />
              </div>

              <div>
                <label className="admin-label">Slug (URL)</label>
                <input value={form.slug} onChange={(e) => field('slug', slugify(e.target.value))} className="admin-input" placeholder="snapback-lima-edition" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Precio</label>
                  <input value={form.price} onChange={(e) => field('price', e.target.value)} className="admin-input" placeholder="S/ 189" />
                </div>
                <div>
                  <label className="admin-label">Tag</label>
                  <input value={form.tag} onChange={(e) => field('tag', e.target.value)} className="admin-input" placeholder="Nuevo" />
                </div>
              </div>

              <div>
                <label className="admin-label">Stock disponible</label>
                <input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => field('stock', Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="admin-input"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="admin-label">Tienda</label>
                <select value={form.vendorSlug} onChange={(e) => field('vendorSlug', e.target.value)} className="admin-input">
                  {vendors.map((v) => (
                    <option key={v.slug} value={v.slug}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="admin-label">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => field('description', e.target.value)}
                  rows={3}
                  className="admin-input"
                  placeholder="Describe el producto..."
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={form.activo} onChange={(e) => field('activo', e.target.checked)} />
                Visible en el catálogo
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/10 p-6">
              <button
                onClick={() => setModal(false)}
                className="rounded-full border border-white/20 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-slate-300 transition hover:border-white/40"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="rounded-full bg-[#d12a18] px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vendor modal */}
      {vendorModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-10">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setVendorModal(false)} />
          <div className="relative mb-10 w-full max-w-lg rounded-2xl border border-white/10 bg-brand-900 shadow-soft">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <h2 className="text-lg font-bold text-white">{vendorEditId ? 'Editar tienda' : 'Nueva tienda'}</h2>
              <button onClick={() => setVendorModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="admin-label">Logo</label>
                <div className="flex items-center gap-3">
                  {vendorForm.logo ? (
                    <div className="group relative h-20 w-20 flex-shrink-0">
                      <Image src={vendorForm.logo} alt="" fill className="rounded-full border-2 border-[#d12a18] object-cover" sizes="80px" />
                      <button
                        onClick={() => vfield('logo', '')}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => logoFileRef.current?.click()}
                      className="flex h-20 w-20 flex-shrink-0 flex-col items-center justify-center rounded-full border-2 border-dashed border-white/20 text-slate-400 transition hover:border-[#d12a18] hover:text-[#d12a18]"
                    >
                      <span className="text-2xl leading-none">+</span>
                      <span className="mt-1 text-[9px]">{logoUploading ? 'Subiendo...' : 'Subir'}</span>
                    </button>
                  )}
                  <input
                    ref={logoFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                  />
                </div>
              </div>

              <div>
                <label className="admin-label">Foto de portada (tarjeta, ~3:2)</label>
                <div className="flex items-center gap-3">
                  {vendorForm.cover ? (
                    <div className="group relative h-20 w-32 flex-shrink-0">
                      <Image src={vendorForm.cover} alt="" fill className="rounded-xl border-2 border-[#d12a18] object-cover" sizes="128px" />
                      <button
                        onClick={() => vfield('cover', '')}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => coverFileRef.current?.click()}
                      className="flex h-20 w-32 flex-shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 text-slate-400 transition hover:border-[#d12a18] hover:text-[#d12a18]"
                    >
                      <span className="text-2xl leading-none">+</span>
                      <span className="mt-1 text-[9px]">{coverUploading ? 'Subiendo...' : 'Subir'}</span>
                    </button>
                  )}
                  <input
                    ref={coverFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">Se usa en la tarjeta del listado de vendedores. Recomendado: 1200×800px.</p>
              </div>

              <div>
                <label className="admin-label">Banner de tienda (ancho, ~4.5:1)</label>
                <div className="flex items-center gap-3">
                  {vendorForm.coverBanner ? (
                    <div className="group relative h-16 w-full flex-shrink-0">
                      <Image src={vendorForm.coverBanner} alt="" fill className="rounded-xl border-2 border-[#d12a18] object-cover" sizes="320px" />
                      <button
                        onClick={() => vfield('coverBanner', '')}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => coverBannerFileRef.current?.click()}
                      className="flex h-16 w-full flex-shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 text-slate-400 transition hover:border-[#d12a18] hover:text-[#d12a18]"
                    >
                      <span className="text-2xl leading-none">+</span>
                      <span className="mt-1 text-[9px]">{coverBannerUploading ? 'Subiendo...' : 'Subir'}</span>
                    </button>
                  )}
                  <input
                    ref={coverBannerFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleCoverBannerUpload(e.target.files[0])}
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">Se usa en el banner ancho de la página de la tienda. Recomendado: 1800×400px. Si se deja vacío, se usa la foto de portada.</p>
              </div>

              <div>
                <label className="admin-label">Nombre *</label>
                <input value={vendorForm.name} onChange={(e) => handleVendorNameChange(e.target.value)} className="admin-input" placeholder="Ej: Lima Caps" />
              </div>

              <div>
                <label className="admin-label">Slug (URL)</label>
                <input value={vendorForm.slug} onChange={(e) => vfield('slug', slugify(e.target.value))} className="admin-input" placeholder="lima-caps" />
              </div>

              <div>
                <label className="admin-label">Descripción</label>
                <textarea
                  value={vendorForm.description}
                  onChange={(e) => vfield('description', e.target.value)}
                  rows={3}
                  className="admin-input"
                  placeholder="Describe la tienda..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Calificación</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={vendorForm.rating}
                    onChange={(e) => vfield('rating', parseFloat(e.target.value) || 0)}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Ventas</label>
                  <input
                    type="number"
                    min="0"
                    value={vendorForm.sales}
                    onChange={(e) => vfield('sales', parseInt(e.target.value, 10) || 0)}
                    className="admin-input"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={vendorForm.activo} onChange={(e) => vfield('activo', e.target.checked)} />
                Visible en el sitio
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/10 p-6">
              <button
                onClick={() => setVendorModal(false)}
                className="rounded-full border border-white/20 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-slate-300 transition hover:border-white/40"
              >
                Cancelar
              </button>
              <button
                onClick={saveVendor}
                disabled={vendorSaving}
                className="rounded-full bg-[#d12a18] px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {vendorSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirms */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-brand-900 p-6 shadow-soft">
            <p className="text-white">¿Eliminar este producto? Esta acción no se puede deshacer.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-full border border-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={deleteProduct}
                className="rounded-full bg-red-500 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {vendorDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setVendorDeleteId(null)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-brand-900 p-6 shadow-soft">
            <p className="text-white">¿Eliminar esta tienda? Sus productos quedarán sin tienda asignada.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setVendorDeleteId(null)}
                className="rounded-full border border-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={deleteVendor}
                className="rounded-full bg-red-500 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .admin-label {
          display: block;
          margin-bottom: 0.375rem;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
        }
        .admin-input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.03);
          padding: 0.65rem 1rem;
          color: white;
        }
        .admin-input::placeholder {
          color: rgba(255, 255, 255, 0.35);
        }
        .admin-input:focus {
          outline: none;
          border-color: #d12a18;
        }
      `}</style>
    </main>
  );
}
