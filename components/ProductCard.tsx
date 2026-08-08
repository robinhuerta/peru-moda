'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/cartStore';

export type Product = {
  id: string;
  name: string;
  price: string;
  tag: string;
  image: string;
  slug: string; // Add slug for product detail page linking
  images: string[]; // Add for product gallery
  description: string; // Add for product detail page
  stock: number;
};

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleFavorite = useCartStore((state) => state.toggleFavorite);
  const favorites = useCartStore((state) => state.favorites);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isFavorite = mounted && favorites.includes(product.id);
  const outOfStock = product.stock <= 0;

  return (
    <article className="group overflow-hidden rounded-[32px] border border-ink/10 bg-brand-900 transition hover:-translate-y-1 hover:border-[#d12a18]/40 hover:shadow-soft">
      <Link href={`/producto/${product.slug}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-slate-900">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {outOfStock && (
            <span className="absolute left-4 top-4 rounded-full bg-black/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white">
              Agotado
            </span>
          )}
        </div>
      </Link>
      <div className="space-y-3 p-6">
        <span className="inline-flex rounded-full bg-ink/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-ink/70">{product.tag}</span>
        <h3 className="text-xl font-semibold text-ink">{product.name}</h3>
        <p className="text-lg font-bold text-[#d12a18]">{product.price}</p>
        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={() => addItem(product)}
            disabled={outOfStock}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {outOfStock ? 'Agotado' : 'Añadir'}
          </button>
          <button
            onClick={() => toggleFavorite(product.id)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              isFavorite
                ? 'border-[#d12a18] bg-[#d12a18]/15 text-[#d12a18]'
                : 'border-ink/20 text-ink hover:border-[#d12a18]'
            }`}
          >
            {isFavorite ? '♥ Favorito' : 'Favorito'}
          </button>
        </div>
      </div>
    </article>
  );
}
