import Stripe from 'stripe'

export function createStripeClient(apiKey: string): Stripe {
  return new Stripe(apiKey, { apiVersion: '2023-10-16' })
}
