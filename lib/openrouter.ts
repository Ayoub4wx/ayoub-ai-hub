import { ChatMessage } from '@/types/chat'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Free models to try in order of preference (verified working 2025)
const FREE_MODELS = [
  'google/gemma-3-4b-it:free',
  'nvidia/nemotron-nano-9b-v2:free',
  'arcee-ai/trinity-mini:free',
  'liquid/lfm-2.5-1.2b-instruct:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
]

export function buildSystemPrompt(newsContext?: string): string {
  return `You are Ayoub's AI assistant — a helpful, knowledgeable, and friendly AI for the Ayoub AI Hub website.

About Ayoub:
- Ayoub is a tech and AI content creator and influencer
- YouTube: https://www.youtube.com/@aiwithayoub (AI & tech tutorials, news, reviews)
- TikTok: https://www.tiktok.com/@ayoub.env (short AI tips and demos)
- Instagram: https://www.instagram.com/ayoub.env (AI content and tech updates)
- He covers the latest in AI, machine learning, LLMs, and tech tools

${newsContext ? `Latest AI News (as of today):\n${newsContext}\n` : ''}

Your role:
- Answer questions about AI, machine learning, tech, and related topics
- Share information about Ayoub's content, social media, and projects
- Discuss the latest AI news from the feeds (provided above when available)
- Be conversational, concise, and informative
- For technical questions, provide clear explanations with examples
- Stay on topic: AI, tech, Ayoub's content, and the website features

Keep responses concise (under 300 words unless technical depth is needed). Be friendly and enthusiastic about AI!`
}

export async function createChatStream(
  messages: Omit<ChatMessage, 'id' | 'timestamp'>[],
  newsContext?: string
): Promise<Response> {
  const systemMessage = {
    role: 'system' as const,
    content: buildSystemPrompt(newsContext),
  }

  const apiMessages = [
    systemMessage,
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ]

  const headers = {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
    'X-Title': process.env.OPENROUTER_SITE_NAME || 'Ayoub AI Hub',
    'Content-Type': 'application/json',
  }

  // Try each free model in order until one succeeds
  let lastError = ''
  for (const model of FREE_MODELS) {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: apiMessages,
        stream: true,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    })

    if (response.ok) return response

    lastError = `${response.status}: ${await response.text()}`
    console.warn(`OpenRouter model ${model} failed: ${lastError}`)
  }

  throw new Error(`All OpenRouter models failed. Last error: ${lastError}`)
}
