import { NextResponse } from 'next/server'
import { verifyCronAuth, getServiceSupabase } from '@/lib/cron-auth'
import { fetchAllNews } from '@/lib/rss'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ayoubaihub.vercel.app'
const MAILERLITE_API = 'https://connect.mailerlite.com/api'

export async function GET(request: Request) {
  const authError = verifyCronAuth(request)
  if (authError) return authError

  const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY
  if (!MAILERLITE_API_KEY || MAILERLITE_API_KEY === 'placeholder_mailerlite_key') {
    return NextResponse.json({ success: false, skipped: true, reason: 'MailerLite not configured' })
  }

  try {
    const supabase = getServiceSupabase()

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString()

    // Fetch top 3 community posts from last 7 days
    const { data: topPosts, error: postsError } = await supabase
      .from('posts')
      .select('id, title, content, view_count, created_at, profiles(username, display_name)')
      .eq('is_deleted', false)
      .gte('created_at', sevenDaysAgoStr)
      .order('view_count', { ascending: false })
      .limit(3)

    if (postsError) throw new Error(postsError.message)

    // Get like counts for each post
    const postsWithLikes = await Promise.all(
      (topPosts || []).map(async (post) => {
        const { data: likesData } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', post.id)
        return { ...post, likeCount: likesData?.length ?? 0 }
      })
    )

    // Fetch top 3 news articles
    const allNews = await fetchAllNews()
    const topNews = allNews.slice(0, 3)

    // Get active subscriber count
    const { data: subscriberData } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('status', 'active')
    const subscriberCount = subscriberData?.length ?? 0

    const weekLabel = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

    // Build HTML email
    const postsHtml = postsWithLikes.length > 0
      ? postsWithLikes.map((post) => {
          const profile = post.profiles as unknown as { username: string; display_name: string } | null
          const author = profile?.display_name || profile?.username || 'Community'
          const excerpt = post.content.slice(0, 150).replace(/[#*`]/g, '') + '...'
          return `
          <div style="margin-bottom:24px;padding:16px;background:#1e1e2e;border-radius:8px;border-left:3px solid #7c3aed;">
            <p style="margin:0 0 4px;font-size:12px;color:#8b8fa8;">${author} · ${post.likeCount} likes · ${post.view_count} views</p>
            <a href="${SITE_URL}/community/${post.id}" style="color:#a78bfa;text-decoration:none;font-size:16px;font-weight:600;">${post.title}</a>
            <p style="margin:8px 0 0;font-size:14px;color:#c4c6d0;">${excerpt}</p>
          </div>`
        }).join('')
      : '<p style="color:#8b8fa8;">No new posts this week. Be the first to share something!</p>'

    const newsHtml = topNews.map((article) => `
      <div style="margin-bottom:16px;padding:12px;background:#1e1e2e;border-radius:8px;">
        <p style="margin:0 0 4px;font-size:12px;color:#8b8fa8;">${article.source}</p>
        <a href="${article.url}" style="color:#22d3ee;text-decoration:none;font-size:15px;font-weight:500;">${article.title}</a>
      </div>`).join('')

    const htmlEmail = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e2e8f0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="margin:0;font-size:24px;background:linear-gradient(135deg,#a78bfa,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Ayoub AI Hub</h1>
      <p style="margin:8px 0 0;color:#8b8fa8;font-size:14px;">Weekly Digest — ${weekLabel}</p>
    </div>

    <h2 style="font-size:18px;color:#e2e8f0;margin:0 0 16px;">Top Community Posts</h2>
    ${postsHtml}

    <h2 style="font-size:18px;color:#e2e8f0;margin:24px 0 16px;">AI News Highlights</h2>
    ${newsHtml}

    <div style="text-align:center;margin-top:32px;padding-top:24px;border-top:1px solid #2a2a3e;">
      <a href="${SITE_URL}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#7c3aed,#0891b2);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Visit Ayoub AI Hub</a>
      <p style="margin:16px 0 0;font-size:12px;color:#4a4a5a;">You're receiving this because you subscribed to Ayoub AI Hub updates.</p>
    </div>
  </div>
</body>
</html>`

    // Create MailerLite campaign
    const campaignRes = await fetch(`${MAILERLITE_API}/campaigns`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MAILERLITE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `Weekly Digest — ${weekLabel}`,
        type: 'regular',
        emails: [{
          subject: `Your AI Weekly Digest — ${weekLabel}`,
          from_name: 'Ayoub AI Hub',
          from: 'noreply@ayoubaihub.com',
          content: htmlEmail,
        }],
        groups: process.env.MAILERLITE_GROUP_ID ? [process.env.MAILERLITE_GROUP_ID] : [],
      }),
    })

    if (!campaignRes.ok) {
      const errText = await campaignRes.text()
      throw new Error(`MailerLite campaign creation failed: ${campaignRes.status} — ${errText}`)
    }

    const campaign = await campaignRes.json()
    const campaignId = campaign.data?.id

    if (!campaignId) {
      throw new Error('No campaign ID returned from MailerLite')
    }

    // Send campaign immediately
    const scheduleRes = await fetch(`${MAILERLITE_API}/campaigns/${campaignId}/schedule`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MAILERLITE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ delivery: 'instant' }),
    })

    if (!scheduleRes.ok) {
      const errText = await scheduleRes.text()
      throw new Error(`MailerLite send failed: ${scheduleRes.status} — ${errText}`)
    }

    return NextResponse.json({
      success: true,
      campaignId,
      subscriberCount,
      postsFeatured: postsWithLikes.length,
      newsFeatured: topNews.length,
    })
  } catch (err) {
    console.error('weekly-digest cron error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
