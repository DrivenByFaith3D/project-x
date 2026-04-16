'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import MessageBubble from './MessageBubble'
import FileUploader from './FileUploader'

interface ChatMessage {
  id: string
  orderId: string
  senderId: string
  content: string
  fileUrl: string | null
  createdAt: string
  senderEmail: string
  senderRole: string
}

interface Props {
  orderId: string
  initialMessages: ChatMessage[]
  currentUserId: string
  isAdmin: boolean
}

export default function ChatWindow({ orderId, initialMessages, currentUserId, isAdmin }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [showUploader, setShowUploader] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll for new messages every 3 seconds
  const poll = useCallback(async () => {
    const res = await fetch(`/api/messages?orderId=${orderId}`)
    if (!res.ok) return
    const data: ChatMessage[] = await res.json()
    setMessages(data)
  }, [orderId])

  useEffect(() => {
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [poll])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || sending) return
    setSending(true)

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, content: content.trim() }),
    })

    setContent('')
    await poll()
    setSending(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(e as unknown as React.FormEvent)
    }
  }

  return (
    <div className="card flex flex-col" style={{ height: '600px' }}>
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
        <h2 className="font-semibold text-white">Order Chat</h2>
        <button onClick={() => setShowUploader((v) => !v)}
          className="text-sm text-zinc-400 hover:text-white font-medium flex items-center gap-1 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          Upload File
        </button>
      </div>

      {showUploader && (
        <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-950">
          <FileUploader orderId={orderId} onUploaded={() => { setShowUploader(false); poll() }} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === currentUserId} />
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="px-5 py-4 border-t border-zinc-800">
        <div className="flex gap-3 items-end">
          <textarea value={content} onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown} className="input resize-none flex-1" rows={2}
            placeholder="Type a message… (Enter to send, Shift+Enter for new line)" />
          <button type="submit" disabled={sending || !content.trim()} className="btn-primary shrink-0 h-10 px-5">
            {sending ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}
