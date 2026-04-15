import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminOrderRow from './AdminOrderRow'
import type { Order } from '@/types'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, profiles(email)')
    .order('created_at', { ascending: false })

  const counts = {
    pending: orders?.filter((o) => o.status === 'pending').length || 0,
    in_progress: orders?.filter((o) => o.status === 'in_progress').length || 0,
    shipped: orders?.filter((o) => o.status === 'shipped').length || 0,
    completed: orders?.filter((o) => o.status === 'completed').length || 0,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Pending', value: counts.pending, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'In Progress', value: counts.in_progress, color: 'bg-blue-50 text-blue-700' },
          { label: 'Shipped', value: counts.shipped, color: 'bg-purple-50 text-purple-700' },
          { label: 'Completed', value: counts.completed, color: 'bg-green-50 text-green-700' },
        ].map((stat) => (
          <div key={stat.label} className={`card p-5 ${stat.color}`}>
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Orders table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">All Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">Order ID</th>
                <th className="px-5 py-3 text-left">Customer</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Created</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders?.map((order) => (
                <AdminOrderRow key={order.id} order={order as Order} />
              ))}
              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400">No orders yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
