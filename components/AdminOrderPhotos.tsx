'use client'

import { useState, useRef } from 'react'

interface Photo {
  id: string
  url: string
  caption: string | null
  category: string | null
}

const CATEGORIES = [
  { value: '', label: 'No category' },
  { value: 'desk_organizer', label: 'Desk Organizer' },
  { value: 'phone_stand', label: 'Phone Stand' },
  { value: 'figurine', label: 'Figurine' },
  { value: 'home_decor', label: 'Home Decor' },
  { value: 'other', label: 'Other' },
]

export default function AdminOrderPhotos({ orderId, initialPhotos }: { orderId: string; initialPhotos: Photo[] }) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [category, setCategory] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingFile(file)
    setCaption('')
    setCategory('')
  }

  async function handleUpload() {
    if (!pendingFile) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', pendingFile)
    formData.append('orderId', orderId)
    if (caption.trim()) formData.append('caption', caption.trim())
    if (category) formData.append('category', category)
    const res = await fetch('/api/orders/photos', { method: 'POST', body: formData })
    if (res.ok) {
      const photo = await res.json()
      setPhotos((prev) => [...prev, photo])
    }
    setUploading(false)
    setPendingFile(null)
    setCaption('')
    setCategory('')
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleDelete(photoId: string) {
    if (!confirm('Remove this photo?')) return
    await fetch('/api/orders/photos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoId }),
    })
    setPhotos((prev) => prev.filter((p) => p.id !== photoId))
  }

  return (
    <>
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Order Photos</h2>
          {!pendingFile && (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="text-xs px-2.5 py-1 rounded bg-zinc-700 text-white hover:bg-zinc-600 transition-colors disabled:opacity-40"
            >
              + Add Photo
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.gif"
            className="hidden"
            onChange={onFileChange}
          />
        </div>

        {/* Pending upload form */}
        {pendingFile && (
          <div className="mb-4 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg space-y-3">
            <p className="text-xs text-zinc-400 font-medium truncate">{pendingFile.name}</p>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Caption (optional)</label>
              <input
                type="text"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="e.g. Custom desk organizer in white PLA"
                className="input w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="input w-full text-sm">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="text-xs px-3 py-1.5 rounded bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-40 font-medium"
              >
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
              <button
                onClick={() => { setPendingFile(null); if (fileRef.current) fileRef.current.value = '' }}
                className="text-xs px-3 py-1.5 rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {photos.length === 0 ? (
          <p className="text-xs text-zinc-600 py-2">No photos yet. Upload a photo of the finished print to share with the customer.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-zinc-700">
                <div className="aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt="Order photo"
                    className="w-full h-full object-cover cursor-zoom-in"
                    onClick={() => setExpanded(photo.url)}
                  />
                </div>
                {(photo.caption || photo.category) && (
                  <div className="px-2 py-1.5 bg-zinc-900 border-t border-zinc-800">
                    {photo.category && (
                      <span className="text-xs text-zinc-500 capitalize">{photo.category.replace('_', ' ')}</span>
                    )}
                    {photo.caption && (
                      <p className="text-xs text-zinc-400 truncate mt-0.5">{photo.caption}</p>
                    )}
                  </div>
                )}
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  title="Remove photo"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {expanded && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setExpanded(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={expanded} alt="Order photo" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </>
  )
}
