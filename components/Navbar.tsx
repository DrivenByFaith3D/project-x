import Link from 'next/link'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import NavbarClient from './NavbarClient'

export default async function Navbar() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === 'admin'

  return (
    <nav className="bg-zinc-900/90 backdrop-blur-md border-b border-zinc-700/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="DrivenByFaith3D Logo" width={40} height={40} className="object-contain" />
            <span className="font-bold text-lg text-white hidden sm:block">DrivenByFaith3D</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/listings" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors">
              Listings
            </Link>
            {session && (
              <Link href="/orders" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors">
                My Orders
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors">
                Admin
              </Link>
            )}
          </div>

          <NavbarClient user={session?.user ?? null} />
        </div>
      </div>
    </nav>
  )
}
