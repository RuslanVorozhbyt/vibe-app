import { streamObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { journalSchema } from '@/app/schemas/journalSchema'
import { supabaseClient } from '@/app/lib/supabaseClient'
import { ValidSubscriptionStatus } from '@/app/enums/ValidSubscriptionStatus'
import {auth} from '@clerk/nextjs/server'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 })
    }

    const { text } = await req.json()
    if (!text || !text.trim()) {
      return new Response(JSON.stringify({ error: 'Text is required' }), { status: 400 })
    }

    const { data: subsData } = await supabaseClient
      .from('subscriptions')
      .select('status')
      .eq('clerk_user_id', userId)
      .single()

    const isSubscribed = subsData
      ? subsData.status === ValidSubscriptionStatus.ACTIVE || subsData.status === ValidSubscriptionStatus.TRIALING
      : false

    if (!isSubscribed) {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)

      const { count: dailyCount } = await supabaseClient
        .from('journal_requests')
        .select('id', { count: 'exact', head: true })
        .eq('clerk_user_id', userId)
        .gte('created_at', todayStart.toISOString())
        .lte('created_at', todayEnd.toISOString())

      if ((dailyCount || 0) >= 5) {
        return new Response(
          JSON.stringify({ error: 'Daily limit reached for unsubscribed users (5 requests/day)' }),
          { status: 429 }
        )
      }

      await supabaseClient.from('journal_requests').insert({
        clerk_user_id: userId,
      })
    }

    const result = await streamObject({
      model: openai('gpt-4o-mini'),
      schema: journalSchema,
      prompt: `Analyze this journal entry and return an object describing the user's emotional state. Entry: "${text}"`,
    })

    return result.toTextStreamResponse()
  } catch (err) {
    console.error('Error in /api/analyze:', err)
    return new Response(JSON.stringify({ error: 'Failed to analyze journal entry' }), { status: 500 })
  }
}
