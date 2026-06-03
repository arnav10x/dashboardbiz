import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
  },
  pro: {
    name: 'Premium',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
  },
}
