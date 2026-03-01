import Link from 'next/link'
import { Bot, Users, Gamepad2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const sections = [
  {
    icon: Bot,
    title: 'Ask AI Anything',
    description: 'Chat with my AI assistant powered by free LLMs. Ask about AI news, tech topics, or Ayoub\'s content.',
    cta: 'Start Chatting',
    href: '/ask-ai',
    gradient: 'from-cyan-600/20 to-blue-600/20',
    iconColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/20',
    btnClass: 'bg-cyan-600 hover:bg-cyan-500 text-white border-0',
  },
  {
    icon: Users,
    title: 'Join the Community',
    description: 'Connect with AI enthusiasts. Post, comment, discuss trending topics, and follow the latest in AI.',
    cta: 'Join Now',
    href: '/community',
    gradient: 'from-violet-600/20 to-purple-600/20',
    iconColor: 'text-violet-400',
    borderColor: 'border-violet-500/20',
    btnClass: 'bg-violet-600 hover:bg-violet-500 text-white border-0',
  },
  {
    icon: Gamepad2,
    title: 'Play AI Trivia',
    description: 'Test your AI knowledge with 50 questions about machine learning, models, companies, and history.',
    cta: 'Play Now',
    href: '/game',
    gradient: 'from-pink-600/20 to-rose-600/20',
    iconColor: 'text-pink-400',
    borderColor: 'border-pink-500/20',
    btnClass: 'bg-pink-600 hover:bg-pink-500 text-white border-0',
  },
]

export default function CallToAction() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3">
          Explore the <span className="gradient-text">Hub</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Everything you need to stay ahead in AI — news, community, AI assistant, and more.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((section) => (
          <div
            key={section.href}
            className={`relative rounded-2xl border ${section.borderColor} bg-gradient-to-br ${section.gradient} p-6 flex flex-col backdrop-blur-sm`}
          >
            <div className={`w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center mb-4 ${section.iconColor}`}>
              <section.icon className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold mb-2">{section.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5">
              {section.description}
            </p>

            <Link href={section.href}>
              <Button className={`w-full gap-2 ${section.btnClass}`}>
                {section.cta}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
