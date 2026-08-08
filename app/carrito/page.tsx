'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/cartStore';
import { parsePrice, formatPrice } from '@/lib/utils';
import { api, type CreateOrderPayload, type CreateOrderResult } from '@/lib/api';
import CheckoutForm from '@/components/CheckoutForm';

type Step = 'cart' | 'delivery' | 'confirmation';

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>('cart');
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<{ id: string; status: string; paymentMethod: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + parsePrice(item.product.price) * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitOrder = async (payload: Omit<CreateOrderPayload, 'items'>) => {
    setSubmitting(true);
    setOrderError(null);
    try {
      const result: CreateOrderResult = await api.createOrder({
        ...payload,
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      });
      if (!result.ok) {
        const names = result.unavailable.map((u) => u.name || 'un producto').join(', ');
        setOrderError(
          names
            ? `Ya no hay stock suficiente de: ${names}. Ajusta las cantidades en tu carrito.`
            : 'Ya no hay stock suficiente para completar el pedido. Ajusta las cantidades en tu carrito.'
        );
        setStep('cart');
        return;
      }
      setOrderResult({ id: result.id, status: result.status, paymentMethod: payload.payment.method });
      clearCart();
      setStep('confirmation');
    } catch {
      setOrderError('No se pudo procesar el pedido. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) {
    return null;
  }

  if (step === 'confirmation' && orderResult) {
    const message =
      orderResult.paymentMethod === 'cash'
        ? 'Tu pedido fue registrado. Pagarás en efectivo cuando lo recibas.'
        : 'Tu pedido fue recibido y está pendiente de confirmación mientras validamos tu comprobante de pago.';
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-950 px-6 text-center text-ink">
        <div className="max-w-md space-y-6">
          <span className="inline-flex rounded-full bg-[#d12a18]/15 px-4 py-2 text-sm uppercase tracking-[0.3em] text-[#d12a18]">
            Pedido confirmado
          </span>
          <h1 className="text-4xl font-black tracking-tight">¡Gracias por tu compra!</h1>
          <p className="text-lg text-ink/70">{message}</p>
          <p className="text-sm text-ink/40">Nº de pedido: {orderResult.id}</p>
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
    <main className="min-h-screen bg-brand-950 text-ink">
      <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 rounded-[32px] border border-ink/10 bg-brand-900 p-10 shadow-soft">
            <span className="inline-flex rounded-full bg-[#d12a18]/15 px-4 py-2 text-sm uppercase tracking-[0.3em] text-[#d12a18]">
              Tu compra
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-ink sm:text-5xl">
              {step === 'cart' ? 'Carrito' : 'Entrega y pago'}
            </h1>
          </div>

          {orderError && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
              {orderError}
            </div>
          )}

          {items.length === 0 ? (
            <div className="rounded-[32px] border border-ink/10 bg-brand-900 p-10 text-center">
              <p className="text-lg text-ink/70">Tu carrito está vacío.</p>
              <Link
                href="/"
                className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-slate-100"
              >
                Explorar catálogo
              </Link>
            </div>
          ) : step === 'cart' ? (
            <div className="space-y-6">
              {items.map((item) => {
                const atMaxStock = item.quantity >= item.product.stock;
                return (
                  <div
                    key={item.product.id}
                    className="flex flex-col gap-4 rounded-[32px] border border-ink/10 bg-brand-900 p-6 sm:flex-row sm:items-center"
                  >
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-900">
                      <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="96px" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-ink">{item.product.name}</h3>
                      <p className="text-[#d12a18] font-bold">{item.product.price}</p>
                      {atMaxStock && <p className="text-xs text-ink/40">Stock máximo alcanzado ({item.product.stock})</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 text-ink transition hover:border-[#d12a18]"
                      >
                        −
                      </button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={atMaxStock}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 text-ink transition hover:border-[#d12a18] disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                    <p className="w-24 text-right font-semibold text-ink">
                      {formatPrice(parsePrice(item.product.price) * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-sm text-ink/50 transition hover:text-[#d12a18]"
                    >
                      Eliminar
                    </button>
                  </div>
                );
              })}

              <div className="flex flex-col gap-4 rounded-[32px] border border-ink/10 bg-brand-900 p-8 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-ink/50">{totalItems} producto(s)</p>
                  <p className="text-3xl font-black text-ink">{formatPrice(subtotal)}</p>
                </div>
                <button
                  onClick={() => setStep('delivery')}
                  className="rounded-full bg-[#d12a18] px-8 py-4 text-lg font-semibold text-white transition hover:bg-red-600"
                >
                  Continuar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-[32px] border border-ink/10 bg-brand-900 p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-ink/50">Resumen</p>
                <p className="text-2xl font-black text-ink">{formatPrice(subtotal)} · {totalItems} producto(s)</p>
              </div>
              <CheckoutForm onSubmit={handleSubmitOrder} submitting={submitting} />
              <button
                onClick={() => setStep('cart')}
                className="text-sm text-ink/50 transition hover:text-[#d12a18]"
              >
                ← Volver al carrito
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
