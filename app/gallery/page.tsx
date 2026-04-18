import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import GalleryClient from './GalleryClient'

export const metadata: Metadata = { title: 'Gallery' }

export default async function GalleryPage() {
  const photos = await prisma.orderPhoto.findMany({
    orderBy: { createdAt: 'desc' },
    take: 48,
    select: { id: true, url: true, caption: true, category: true },
  })

  return <GalleryClient photos={photos} />
}
