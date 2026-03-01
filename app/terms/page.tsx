import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Ayoub AI Hub.',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-4xl font-bold mb-2">Terms of <span className="gradient-text">Service</span></h1>
      <p className="text-muted-foreground mb-8">Last updated: March 2025</p>

      <div className="prose prose-sm prose-invert max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">1. Acceptance of Terms</h2>
          <p>By accessing and using Ayoub AI Hub (&quot;the Site&quot;), you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use the Site.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">2. Use of the Service</h2>
          <p>You agree to use the Site only for lawful purposes. You may not use the Site to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Post spam, abusive, or harmful content</li>
            <li>Impersonate others or provide false information</li>
            <li>Attempt to gain unauthorized access to any part of the Site</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">3. Community Content</h2>
          <p>Users may post content in the Community section. You are responsible for the content you post. We reserve the right to remove content that violates these Terms.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">4. AI Assistant</h2>
          <p>The AI assistant is powered by third-party language models. The information provided may not always be accurate. Do not rely on AI-generated content for critical decisions.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">5. Intellectual Property</h2>
          <p>All original content on this Site is owned by Ayoub AI Hub. News content is sourced from third-party RSS feeds and belongs to their respective owners.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">6. Limitation of Liability</h2>
          <p>The Site is provided &quot;as is&quot; without warranties. We are not liable for any damages arising from your use of the Site.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">7. Changes to Terms</h2>
          <p>We may update these Terms from time to time. Continued use of the Site after changes constitutes acceptance of the new Terms.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">8. Contact</h2>
          <p>For questions about these Terms, please use the <a href="/contact" className="text-primary hover:underline">Contact page</a>.</p>
        </section>
      </div>
    </div>
  )
}
