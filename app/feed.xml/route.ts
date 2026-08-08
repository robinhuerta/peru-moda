import { api } from '@/lib/api';
import { parsePrice } from '@/lib/utils';

export const revalidate = 1800;

const SITE_URL = 'https://peru-moda.vercel.app';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const [products, vendors] = await Promise.all([
    api.listProducts({ revalidate: 1800 }),
    api.listVendors({ revalidate: 1800 }),
  ]);

  const vendorNameBySlug = new Map(vendors.map((v) => [v.slug, v.name]));

  const items = products
    .map((p) => {
      const price = parsePrice(p.price).toFixed(2);
      const availability = p.stock > 0 ? 'in stock' : 'out of stock';
      const brand = vendorNameBySlug.get(p.vendorSlug) ?? 'Perú & Moda';

      return `
    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <title>${escapeXml(p.name)}</title>
      <description>${escapeXml(p.description || p.name)}</description>
      <link>${SITE_URL}/producto/${escapeXml(p.slug)}</link>
      <g:image_link>${escapeXml(p.image)}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${price} PEN</g:price>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category>Apparel &amp; Accessories &gt; Clothing Accessories &gt; Hats</g:google_product_category>
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Perú &amp; Moda</title>
    <link>${SITE_URL}</link>
    <description>Catálogo de productos de Perú &amp; Moda</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
