'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function NavbarClient({ user }: { user: User | null }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3">
      {user ? (
        <>
          <span className="text-sm text-gray-500 hidden sm:block truncate max-w-[160px]">
            {user.email}
          </span>
          <button onClick={handleSignOut} className="btn-secondary text-sm">
            Logout
          </button>
        </>
      ) : (
        <>
          <Link href="/login" className="btn-secondary text-sm">Login</Link>
          <Link href="/signup" className="btn-primary text-sm">Sign Up</Link>
        </>
      )}
    </div>
  )
}
