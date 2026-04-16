import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'

export default async function HomePage() {
  const products = await prisma.product.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <section className="bg-black border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
                Custom 3D Printing Services
              </h1>
              <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
                From rapid prototypes to production parts — we bring your designs to life with
                precision and speed. Upload your STL files and get started today.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/orders/new" className="btn-primary px-8 py-3">Start Custom Order</Link>
                <Link href="/listings" className="btn-secondary px-8 py-3">Browse Products</Link>
              </div>
            </div>
            <div className="shrink-0">
              <Image src="/logo.png" alt="DrivenByFaith3D" width={220} height={220} className="object-contain opacity-90" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '⚡', title: 'Fast Turnaround', desc: 'Most orders ship within 3–5 business days.' },
              { icon: '🎯', title: 'High Precision', desc: 'Layer resolution as fine as 0.05mm.' },
              { icon: '📦', title: 'Tracked Shipping', desc: 'Real-time shipment tracking on every order.' },
            ].map((f) => (
              <div key={f.title} className="text-center p-6 rounded-xl border border-zinc-800 bg-zinc-900">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2 text-white">{f.title}</h3>
                <p className="text-zinc-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {products.length > 0 && (
        <section className="py-16 bg-black border-b border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold text-white">Featured Products</h2>
              <Link href="/listings" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors">View all →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-zinc-900 text-center border-t border-zinc-800">
        <div className="max-w-xl mx-auto px-4">
          <Image src="/logo.png" alt="DrivenByFaith3D" width={80} height={80} className="mx-auto mb-6 object-contain opacity-80" />
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to print your idea?</h2>
          <p className="text-zinc-400 mb-8">Upload your file and get a quote within 24 hours.</p>
          <Link href="/orders/new" className="btn-primary px-8 py-3">Create Custom Order</Link>
        </div>
      </section>
    </div>
  )
}
