import { redirect } from 'next/navigation'
import AiBloggerAdminPanel from '@/components/admin/AiBloggerAdminPanel'
import { getAiBloggerAdminPassword, isAiBloggerAdminAuthenticated } from '@/lib/ai-blogger-admin'

export default function AiBloggerAdminPage() {
  if (!getAiBloggerAdminPassword()) {
    return (
      <div className="min-h-screen px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-secondary/30 p-8">
          <h1 className="text-3xl font-bold mb-3">AI Blogger Admin</h1>
          <p className="text-muted-foreground">
            Set `AI_BLOGGER_ADMIN_PASSWORD` in `.env.local` to enable this panel.
          </p>
        </div>
      </div>
    )
  }

  if (!isAiBloggerAdminAuthenticated()) {
    redirect('/ai-blogger-admin/login')
  }

  return <AiBloggerAdminPanel />
}
