import { Bot } from 'lucide-react'
import { Metadata } from 'next'
import ChatWindow from '@/components/chat/ChatWindow'
import { SUGGESTED_QUESTIONS } from '@/constants/suggested-questions'

export const metadata: Metadata = {
  title: 'Ask AI',
  description: 'Chat with Ayoub\'s AI assistant — powered by free LLMs. Ask about AI news, tech topics, and more.',
}

export default function AskAIPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-3">
          Ask <span className="gradient-text">Ayoub&apos;s AI</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Powered by free LLMs via OpenRouter. Ask about AI news, tech topics, Ayoub&apos;s content,
          or anything AI-related.
        </p>
      </div>

      {/* Chat area */}
      <div className="border border-border rounded-2xl overflow-hidden bg-secondary/20 shadow-2xl">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-gradient-to-r from-violet-900/30 to-cyan-900/30">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-medium">Ayoub&apos;s AI Assistant</span>
          <span className="text-xs text-muted-foreground ml-auto">Powered by OpenRouter</span>
        </div>
        <div className="h-[500px]">
          <ChatWindow fullPage />
        </div>
      </div>

      {/* All suggested questions */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          More topics to explore
        </h2>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <div
              key={i}
              className="text-sm px-3 py-2 rounded-xl bg-secondary border border-border text-muted-foreground"
            >
              {q}
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        {[
          { emoji: '🤖', title: 'Free LLMs', desc: 'Powered by DeepSeek & Qwen via OpenRouter' },
          { emoji: '📰', title: 'AI News Context', desc: 'Gets latest news headlines for context' },
          { emoji: '🔒', title: 'No Data Stored', desc: 'Chat history stays in your browser' },
        ].map((item) => (
          <div key={item.title} className="bg-secondary/30 border border-border rounded-xl p-4">
            <div className="text-2xl mb-1.5">{item.emoji}</div>
            <p className="font-medium text-sm">{item.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
