import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import Navbar from '@/components/Navbar'
import Providers from '@/components/Providers'
import PasswordChangeGate from '@/components/PasswordChangeGate'

export const metadata: Metadata = {
  title: {
    default: 'DrivenByFaith3D',
    template: '%s | DrivenByFaith3D',
  },
  description: 'Professional custom 3D printing services. Upload your STL, share an image, or describe your idea — we\'ll print it for you.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'DrivenByFaith3D',
    description: 'Professional custom 3D printing services.',
    siteName: 'DrivenByFaith3D',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-black text-white">
        <Providers>
          <Navbar />
          <PasswordChangeGate />
          <main className="flex-1">{children}</main>
          <footer className="bg-zinc-950 border-t border-zinc-800 text-zinc-500 text-sm py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>© {new Date().getFullYear()} DrivenByFaith3D. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms</Link>
                <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</Link>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
