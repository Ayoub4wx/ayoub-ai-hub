export interface AffiliateTool {
  name: string
  description: string
  price: string
  href: string
  tag?: string
  highlight?: boolean
}

export interface AffiliateCategory {
  name: string
  icon: string
  tools: AffiliateTool[]
}

export const AFFILIATE_CATEGORIES: AffiliateCategory[] = [
  {
    name: 'AI Chat & Writing',
    icon: '💬',
    tools: [
      {
        name: 'ChatGPT Plus',
        description: 'OpenAI\'s flagship AI chat. Access GPT-4o, image generation with DALL-E, and browsing.',
        price: '$20/mo',
        href: 'https://chat.openai.com/?utm_source=ayoubaihub&utm_medium=referral',
        tag: 'Most Popular',
        highlight: true,
      },
      {
        name: 'Claude Pro',
        description: 'Anthropic\'s Claude — best for coding, analysis, and long documents. 200K context window.',
        price: '$20/mo',
        href: 'https://claude.ai/?utm_source=ayoubaihub&utm_medium=referral',
        tag: 'Best for Coding',
      },
      {
        name: 'Gemini Advanced',
        description: 'Google\'s most capable AI model. Integrates with Google Workspace and Search.',
        price: '$19.99/mo',
        href: 'https://gemini.google.com/?utm_source=ayoubaihub&utm_medium=referral',
        tag: 'Best Search AI',
      },
      {
        name: 'Perplexity Pro',
        description: 'AI-powered search engine that cites sources. Best for research and fact-checking.',
        price: '$20/mo',
        href: 'https://perplexity.ai/?utm_source=ayoubaihub&utm_medium=referral',
        tag: 'Best Research',
      },
    ],
  },
  {
    name: 'AI Image Generation',
    icon: '🎨',
    tools: [
      {
        name: 'Midjourney',
        description: 'The gold standard for AI art. Stunning, photorealistic and artistic image generation.',
        price: '$10/mo',
        href: 'https://midjourney.com/?utm_source=ayoubaihub&utm_medium=referral',
        tag: 'Best Quality',
        highlight: true,
      },
      {
        name: 'Adobe Firefly',
        description: 'Adobe\'s AI generator. Safe for commercial use, integrated with Photoshop & Illustrator.',
        price: '$4.99/mo',
        href: 'https://firefly.adobe.com/?utm_source=ayoubaihub&utm_medium=referral',
        tag: 'Commercial Safe',
      },
      {
        name: 'Leonardo AI',
        description: 'Powerful AI image platform with fine-tuned models for game assets, characters, and art.',
        price: '$12/mo',
        href: 'https://leonardo.ai/?utm_source=ayoubaihub&utm_medium=referral',
      },
    ],
  },
  {
    name: 'AI Video & Voice',
    icon: '🎬',
    tools: [
      {
        name: 'ElevenLabs',
        description: 'Best AI voice cloning and text-to-speech. Used by creators and content studios worldwide.',
        price: '$5/mo',
        href: 'https://elevenlabs.io/?utm_source=ayoubaihub&utm_medium=referral',
        tag: 'Best Voice AI',
        highlight: true,
      },
      {
        name: 'Runway ML',
        description: 'Professional AI video generation and editing. Gen-3 Alpha creates cinematic videos.',
        price: '$15/mo',
        href: 'https://runwayml.com/?utm_source=ayoubaihub&utm_medium=referral',
      },
      {
        name: 'HeyGen',
        description: 'Create AI avatar videos from text. Perfect for marketing and educational content.',
        price: '$29/mo',
        href: 'https://heygen.com/?utm_source=ayoubaihub&utm_medium=referral',
      },
    ],
  },
  {
    name: 'AI Coding Tools',
    icon: '💻',
    tools: [
      {
        name: 'Cursor',
        description: 'The AI-first code editor. Chat with your codebase, auto-complete entire functions.',
        price: '$20/mo',
        href: 'https://cursor.com/?utm_source=ayoubaihub&utm_medium=referral',
        tag: 'Top Pick',
        highlight: true,
      },
      {
        name: 'GitHub Copilot',
        description: 'AI pair programmer built into VS Code, JetBrains, and more. Powered by OpenAI.',
        price: '$10/mo',
        href: 'https://github.com/features/copilot?utm_source=ayoubaihub&utm_medium=referral',
      },
      {
        name: 'v0 by Vercel',
        description: 'Generate React UI components from text prompts. Instant Tailwind + shadcn/ui output.',
        price: '$20/mo',
        href: 'https://v0.dev/?utm_source=ayoubaihub&utm_medium=referral',
      },
    ],
  },
  {
    name: 'Free AI Tools (No Sub Needed)',
    icon: '🆓',
    tools: [
      {
        name: 'OpenRouter',
        description: 'Access 100+ AI models (GPT-4, Claude, Llama) with one API key. Free tier available.',
        price: 'Free tier',
        href: 'https://openrouter.ai/?utm_source=ayoubaihub&utm_medium=referral',
        tag: 'What powers this site',
        highlight: true,
      },
      {
        name: 'Groq',
        description: 'Lightning-fast inference for Llama, Mixtral, Gemma models. Ultra-low latency API.',
        price: 'Free tier',
        href: 'https://groq.com/?utm_source=ayoubaihub&utm_medium=referral',
      },
      {
        name: 'Google AI Studio',
        description: 'Free access to Gemini 2.0, Gemini Flash. Build and test AI apps for free.',
        price: 'Free tier',
        href: 'https://aistudio.google.com/?utm_source=ayoubaihub&utm_medium=referral',
      },
      {
        name: 'Hugging Face',
        description: 'The GitHub of AI. 500K+ models, datasets, and spaces. Run models free in your browser.',
        price: 'Free tier',
        href: 'https://huggingface.co/?utm_source=ayoubaihub&utm_medium=referral',
      },
    ],
  },
]
