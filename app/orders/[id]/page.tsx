import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatWindow from '@/components/ChatWindow'
import ShippingStatus from '@/components/ShippingStatus'
import type { Message, FileUpload, Order } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  shipped: 'bg-purple-100 text-purple-800',
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (!order) notFound()
  if (!isAdmin && order.user_id !== user.id) notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('*, profiles(email, role)')
    .eq('order_id', id)
    .order('created_at', { ascending: true })

  const { data: files } = await supabase
    .from('file_uploads')
    .select('*')
    .eq('order_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Order</p>
          <h1 className="text-2xl font-bold text-gray-900">#{(order as Order).id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Created {new Date((order as Order).created_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        </div>
        <span className={`self-start sm:self-auto text-sm font-medium px-3 py-1.5 rounded-full capitalize ${STATUS_STYLES[(order as Order).status] || 'bg-gray-100 text-gray-700'}`}>
          {(order as Order).status.replace('_', ' ')}
        </span>
      </div>

      {/* Description */}
      <div className="card p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</h2>
        <p className="text-gray-700">{(order as Order).description}</p>
      </div>

      {/* Shipping Status */}
      {(order as Order).status === 'shipped' && (order as Order).tracking_number && (
        <div className="mb-6">
          <ShippingStatus order={order as Order} />
        </div>
      )}

      {/* File Uploads */}
      {files && files.length > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Uploaded Files</h2>
          <div className="space-y-2">
            {(files as FileUpload[]).map((file) => (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="text-brand-600 hover:underline truncate">{file.name || 'Uploaded file'}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Chat */}
      <ChatWindow
        orderId={id}
        initialMessages={(messages as Message[]) || []}
        currentUserId={user.id}
        isAdmin={isAdmin}
      />
    </div>
  )
}
