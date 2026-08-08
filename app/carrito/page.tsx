'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/cartStore';
import { parsePrice, formatPrice } from '@/lib/utils';

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const [mounted, setMounted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = items.reduce((sum, item) => sum + parsePrice(item.product.price) * item.quantity, 0);

  const handleCheckout = () => {
    clearCart();
    setConfirmed(true);
  };

  if (!mounted) {
    return null;
  }

  if (confirmed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-950 px-6 text-center text-white">
        <div className="max-w-md space-y-6">
          <span className="inline-flex rounded-full bg-[#d12a18]/15 px-4 py-2 text-sm uppercase tracking-[0.3em] text-[#d12a18]">
            Pedido confirmado
          </span>
          <h1 className="text-4xl font-black tracking-tight">¡Gracias por tu compra!</h1>
          <p className="text-lg text-slate-300">
            Hemos recibido tu pedido y te contactaremos pronto para coordinar la entrega.
          </p>
          <Link
            href="/"
            className="inline-block rounded-full bg-white px-6 py-3 text-lg font-semibold text-black transition hover:bg-slate-100"
          >
            Seguir comprando
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-950 text-white">
      <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 rounded-[32px] border border-white/10 bg-brand-900 p-10 shadow-soft">
            <span className="inline-flex rounded-full bg-[#d12a18]/15 px-4 py-2 text-sm uppercase tracking-[0.3em] text-[#d12a18]">
              Tu compra
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl">Carrito</h1>
          </div>

          {items.length === 0 ? (
            <div className="rounded-[32px] border border-white/10 bg-brand-900 p-10 text-center">
              <p className="text-lg text-slate-300">Tu carrito está vacío.</p>
              <Link
                href="/"
                className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-slate-100"
              >
                Explorar catálogo
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex flex-col gap-4 rounded-[32px] border border-white/10 bg-brand-900 p-6 sm:flex-row sm:items-center"
                >
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-900">
                    <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="96px" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{item.product.name}</h3>
                    <p className="text-[#d12a18] font-bold">{item.product.price}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-[#d12a18]"
                    >
                      −
                    </button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-[#d12a18]"
                    >
                      +
                    </button>
                  </div>
                  <p className="w-24 text-right font-semibold text-white">
                    {formatPrice(parsePrice(item.product.price) * item.quantity)}
                  </p>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-sm text-slate-400 transition hover:text-[#d12a18]"
                  >
                    Eliminar
                  </button>
                </div>
              ))}

              <div className="flex flex-col gap-4 rounded-[32px] border border-white/10 bg-brand-900 p-8 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Total</p>
                  <p className="text-3xl font-black text-white">{formatPrice(total)}</p>
                </div>
                <button
                  onClick={handleCheckout}
                  className="rounded-full bg-[#d12a18] px-8 py-4 text-lg font-semibold text-white transition hover:bg-red-600"
                >
                  Finalizar compra
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
