'use client'

import { useState } from 'react'
import { Bot, X, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ChatWindow from './ChatWindow'
import { cn } from '@/lib/utils'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat panel */}
      {isOpen && (
        <div className={cn(
          'mb-3 w-[360px] rounded-2xl border border-border bg-background shadow-2xl',
          'overflow-hidden',
          'animate-in slide-in-from-bottom-4 fade-in duration-200'
        )}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-violet-900/50 to-cyan-900/50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">Ayoub&apos;s AI</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Chat window */}
          <ChatWindow />
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center shadow-2xl',
          'bg-gradient-to-br from-violet-600 to-cyan-600',
          'hover:from-violet-500 hover:to-cyan-500',
          'transition-all duration-200 hover:scale-110',
          !isOpen && 'pulse-ring'
        )}
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
      >
        {isOpen ? (
          <Minimize2 className="w-6 h-6 text-white" />
        ) : (
          <Bot className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  )
}
