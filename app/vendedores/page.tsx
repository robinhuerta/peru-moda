import VendorPanel from '@/components/VendorPanel';
import { api } from '@/lib/api';

export const revalidate = 30;

export default async function VendorsPage() {
  const vendors = await api.listVendors({ revalidate: 30 });

  return (
    <main className="min-h-screen bg-brand-950 text-ink">
      <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 rounded-[32px] border border-ink/10 bg-brand-900 p-10 shadow-soft">
            <span className="inline-flex rounded-full bg-[#d12a18]/15 px-4 py-2 text-sm uppercase tracking-[0.3em] text-[#d12a18]">
              Marketplace</span>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-ink sm:text-5xl">Vendedores destacados</h1>
            <p className="mt-4 max-w-3xl text-lg text-ink/70">
              Conecta con sellers premium que ofrecen gorras streetwear, edición limitada y drops exclusivos. Cada tienda tiene su propio panel y estadísticas de ventas.
            </p>
          </div>

          {vendors.length === 0 ? (
            <p className="text-ink/50">Aún no hay tiendas publicadas.</p>
          ) : (
            <div className="grid gap-8 xl:grid-cols-3">
              {vendors.map((vendor) => (
                <VendorPanel key={vendor.slug} vendor={vendor} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
