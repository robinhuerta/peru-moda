import Link from 'next/link';
import { company } from '@/lib/company';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-brand-950 px-6 py-10 text-sm text-slate-400 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {company.razonSocial} · RUC {company.ruc} · {company.direccion}
        </p>
        <Link
          href="/libro-de-reclamaciones"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-white transition hover:border-[#d12a18]"
        >
          Libro de Reclamaciones
        </Link>
      </div>
    </footer>
  );
}
