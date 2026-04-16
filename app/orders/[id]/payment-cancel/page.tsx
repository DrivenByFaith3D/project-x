import Link from 'next/link'

export default async function PaymentCancelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Payment Cancelled</h1>
      <p className="text-zinc-400 mb-8">No charge was made. You can pay at any time from your order page.</p>
      <Link href={`/orders/${id}`} className="btn-primary">
        Back to Order
      </Link>
    </div>
  )
}
