import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, firstName } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const API_KEY = process.env.MAILERLITE_API_KEY
    const GROUP_ID = process.env.MAILERLITE_GROUP_ID

    if (!API_KEY || API_KEY === 'placeholder_mailerlite_key') {
      // Dev mode: just return success
      return NextResponse.json({ success: true, message: 'Subscribed (dev mode)' })
    }

    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        fields: { name: firstName || '' },
        groups: GROUP_ID ? [GROUP_ID] : [],
      }),
    })

    if (!response.ok && response.status !== 409) {
      throw new Error(`MailerLite error: ${response.status}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter API error:', error)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
