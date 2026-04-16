import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AdminOrdersTable from './AdminOrdersTable'
import UserRow from './UserRow'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/')

  // Purge trash older than 30 days on each admin load
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  await prisma.order.deleteMany({ where: { deletedAt: { not: null, lte: cutoff } } })

  const [orders, users] = await Promise.all([
    prisma.order.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' } }),
  ])

  // Stats only count active (not archived or deleted) orders
  const active = orders.filter((o) => !o.archivedAt && !o.deletedAt)
  const counts = {
    pending:     active.filter((o) => o.status === 'pending').length,
    in_progress: active.filter((o) => o.status === 'in_progress').length,
    shipped:     active.filter((o) => o.status === 'shipped').length,
    completed:   active.filter((o) => o.status === 'completed').length,
  }

  const tableOrders = orders.map((o) => ({ ...o, userEmail: o.user.email }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Pending',     value: counts.pending },
          { label: 'In Progress', value: counts.in_progress },
          { label: 'Shipped',     value: counts.shipped },
          { label: 'Completed',   value: counts.completed },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-sm font-medium mt-1 text-zinc-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <AdminOrdersTable initialOrders={tableOrders} />

      {/* Users Table */}
      <div className="card overflow-hidden mt-10">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h2 className="font-semibold text-white">All Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-950 text-zinc-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Role</th>
                <th className="px-5 py-3 text-left">Password</th>
                <th className="px-5 py-3 text-left">Joined</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
