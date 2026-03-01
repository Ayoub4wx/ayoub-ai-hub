'use client'

import { useRef, useEffect, useState } from 'react'
import { Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import ChatMessageBubble from './ChatMessage'
import SuggestedQuestions from './SuggestedQuestions'
import { useChat } from '@/hooks/useChat'

interface ChatWindowProps {
  fullPage?: boolean
}

export default function ChatWindow({ fullPage = false }: ChatWindowProps) {
  const { messages, isLoading, sendMessage, clearMessages } = useChat()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    sendMessage(input)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={`flex flex-col ${fullPage ? 'h-full' : 'h-[450px]'}`}>
      {/* Messages */}
      <ScrollArea className="flex-1 px-3 py-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 py-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="text-center">
              <p className="font-medium text-sm">Ask Ayoub&apos;s AI anything!</p>
              <p className="text-xs text-muted-foreground mt-1">AI news, tech topics, or about Ayoub&apos;s content</p>
            </div>
          </div>
        ) : (
          <div>
            {messages.map((msg) => (
              <ChatMessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Suggested questions (only when empty) */}
      {messages.length === 0 && (
        <SuggestedQuestions onSelect={(q) => { setInput(q); sendMessage(q) }} />
      )}

      {/* Input */}
      <div className="border-t border-border p-3 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about AI, news, or Ayoub's content..."
          className="resize-none min-h-[40px] max-h-[100px] text-sm bg-secondary border-border"
          rows={1}
        />
        <div className="flex flex-col gap-1">
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-8 w-8 bg-violet-600 hover:bg-violet-500"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
          {messages.length > 0 && (
            <Button
              onClick={clearMessages}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Clear chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
