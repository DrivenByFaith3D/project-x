'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import MessageBubble from './MessageBubble'
import FileUploader from './FileUploader'
import type { Message } from '@/types'

interface Props {
  orderId: string
  initialMessages: Message[]
  currentUserId: string
  isAdmin: boolean
}

export default function ChatWindow({ orderId, initialMessages, currentUserId, isAdmin }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [showUploader, setShowUploader] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${orderId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=eq.${orderId}` },
        async (payload) => {
          const { data } = await supabase
            .from('messages')
            .select('*, profiles(email, role)')
            .eq('id', payload.new.id)
            .single()
          if (data) {
            setMessages((prev) => {
              if (prev.find((m) => m.id === data.id)) return prev
              return [...prev, data as Message]
            })
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [orderId, supabase])

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
        <button
          onClick={() => setShowUploader((v) => !v)}
          className="text-sm text-zinc-400 hover:text-white font-medium flex items-center gap-1 transition-colors"
        >
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

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === currentUserId} isAdmin={isAdmin} />
        ))}
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
