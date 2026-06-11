// POST /api/stripe/webhooks/subscriptions
// Handles Stripe V1 webhook events for subscription lifecycle management.
// These are standard (non-thin) events.
//
// SETUP (one-time, in Stripe Dashboard):
// 1. Developers → Webhooks → + Add destination
// 2. Events from: Your account (platform)
// 3. Select these events:
//    customer.subscription.created, customer.subscription.updated,
//    customer.subscription.deleted, invoice.payment_succeeded,
//    invoice.payment_failed, payment_method.attached, payment_method.detached,
//    customer.updated, customer.tax_id.created, customer.tax_id.deleted,
//    customer.tax_id.updated, billing_portal.session.created
// 4. Set the endpoint URL to: https://your-domain.com/api/stripe/webhooks/subscriptions
// 5. Copy the signing secret to STRIPE_WEBHOOK_SECRET_SUBS in your env vars
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripeClient } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_SUBS
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET_SUBS environment variable')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const body = await request.text()
  const sig  = request.headers.get('stripe-signature') ?? ''

  let event: any
  try {
    event = stripeClient.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createClient()

  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const subscription = event.data.object

      // For V2 accounts, the connected account ID is in customer_account (not customer)
      const accountId = subscription.customer_account ?? subscription.customer

      // Determine effective subscription status
      let status = subscription.status
      if (subscription.cancel_at_period_end) status = 'canceling'
      if (subscription.pause_collection)      status = 'paused'

      const priceId = subscription.items?.data?.[0]?.price?.id
      const qty     = subscription.items?.data?.[0]?.quantity

      console.log(`Subscription ${subscription.id} updated: status=${status}, price=${priceId}, qty=${qty}, account=${accountId}`)

      // TODO: Update DB — grant/adjust access based on new price/quantity
      // Example:
      // await supabase
      //   .from('user_settings')
      //   .update({ stripe_subscription_id: subscription.id, stripe_subscription_status: status })
      //   .eq('stripe_account_id', accountId) // join via connected account
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const accountId = subscription.customer_account ?? subscription.customer

      console.log(`Subscription ${subscription.id} canceled for account ${accountId}`)

      // TODO: Revoke access — remove pro features for this account
      // await supabase
      //   .from('user_settings')
      //   .update({ stripe_subscription_id: null, stripe_subscription_status: 'canceled' })
      //   .eq('stripe_account_id', accountId)
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object
      console.log(`Invoice paid: ${invoice.id}, amount: ${invoice.amount_paid}`)
      // TODO: Record successful payment, unlock any usage-based features
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      const accountId = invoice.customer_account ?? invoice.customer
      console.log(`Payment failed for account ${accountId}, invoice ${invoice.id}`)
      // TODO: Notify user to update payment method; grace period logic goes here
      break
    }

    case 'payment_method.attached': {
      const pm = event.data.object
      console.log(`Payment method added: ${pm.id}, customer: ${pm.customer}`)
      break
    }

    case 'payment_method.detached': {
      const pm = event.data.object
      console.log(`Payment method removed: ${pm.id}`)
      break
    }

    case 'customer.updated': {
      const customer = event.data.object
      // Check for default payment method changes; treat billing email as billing only,
      // never as a login credential
      console.log(`Customer updated: ${customer.id}, default_pm: ${customer.invoice_settings?.default_payment_method}`)
      break
    }

    case 'customer.tax_id.created':
    case 'customer.tax_id.deleted':
    case 'customer.tax_id.updated': {
      const taxId = event.data.object
      console.log(`Tax ID event ${event.type}: ${taxId.id}`)
      break
    }

    case 'billing_portal.configuration.created':
    case 'billing_portal.configuration.updated':
    case 'billing_portal.session.created': {
      console.log(`Billing portal event: ${event.type}`)
      break
    }

    default:
      console.log('Unhandled subscription event type:', event.type)
  }

  return NextResponse.json({ received: true })
}
