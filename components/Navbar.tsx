import Link from 'next/link'
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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand-700">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            3D Print Shop
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/listings" className="text-gray-600 hover:text-brand-600 text-sm font-medium transition-colors">
              Listings
            </Link>
            {user && (
              <Link href="/orders" className="text-gray-600 hover:text-brand-600 text-sm font-medium transition-colors">
                My Orders
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="text-gray-600 hover:text-brand-600 text-sm font-medium transition-colors">
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
