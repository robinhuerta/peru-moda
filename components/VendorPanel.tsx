import Image from 'next/image';
import Link from 'next/link';

type Vendor = {
  name: string;
  slug: string;
  description: string;
  rating: number;
  sales: number;
  cover: string;
  logo?: string;
};

export default function VendorPanel({ vendor }: { vendor: Vendor }) {
  return (
    <article className="group overflow-hidden rounded-[32px] border border-ink/10 bg-brand-900 transition hover:-translate-y-1 hover:border-[#d12a18]/40 hover:shadow-soft">
      <div className="relative h-64 overflow-hidden bg-slate-900">
        <Image
          src={vendor.cover}
          alt={vendor.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 33vw"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 bg-gradient-to-t from-black/80 to-transparent p-6">
          {vendor.logo && (
            <span className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-white/80 bg-brand-900">
              <Image src={vendor.logo} alt={`Logo de ${vendor.name}`} fill className="object-cover" sizes="48px" />
            </span>
          )}
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Vendedor</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">{vendor.name}</h2>
          </div>
        </div>
      </div>
      <div className="space-y-4 p-6">
        <p className="text-sm text-ink/70">{vendor.description}</p>
        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2 rounded-full bg-ink/5 px-4 py-2 text-ink/90">
            <strong>{vendor.rating.toFixed(1)}</strong> ★
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-ink/5 px-4 py-2 text-ink/90">
            {vendor.sales} ventas
          </span>
        </div>
        <Link
          href={`/vendedores/${vendor.slug}`}
          className="block w-full rounded-full bg-[#d12a18] px-5 py-3 text-center text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-red-600"
        >
          Ver tienda
        </Link>
      </div>
    </article>
  );
}
