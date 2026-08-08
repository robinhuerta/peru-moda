'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCartStore } from '@/lib/cartStore';
import type { Product } from '@/components/ProductCard';

const SIZES = ['S/M', 'M/L', 'L/XL'];

export default function ProductActions({ product }: { product: Product }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [size, setSize] = useState(SIZES[1]);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (!addItem(product)) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (!addItem(product)) return;
    router.push('/carrito');
  };

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-ink">Talla</h2>
        <div className="flex flex-wrap gap-3">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                size === s
                  ? 'border-[#d12a18] bg-[#d12a18]/15 text-[#d12a18]'
                  : 'border-ink/20 text-ink hover:border-[#d12a18]'
              }`}
            >
              Talla {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-4 sm:flex-row">
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="flex-1 rounded-full bg-white px-6 py-3 text-lg font-semibold text-black transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {outOfStock ? 'Agotado' : added ? '✓ Añadido' : 'Añadir al carrito'}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="flex-1 rounded-full border border-[#d12a18] bg-[#d12a18] px-6 py-3 text-lg font-semibold text-white transition hover:border-red-600 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Comprar ahora
        </button>
      </div>
    </>
  );
}
