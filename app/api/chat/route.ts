import { NextRequest, NextResponse } from 'next/server'
import { createChatStream } from '@/lib/openrouter'
import { fetchAllNews } from '@/lib/rss'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages } = body

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 })
    }

    // Limit conversation history
    const recentMessages = messages.slice(-10)

    // Get news context for the AI
    let newsContext = ''
    try {
      const articles = await fetchAllNews()
      const top5 = articles.slice(0, 5)
      newsContext = top5
        .map(
          (a) =>
            `- "${a.title}" (${a.source}, ${new Date(a.publishedAt).toLocaleDateString()})`
        )
        .join('\n')
    } catch {
      // News context is optional
    }

    // Get streaming response from OpenRouter
    const upstreamResponse = await createChatStream(recentMessages, newsContext)

    // Stream the response back to client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstreamResponse.body?.getReader()
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
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
