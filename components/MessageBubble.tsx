interface ChatMessage {
  id: string
  senderId: string
  content: string
  fileUrl: string | null
  createdAt: string
  senderEmail: string
  senderRole: string
}

interface Props {
  message: ChatMessage
  isOwn: boolean
  groupWithPrev?: boolean
}

export default function MessageBubble({ message, isOwn, groupWithPrev }: Props) {
  const isAdminSender = message.senderRole === 'admin'
  const senderLabel = isAdminSender ? 'DrivenByFaith3D' : message.senderEmail?.split('@')[0] || 'You'
  const time = new Date(message.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} ${groupWithPrev ? 'mt-0.5' : 'mt-3'}`}>
      {!groupWithPrev && (
        <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className={`text-xs font-medium ${isAdminSender ? 'text-zinc-300' : 'text-zinc-500'}`}>
            {senderLabel}
          </span>
          <span className="text-xs text-zinc-600">{time}</span>
        </div>
      )}
      <div className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-2.5 text-sm leading-relaxed transition-all ${
        isOwn
          ? `bg-white text-black ${groupWithPrev ? 'rounded-2xl rounded-tr-md' : 'rounded-2xl rounded-br-md'}`
          : isAdminSender
          ? `bg-zinc-700 text-white ${groupWithPrev ? 'rounded-2xl rounded-tl-md' : 'rounded-2xl rounded-bl-md'}`
          : `bg-zinc-800 text-white ${groupWithPrev ? 'rounded-2xl rounded-tl-md' : 'rounded-2xl rounded-bl-md'}`
      }`}>
        {message.content}
        {message.fileUrl && (
          <a href={message.fileUrl} target="_blank" rel="noopener noreferrer"
            className={`mt-2 flex items-center gap-1 text-xs underline ${isOwn ? 'text-zinc-500' : 'text-zinc-400'}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            Attached file
          </a>
        )}
      </div>
      {groupWithPrev && (
        <span className="text-xs text-zinc-700 mt-0.5 px-1">{time}</span>
      )}
    </div>
  )
}
