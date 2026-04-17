'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import PasswordInput from '@/components/PasswordInput'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token) setError('Invalid reset link. Please request a new one.')
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    setError('')
    setLoading(true)

    const res = await fetch('/api/password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    setDone(true)
    setTimeout(() => router.push('/login'), 3000)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Set new password</h1>
          <p className="text-zinc-400 mt-1 text-sm">Choose a strong password for your account</p>
        </div>

        {done ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-green-900/50 border border-green-800/50 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-medium">Password updated!</p>
            <p className="text-sm text-zinc-400">Redirecting you to sign in…</p>
            <Link href="/login" className="btn-primary w-full block text-center mt-2">Sign In Now</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">New Password</label>
              <PasswordInput value={password} onChange={setPassword} required placeholder="At least 6 characters" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Confirm Password</label>
              <PasswordInput value={confirm} onChange={setConfirm} required placeholder="Repeat your password" />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading || !token} className="btn-primary w-full">
              {loading ? 'Saving…' : 'Set New Password'}
            </button>

            <Link href="/login" className="block text-center text-sm text-zinc-500 hover:text-zinc-300 transition-colors mt-2">
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
