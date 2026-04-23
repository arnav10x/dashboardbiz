import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
