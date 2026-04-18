import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = { title: 'Gallery' }

export default async function GalleryPage() {
  // Pull admin-uploaded order photos to showcase
  const photos = await prisma.orderPhoto.findMany({
    orderBy: { createdAt: 'desc' },
    take: 24,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-2">Our Work</p>
        <h1 className="text-3xl font-bold text-white">Gallery</h1>
        <p className="text-zinc-400 mt-2">A showcase of prints we've made for our customers.</p>
      </div>

      {photos.length === 0 ? (
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
          {photos.map(photo => (
            <div key={photo.id} className="break-inside-avoid overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="3D print" className="w-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
          ))}
        </div>
      )}

      <div className="card p-8 text-center mt-12">
        <h2 className="text-xl font-bold text-white mb-2">Want something like this?</h2>
        <p className="text-zinc-400 text-sm mb-5">Submit a custom order and we'll bring your idea to life.</p>
        <Link href="/orders/new" className="btn-primary">Start Custom Order</Link>
      </div>
    </div>
  )
}
