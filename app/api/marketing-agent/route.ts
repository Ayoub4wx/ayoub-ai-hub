import { NextRequest, NextResponse } from 'next/server'
import { buildMarketingPrompt, TaskId, SocialPlatform } from '@/constants/marketing-tasks'

export const runtime = 'nodejs'
export const maxDuration = 30
export const dynamic = 'force-dynamic'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

const FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'google/gemma-3-4b-it:free',
  'nvidia/nemotron-nano-9b-v2:free',
  'liquid/lfm-2.5-1.2b-instruct:free',
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { task, input, platform } = body as {
      task: TaskId
      input: string
      platform?: SocialPlatform
    }

    if (!task || !input?.trim()) {
      return NextResponse.json({ error: 'Task and input are required' }, { status: 400 })
    }

    const prompt = buildMarketingPrompt(task, input.trim(), platform)

    const headers = {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
      'X-Title': process.env.OPENROUTER_SITE_NAME || 'Ayoub AI Hub',
      'Content-Type': 'application/json',
    }

    const messages = [{ role: 'user', content: prompt }]

    let upstreamResponse: Response | null = null
    for (const model of FREE_MODELS) {
      const res = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          max_tokens: 1500,
          temperature: 0.75,
        }),
      })

      if (res.ok) {
        upstreamResponse = res
        break
      }

      console.warn(`Marketing agent: model ${model} failed ${res.status}`)
    }

    if (!upstreamResponse) {
      return NextResponse.json({ error: 'All models failed. Try again.' }, { status: 503 })
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstreamResponse!.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
              controller.close()
              break
            }
            controller.enqueue(value)
          }
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Marketing agent error:', error)
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
  }
}
