import Link from 'next/link'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'
import CustomerDashboard from '@/components/CustomerDashboard'
import { STATUS_STYLES, formatOrderId } from '@/lib/constants'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === 'admin'

  if (isAdmin) {
    // Purge expired trash
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    await prisma.order.deleteMany({ where: { deletedAt: { not: null, lte: cutoff } } })

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const [activeOrders, recentMessages, listingsCount, paidOrders] = await Promise.all([
      prisma.order.findMany({
        where: { archivedAt: null, deletedAt: null },
      }),
      prisma.message.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          sender: { select: { name: true, email: true, role: true } },
          order: { select: { id: true, orderNumber: true } },
        },
      }),
      prisma.product.count(),
      prisma.order.findMany({
        where: { paymentStatus: 'paid', deletedAt: null, createdAt: { gte: sixMonthsAgo } },
        select: { quote: true, createdAt: true },
      }),
    ])

    const allTimePaid = await prisma.order.aggregate({
      where: { paymentStatus: 'paid', deletedAt: null },
      _sum: { quote: true },
      _count: true,
    })

    const revenueThisMonth = paidOrders
      .filter(o => new Date(o.createdAt) >= startOfMonth)
      .reduce((sum, o) => sum + (o.quote ?? 0), 0)
    const ordersThisMonth = paidOrders.filter(o => new Date(o.createdAt) >= startOfMonth).length
    const revenueAllTime = allTimePaid._sum.quote ?? 0
    const avgOrderValue = allTimePaid._count > 0 ? revenueAllTime / allTimePaid._count : 0

    // Bar chart: orders per month for last 6 months
    const monthBuckets: { label: string; count: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const label = d.toLocaleString('en-US', { month: 'short' })
      const year = d.getFullYear()
      const month = d.getMonth()
      const count = paidOrders.filter(o => {
        const c = new Date(o.createdAt)
        return c.getFullYear() === year && c.getMonth() === month
      }).length
      monthBuckets.push({ label, count })
    }
    const maxBucketCount = Math.max(...monthBuckets.map(b => b.count), 1)

    const counts = {
      pending:     activeOrders.filter((o) => o.status === 'pending').length,
      in_progress: activeOrders.filter((o) => o.status === 'in_progress').length,
      in_transit:  activeOrders.filter((o) => ['label_created', 'in_transit', 'out_for_delivery'].includes(o.status)).length,
      delivered:   activeOrders.filter((o) => ['delivered', 'completed'].includes(o.status)).length,
    }

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Welcome back 👋</h1>
          <p className="text-zinc-400 text-sm mt-1">Here's what's happening with your shop.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Pending',     value: counts.pending,     href: '/admin/orders' },
            { label: 'In Progress', value: counts.in_progress, href: '/admin/orders' },
            { label: 'In Transit',  value: counts.in_transit,  href: '/admin/orders' },
            { label: 'Delivered',   value: counts.delivered,   href: '/admin/orders' },
          ].map((stat) => (
            <Link key={stat.label} href={stat.href} className="card p-5 hover:border-zinc-600 transition-colors">
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-sm font-medium mt-1 text-zinc-400">{stat.label}</p>
            </Link>
          ))}
        </div>

        {/* Revenue stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Revenue This Month', value: `$${revenueThisMonth.toFixed(2)}` },
            { label: 'Revenue All Time',   value: `$${revenueAllTime.toFixed(2)}` },
            { label: 'Avg Order Value',    value: avgOrderValue > 0 ? `$${avgOrderValue.toFixed(2)}` : '—' },
            { label: 'Paid This Month',    value: String(ordersThisMonth) },
          ].map((stat) => (
            <div key={stat.label} className="card p-5">
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs font-medium mt-1 text-zinc-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Orders chart */}
        <div className="card p-5 mb-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-4">Paid Orders — Last 6 Months</p>
          <div className="flex items-end gap-2 h-24">
            {monthBuckets.map((b) => (
              <div key={b.label} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs text-zinc-500">{b.count > 0 ? b.count : ''}</span>
                <div
                  className="w-full rounded-sm bg-zinc-600 hover:bg-zinc-400 transition-colors"
                  style={{ height: `${Math.max(4, (b.count / maxBucketCount) * 72)}px` }}
                />
                <span className="text-[10px] text-zinc-500">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent messages — takes 2/3 */}
          <div className="lg:col-span-2 card overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-semibold text-white">Recent Messages</h2>
              <Link href="/admin/orders" className="text-xs text-zinc-500 hover:text-white transition-colors">View all orders →</Link>
            </div>
            <div className="divide-y divide-zinc-800">
              {recentMessages.length === 0 && (
                <p className="px-5 py-8 text-center text-zinc-600 text-sm">No messages yet</p>
              )}
              {recentMessages.map((msg) => {
                const isAdminMsg = msg.sender.role === 'admin'
                const senderLabel = isAdminMsg ? 'You' : (msg.sender.name || msg.sender.email.split('@')[0])
                const time = new Date(msg.createdAt).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                })
                return (
                  <Link key={msg.id} href={`/admin/orders/${msg.order.id}`}
                    className="flex items-start gap-3 px-5 py-3.5 hover:bg-zinc-800/50 transition-colors">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isAdminMsg ? 'bg-white text-black' : 'bg-zinc-700 text-white'
                    }`}>
                      {senderLabel[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-white">{senderLabel}</span>
                        <span className="text-xs text-zinc-600">on</span>
                        <span className="text-xs font-mono text-zinc-400">
                          {formatOrderId(msg.order)}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 truncate">{msg.content}</p>
                    </div>
                    <span className="text-xs text-zinc-600 shrink-0 mt-0.5">{time}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Shortcuts — takes 1/3 */}
          <div className="flex flex-col gap-4">
            {/* Listings shortcut */}
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                <h2 className="font-semibold text-white">Listings</h2>
                <span className="text-xs text-zinc-500">{listingsCount} products</span>
              </div>
              <div className="p-5 flex flex-col gap-3">
                <p className="text-sm text-zinc-400">Manage your shop products and pre-made items.</p>
                <Link href="/listings" className="btn-secondary text-sm text-center">
                  View Listings
                </Link>
              </div>
            </div>

            {/* Quick links */}
            <div className="card p-5">
              <h2 className="font-semibold text-white mb-3">Quick Links</h2>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'All Orders',  href: '/admin/orders' },
                  { label: 'All Users',   href: '/admin/users' },
                  { label: 'Admin Panel', href: '/admin' },
                ].map((link) => (
                  <Link key={link.href} href={link.href}
                    className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center justify-between py-1.5 border-b border-zinc-800 last:border-0">
                    {link.label}
                    <span className="text-zinc-600">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Logged-in customer: show listings + dashboard
  if (session?.user) {
    const listings = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Listings */}
        <div>
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-1">Shop</p>
              <h2 className="text-xl font-bold text-white">Listings</h2>
            </div>
            <Link href="/listings" className="text-sm text-zinc-400 hover:text-white transition-colors">
              View all →
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-zinc-400 font-medium mb-1">No listings yet</p>
              <p className="text-zinc-600 text-sm">Check back soon — products will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Dashboard */}
        <CustomerDashboard userId={session.user.id} />
      </div>
    )
  }

  // Marketing homepage for unauthenticated visitors
  const products = await prisma.product.findMany({ take: 3, orderBy: { createdAt: 'desc' } })

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-zinc-900 border-b border-zinc-700/60 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/3 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="max-w-2xl">
              <span className="inline-block text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-4 border border-zinc-700 px-3 py-1 rounded-full">
                Custom 3D Printing
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
                Bring Your Ideas{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                  to Life
                </span>
              </h1>
              <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
                From rapid prototypes to production parts — precision printing with fast turnaround.
                Upload your STL files and get started today.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/orders/new" className="btn-primary px-8 py-3 text-base">Start Custom Order</Link>
                <Link href="/listings" className="btn-secondary px-8 py-3 text-base">Browse Products</Link>
              </div>
            </div>
            <div className="shrink-0 relative">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl scale-75" />
              <Image src="/logo.png" alt="DrivenByFaith3D" width={240} height={240} className="relative object-contain drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-zinc-950 border-b border-zinc-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, title: 'Fast Turnaround', desc: 'Most orders ship within 3–5 business days.' },
              { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>, title: 'High Precision', desc: 'Layer resolution as fine as 0.05mm.' },
              { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>, title: 'Tracked Shipping', desc: 'Real-time shipment tracking on every order.' },
            ].map((f) => (
              <div key={f.title} className="group card p-6 hover:border-zinc-600 transition-all duration-300 hover:bg-zinc-800/80">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center mb-4 transition-colors duration-300 text-zinc-300 group-hover:text-white">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-base mb-1.5 text-white">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {products.length > 0 && (
        <section className="py-20 bg-zinc-900 border-b border-zinc-700/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-2">Shop</p>
                <h2 className="text-2xl font-bold text-white">Featured Products</h2>
              </div>
              <Link href="/listings" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors group">
                View all <span className="group-hover:translate-x-1 inline-block transition-transform">→</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative py-24 bg-zinc-950 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-xl mx-auto px-4">
          <Image src="/logo.png" alt="DrivenByFaith3D" width={72} height={72} className="mx-auto mb-6 object-contain drop-shadow-xl" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Ready to print your idea?</h2>
          <p className="text-zinc-400 mb-8 text-lg">Upload your file and get a quote within 24 hours.</p>
          <Link href="/orders/new" className="btn-primary px-10 py-3 text-base">Create Custom Order</Link>
        </div>
      </section>
    </div>
  )
}
