import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const FEEDBACK_INBOX = 'prspectve@outlook.com'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { type?: string; location?: string; message?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  const { type = 'feedback', location, message } = body
  if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 })

  const typeLabel = type === 'bug' ? 'Bug Report' : type === 'feature' ? 'Feature Request' : 'General Feedback'
  const subject   = `[prspectve Beta] ${typeLabel}${type === 'bug' && location ? ` — ${location}` : ''}`

  // Best-effort email — feedback must never be lost just because email isn't configured
  let emailed = false
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 16px;font-size:18px;color:#111">${typeLabel}</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <tr><td style="padding:6px 12px;background:#f4f4f5;font-size:12px;font-weight:600;color:#555;width:120px">From</td><td style="padding:6px 12px;font-size:13px;color:#111">${user.email}</td></tr>
          <tr><td style="padding:6px 12px;background:#f4f4f5;font-size:12px;font-weight:600;color:#555">Type</td><td style="padding:6px 12px;font-size:13px;color:#111">${typeLabel}</td></tr>
          ${location ? `<tr><td style="padding:6px 12px;background:#f4f4f5;font-size:12px;font-weight:600;color:#555">Location</td><td style="padding:6px 12px;font-size:13px;color:#111">${location}</td></tr>` : ''}
        </table>
        <div style="background:#f9fafb;border-left:3px solid #8b5cf6;padding:14px 18px;border-radius:4px">
          <p style="margin:0;font-size:14px;color:#333;white-space:pre-wrap">${message.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        </div>
      </div>
    `
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to:   FEEDBACK_INBOX,
          subject,
          html,
        }),
      })
      emailed = res.ok
    } catch {
      emailed = false
    }
  }

  // Source of truth: persist to the feedback table
  const { error: dbError } = await supabase.from('feedback').insert({
    user_id: user.id,
    email: user.email,
    type,
    location: location || null,
    message: message.trim(),
    emailed,
  })

  if (dbError && !emailed) {
    return NextResponse.json({ error: dbError.message }, { status: 502 })
  }

  return NextResponse.json({ success: true, emailed })
}
