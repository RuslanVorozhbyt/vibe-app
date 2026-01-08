import { clerkMiddleware } from '@clerk/nextjs/server';
import {NextResponse} from "next/server";
import {ApplicationRoutes} from "@/app/enums/ApplicationRoutes";

export default clerkMiddleware(async (auth, req) => {
  const user = await auth()

  if (!user.userId && req.nextUrl.pathname !== ApplicationRoutes.SIGN_UP) {
    return NextResponse.redirect(new URL(ApplicationRoutes.SIGN_UP, req.url));
  }

  if (user.userId && req.nextUrl.pathname === ApplicationRoutes.SIGN_UP) {
    return NextResponse.redirect(new URL(ApplicationRoutes.JOURNAL, req.url));
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
