'use client'

import { useState, useRef } from 'react'

interface Photo {
  id: string
  url: string
}

export default function AdminOrderPhotos({ orderId, initialPhotos }: { orderId: string; initialPhotos: Photo[] }) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('orderId', orderId)
    const res = await fetch('/api/orders/photos', { method: 'POST', body: formData })
    if (res.ok) {
      const photo = await res.json()
      setPhotos((prev) => [...prev, photo])
    }
    setUploading(false)
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
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="text-xs px-2.5 py-1 rounded bg-zinc-700 text-white hover:bg-zinc-600 transition-colors disabled:opacity-40"
          >
            {uploading ? 'Uploading…' : '+ Add Photo'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.gif"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
        {photos.length === 0 ? (
          <p className="text-xs text-zinc-600 py-2">No photos yet. Upload a photo of the finished print to share with the customer.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden border border-zinc-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt="Order photo"
                  className="w-full h-full object-cover cursor-zoom-in"
                  onClick={() => setExpanded(photo.url)}
                />
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
