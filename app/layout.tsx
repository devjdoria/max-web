import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Para Maxime — 21 vueltas al sol',
  description: 'Un pequeño universo de recuerdos, viajes y sorpresas para Maxime.',
  openGraph: { title: 'Para Maxime — 21 vueltas al sol', description: 'Un pequeño universo de recuerdos, viajes y sorpresas para Maxime.', images: [{ url: '/og.png', width: 1672, height: 941, alt: 'Para Maxime — 21 vueltas al sol' }] },
  twitter: { card: 'summary_large_image', title: 'Para Maxime — 21 vueltas al sol', description: 'Un pequeño universo de recuerdos, viajes y sorpresas para Maxime.', images: ['/og.png'] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
