import type { Metadata } from 'next'
import { Tajawal, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-tajawal',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: {
    default: 'أثر | ATHR - عطور فاخرة بالتوصيل',
    template: '%s | أثر ATHR',
  },
  description: 'أثر ATHR - متجر عطور فاخرة أونلاين في مصر. اطلب عطرك واحنا بنوصله لباب بيتك.',
  keywords: 'أثر, ATHR, عطور, عطور فاخرة, عطور مصر, عطور توصيل, عطور اونلاين, عطر, perfume, Egypt perfume',
  authors: [{ name: 'ATHR Perfumes' }],
  creator: 'ATHR',
  publisher: 'ATHR Perfumes',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://athr-perfumes.vercel.app'),
  openGraph: {
    title: 'أثر | ATHR - عطور فاخرة بالتوصيل',
    description: 'اكتشف مجموعة أثر من العطور الفاخرة. توصيل لباب بيتك في مصر.',
    url: 'https://athr-perfumes.vercel.app',
    siteName: 'ATHR Perfumes',
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'أثر | ATHR - عطور فاخرة بالتوصيل',
    description: 'اكتشف مجموعة أثر من العطور الفاخرة. توصيل لباب بيتك في مصر.',
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
    google: 'rz5pNaKLcGue7H5nqnFgN0AXCPKMKLcjwRay3X4sPCw',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${tajawal.variable} ${playfair.variable} antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="bottom-center"
            richColors
            closeButton
            theme="dark"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                border: '1px solid #c9a84c',
                color: '#f5f0e8',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
