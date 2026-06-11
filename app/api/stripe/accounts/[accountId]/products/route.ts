// GET  /api/stripe/accounts/[accountId]/products — list products on the connected account
// POST /api/stripe/accounts/[accountId]/products — create a product on the connected account
//
// All operations use the Stripe-Account header (stripeAccount option) so they act on
// the connected account, not the platform account.
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripeClient } from '@/lib/stripe'

export async function GET(_req: Request, { params }: { params: { accountId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Retrieve active products with their default price for display in the storefront
  const products = await stripeClient.products.list(
    { limit: 20, active: true, expand: ['data.default_price'] },
    { stripeAccount: params.accountId }
  )

  return NextResponse.json({ products: products.data })
}

export async function POST(request: Request, { params }: { params: { accountId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description, price, currency = 'usd' } = await request.json()
  if (!name || !price) {
    return NextResponse.json({ error: 'name and price are required' }, { status: 400 })
  }

  const priceInCents = Math.round(Number(price) * 100)
  if (isNaN(priceInCents) || priceInCents <= 0) {
    return NextResponse.json({ error: 'price must be a positive number' }, { status: 400 })
  }

  // Create the product with an inline default price on the connected account
  const product = await stripeClient.products.create(
    {
      name,
      description: description || undefined,
      default_price_data: {
        unit_amount: priceInCents,
        currency,
      },
    },
    { stripeAccount: params.accountId }
  )

  return NextResponse.json({ product })
}
