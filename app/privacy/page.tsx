import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Ayoub AI Hub.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-4xl font-bold mb-2">Privacy <span className="gradient-text">Policy</span></h1>
      <p className="text-muted-foreground mb-8">Last updated: March 2025</p>

      <div className="prose prose-sm prose-invert max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">1. Information We Collect</h2>
          <p>We collect information you provide directly:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong className="text-foreground">Account data:</strong> Email address, display name when you register</li>
            <li><strong className="text-foreground">Community content:</strong> Posts, comments you create</li>
            <li><strong className="text-foreground">Newsletter:</strong> Email address if you subscribe</li>
            <li><strong className="text-foreground">Contact form:</strong> Name, email, and message content</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide and improve the Service</li>
            <li>To send newsletter emails (if subscribed)</li>
            <li>To respond to contact form submissions</li>
            <li>To maintain community safety and moderation</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">3. AI Chat Data</h2>
          <p>Chat conversations with the AI assistant are not stored on our servers. Your chat history is kept only in your browser session and is cleared when you close the chat widget or refresh the page.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">4. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong className="text-foreground">Supabase:</strong> Database and authentication</li>
            <li><strong className="text-foreground">OpenRouter:</strong> AI chat functionality</li>
            <li><strong className="text-foreground">MailerLite:</strong> Newsletter subscriptions</li>
            <li><strong className="text-foreground">Vercel:</strong> Hosting and analytics</li>
            <li><strong className="text-foreground">Google Analytics:</strong> Site usage analytics</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">5. Cookies</h2>
          <p>We use cookies for authentication sessions and analytics. You can disable cookies in your browser settings, though this may affect functionality.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">6. Your Rights</h2>
          <p>You have the right to access, update, or delete your personal data. To exercise these rights, contact us via the <a href="/contact" className="text-primary hover:underline">Contact page</a>.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">7. Data Security</h2>
          <p>We use industry-standard security measures including encrypted connections (HTTPS) and secure authentication via Supabase.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">8. Contact</h2>
          <p>For privacy questions, contact us via the <a href="/contact" className="text-primary hover:underline">Contact page</a>.</p>
        </section>
      </div>
    </div>
  )
}
