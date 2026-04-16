import Image from 'next/image'
import type { Product } from '@/types'

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="card overflow-hidden hover:border-zinc-600 transition-colors">
      <div className="aspect-square bg-zinc-800 relative">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-600">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{product.description}</p>
        )}
        <p className="text-white font-bold text-lg mt-2">${product.price.toFixed(2)}</p>
      </div>
    </div>
  )
}
