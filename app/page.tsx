import ProductCard from '@/components/ProductCard';
import Hero from '@/components/Hero';
import LogoMarquee from '@/components/LogoMarquee';
import { api } from '@/lib/api';

export const revalidate = 30;

export default async function CatalogPage() {
  const products = await api.listProducts({ revalidate: 30 });

  return (
    <main className="min-h-screen bg-brand-950 text-ink">
      <Hero products={products} />
      <LogoMarquee products={products} />

      <section id="catalogo" className="relative overflow-hidden px-6 pb-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <span className="inline-flex rounded-full bg-[#d12a18]/15 px-4 py-2 text-sm uppercase tracking-[0.3em] text-[#d12a18]">
                Catálogo
              </span>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-4xl">
                Todas las gorras
              </h2>
            </div>
          </div>

          {products.length === 0 ? (
            <p className="text-ink/50">Aún no hay productos publicados.</p>
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
