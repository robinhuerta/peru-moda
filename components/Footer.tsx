import type { ReactNode } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { company } from '@/lib/company';
import { api } from '@/lib/api';

function ShirtIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8">
      <path d="M8 3 4 6l1.5 3L8 8v13h8V8l2.5 1L20 6l-4-3-2 2h-4L8 3Z" strokeLinejoin="round" />
    </svg>
  );
}

function HandBoxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8">
      <rect x="9" y="4" width="10" height="10" rx="1" />
      <path d="M9 9H6M2 16c1.5-1.5 3.5-1.5 5 0l1.5 1.5c.8.8 2 .8 2.8 0" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 16v3.5a1.5 1.5 0 0 0 1.5 1.5h3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8">
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M9 8h6M9 12h6M9 16h3" strokeLinecap="round" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M4 5c2 0 5 .8 6 2v12c-1-1.2-4-2-6-2V5ZM20 5c-2 0-5 .8-6 2v12c1-1.2 4-2 6-2V5Z" strokeLinejoin="round" />
    </svg>
  );
}

function FooterStep({
  number,
  title,
  text,
  icon,
}: {
  number: string;
  title: string;
  text: string;
  icon: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 text-[#d12a18]">
        <span className="text-3xl font-black">{number}.</span>
        {icon}
      </div>
      <p className="mt-3 text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm text-ink/50">{text}</p>
    </div>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink/40">{title}</h3>
      <ul className="space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-ink/60 transition hover:text-[#d12a18]">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function Footer() {
  const vendors = await api.listVendors({ revalidate: 60 }).catch(() => []);

  return (
    <footer className="border-t border-ink/10 bg-brand-950 text-ink">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:items-start">
          <div>
            <h2 className="text-2xl font-black tracking-tight">¿Cambios o devoluciones?</h2>
            <p className="mt-3 max-w-sm text-sm text-ink/60">
              Cada producto es vendido y enviado directamente por la tienda que lo publica. Para un cambio o
              devolución, coordina directamente con el vendedor de tu pedido.
            </p>
            <Link
              href="/libro-de-reclamaciones"
              className="mt-6 inline-flex items-center rounded-full bg-ink px-5 py-3 text-xs font-semibold uppercase tracking-widest text-brand-950 transition hover:opacity-80"
            >
              Ver libro de reclamaciones
            </Link>
          </div>
          <FooterStep
            number="1"
            title="Revisa el estado"
            text="Que el producto esté sin uso, con etiquetas y accesorios."
            icon={<ShirtIcon />}
          />
          <FooterStep
            number="2"
            title="Contacta al vendedor"
            text="Escribe a la tienda que te vendió el producto desde su página."
            icon={<HandBoxIcon />}
          />
          <FooterStep
            number="3"
            title="Recibe tu solución"
            text="El vendedor confirma el cambio, la devolución o el reembolso."
            icon={<ReceiptIcon />}
          />
        </div>
      </div>

      <div className="border-t-2 border-[#d12a18]" />

      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo />
            <p className="text-xs leading-relaxed text-ink/50">
              Razón Social: {company.razonSocial}
              <br />
              RUC: {company.ruc}
              <br />
              {company.direccion}
            </p>
            <Link
              href="/libro-de-reclamaciones"
              className="inline-flex items-center gap-2 text-xs font-semibold text-ink/60 transition hover:text-[#d12a18]"
            >
              <BookIcon />
              Libro de Reclamaciones
            </Link>
          </div>

          <FooterColumn
            title="Servicio al cliente"
            links={[
              { href: '/carrito', label: 'Carrito' },
              { href: '/libro-de-reclamaciones', label: 'Libro de reclamaciones' },
            ]}
          />

          <FooterColumn
            title="Nosotros"
            links={[
              { href: '/', label: 'Catálogo' },
              { href: '/vendedores', label: 'Nuestros vendedores' },
            ]}
          />

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink/40">Vendedores</h3>
            {vendors.length === 0 ? (
              <p className="text-sm text-ink/40">Próximamente</p>
            ) : (
              <ul className="space-y-2.5 text-sm">
                {vendors.slice(0, 6).map((v) => (
                  <li key={v.slug}>
                    <Link href={`/vendedores/${v.slug}`} className="text-ink/60 transition hover:text-[#d12a18]">
                      {v.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
