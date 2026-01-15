import {StripeActions} from "@/app/enums/StripeActions";

export const runtime = 'nodejs'

import Stripe from 'stripe'
import { supabaseAdmin } from '@/app/lib/supabaseAdmin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('Missing signature', { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('❌ Webhook verification failed', err)
    return new Response('Invalid signature', { status: 400 })
  }

  try {
    switch (event.type) {
      case StripeActions.SESSION_COMPLETED: {
        const session = event.data.object as Stripe.Checkout.Session

        const clerkUserId =
          session.client_reference_id ??
          session.metadata?.clerk_user_id ??
          null

        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : null

        if (!clerkUserId || !subscriptionId) {
          console.warn('⚠️ Missing user or subscription', {
            clerkUserId,
            subscriptionId,
          })
          break
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        const currentPeriodEnd =
          //@ts-expect-error
          typeof subscription.current_period_end === 'number'
            //@ts-expect-error
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null

        const priceId =
          subscription.items.data[0]?.price?.id ?? null

        const { error } = await supabaseAdmin
          .from('subscriptions')
          .upsert(
            {
              clerk_user_id: clerkUserId,
              stripe_customer_id: subscription.customer as string,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              price_id: priceId,
              current_period_end: currentPeriodEnd,
            },
            { onConflict: 'clerk_user_id' }
          )

        if (error) {
          console.error('❌ Supabase upsert failed:', error)
        } else {
          console.log('✅ Subscription saved')
        }

        break
      }

      case StripeActions.CUSTOMER_SUBSCRIPTION_UPDATED:
      case StripeActions.CUSTOMER_SUBSCRIPTION_DELETED: {
        const subscription = event.data.object as Stripe.Subscription

        const currentPeriodEnd =
          //@ts-expect-error
          typeof subscription.current_period_end === 'number'
            //@ts-expect-error
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null

        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: currentPeriodEnd,
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('❌ Supabase update failed:', error)
        } else {
          console.log('✅ Subscription updated')
        }

        break
      }

      default:
        console.log('ℹ️ Ignored event:', event.type)
    }
  } catch (err) {
    console.error('❌ Webhook handler crashed:', err)
  }

  return new Response('OK', { status: 200 })
}
