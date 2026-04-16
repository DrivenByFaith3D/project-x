import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import UserRow from '../UserRow'

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/')

  const [users, resetRequests] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.passwordResetRequest.findMany({ orderBy: { createdAt: 'desc' } }),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">Users</h1>

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
                <th className="px-5 py-3 text-left">Password</th>
                <th className="px-5 py-3 text-left">Joined</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-zinc-600">No users yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
