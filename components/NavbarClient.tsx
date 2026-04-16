'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

interface User {
  id: string
  email: string
  role: string
  name?: string | null
}

export default function NavbarClient({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center gap-3">
      {user ? (
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <span className="hidden sm:block font-medium">
              {user.name ? user.name.split(' ')[0] : user.email}
            </span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-44 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg z-50 overflow-hidden">
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Settings
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <Link href="/login" className="btn-secondary text-sm">Login</Link>
          <Link href="/signup" className="btn-primary text-sm">Sign Up</Link>
        </>
      )}
    </div>
  )
}
