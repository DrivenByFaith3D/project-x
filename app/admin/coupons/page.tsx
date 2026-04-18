import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CouponsClient from './CouponsClient'

export default async function AdminCouponsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/')

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Coupons</h1>
          <p className="text-zinc-500 text-sm mt-1">Create and manage discount codes</p>
        </div>
      </div>
      <CouponsClient initialCoupons={coupons} />
    </div>
  )
}
