import type { Metadata } from 'next';
import { COPY } from '@/lib/content';
import { APP_URL, EVENT } from '@/lib/event';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: COPY.page.title,
  description: COPY.page.metaDescription,
  openGraph: {
    title: COPY.page.title,
    description: COPY.page.metaDescription,
    siteName: EVENT.name,
    type: 'website',
    locale: 'en_AE',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* The two faces used above the fold. The Arabic face loads on demand. */}
        <link rel="preload" href="/fonts/poppins-700-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/inter-400-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
