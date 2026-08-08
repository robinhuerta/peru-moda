import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mockProducts } from '@/lib/mockProducts';
import ProductGallery from '@/components/ProductGallery';
import ProductActions from '@/components/ProductActions';

// Generate static paths for all products
export async function generateStaticParams() {
  return mockProducts.map((product) => ({
    slug: product.slug,
  }));
}

type ProductDetailPageProps = {
  params: { slug: string };
};

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = params;
  const product = mockProducts.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = mockProducts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <main className="min-h-screen bg-brand-950 text-white">
      <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image Gallery (Client Component) */}
            <ProductGallery images={product.images} productName={product.name} />

            {/* Product Details */}
            <div className="space-y-8">
              <div>
                <span className="inline-flex rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                  {product.tag}
                </span>
                <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
                  {product.name}
                </h1>
                <p className="mt-4 text-3xl font-bold text-[#d12a18]">
                  {product.price}
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Descripción</h2>
                <p className="text-lg text-slate-300">{product.description}</p>
              </div>

              <ProductActions product={product} />

              {/* Seller Info */}
              <div className="space-y-4 pt-8 border-t border-white/10">
                <h2 className="text-xl font-semibold text-white">Información del Vendedor</h2>
                <p className="text-slate-300">
                  Vendido por: <Link href="/vendedores/lima-caps" className="text-[#d12a18] hover:underline">Lima Caps</Link>
                </p>
                <p className="text-slate-300">Calificación: 4.9 ★</p>
                <p className="text-slate-300">Tiempo de entrega estimado: 3-5 días hábiles</p>
              </div>

              {/* Placeholder for Reviews */}
              <div className="space-y-4 pt-8 border-t border-white/10">
                <h2 className="text-xl font-semibold text-white">Reseñas de Clientes</h2>
                <p className="text-slate-300">Aún no hay reseñas para este producto.</p>
              </div>

              {/* Related Products */}
              <div className="space-y-4 pt-8 border-t border-white/10">
                <h2 className="text-xl font-semibold text-white">Productos Relacionados</h2>
                <div className="grid grid-cols-2 gap-4">
                  {relatedProducts.map((related) => (
                    <Link
                      key={related.id}
                      href={`/producto/${related.slug}`}
                      className="group relative aspect-[4/5] overflow-hidden rounded-[32px] bg-brand-900"
                    >
                      <Image
                        src={related.image}
                        alt={related.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="25vw"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <p className="text-sm font-semibold text-white">{related.name}</p>
                        <p className="text-xs text-slate-300">{related.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
