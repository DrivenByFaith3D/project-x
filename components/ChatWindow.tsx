'use client'

import { useEffect, useRef, useState } from 'react'
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
  senderName: string | null
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
  const latestIdRef = useRef<string | null>(initialMessages.at(-1)?.id ?? null)
  const isUserScrollingRef = useRef(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  function scrollToBottom(behavior: ScrollBehavior = 'smooth') {
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' })
  }

  function maybeScrollToBottom() {
    const el = scrollContainerRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    if (nearBottom || !isUserScrollingRef.current) scrollToBottom()
  }

  useEffect(() => {
    scrollToBottom('instant')
  }, [])

  // SSE connection for real-time messages
  useEffect(() => {
    const lastId = latestIdRef.current
    const url = `/api/messages/stream?orderId=${orderId}${lastId ? `&lastId=${lastId}` : ''}`
    const es = new EventSource(url)

    es.addEventListener('message', (e) => {
      const msg: ChatMessage = JSON.parse(e.data)
      // Ignore echoes of our own optimistic messages
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev
        const next = [...prev.filter((m) => !m.id.startsWith('optimistic-')), msg]
        latestIdRef.current = msg.id
        setTimeout(maybeScrollToBottom, 50)
        return next
      })
    })

    es.onerror = () => {
      // EventSource auto-reconnects; nothing to do here
    }

    return () => es.close()
  }, [orderId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function editMessage(messageId: string, newContent: string) {
    await fetch('/api/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, content: newContent }),
    })
    setMessages((prev) =>
      prev.map((m) => m.id === messageId ? { ...m, content: newContent } : m)
    )
  }

  async function deleteMessage(messageId: string) {
    if (!confirm('Delete this message?')) return
    await fetch(`/api/messages?messageId=${messageId}`, { method: 'DELETE' })
    setMessages((prev) => prev.filter((m) => m.id !== messageId))
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed || sending) return
    setSending(true)
    setContent('')

    // Optimistic message
    const optimistic: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      orderId,
      senderId: currentUserId,
      content: trimmed,
      fileUrl: null,
      createdAt: new Date().toISOString(),
      senderEmail: '',
      senderName: null,
      senderRole: isAdmin ? 'admin' : 'user',
    }
    setMessages((prev) => [...prev, optimistic])
    setTimeout(() => scrollToBottom(), 30)

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, content: trimmed }),
    })

    // SSE will push the real message; just clear the sending state
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
        <h2 className="font-semibold text-white">Chat</h2>
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
          <FileUploader orderId={orderId} onUploaded={() => setShowUploader(false)} />
        </div>
      )}

      <div
        ref={scrollContainerRef}
        onScroll={() => {
          const el = scrollContainerRef.current
          if (!el) return
          isUserScrollingRef.current = el.scrollHeight - el.scrollTop - el.clientHeight > 80
        }}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-1"
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map((msg, i) => {
          const prev = messages[i - 1]
          const groupWithPrev = prev && prev.senderId === msg.senderId
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === currentUserId}
              groupWithPrev={groupWithPrev}
              onEdit={editMessage}
              onDelete={deleteMessage}
            />
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="px-5 py-4 border-t border-zinc-800">
        <div className="flex gap-3 items-end">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="input resize-none flex-1"
            rows={2}
            placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
          />
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
