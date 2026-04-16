import type { Message } from '@/types'

interface Props {
  message: Message
  isOwn: boolean
  isAdmin: boolean
}

export default function MessageBubble({ message, isOwn }: Props) {
  const isAdminSender = message.profiles?.role === 'admin'
  const senderLabel = isAdminSender
    ? 'DrivenByFaith3D'
    : message.profiles?.email?.split('@')[0] || 'You'

  const time = new Date(message.created_at).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  })

  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-xs font-medium ${isAdminSender ? 'text-zinc-300' : 'text-zinc-500'}`}>
          {senderLabel}
        </span>
        <span className="text-xs text-zinc-600">{time}</span>
      </div>
      <div className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isOwn
          ? 'bg-white text-black rounded-br-sm'
          : isAdminSender
          ? 'bg-zinc-700 text-white rounded-bl-sm'
          : 'bg-zinc-800 text-white rounded-bl-sm'
      }`}>
        {message.content}
        {message.file_url && (
          <a href={message.file_url} target="_blank" rel="noopener noreferrer"
            className={`mt-2 flex items-center gap-1 text-xs underline ${isOwn ? 'text-zinc-500' : 'text-zinc-400'}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            Attached file
          </a>
        )}
      </div>
    </div>
  )
}
