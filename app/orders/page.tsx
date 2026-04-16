import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-zinc-800 text-zinc-300',
  in_progress: 'bg-zinc-700 text-white',
  completed: 'bg-white text-black',
  shipped: 'bg-zinc-300 text-black',
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Orders</h1>
          <p className="text-zinc-400 text-sm mt-1">Track and manage your custom orders</p>
        </div>
        <Link href="/orders/new" className="btn-primary">+ New Order</Link>
      </div>

      {orders.length === 0 ? (
        <div className="card p-16 text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="font-medium text-zinc-400">No orders yet</p>
          <p className="text-sm mt-1 mb-6 text-zinc-500">Create your first custom order to get started.</p>
          <Link href="/orders/new" className="btn-primary">Create Order</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}
              className="card p-5 flex items-center justify-between hover:border-zinc-600 transition-colors block">
              <div>
                <p className="font-medium text-white text-sm">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm text-zinc-400 mt-0.5 line-clamp-1">{order.description}</p>
                <p className="text-xs text-zinc-600 mt-1">
                  {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[order.status] || 'bg-zinc-800 text-zinc-300'}`}>
                  {order.status.replace('_', ' ')}
                </span>
                <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
