import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import NavbarClient from './NavbarClient'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  return (
    <nav className="bg-black border-b border-zinc-800 sticky top-0 z-50">
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
            {user && (
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

          <NavbarClient user={user} />
        </div>
      </div>
    </nav>
  )
}
