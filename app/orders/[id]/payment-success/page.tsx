import Link from 'next/link'

export default async function PaymentSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-green-900/50 border border-green-800/50 flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Payment Successful</h1>
      <p className="text-zinc-400 mb-8">Thank you! Your payment was received and your order is now in progress. We&apos;ll keep you updated via the chat.</p>
      <Link href={`/orders/${id}`} className="btn-primary">
        Back to Order
      </Link>
    </div>
  )
}
