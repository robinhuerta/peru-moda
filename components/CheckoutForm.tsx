'use client';

import { useRef, useState } from 'react';
import { api, type CreateOrderPayload, type DeliveryMethod, type PaymentMethod } from '@/lib/api';
import { PERU_DEPARTMENTS } from '@/lib/peruLocations';

const PAYMENT_INFO: Record<Exclude<PaymentMethod, 'cash'>, { label: string; detail: string }> = {
  yape: { label: 'Yape', detail: '987 654 321 - Perú & Moda' },
  plin: { label: 'Plin', detail: '987 654 321 - Perú & Moda' },
  transfer: { label: 'Transferencia bancaria', detail: 'BCP Cuenta Corriente 191-1234567-0-12' },
};

const INPUT_CLASS =
  'w-full rounded-xl border border-ink/20 bg-brand-950 px-4 py-3 text-ink placeholder:text-ink/40 focus:border-[#d12a18] focus:outline-none';

type CheckoutFormProps = {
  onSubmit: (payload: Omit<CreateOrderPayload, 'items'>) => Promise<void>;
  submitting: boolean;
};

export default function CheckoutForm({ onSubmit, submitting }: CheckoutFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dni, setDni] = useState('');
  const [department, setDepartment] = useState(PERU_DEPARTMENTS[14]); // Lima
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [addressReference, setAddressReference] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('yape');
  const [notes, setNotes] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [proofUploading, setProofUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const proofFileRef = useRef<HTMLInputElement>(null);

  const needsProof = paymentMethod !== 'cash';

  const handleProofUpload = async (file: File) => {
    setProofUploading(true);
    setFormError(null);
    try {
      const url = await api.uploadProof(file);
      setProofUrl(url);
    } catch {
      setFormError('No se pudo subir el comprobante. Intenta de nuevo.');
    } finally {
      setProofUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      setFormError('Completa tu nombre y teléfono.');
      return;
    }
    if (deliveryMethod === 'delivery' && (!province.trim() || !district.trim() || !address.trim())) {
      setFormError('Completa provincia, distrito y dirección para el envío.');
      return;
    }
    if (needsProof && !proofUrl) {
      setFormError('Sube el comprobante de pago para continuar.');
      return;
    }
    setFormError(null);
    await onSubmit({
      customer: { name: name.trim(), phone: phone.trim(), dni: dni.trim() },
      delivery: {
        department,
        province: province.trim(),
        district: district.trim(),
        address: address.trim(),
        addressReference: addressReference.trim(),
        method: deliveryMethod,
      },
      payment: { method: paymentMethod, proofUrl },
      notes: notes.trim(),
    });
  };

  return (
    <div className="space-y-6 rounded-[32px] border border-ink/10 bg-brand-900 p-8">
      <h2 className="text-2xl font-bold text-ink">Datos de entrega y pago</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-ink/70">Nombre completo *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={INPUT_CLASS} placeholder="Ej: María Torres" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink/70">Teléfono *</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={INPUT_CLASS} placeholder="987 654 321" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink/70">DNI</label>
          <input value={dni} onChange={(e) => setDni(e.target.value)} className={INPUT_CLASS} placeholder="12345678" />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-ink/70">Método de entrega</label>
        <div className="flex gap-3">
          {(['delivery', 'pickup'] as DeliveryMethod[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setDeliveryMethod(m)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                deliveryMethod === m ? 'border-[#d12a18] bg-[#d12a18]/15 text-[#d12a18]' : 'border-ink/20 text-ink hover:border-[#d12a18]'
              }`}
            >
              {m === 'delivery' ? 'Delivery a domicilio' : 'Recojo en tienda'}
            </button>
          ))}
        </div>
      </div>

      {deliveryMethod === 'delivery' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm text-ink/70">Departamento *</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className={INPUT_CLASS}>
              {PERU_DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink/70">Provincia *</label>
            <input value={province} onChange={(e) => setProvince(e.target.value)} className={INPUT_CLASS} placeholder="Ej: Lima" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink/70">Distrito *</label>
            <input value={district} onChange={(e) => setDistrict(e.target.value)} className={INPUT_CLASS} placeholder="Ej: Miraflores" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-ink/70">Dirección completa *</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className={INPUT_CLASS} placeholder="Av. Siempre Viva 123" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink/70">Referencia</label>
            <input value={addressReference} onChange={(e) => setAddressReference(e.target.value)} className={INPUT_CLASS} placeholder="Frente al parque" />
          </div>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm text-ink/70">Método de pago</label>
        <div className="flex flex-wrap gap-3">
          {([
            ['yape', 'Yape'],
            ['plin', 'Plin'],
            ['transfer', 'Transferencia'],
            ['cash', 'Contra entrega'],
          ] as [PaymentMethod, string][]).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setPaymentMethod(value)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                paymentMethod === value ? 'border-[#d12a18] bg-[#d12a18]/15 text-[#d12a18]' : 'border-ink/20 text-ink hover:border-[#d12a18]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {needsProof && (
        <div className="rounded-2xl border border-ink/10 bg-brand-950 p-5">
          <p className="text-sm text-ink/70">
            Paga a: <strong className="text-ink">{PAYMENT_INFO[paymentMethod as Exclude<PaymentMethod, 'cash'>].detail}</strong>
          </p>
          <label className="mb-2 mt-4 block text-sm text-ink/70">Comprobante de pago *</label>
          {proofUrl ? (
            <p className="text-sm text-[#d12a18]">✓ Comprobante subido</p>
          ) : (
            <button
              type="button"
              onClick={() => proofFileRef.current?.click()}
              className="rounded-full border border-dashed border-ink/30 px-4 py-2 text-sm text-ink/70 transition hover:border-[#d12a18] hover:text-[#d12a18]"
            >
              {proofUploading ? 'Subiendo...' : 'Subir comprobante'}
            </button>
          )}
          <input
            ref={proofFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleProofUpload(e.target.files[0])}
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm text-ink/70">Observaciones (opcional)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={INPUT_CLASS} placeholder="Indicaciones adicionales..." />
      </div>

      {formError && <p className="text-sm text-red-500">{formError}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting || proofUploading}
        className="w-full rounded-full bg-[#d12a18] px-8 py-4 text-lg font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Enviando pedido...' : 'Confirmar pedido'}
      </button>
    </div>
  );
}
