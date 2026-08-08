'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { company } from '@/lib/company';

type ClaimRecord = {
  code: string;
  fecha: string;
  nombre: string;
  documento: string;
  numeroDocumento: string;
  domicilio: string;
  telefono: string;
  email: string;
  esMenor: boolean;
  apoderado: string;
  tipoBien: string;
  monto: string;
  descripcionBien: string;
  tipoReclamo: string;
  detalle: string;
  pedido: string;
};

function generateCode() {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  return `RC-${stamp}`;
}

export default function ComplaintBookPage() {
  const [submitted, setSubmitted] = useState<ClaimRecord | null>(null);
  const [esMenor, setEsMenor] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const record: ClaimRecord = {
      code: generateCode(),
      fecha: new Date().toLocaleDateString('es-PE'),
      nombre: String(data.get('nombre') ?? ''),
      documento: String(data.get('documento') ?? ''),
      numeroDocumento: String(data.get('numeroDocumento') ?? ''),
      domicilio: String(data.get('domicilio') ?? ''),
      telefono: String(data.get('telefono') ?? ''),
      email: String(data.get('email') ?? ''),
      esMenor,
      apoderado: String(data.get('apoderado') ?? ''),
      tipoBien: String(data.get('tipoBien') ?? ''),
      monto: String(data.get('monto') ?? ''),
      descripcionBien: String(data.get('descripcionBien') ?? ''),
      tipoReclamo: String(data.get('tipoReclamo') ?? ''),
      detalle: String(data.get('detalle') ?? ''),
      pedido: String(data.get('pedido') ?? ''),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('libroReclamaciones') ?? '[]');
      localStorage.setItem('libroReclamaciones', JSON.stringify([...existing, record]));
    } catch {
      // localStorage no disponible; el registro solo se muestra en pantalla
    }

    setSubmitted(record);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-brand-950 px-6 py-16 text-white sm:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl space-y-8 rounded-[32px] border border-white/10 bg-brand-900 p-10 shadow-soft print:border-0 print:bg-white print:text-black">
          <div>
            <span className="inline-flex rounded-full bg-[#d12a18]/15 px-4 py-2 text-sm uppercase tracking-[0.3em] text-[#d12a18]">
              Reclamo registrado
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight">Código: {submitted.code}</h1>
            <p className="mt-2 text-slate-300 print:text-black">
              Fecha de registro: {submitted.fecha}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="text-sm uppercase tracking-[0.2em] text-slate-400 print:text-black">Proveedor</h2>
              <p className="mt-2 text-slate-200 print:text-black">{company.razonSocial}</p>
              <p className="text-slate-200 print:text-black">RUC: {company.ruc}</p>
              <p className="text-slate-200 print:text-black">{company.direccion}</p>
            </div>
            <div>
              <h2 className="text-sm uppercase tracking-[0.2em] text-slate-400 print:text-black">Consumidor</h2>
              <p className="mt-2 text-slate-200 print:text-black">{submitted.nombre}</p>
              <p className="text-slate-200 print:text-black">{submitted.documento} {submitted.numeroDocumento}</p>
              <p className="text-slate-200 print:text-black">{submitted.domicilio}</p>
              <p className="text-slate-200 print:text-black">{submitted.telefono} · {submitted.email}</p>
              {submitted.esMenor && (
                <p className="text-slate-200 print:text-black">Apoderado: {submitted.apoderado}</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm uppercase tracking-[0.2em] text-slate-400 print:text-black">Bien contratado</h2>
            <p className="mt-2 text-slate-200 print:text-black">Tipo: {submitted.tipoBien} · Monto reclamado: S/ {submitted.monto || '0'}</p>
            <p className="text-slate-200 print:text-black">{submitted.descripcionBien}</p>
          </div>

          <div>
            <h2 className="text-sm uppercase tracking-[0.2em] text-slate-400 print:text-black">Detalle del {submitted.tipoReclamo}</h2>
            <p className="mt-2 whitespace-pre-wrap text-slate-200 print:text-black">{submitted.detalle}</p>
          </div>

          <div>
            <h2 className="text-sm uppercase tracking-[0.2em] text-slate-400 print:text-black">Pedido del consumidor</h2>
            <p className="mt-2 whitespace-pre-wrap text-slate-200 print:text-black">{submitted.pedido}</p>
          </div>

          <p className="text-sm text-slate-400 print:text-black">
            De acuerdo con el Código de Protección y Defensa del Consumidor, el proveedor deberá dar respuesta
            en un plazo no mayor a 30 días calendario. Guarda este código para hacer seguimiento a tu reclamo.
          </p>

          <div className="flex flex-wrap gap-4 print:hidden">
            <button
              onClick={() => window.print()}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-slate-100"
            >
              Imprimir / Guardar PDF
            </button>
            <Link
              href="/"
              className="rounded-full border border-white/20 px-6 py-3 text-sm text-white transition hover:border-[#d12a18]"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-950 px-6 py-16 text-white sm:px-10 lg:px-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 rounded-[32px] border border-white/10 bg-brand-900 p-10 shadow-soft">
          <span className="inline-flex rounded-full bg-[#d12a18]/15 px-4 py-2 text-sm uppercase tracking-[0.3em] text-[#d12a18]">
            Libro de Reclamaciones
          </span>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">Libro de Reclamaciones Virtual</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            Conforme al Código de Protección y Defensa del Consumidor (Ley N.º 29571). La presentación de un reclamo
            no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante INDECOPI.
          </p>
          <div className="mt-6 grid gap-1 text-sm text-slate-300">
            <p><strong className="text-white">Razón social:</strong> {company.razonSocial}</p>
            <p><strong className="text-white">RUC:</strong> {company.ruc}</p>
            <p><strong className="text-white">Dirección:</strong> {company.direccion}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <fieldset className="space-y-4 rounded-[32px] border border-white/10 bg-brand-900 p-8">
            <legend className="px-2 text-lg font-semibold text-white">1. Datos del consumidor reclamante</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="nombre" required placeholder="Nombres y apellidos" className="input" />
              <div className="flex gap-2">
                <select name="documento" required className="input w-32">
                  <option value="DNI">DNI</option>
                  <option value="CE">CE</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
                <input name="numeroDocumento" required placeholder="Número de documento" className="input flex-1" />
              </div>
              <input name="domicilio" required placeholder="Domicilio" className="input sm:col-span-2" />
              <input name="telefono" required placeholder="Teléfono" className="input" />
              <input type="email" name="email" required placeholder="Correo electrónico" className="input" />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={esMenor} onChange={(e) => setEsMenor(e.target.checked)} />
              El reclamante es menor de edad
            </label>
            {esMenor && (
              <input name="apoderado" required placeholder="Nombre del padre, madre o apoderado" className="input" />
            )}
          </fieldset>

          <fieldset className="space-y-4 rounded-[32px] border border-white/10 bg-brand-900 p-8">
            <legend className="px-2 text-lg font-semibold text-white">2. Datos del bien contratado</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <select name="tipoBien" required className="input">
                <option value="Producto">Producto</option>
                <option value="Servicio">Servicio</option>
              </select>
              <input name="monto" type="number" min="0" step="0.01" placeholder="Monto reclamado (S/)" className="input" />
            </div>
            <textarea
              name="descripcionBien"
              required
              rows={2}
              placeholder="Describe el producto o servicio (ej. Snapback Lima Edition, pedido #123)"
              className="input"
            />
          </fieldset>

          <fieldset className="space-y-4 rounded-[32px] border border-white/10 bg-brand-900 p-8">
            <legend className="px-2 text-lg font-semibold text-white">3. Detalle de la reclamación</legend>
            <div className="flex gap-6 text-sm text-slate-300">
              <label className="flex items-center gap-2">
                <input type="radio" name="tipoReclamo" value="Reclamo" defaultChecked required />
                Reclamo (disconformidad con el producto o servicio)
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="tipoReclamo" value="Queja" required />
                Queja (disconformidad con la atención)
              </label>
            </div>
            <textarea
              name="detalle"
              required
              rows={4}
              placeholder="Describe con detalle lo ocurrido"
              className="input"
            />
          </fieldset>

          <fieldset className="space-y-4 rounded-[32px] border border-white/10 bg-brand-900 p-8">
            <legend className="px-2 text-lg font-semibold text-white">4. Pedido del consumidor</legend>
            <textarea
              name="pedido"
              required
              rows={3}
              placeholder="¿Qué solución esperas? (ej. reembolso, cambio de producto, etc.)"
              className="input"
            />
          </fieldset>

          <label className="flex items-start gap-3 text-sm text-slate-300">
            <input type="checkbox" required className="mt-1" />
            Declaro que la información consignada es veraz y autorizo su tratamiento para la atención de este reclamo.
          </label>

          <button
            type="submit"
            className="w-full rounded-full bg-[#d12a18] px-8 py-4 text-lg font-semibold text-white transition hover:bg-red-600 sm:w-auto"
          >
            Enviar reclamo
          </button>
        </form>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.03);
          padding: 0.75rem 1rem;
          color: white;
        }
        .input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        .input:focus {
          outline: none;
          border-color: #d12a18;
        }
      `}</style>
    </main>
  );
}
