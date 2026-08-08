const API_URL = process.env.API_URL || 'https://peru-moda-api.robinhuerta.workers.dev';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.error('Set ADMIN_PASSWORD env var before running the seed script.');
  process.exit(1);
}

const vendors = [
  {
    name: 'Lima Caps',
    slug: 'lima-caps',
    description: 'Drops exclusivos con diseño urbano y manufactura premium.',
    rating: 4.9,
    sales: 240,
    cover: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
    logo: '',
  },
  {
    name: 'Cuzco Street',
    slug: 'cuzco-street',
    description: 'Gorras con actitud streetwear y materiales selectos.',
    rating: 4.8,
    sales: 180,
    cover: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80',
    logo: '',
  },
  {
    name: 'Andean Hype',
    slug: 'andean-hype',
    description: 'Modelos limitados con detalles de edición premium.',
    rating: 4.7,
    sales: 152,
    cover: 'https://images.unsplash.com/photo-1515876305429-71ec17a4191e?auto=format&fit=crop&w=1200&q=80',
    logo: '',
  },
];

for (let i = 0; i < vendors.length; i++) {
  const vendor = vendors[i];
  const res = await fetch(`${API_URL}/api/vendors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Password': ADMIN_PASSWORD },
    body: JSON.stringify({ ...vendor, activo: true, orden: i }),
  });
  const data = await res.json();
  console.log(res.status, vendor.name, data);
}
