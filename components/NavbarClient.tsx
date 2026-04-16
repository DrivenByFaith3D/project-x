'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface User {
  id: string
  email: string
  role: string
}

export default function NavbarClient({ user }: { user: User | null }) {
  return (
    <div className="flex items-center gap-3">
      {user ? (
        <>
          <span className="text-sm text-zinc-500 hidden sm:block truncate max-w-[160px]">
            {user.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="btn-secondary text-sm"
          >
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
