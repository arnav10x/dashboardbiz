import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'prspectve',
  description: 'A daily operating system for ambitious founders.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('strata-theme');if(t!=='dark'){document.documentElement.classList.add('theme-light');}}catch(e){}})();` }} />
      </head>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
