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
    include: { user: { select: { email: true, name: true, addressStreet: true, addressCity: true, addressState: true, addressZip: true, addressCountry: true } } },
    orderBy: { createdAt: 'desc' },
  })

  // Get unread counts for admin: messages from non-admins since admin last viewed each order
  const adminViews = await prisma.orderView.findMany({
    where: { userId: session.user.id, orderId: { in: orders.map(o => o.id) } },
  })
  const adminViewMap = new Map(adminViews.map(v => [v.orderId, v.viewedAt]))

  const unreadCounts = await Promise.all(
    orders.map(async (order) => {
      const lastViewed = adminViewMap.get(order.id)
      const count = await prisma.message.count({
        where: {
          orderId: order.id,
          sender: { role: { not: 'admin' } },
          ...(lastViewed ? { createdAt: { gt: lastViewed } } : {}),
        },
      })
      return { orderId: order.id, count }
    })
  )
  const unreadMap = Object.fromEntries(unreadCounts.map(u => [u.orderId, u.count]))

  const tableOrders = orders.map((o) => ({
    ...o,
    userEmail: o.user.email,
    userName: o.user.name ?? '',
    userAddressStreet: o.user.addressStreet ?? '',
    userAddressCity: o.user.addressCity ?? '',
    userAddressState: o.user.addressState ?? '',
    userAddressZip: o.user.addressZip ?? '',
    userAddressCountry: o.user.addressCountry ?? 'US',
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">Orders</h1>
      <AdminOrdersTable initialOrders={tableOrders} unreadMap={unreadMap} />
    </div>
  )
}
