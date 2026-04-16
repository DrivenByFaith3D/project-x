import { createClient } from '@/lib/supabase/server'
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
      <h1 className="text-2xl font-bold text-white mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Pending', value: counts.pending },
          { label: 'In Progress', value: counts.in_progress },
          { label: 'Shipped', value: counts.shipped },
          { label: 'Completed', value: counts.completed },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-sm font-medium mt-1 text-zinc-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h2 className="font-semibold text-white">All Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-950 text-zinc-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">Order ID</th>
                <th className="px-5 py-3 text-left">Customer</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Created</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {orders?.map((order) => (
                <AdminOrderRow key={order.id} order={order as Order} />
              ))}
              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-zinc-600">No orders yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
