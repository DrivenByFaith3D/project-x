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
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, street, city, state, zip }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error === 'ACCOUNT_EXISTS' ? 'ACCOUNT_EXISTS' : data.error)
      setLoading(false)
      return
    }

    if (data.needsVerification) {
      setNeedsVerification(true)
      setLoading(false)
      return
    }

    await signIn('credentials', { email, password, redirect: false })
    router.push('/orders')
    router.refresh()
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card p-8 w-full max-w-md">
        {needsVerification ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Check your email</h1>
            <p className="text-zinc-400 text-sm">
              We sent a verification link to <strong className="text-white">{email}</strong>. Click it to activate your account before signing in.
            </p>
            <p className="text-zinc-500 text-xs">Didn&apos;t receive it? Check your spam folder.</p>
            <Link href="/login" className="btn-secondary w-full inline-block text-center mt-2">Back to Sign In</Link>
          </div>
        ) : (
        <>
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

          {/* Optional address */}
          <div className="border-t border-zinc-800 pt-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Shipping Address <span className="normal-case font-normal text-zinc-600">(optional)</span></p>
            <div className="space-y-3">
              <input type="text" value={street} onChange={(e) => setStreet(e.target.value)}
                className="input" placeholder="Street address" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                  className="input" placeholder="City" />
                <input type="text" value={state} onChange={(e) => setState(e.target.value)}
                  className="input" placeholder="State" />
              </div>
              <input type="text" value={zip} onChange={(e) => setZip(e.target.value)}
                className="input" placeholder="ZIP code" />
            </div>
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
        </>
        )}
      </div>
    </div>
  )
}
