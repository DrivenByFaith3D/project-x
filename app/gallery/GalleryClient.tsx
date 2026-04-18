'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Photo {
  id: string
  url: string
  caption: string | null
  category: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  desk_organizer: 'Desk Organizer',
  phone_stand: 'Phone Stand',
  figurine: 'Figurine',
  home_decor: 'Home Decor',
  other: 'Other',
}

export default function GalleryClient({ photos }: { photos: Photo[] }) {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [inquiryPhoto, setInquiryPhoto] = useState<Photo | null>(null)
  const [expanded, setExpanded] = useState<Photo | null>(null)
  const [inquiryText, setInquiryText] = useState('')

  // Build unique categories present in photos
  const presentCategories = Array.from(
    new Set(photos.map(p => p.category).filter(Boolean) as string[])
  )

  const filtered = activeCategory
    ? photos.filter(p => p.category === activeCategory)
    : photos

  function openInquiry(photo: Photo) {
    const label = photo.category ? CATEGORY_LABELS[photo.category] ?? photo.category : 'this item'
    setInquiryText(`Hi! I saw a ${label} in your gallery and I'd love something similar. ${photo.caption ? `(Reference: "${photo.caption}") ` : ''}`)
    setInquiryPhoto(photo)
    setExpanded(null)
  }

  function startOrder() {
    if (!inquiryPhoto) return
    const desc = encodeURIComponent(inquiryText.trim())
    router.push(`/orders/new?type=scratch&description=${desc}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-2">Our Work</p>
        <h1 className="text-3xl font-bold text-white">Gallery</h1>
        <p className="text-zinc-400 mt-2">A showcase of prints we've made for our customers.</p>
      </div>

      {/* Category filters */}
      {presentCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              !activeCategory
                ? 'border-white text-white bg-white/10'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
            }`}
          >
            All
          </button>
          {presentCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activeCategory === cat
                  ? 'border-white text-white bg-white/10'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
              }`}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-zinc-400 font-medium mb-1">Gallery coming soon</p>
          <p className="text-zinc-600 text-sm">We're just getting started — check back soon to see our work.</p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {filtered.map(photo => (
            <div key={photo.id} className="break-inside-avoid overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.caption ?? '3D print'}
                className="w-full object-cover cursor-zoom-in group-hover:brightness-75 transition-all duration-200"
                onClick={() => setExpanded(photo)}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <button
                  className="pointer-events-auto w-full text-xs font-semibold bg-white text-black rounded-lg py-2 hover:bg-zinc-200 transition-colors"
                  onClick={(e) => { e.stopPropagation(); openInquiry(photo) }}
                >
                  I want this
                </button>
              </div>
              {/* Category badge */}
              {photo.category && (
                <div className="absolute top-2 left-2 pointer-events-none">
                  <span className="text-xs bg-black/60 text-zinc-300 px-2 py-0.5 rounded-full">
                    {CATEGORY_LABELS[photo.category] ?? photo.category}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="card p-8 text-center mt-12">
        <h2 className="text-xl font-bold text-white mb-2">Want something like this?</h2>
        <p className="text-zinc-400 text-sm mb-5">Submit a custom order and we'll bring your idea to life.</p>
        <Link href="/orders/new" className="btn-primary">Start Custom Order</Link>
      </div>

      {/* Lightbox */}
      {expanded && !inquiryPhoto && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4"
          onClick={() => setExpanded(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={expanded.url} alt={expanded.caption ?? '3D print'} className="max-w-full max-h-[80vh] object-contain rounded-lg" />
          {(expanded.caption || expanded.category) && (
            <div className="mt-4 text-center" onClick={e => e.stopPropagation()}>
              {expanded.category && <p className="text-zinc-500 text-xs">{CATEGORY_LABELS[expanded.category] ?? expanded.category}</p>}
              {expanded.caption && <p className="text-zinc-300 text-sm mt-1">{expanded.caption}</p>}
            </div>
          )}
          <button
            className="mt-5 text-sm font-semibold bg-white text-black rounded-lg px-6 py-2.5 hover:bg-zinc-200 transition-colors"
            onClick={(e) => { e.stopPropagation(); openInquiry(expanded) }}
          >
            I want this
          </button>
          <button className="mt-3 text-xs text-zinc-600 hover:text-zinc-400" onClick={() => setExpanded(null)}>Close</button>
        </div>
      )}

      {/* Inquiry modal */}
      {inquiryPhoto && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setInquiryPhoto(null)}>
          <div className="card p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={inquiryPhoto.url} alt="" className="w-20 h-20 object-cover rounded-lg border border-zinc-700 shrink-0" />
              <div>
                <h2 className="text-white font-semibold text-base">Request something like this</h2>
                <p className="text-zinc-500 text-xs mt-1">We'll review your request and send you a quote.</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Tell me more</label>
              <textarea
                value={inquiryText}
                onChange={e => setInquiryText(e.target.value)}
                className="input resize-none w-full"
                rows={4}
                placeholder="Describe what you're looking for — size, color, any tweaks…"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setInquiryPhoto(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={startOrder} disabled={!inquiryText.trim()} className="btn-primary flex-1">
                Start Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
