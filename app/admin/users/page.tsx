import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import UserRow from '../UserRow'

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/')

  const [users, resetRequests, orderStats] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.passwordResetRequest.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.order.groupBy({
      by: ['userId'],
      _count: { id: true },
      _sum: { quote: true },
      where: { deletedAt: null },
    }),
  ])

  const statsMap = new Map(orderStats.map(s => [s.userId, {
    count: s._count.id,
    spent: s._sum.quote ?? 0,
  }]))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <span>{users.filter(u => u.role === 'user').length} customers</span>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Customers', value: users.filter(u => u.role === 'user').length },
          { label: 'Verified', value: users.filter(u => u.emailVerified && u.role === 'user').length },
          { label: 'With Orders', value: orderStats.filter(s => s._count.id > 0).length },
          { label: 'Total Revenue', value: `$${orderStats.reduce((s, o) => s + (o._sum.quote ?? 0), 0).toFixed(2)}` },
        ].map(stat => (
          <div key={stat.label} className="card p-4">
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {resetRequests.length > 0 && (
        <div className="card overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-3">
            <h2 className="font-semibold text-white">Password Reset Requests</h2>
            <span className="text-xs bg-red-900/60 text-red-300 border border-red-800 px-2 py-0.5 rounded-full">
              {resetRequests.length}
            </span>
          </div>
          <div className="divide-y divide-zinc-800">
            {resetRequests.map((req) => (
              <div key={req.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white font-medium">{req.name}</p>
                  <p className="text-xs text-zinc-400">{req.email}</p>
                </div>
                <p className="text-xs text-zinc-600 shrink-0">
                  {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-950 text-zinc-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Role</th>
                <th className="px-5 py-3 text-left">Orders</th>
                <th className="px-5 py-3 text-left">Total Spent</th>
                <th className="px-5 py-3 text-left">Joined</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users.map((user) => {
                const stat = statsMap.get(user.id)
                return (
                  <tr key={user.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-5 py-3 text-white font-medium">{user.name ?? '—'}</td>
                    <td className="px-5 py-3 text-zinc-400">{user.email}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.role === 'admin' ? 'bg-white/10 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {stat ? (
                        <Link href={`/admin/orders?userId=${user.id}`} className="text-zinc-300 hover:text-white transition-colors">
                          {stat.count} order{stat.count !== 1 ? 's' : ''}
                        </Link>
                      ) : (
                        <span className="text-zinc-600">0</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-zinc-300">
                      {stat && stat.spent > 0 ? `$${stat.spent.toFixed(2)}` : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="px-5 py-3 text-zinc-500">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <UserRow user={user} inlineActions />
                    </td>
                  </tr>
                )
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-zinc-600">No users yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
