import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { ApplicationRoutes } from '@/app/enums/ApplicationRoutes'
import {ApplicationApiRoutes} from "@/app/enums/ApplicationApiRoutes";

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl

  if (pathname === ApplicationApiRoutes.CLERK_WEBHOOK) {
    return NextResponse.next()
  }

  const user = await auth()

  if (!user.userId && pathname !== ApplicationRoutes.SIGN_UP) {
    return NextResponse.redirect(new URL(ApplicationRoutes.SIGN_UP, req.url))
  }

  if (user.userId && pathname === ApplicationRoutes.SIGN_UP) {
    return NextResponse.redirect(new URL(ApplicationRoutes.JOURNAL, req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/api/(.*)',
  ],
}
