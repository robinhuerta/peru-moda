import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/components/ProductCard';

export default function Hero({ products }: { products: Product[] }) {
  const [featured, second, third] = products;

  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-16 sm:px-10 lg:px-16">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[#d12a18]/20 blur-[140px]"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">
            Marketplace peruano
          </span>

          <h1 className="mt-6 text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Gorras con
            <span className="block text-[#d12a18]">actitud peruana</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-slate-300">
            Drops exclusivos de streetwear y edición limitada, hechos por marcas peruanas.
            Envíos a todo el país y pago seguro en cada compra.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#catalogo"
              className="rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition hover:bg-slate-100"
            >
              Explorar catálogo
            </a>
            <Link
              href="/vendedores"
              className="rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-white transition hover:border-[#d12a18]"
            >
              Ver vendedores
            </Link>
          </div>

          <dl className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-8">
            <div>
              <dt className="text-2xl font-black text-white sm:text-3xl">{products.length}+</dt>
              <dd className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Modelos exclusivos</dd>
            </div>
            <div>
              <dt className="text-2xl font-black text-white sm:text-3xl">3</dt>
              <dd className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Tiendas verificadas</dd>
            </div>
            <div>
              <dt className="text-2xl font-black text-white sm:text-3xl">24</dt>
              <dd className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Departamentos con envío</dd>
            </div>
          </dl>
        </div>

        <div className="relative mx-auto h-[420px] w-full max-w-md sm:h-[520px]">
          {featured && (
            <div className="absolute inset-0 overflow-hidden rounded-[40px] border border-white/10 shadow-soft">
              <Image
                src={featured.image}
                alt={featured.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 480px"
              />
            </div>
          )}

          {second && (
            <div className="absolute -left-8 bottom-10 h-40 w-32 overflow-hidden rounded-3xl border border-white/10 shadow-soft sm:h-48 sm:w-36">
              <Image
                src={second.image}
                alt={second.name}
                fill
                className="object-cover"
                sizes="150px"
              />
            </div>
          )}

          {third && (
            <div className="absolute -right-6 -top-6 h-28 w-28 overflow-hidden rounded-3xl border border-white/10 shadow-soft sm:h-32 sm:w-32">
              <Image
                src={third.image}
                alt={third.name}
                fill
                className="object-cover"
                sizes="130px"
              />
            </div>
          )}

          <div className="absolute -bottom-6 right-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-brand-900/90 px-5 py-4 shadow-soft backdrop-blur">
            <span className="text-2xl font-black text-[#d12a18]">4.9</span>
            <div className="text-xs text-slate-300">
              <p className="font-semibold text-white">★★★★★</p>
              <p>Calificación de compradores</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
