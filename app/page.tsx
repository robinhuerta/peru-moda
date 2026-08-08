import ProductCard from '@/components/ProductCard';
import { mockProducts } from '@/lib/mockProducts';

export default function CatalogPage() {
  return (
    <main className="min-h-screen bg-brand-950 text-white">
      <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 rounded-[32px] border border-white/10 bg-brand-900 p-10 shadow-soft">
            <span className="inline-flex rounded-full bg-[#d12a18]/15 px-4 py-2 text-sm uppercase tracking-[0.3em] text-[#d12a18]">
              Explora</span>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl">Catálogo de Gorras</h1>
            <p className="mt-4 max-w-3xl text-lg text-slate-300">
              Descubre la colección completa de gorras premium, urbanas y streetwear.
            </p>
          </div>

          {/* Aquí irían los filtros y la barra de búsqueda */}
          {/* <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Filtros</h2>
            </div> */}

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