// POST /api/stripe/webhooks/v2
// Handles Stripe V2 thin events for connected account requirement changes.
//
// SETUP (one-time, in Stripe Dashboard):
// 1. Developers → Webhooks → + Add destination
// 2. Events from: Connected accounts
// 3. Show advanced options → Payload style: Thin
// 4. Add events:
//    - v2.core.account[requirements].updated
//    - v2.core.account[configuration.merchant].capability_status_updated
//    - v2.core.account[configuration.customer].capability_status_updated
// 5. Set the endpoint URL to: https://your-domain.com/api/stripe/webhooks/v2
// 6. Copy the signing secret to STRIPE_WEBHOOK_SECRET_V2 in your env vars
//
// Local testing:
// stripe listen --thin-events 'v2.core.account[requirements].updated,...' --forward-thin-to localhost:3000/api/stripe/webhooks/v2
import { NextRequest, NextResponse } from 'next/server'
import { stripeClient } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_V2
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET_V2 environment variable')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const body = await request.text()
  const sig  = request.headers.get('stripe-signature') ?? ''

  let thinEvent: any
  try {
    // Parse the thin event using the SDK — validates the signature automatically
    thinEvent = (stripeClient as any).parseThinEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Fetch the full event data from the Stripe API (thin events only carry the event ID)
  const event = await (stripeClient as any).v2.core.events.retrieve(thinEvent.id)

  switch (event.type) {
    case 'v2.core.account[requirements].updated': {
      // Requirements have changed — the connected account may need to provide more info.
      // The account may have new currently_due requirements that need attention.
      const accountId = event.related_object?.id
      console.log(`Requirements updated for account ${accountId}:`, event.data)
      // TODO: notify the user in-app that their Stripe account needs attention
      break
    }

    case 'v2.core.account[configuration.merchant].capability_status_updated': {
      // The merchant capability status changed (e.g. card_payments became active)
      const accountId = event.related_object?.id
      const capability = event.data?.capability_key
      const status     = event.data?.status
      console.log(`Merchant capability ${capability} → ${status} for account ${accountId}`)
      // TODO: update in-app status / unlock features when card_payments becomes 'active'
      break
    }

    case 'v2.core.account[configuration.customer].capability_status_updated': {
      const accountId = event.related_object?.id
      const capability = event.data?.capability_key
      const status     = event.data?.status
      console.log(`Customer capability ${capability} → ${status} for account ${accountId}`)
      break
    }

    default:
      console.log('Unhandled V2 event type:', event.type)
  }

  return NextResponse.json({ received: true })
}
