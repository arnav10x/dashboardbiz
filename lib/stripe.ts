import Stripe from 'stripe'

// REQUIRED: Set STRIPE_SECRET_KEY in your environment variables.
// Get this from: dashboard.stripe.com → Developers → API keys → Secret key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    'Missing STRIPE_SECRET_KEY environment variable. ' +
    'Add it to .env.local (local) or your Vercel project settings (production).'
  )
}

// Single shared Stripe client — use this for ALL Stripe requests throughout the app.
// The API version is set automatically by the SDK to the latest pinned version.
export const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY)
