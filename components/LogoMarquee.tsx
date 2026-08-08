import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/components/ProductCard';

export default function LogoMarquee({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  const track = [...products, ...products];

  return (
    <section className="border-y border-ink/10 bg-brand-900/50 py-10">
      <p className="mb-6 text-center text-xs uppercase tracking-[0.3em] text-ink/40">
        Las gorras que vendemos
      </p>
      <div className="group relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-brand-900 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-brand-900 to-transparent" />

        <div className="flex w-max animate-marquee gap-16 group-hover:[animation-play-state:paused]">
          {track.map((product, index) => (
            <Link
              key={`${product.id}-${index}`}
              href={`/producto/${product.slug}`}
              className="flex w-28 flex-shrink-0 flex-col items-center gap-3 opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
            >
              <span className="relative h-16 w-16 overflow-hidden rounded-full border border-ink/15">
                <Image src={product.image} alt={product.name} fill className="object-cover" sizes="64px" />
              </span>
              <span className="text-center text-xs text-ink/50">{product.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
