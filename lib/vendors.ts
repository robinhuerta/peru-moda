import { slugify } from '@/lib/utils';

export type Vendor = {
  name: string;
  slug: string;
  description: string;
  rating: number;
  sales: number;
  cover: string;
};

const rawVendors: Omit<Vendor, 'slug'>[] = [
  {
    name: 'Lima Caps',
    description: 'Drops exclusivos con diseño urbano y manufactura premium.',
    rating: 4.9,
    sales: 240,
    cover: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Cuzco Street',
    description: 'Gorras con actitud streetwear y materiales selectos.',
    rating: 4.8,
    sales: 180,
    cover: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Andean Hype',
    description: 'Modelos limitados con detalles de edición premium.',
    rating: 4.7,
    sales: 152,
    cover: 'https://images.unsplash.com/photo-1515876305429-71ec17a4191e?auto=format&fit=crop&w=1200&q=80',
  },
];

export const vendors: Vendor[] = rawVendors.map((vendor) => ({
  ...vendor,
  slug: slugify(vendor.name),
}));
