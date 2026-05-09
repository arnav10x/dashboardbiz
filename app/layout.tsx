import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { AccentProvider } from '@/components/providers/AccentProvider'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Founder OS',
  description: '30-day performance coaching OS for beginner online service business founders.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={spaceGrotesk.variable} suppressHydrationWarning>
      <body className="antialiased font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AccentProvider>
            {children}
          </AccentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
