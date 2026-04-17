import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AdminProductsClient from './AdminProductsClient'

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/')

  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Products</h1>
      </div>
      <AdminProductsClient initialProducts={products} />
    </div>
  )
}
