import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import PWAInstaller, { PWAFeatures } from './components/PWAInstaller';
import '../src/index.css';

export const metadata: Metadata = {
  title: {
    default: 'Onward Dominicans - Dominican Community News & Culture',
    template: '%s | Onward Dominicans',
  },
  description: 'Stay connected with Dominican community news, cultural events, and stories that celebrate our rich heritage and vibrant traditions.',
  keywords: [
    'Dominican community',
    'Dominican culture',
    'Dominican news',
    'merengue',
    'bachata',
    'Dominican food',
    'mangu',
    'Dominican independence',
    'Caribbean culture',
    'Latino community'
  ],
  authors: [{ name: 'Onward Dominicans Editorial Team' }],
  creator: 'Onward Dominicans',
  publisher: 'Onward Dominicans',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://odmailsu.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://odmailsu.vercel.app',
    siteName: 'Onward Dominicans',
    title: 'Onward Dominicans - Dominican Community News & Culture',
    description: 'Stay connected with Dominican community news, cultural events, and stories that celebrate our rich heritage and vibrant traditions.',
    images: [
      {
        url: '/favicon.ico',
        width: 1200,
        height: 630,
        alt: 'Onward Dominicans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Onward Dominicans - Dominican Community News & Culture',
    description: 'Stay connected with Dominican community news, cultural events, and stories that celebrate our rich heritage and vibrant traditions.',
    images: ['/favicon.ico'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google25e0604217c35b35',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Onward Dominicans",
              "url": "https://odmailsu.vercel.app",
              "logo": "https://odmailsu.vercel.app/favicon.ico",
              "description": "Dominican community news, culture, and events",
              "sameAs": [],
              "keywords": "Dominican community, Dominican culture, Dominican news, merengue, bachata, Dominican food, mangu, Dominican independence, Caribbean culture, Latino community",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "US"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Editorial",
                "email": "contact@onwarddominicans.com"
              }
            })
          }}
        />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Additional meta tags */}
        <meta name="theme-color" content="#1e293b" />
        <meta name="msapplication-TileColor" content="#1e293b" />

        {/* PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Onward Dominicans" />
        <meta name="application-name" content="Onward Dominicans" />
        <meta name="msapplication-tooltip" content="Dominican Community News" />
        <meta name="msapplication-starturl" content="/" />
      </head>
      <body className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        {children}
        <PWAInstaller />
        <PWAFeatures />
        <Analytics />
      </body>
    </html>
  );
}
