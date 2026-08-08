const API_URL = process.env.API_URL || 'https://peru-moda-api.robinhuerta.workers.dev';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.error('Set ADMIN_PASSWORD env var before running the seed script.');
  process.exit(1);
}

const vendorSlugs = ['lima-caps', 'cuzco-street', 'andean-hype'];

const products = [
  {
    name: 'Snapback Lima Edition',
    price: 'S/ 189',
    tag: 'Nuevo',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
    slug: 'snapback-lima-edition',
    images: [
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1588806536034-e40562e15316?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'La Snapback Lima Edition es la gorra perfecta para el estilo urbano. Confeccionada con materiales de alta calidad y un diseño moderno que rinde homenaje a la capital peruana. Ideal para complementar tu outfit streetwear.',
  },
  {
    name: 'Trucker Gold',
    price: 'S/ 149',
    tag: 'Top ventas',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80',
    slug: 'trucker-gold',
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515876305429-71ec17a4191e?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'La Trucker Gold combina un diseño clásico con un toque de lujo. Ideal para quienes buscan un accesorio distintivo y cómodo para el día a día. Su malla transpirable la hace perfecta para cualquier clima.',
  },
  {
    name: 'Dad Hat Cusco',
    price: 'S/ 129',
    tag: 'Edición limitada',
    image: 'https://images.unsplash.com/photo-1515876305429-71ec17a4191e?auto=format&fit=crop&w=1200&q=80',
    slug: 'dad-hat-cusco',
    images: [
      'https://images.unsplash.com/photo-1515876305429-71ec17a4191e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'La Dad Hat Cusco es una pieza de colección que fusiona la comodidad de una gorra clásica con la mística de la cultura inca. Perfecta para un look casual y auténtico, con bordados sutiles.',
  },
  {
    name: 'Bucket Hat Arequipa',
    price: 'S/ 99',
    tag: 'Nuevo',
    image: 'https://images.unsplash.com/photo-1588806536034-e40562e15316?auto=format&fit=crop&w=1200&q=80',
    slug: 'bucket-hat-arequipa',
    images: [
      'https://images.unsplash.com/photo-1588806536034-e40562e15316?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515876305429-71ec17a4191e?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'El Bucket Hat Arequipa es el accesorio ideal para protegerte del sol con estilo. Su diseño versátil y materiales ligeros lo hacen indispensable para cualquier aventura urbana o de playa.',
  },
];

for (let i = 0; i < products.length; i++) {
  const product = products[i];
  const res = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Password': ADMIN_PASSWORD },
    body: JSON.stringify({ ...product, vendor_slug: vendorSlugs[i % vendorSlugs.length], activo: true, orden: i }),
  });
  const data = await res.json();
  console.log(res.status, product.name, data);
}
