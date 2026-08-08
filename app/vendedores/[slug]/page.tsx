import Image from 'next/image';
import { notFound } from 'next/navigation';
import { vendors } from '@/lib/vendors';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export const revalidate = 30;
export const dynamicParams = true;

type VendorStorePageProps = {
  params: { slug: string };
};

export default async function VendorStorePage({ params }: VendorStorePageProps) {
  const vendor = vendors.find((v) => v.slug === params.slug);

  if (!vendor) {
    notFound();
  }

  const allProducts = await api.listProducts({ revalidate: 30 });
  const products = allProducts.filter((p) => p.vendorSlug === vendor.slug);

  return (
    <main className="min-h-screen bg-brand-950 text-white">
      <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 overflow-hidden rounded-[32px] border border-white/10 bg-brand-900 shadow-soft">
            <div className="relative h-64">
              <Image src={vendor.cover} alt={vendor.name} fill className="object-cover" sizes="100vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-10">
                <span className="inline-flex rounded-full bg-[#d12a18]/15 px-4 py-2 text-sm uppercase tracking-[0.3em] text-[#d12a18]">
                  Tienda
                </span>
                <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">{vendor.name}</h1>
              </div>
            </div>
            <div className="flex flex-col gap-4 p-10 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-2xl text-lg text-slate-300">{vendor.description}</p>
              <div className="flex gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-white/90">
                  <strong>{vendor.rating.toFixed(1)}</strong> ★
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-white/90">
                  {vendor.sales} ventas
                </span>
              </div>
            </div>
          </div>

          <h2 className="mb-6 text-2xl font-bold text-white">Productos de {vendor.name}</h2>
          {products.length === 0 ? (
            <p className="text-slate-400">Esta tienda aún no tiene productos publicados.</p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
