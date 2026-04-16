'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import PasswordInput from '@/components/PasswordInput'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/orders'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [showForgot, setShowForgot] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetName, setResetName] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetDone, setResetDone] = useState(false)
  const [resetError, setResetError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await signIn('credentials', { email, password, redirect: false })

    if (res?.error) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault()
    setResetError('')
    setResetLoading(true)

    const res = await fetch('/api/password-reset-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetEmail, name: resetName }),
    })

    const data = await res.json()
    if (!res.ok) {
      setResetError(data.error)
      setResetLoading(false)
      return
    }

    setResetDone(true)
    setResetLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="DrivenByFaith3D" width={64} height={64} className="mx-auto mb-4 object-contain" />
          {showForgot ? (
            <>
              <h1 className="text-2xl font-bold text-white">Forgot password?</h1>
              <p className="text-zinc-400 mt-1 text-sm">Enter the email and name on your account</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white">Welcome back</h1>
              <p className="text-zinc-400 mt-1 text-sm">Sign in to your account</p>
            </>
          )}
        </div>

        {!showForgot ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input" placeholder="you@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Password</label>
                <PasswordInput value={password} onChange={setPassword} required />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">{error}</p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <button
              onClick={() => { setShowForgot(true); setResetEmail(email) }}
              className="w-full text-center text-sm text-zinc-500 hover:text-zinc-300 transition-colors mt-4"
            >
              Forgot your password?
            </button>

            <p className="text-center text-sm text-zinc-500 mt-4">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-white font-medium hover:underline">Sign up</Link>
            </p>
          </>
        ) : resetDone ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-medium">Request sent!</p>
            <p className="text-sm text-zinc-400">
              We received your request. Once we verify your info, we'll reset your password and you'll be able to log in.
            </p>
            <button onClick={() => { setShowForgot(false); setResetDone(false) }}
              className="btn-secondary w-full mt-2">
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleResetRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
                <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                  className="input" placeholder="you@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Name on file</label>
                <input type="text" value={resetName} onChange={(e) => setResetName(e.target.value)}
                  className="input" placeholder="First and last name" required />
              </div>

              {resetError && (
                <p className="text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">{resetError}</p>
              )}

              <button type="submit" disabled={resetLoading} className="btn-primary w-full">
                {resetLoading ? 'Sending…' : 'Send Reset Request'}
              </button>
            </form>

            <button onClick={() => setShowForgot(false)}
              className="w-full text-center text-sm text-zinc-500 hover:text-zinc-300 transition-colors mt-4">
              Back to sign in
            </button>
          </>
        )}
      </div>
    </div>
  )
}
