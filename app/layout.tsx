import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
