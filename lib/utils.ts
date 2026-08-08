export function parsePrice(price: string): number {
  const digits = price.replace(/[^0-9.]/g, '');
  return parseFloat(digits) || 0;
}

export function formatPrice(amount: number): string {
  return `S/ ${amount.toFixed(2).replace(/\.00$/, '')}`;
}

const ACCENTS: Record<string, string> = {
  á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ñ: 'n', ü: 'u',
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .split('')
    .map((char) => ACCENTS[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
