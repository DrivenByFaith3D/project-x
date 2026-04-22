import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/')

  const orders = await prisma.order.findMany({
    where: { archivedAt: null, deletedAt: null },
  })

  const counts = {
    pending:          orders.filter((o) => o.status === 'pending').length,
    in_progress:      orders.filter((o) => o.status === 'in_progress').length,
    out_for_delivery: orders.filter((o) => ['label_created', 'in_transit', 'out_for_delivery'].includes(o.status)).length,
    delivered:        orders.filter((o) => o.status === 'delivered').length,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Pending',     value: counts.pending },
          { label: 'In Progress', value: counts.in_progress },
          { label: 'Shipped',     value: counts.out_for_delivery },
          { label: 'Delivered',   value: counts.delivered },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-sm font-medium mt-1 text-zinc-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
