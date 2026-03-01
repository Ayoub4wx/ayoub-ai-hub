import { Bot, User } from 'lucide-react'
import { ChatMessage as ChatMessageType } from '@/types/chat'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: ChatMessageType
}

export default function ChatMessageBubble({ message }: ChatMessageProps) {
  const isAI = message.role === 'assistant'

  return (
    <div className={cn('flex gap-2.5 mb-4', isAI ? 'flex-row' : 'flex-row-reverse')}>
      {/* Avatar */}
      <div className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
        isAI
          ? 'bg-gradient-to-br from-violet-500 to-cyan-500'
          : 'bg-secondary border border-border'
      )}>
        {isAI ? (
          <Bot className="w-4 h-4 text-white" />
        ) : (
          <User className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </div>

      {/* Bubble */}
      <div className={cn(
        'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm',
        isAI
          ? 'bg-secondary text-foreground rounded-tl-sm'
          : 'bg-primary text-primary-foreground rounded-tr-sm'
      )}>
        {message.content}
        {message.isStreaming && (
          <span className="inline-flex gap-0.5 ml-1.5 align-middle">
            <span className="typing-dot w-1 h-1 bg-current rounded-full opacity-70" />
            <span className="typing-dot w-1 h-1 bg-current rounded-full opacity-70" />
            <span className="typing-dot w-1 h-1 bg-current rounded-full opacity-70" />
          </span>
        )}
      </div>
    </div>
  )
}
