import Image from 'next/image';
import Link from 'next/link';

const products = [
  {
    name: 'Snapback Lima Edition',
    price: 'S/ 189',
    tag: 'Nuevo',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Trucker Gold',
    price: 'S/ 149',
    tag: 'Top ventas',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Dad Hat Cusco',
    price: 'S/ 129',
    tag: 'Edición limitada',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80'
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-950 text-white">
      <section className="relative overflow-hidden bg-brand-900">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(209,42,24,0.35),transparent_50%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-16 sm:px-10 lg:px-16">
          <span className="mb-7 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm uppercase tracking-[0.4em] text-white/80">
            Marketplace de gorras</span>
          <h1 className="max-w-3xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            Tu estilo, tu gorra. <span className="text-[#d12a18]">Perú & Moda</span> redefine el streetwear.</h1>
          <p className="mt-8 max-w-2xl text-lg text-slate-300 sm:text-xl">
            Descubre gorras premium, ediciones limitadas y sellers exclusivos en un solo lugar. Explora, guarda y compra con experiencia exprés.
          </p>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Link href="/vendedores" className="inline-flex items-center justify-center rounded-full bg-[#d12a18] px-8 py-4 text-base font-semibold text-white transition hover:bg-red-600">
              Ver vendedores</Link>
            <Link href="/vendedores" className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white transition hover:border-white/40">
              Ver tienda
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-brand-950 px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Colecciones</p>
              <h2 className="mt-2 text-3xl font-bold text-white">Descubre por estilo</h2>
            </div>
            <div className="hidden md:block text-sm text-slate-400">Snapback · Trucker · Dad hat · Bucket · Bordadas</div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {products.map((product) => (
              <article key={product.name} className="group overflow-hidden rounded-[32px] border border-white/10 bg-brand-900 transition hover:-translate-y-1 hover:border-[#d12a18]/40 hover:shadow-soft">
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-900">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="space-y-3 p-6">
                  <span className="inline-flex rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">{product.tag}</span>
                  <h3 className="text-xl font-semibold text-white">{product.name}</h3>
                  <p className="text-lg font-bold text-[#d12a18]">{product.price}</p>
                  <div className="flex items-center gap-3 pt-4">
                    <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-slate-100">Añadir</button>
                    <button className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-[#d12a18]">Favorito</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="vendedores" className="bg-brand-900 px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Vendedores</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Sellers premium</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {['Lima Caps', 'Cuzco Street', 'Andean Hype', 'Barrio Premium'].map((name) => (
              <div key={name} className="rounded-[28px] border border-white/10 bg-brand-950 p-6 text-center transition hover:bg-brand-800">
                <div className="mb-4 h-24 w-24 rounded-full bg-white/5" />
                <h3 className="text-xl font-semibold text-white">{name}</h3>
                <p className="mt-2 text-sm text-slate-400">Estilo único y drops exclusivos.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
