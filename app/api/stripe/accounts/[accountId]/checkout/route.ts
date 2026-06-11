// POST /api/stripe/accounts/[accountId]/checkout
// Creates a hosted Checkout Session for a customer to purchase a product from a
// connected account. Uses a Direct Charge so the connected account receives the funds,
// and applies an application fee to monetize the transaction for the platform.
import { NextResponse } from 'next/server'
import { stripeClient } from '@/lib/stripe'

export async function POST(request: Request, { params }: { params: { accountId: string } }) {
  const { priceId, productName, unitAmount, currency = 'usd' } = await request.json()
  const { origin } = new URL(request.url)
  const accountId = params.accountId

  // Application fee: 5% of the transaction (adjust this to your monetization rate)
  const applicationFeeAmount = unitAmount ? Math.round(unitAmount * 0.05) : 50

  const session = await stripeClient.checkout.sessions.create(
    {
      line_items: [
        {
          // Use an existing price ID if provided, otherwise build price data inline
          ...(priceId
            ? { price: priceId, quantity: 1 }
            : {
                price_data: {
                  currency,
                  unit_amount: unitAmount,
                  product_data: { name: productName ?? 'Product' },
                },
                quantity: 1,
              }),
        },
      ],
      payment_intent_data: {
        // Application fee stays with the platform; the rest goes to the connected account
        application_fee_amount: applicationFeeAmount,
      },
      mode: 'payment',
      // TODO: replace accountId with a slug/handle in the URL for production
      success_url: `${origin}/store/${accountId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/store/${accountId}`,
    },
    // Pass the connected account so the charge is made on their behalf (Direct Charge)
    { stripeAccount: accountId }
  )

  return NextResponse.json({ url: session.url })
}
