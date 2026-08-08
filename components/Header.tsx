'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/cartStore';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';

export default function Header() {
  const items = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const count = mounted ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-brand-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-ink/70 sm:gap-6">
          <Link href="/" className="transition hover:text-ink">
            Catálogo
          </Link>
          <Link href="/vendedores" className="transition hover:text-ink">
            Vendedores
          </Link>
          <Link
            href="/carrito"
            className="relative flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2 text-ink transition hover:border-[#d12a18]"
          >
            Carrito
            {count > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d12a18] text-xs font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
