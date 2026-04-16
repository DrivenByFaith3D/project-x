'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import PasswordInput from '@/components/PasswordInput'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error === 'ACCOUNT_EXISTS' ? 'ACCOUNT_EXISTS' : data.error)
      setLoading(false)
      return
    }

    // Auto sign in after signup
    await signIn('credentials', { email, password, redirect: false })
    router.push('/orders')
    router.refresh()
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="DrivenByFaith3D" width={64} height={64} className="mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="text-zinc-400 mt-1 text-sm">Start printing your ideas today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="input" placeholder="First and last name" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="input" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Password</label>
            <PasswordInput value={password} onChange={setPassword} placeholder="At least 6 characters" minLength={6} required />
          </div>

          {error === 'ACCOUNT_EXISTS' ? (
            <div className="text-sm bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-300">
              An account with this email already exists.{' '}
              <Link href="/login" className="text-white font-medium hover:underline">Sign in instead</Link>
              <span className="block mt-1 text-zinc-500 text-xs">
                Forgot your password? Contact us and we'll reset it for you.
              </span>
            </div>
          ) : error ? (
            <p className="text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">{error}</p>
          ) : null}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-white font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
