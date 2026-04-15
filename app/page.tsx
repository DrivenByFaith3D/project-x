import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/types'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .limit(3)
    .order('created_at', { ascending: false })

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Custom 3D Printing Services
            </h1>
            <p className="text-brand-100 text-lg mb-10 leading-relaxed">
              From rapid prototypes to production parts — we bring your designs to life with
              precision and speed. Upload your STL files and get started today.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/orders/new" className="bg-white text-brand-700 hover:bg-brand-50 font-semibold px-8 py-3 rounded-lg transition-colors">
                Start Custom Order
              </Link>
              <Link href="/listings" className="border border-white text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-lg transition-colors">
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '⚡', title: 'Fast Turnaround', desc: 'Most orders ship within 3–5 business days.' },
              { icon: '🎯', title: 'High Precision', desc: 'Layer resolution as fine as 0.05mm.' },
              { icon: '📦', title: 'Tracked Shipping', desc: 'Real-time shipment tracking on every order.' },
            ].map((f) => (
              <div key={f.title} className="text-center p-6">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {products && products.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <Link href="/listings" className="text-brand-600 hover:text-brand-700 text-sm font-medium">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(products as Product[]).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-brand-700 text-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to print your idea?</h2>
          <p className="text-brand-100 mb-8">Upload your file and get a quote within 24 hours.</p>
          <Link href="/orders/new" className="bg-white text-brand-700 hover:bg-brand-50 font-semibold px-8 py-3 rounded-lg transition-colors">
            Create Custom Order
          </Link>
        </div>
      </section>
    </div>
  )
}
