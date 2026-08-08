import ProductCard from '@/components/ProductCard';
import Hero from '@/components/Hero';
import { mockProducts } from '@/lib/mockProducts';

export default function CatalogPage() {
  return (
    <main className="min-h-screen bg-brand-950 text-white">
      <Hero />

      <section id="catalogo" className="relative overflow-hidden px-6 pb-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <span className="inline-flex rounded-full bg-[#d12a18]/15 px-4 py-2 text-sm uppercase tracking-[0.3em] text-[#d12a18]">
                Catálogo
              </span>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Todas las gorras
              </h2>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mockProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}