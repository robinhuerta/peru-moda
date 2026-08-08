import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perú & Moda',
  description: 'Marketplace exclusivo de gorras premium y streetwear.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
