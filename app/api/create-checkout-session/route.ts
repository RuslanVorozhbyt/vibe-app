import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {ApplicationRoutes} from "@/app/enums/ApplicationRoutes";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

export async function POST(req: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { priceId } = await req.json()

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      client_reference_id: userId,
      metadata: {
        clerk_user_id: userId,
      },

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      success_url: `${req.headers.get('origin')}/${ApplicationRoutes.SUCCESS}`,
      cancel_url: `${req.headers.get('origin')}${ApplicationRoutes.PLANS}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
