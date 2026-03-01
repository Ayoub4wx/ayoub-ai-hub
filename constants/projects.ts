export interface Project {
  id: string
  title: string
  description: string
  tags: string[]
  githubUrl?: string
  demoUrl?: string
  imageUrl?: string
  featured: boolean
}

export const PROJECTS: Project[] = [
  {
    id: 'ai-news-hub',
    title: 'AI News Hub',
    description: 'A real-time AI news aggregator pulling from multiple RSS feeds with intelligent filtering and AI-powered summaries.',
    tags: ['Next.js', 'OpenRouter', 'RSS', 'Supabase'],
    demoUrl: 'https://ayoubai.com/news',
    featured: true,
  },
  {
    id: 'ai-chatbot',
    title: 'Ayoub AI Assistant',
    description: 'A streaming AI chatbot powered by free LLMs via OpenRouter with context about AI news and Ayoub\'s content.',
    tags: ['OpenRouter', 'Streaming', 'Next.js', 'AI'],
    demoUrl: 'https://ayoubai.com/ask-ai',
    featured: true,
  },
  {
    id: 'ai-trivia',
    title: 'AI Trivia Game',
    description: 'An interactive trivia game with 50 AI/ML questions, timer, streak tracking, and leaderboard.',
    tags: ['React', 'TypeScript', 'Game Dev'],
    demoUrl: 'https://ayoubai.com/game',
    featured: true,
  },
  {
    id: 'ai-community',
    title: 'Tech Community Platform',
    description: 'A fully-featured discussion platform for AI enthusiasts with posts, comments, likes, and real-time updates.',
    tags: ['Supabase', 'Realtime', 'Auth', 'PostgreSQL'],
    demoUrl: 'https://ayoubai.com/community',
    featured: false,
  },
]
