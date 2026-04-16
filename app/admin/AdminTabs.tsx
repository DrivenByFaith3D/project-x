'use client'

import { useState } from 'react'
import AdminOrdersTable from './AdminOrdersTable'
import UserRow from './UserRow'

type Tab = 'orders' | 'users'

interface Order {
  id: string
  orderNumber?: string | null
  orderType?: string | null
  status: string
  description: string
  createdAt: Date
  archivedAt?: Date | null
  deletedAt?: Date | null
  userEmail: string
}

interface User {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: Date
}

export default function AdminTabs({
  orders,
  users,
}: {
  orders: Order[]
  users: User[]
}) {
  const [tab, setTab] = useState<Tab>('orders')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'orders', label: 'All Orders' },
    { id: 'users',  label: 'All Users' },
  ]

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-6 border-b border-zinc-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'border-white text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'orders' && <AdminOrdersTable initialOrders={orders} />}

      {tab === 'users' && (
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
      )}
    </div>
  )
}
