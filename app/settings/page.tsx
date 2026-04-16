'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const router = useRouter()

  const [name, setName] = useState(session?.user?.name ?? '')
  const [email, setEmail] = useState(session?.user?.email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saveMsg, setSaveMsg] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveMsg('')
    setSaveError('')

    const res = await fetch('/api/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, currentPassword: currentPassword || undefined, newPassword: newPassword || undefined }),
    })

    const data = await res.json()
    if (!res.ok) {
      setSaveError(data.error)
    } else {
      setSaveMsg('Account updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      await update({ name: data.name, email: data.email })
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (deleteConfirm !== 'DELETE') return
    setDeleting(true)
    setDeleteError('')

    const res = await fetch('/api/account', { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      setDeleteError(data.error)
      setDeleting(false)
      return
    }

    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-white mb-8">Account Settings</h1>

      {/* Account Info */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="input" placeholder="Your name" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="input" placeholder="you@example.com" required />
          </div>

          <hr className="border-zinc-800" />
          <p className="text-sm text-zinc-400">Leave password fields blank to keep your current password.</p>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              className="input" placeholder="Required to change password" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="input" placeholder="At least 6 characters" minLength={6} />
          </div>

          {saveMsg && <p className="text-sm text-green-400 bg-green-950/50 border border-green-800 rounded-lg px-3 py-2">{saveMsg}</p>}
          {saveError && <p className="text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">{saveError}</p>}

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Delete Account */}
      <div className="card p-6 border-red-900/50">
        <h2 className="text-lg font-semibold text-red-400 mb-2">Delete Account</h2>
        <p className="text-sm text-zinc-400 mb-4">
          This will permanently delete your account and all associated orders. This cannot be undone.
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Type <span className="font-mono text-red-400">DELETE</span> to confirm
            </label>
            <input type="text" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)}
              className="input" placeholder="DELETE" />
          </div>
          {deleteError && <p className="text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">{deleteError}</p>}
          <button
            onClick={handleDelete}
            disabled={deleteConfirm !== 'DELETE' || deleting}
            className="bg-red-700 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {deleting ? 'Deleting…' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  )
}
