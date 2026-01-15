import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/app/lib/supabaseAdmin'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('status')
    .eq('clerk_user_id', userId)
    .single()

  return Response.json({
    active: data?.status === 'active' || data?.status === 'trialing',
  })
}
