import './globals.css';
import type { Metadata } from 'next';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Perú & Moda',
  description: 'Marketplace exclusivo de gorras premium y streetwear.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
