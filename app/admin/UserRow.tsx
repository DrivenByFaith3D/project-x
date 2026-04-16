'use client'

import { useState } from 'react'
import PasswordInput from '@/components/PasswordInput'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: Date
}

export default function UserRow({ user }: { user: User }) {
  const [resetting, setResetting] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSuccess('')
    setError('')

    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, newPassword }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
    } else {
      setSuccess('Password reset successfully.')
      setNewPassword('')
      setResetting(false)
    }
    setLoading(false)
  }

  return (
    <tr className="hover:bg-zinc-800/50 transition-colors">
      <td className="px-5 py-4 text-zinc-200">{user.name || '—'}</td>
      <td className="px-5 py-4 text-zinc-400">{user.email}</td>
      <td className="px-5 py-4">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${user.role === 'admin' ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-300'}`}>
          {user.role}
        </span>
      </td>
      <td className="px-5 py-4 font-mono text-zinc-600 tracking-widest text-sm">••••••••</td>
      <td className="px-5 py-4 text-zinc-500 text-xs">
        {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
      </td>
      <td className="px-5 py-4">
        {resetting ? (
          <form onSubmit={handleReset} className="flex items-center gap-2">
            <PasswordInput value={newPassword} onChange={setNewPassword} placeholder="New password" minLength={6} required />
            <button type="submit" disabled={loading} className="btn-primary text-xs px-3 py-1.5 whitespace-nowrap">
              {loading ? '…' : 'Set'}
            </button>
            <button type="button" onClick={() => { setResetting(false); setError(''); setNewPassword('') }}
              className="btn-secondary text-xs px-3 py-1.5">Cancel</button>
          </form>
        ) : (
          <button onClick={() => setResetting(true)} className="btn-secondary text-xs px-3 py-1.5">
            Reset Password
          </button>
        )}
        {success && <p className="text-xs text-green-400 mt-1">{success}</p>}
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </td>
    </tr>
  )
}
