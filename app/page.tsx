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
      {/* Hero */}
      <section className="relative bg-zinc-900 border-b border-zinc-700/60 overflow-hidden">
        {/* Background glow */}
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
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Fast Turnaround',
                desc: 'Most orders ship within 3–5 business days.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                ),
                title: 'High Precision',
                desc: 'Layer resolution as fine as 0.05mm.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                ),
                title: 'Tracked Shipping',
                desc: 'Real-time shipment tracking on every order.',
              },
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

      {/* Featured Products */}
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

      {/* CTA */}
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
