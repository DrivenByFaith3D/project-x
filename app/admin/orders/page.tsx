import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AdminOrdersTable from '../AdminOrdersTable'

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/')

  // Purge trash older than 30 days
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  await prisma.order.deleteMany({ where: { deletedAt: { not: null, lte: cutoff } } })

  const orders = await prisma.order.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const tableOrders = orders.map((o) => ({ ...o, userEmail: o.user.email }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">Orders</h1>
      <AdminOrdersTable initialOrders={tableOrders} />
    </div>
  )
}
