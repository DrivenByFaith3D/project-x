import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'DrivenByFaith3D',
  description: 'Professional custom 3D printing services',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-black text-white">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="bg-zinc-950 border-t border-zinc-800 text-zinc-500 text-sm text-center py-6 mt-auto">
            © {new Date().getFullYear()} DrivenByFaith3D. All rights reserved.
          </footer>
        </Providers>
      </body>
    </html>
  )
}
