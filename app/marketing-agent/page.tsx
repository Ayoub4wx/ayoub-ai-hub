'use client'

import { useState, useRef } from 'react'
import { Megaphone, Copy, Check, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  MARKETING_TASKS,
  TaskId,
  SocialPlatform,
} from '@/constants/marketing-tasks'

const PLATFORMS: SocialPlatform[] = ['Twitter/X', 'LinkedIn', 'TikTok']

export default function MarketingAgentPage() {
  const [activeTask, setActiveTask] = useState<TaskId>('social')
  const [platform, setPlatform] = useState<SocialPlatform>('Twitter/X')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const currentTask = MARKETING_TASKS.find((t) => t.id === activeTask)!

  async function handleGenerate() {
    if (!input.trim()) return
    setLoading(true)
    setOutput('')
    setError('')

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/marketing-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: activeTask,
          input: input.trim(),
          platform: activeTask === 'social' ? platform : undefined,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Something went wrong')
        setLoading(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break

          try {
            const json = JSON.parse(data)
            const delta = json.choices?.[0]?.delta?.content
            if (delta) setOutput((prev) => prev + delta)
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError('Failed to connect. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleStop() {
    abortRef.current?.abort()
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
          <Megaphone className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-3">
          Marketing <span className="gradient-text">Agent</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          AI-powered content generator for social posts, YouTube descriptions, newsletters, blog
          outlines, and product copy — completely free.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Task Selector */}
        <div className="lg:col-span-1 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Choose Task
          </p>
          {MARKETING_TASKS.map((task) => (
            <button
              key={task.id}
              onClick={() => {
                setActiveTask(task.id)
                setOutput('')
                setError('')
              }}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                activeTask === task.id
                  ? 'border-violet-500 bg-violet-500/10 text-foreground'
                  : 'border-border bg-secondary/20 text-muted-foreground hover:border-violet-500/50 hover:text-foreground'
              }`}
            >
              <span className="mr-2 text-lg">{task.icon}</span>
              <span className="font-medium text-sm">{task.label}</span>
            </button>
          ))}

          {/* Info card */}
          <div className="mt-6 p-4 rounded-xl border border-border bg-secondary/20">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="block font-semibold text-foreground mb-1">
                {currentTask.icon} {currentTask.label}
              </span>
              {currentTask.description}
            </p>
          </div>
        </div>

        {/* Right: Input + Output */}
        <div className="lg:col-span-2 space-y-4">
          {/* Platform selector (social only) */}
          {currentTask.showPlatform && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Platform:</span>
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium border transition-all ${
                    platform === p
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                      : 'border-border text-muted-foreground hover:border-cyan-500/50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {currentTask.inputLabel}
            </label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentTask.placeholder}
              rows={3}
              className="resize-none bg-secondary/30 border-border focus:border-violet-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) handleGenerate()
              }}
            />
            <p className="text-xs text-muted-foreground mt-1">Ctrl+Enter to generate</p>
          </div>

          {/* Generate button */}
          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
            {loading && (
              <Button variant="outline" onClick={handleStop}>
                Stop
              </Button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Output */}
          {output && (
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-gradient-to-r from-violet-900/30 to-cyan-900/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm font-medium">Generated Content</span>
                  <Badge variant="secondary" className="text-xs">
                    {currentTask.label}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 px-2 text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="p-4 bg-secondary/10 max-h-[480px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-foreground">
                  {output}
                  {loading && (
                    <span className="inline-block w-1.5 h-4 ml-0.5 bg-violet-400 animate-pulse align-middle" />
                  )}
                </pre>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!output && !loading && !error && (
            <div className="border border-dashed border-border rounded-xl p-10 text-center text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                Enter your topic above and click Generate to create content
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom features */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        {[
          { emoji: '🤖', title: '100% Free', desc: 'Powered by Llama 3.3 70B via OpenRouter' },
          { emoji: '⚡', title: 'Streaming Output', desc: 'See results generate in real-time' },
          { emoji: '📋', title: 'Copy & Use', desc: 'One-click copy ready to paste anywhere' },
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
