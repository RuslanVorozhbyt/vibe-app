import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabaseAdmin'
import { ApplicationRoutes } from '@/app/enums/ApplicationRoutes'
import { ValidSubscriptionStatus } from '@/app/enums/ValidSubscriptionStatus'
import { ApplicationApiRoutes } from '@/app/enums/ApplicationApiRoutes'

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl
  if (
    pathname === ApplicationApiRoutes.STRIPE_WEBHOOK ||
    pathname === ApplicationApiRoutes.CLERK_WEBHOOK
  ) {
    return NextResponse.next()
  }

  const user = await auth()

  if (!user.userId && pathname !== ApplicationRoutes.SIGN_UP) {
    return NextResponse.redirect(new URL(ApplicationRoutes.SIGN_UP, req.url))
  }

  if (user.userId && pathname === ApplicationRoutes.SIGN_UP) {
    return NextResponse.redirect(new URL(ApplicationRoutes.JOURNAL, req.url))
  }

  if (user.userId) {
    const { data: subscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('status')
      .eq('clerk_user_id', user.userId)
      .limit(1)

    const active =
      subscriptions?.[0]?.status === ValidSubscriptionStatus.ACTIVE ||
      subscriptions?.[0]?.status === ValidSubscriptionStatus.TRIALING

    if (!active && pathname.startsWith(ApplicationRoutes.PRO_DASHBOARD)) {
      return NextResponse.redirect(new URL(ApplicationRoutes.PLANS, req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|png|gif|svg|ttf|woff2?|ico)).*)',
    '/api/(.*)',
  ],
}
