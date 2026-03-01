'use client'

import { useState } from 'react'
import { Send, Youtube, Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Failed')

      setSent(true)
      toast({ title: 'Message sent!', description: 'I\'ll get back to you soon.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to send message. Try again.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">
          Get in <span className="gradient-text">Touch</span>
        </h1>
        <p className="text-muted-foreground">Have a question, collab idea, or just want to say hi?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact info */}
        <div className="space-y-4">
          <Card className="border-border bg-secondary/30">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Connect</h3>
              <div className="space-y-3">
                <a
                  href="https://www.youtube.com/@aiwithayoub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm hover:text-red-400 transition-colors"
                >
                  <Youtube className="w-5 h-5 text-red-500" />
                  @aiwithayoub
                </a>
                <a
                  href="https://www.instagram.com/ayoub.env"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm hover:text-pink-400 transition-colors"
                >
                  <Instagram className="w-5 h-5 text-pink-500" />
                  @ayoub.env
                </a>
                <a
                  href="https://www.tiktok.com/@ayoub.env"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm hover:text-foreground transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.26 6.26 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.16 8.16 0 004.77 1.52V6.78a4.85 4.85 0 01-1-.09z" />
                  </svg>
                  @ayoub.env
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-gradient-to-br from-violet-900/30 to-cyan-900/20">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-2">Collaboration?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Open to partnerships, sponsorships, and AI project collaborations.
                Reach out with your idea!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact form */}
        <div className="lg:col-span-2">
          {sent ? (
            <Card className="border-border bg-secondary/20">
              <CardContent className="p-8 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-xl font-bold mb-2">Message Sent!</h2>
                <p className="text-muted-foreground">Thanks for reaching out! I&apos;ll get back to you soon.</p>
                <Button
                  className="mt-6"
                  variant="outline"
                  onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                >
                  Send Another
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border bg-secondary/20">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Name *</label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your name"
                        required
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Email *</label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        required
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Subject</label>
                    <Input
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="What&apos;s this about?"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Message *</label>
                    <Textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Your message..."
                      rows={6}
                      required
                      className="bg-secondary border-border resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full gap-2 bg-violet-600 hover:bg-violet-500 text-white border-0"
                  >
                    <Send className="w-4 h-4" />
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
