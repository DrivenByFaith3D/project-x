import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: '3D Print Shop',
  description: 'Professional custom 3D printing services',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="bg-gray-900 text-gray-400 text-sm text-center py-6 mt-auto">
          © {new Date().getFullYear()} 3D Print Shop. All rights reserved.
        </footer>
      </body>
    </html>
  )
}
