import { redirect } from 'next/navigation'
import { isAiBloggerAdminAuthenticated } from '@/lib/ai-blogger-admin'
import AiBloggerAdminLogin from '@/components/admin/AiBloggerAdminLogin'

export default function AiBloggerAdminLoginPage() {
  if (isAiBloggerAdminAuthenticated()) {
    redirect('/ai-blogger-admin')
  }

  return <AiBloggerAdminLogin />
}
