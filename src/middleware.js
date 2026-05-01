import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // 1. Allow the root path and auth pages to be accessed without a token
  const isAuthPage =
    pathname === "/sign-up" || pathname === "/login" || pathname === "/";

  // 2. Redirect authenticated users away from auth pages to dashboard
  if (isAuthPage && token && pathname !== "/dashboard") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 3. Protect dashboard: If no token, send to sign-up
  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/sign-up", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude internal Next.js paths and static assets from middleware
    "/((?!api/auth|_next|images|video|favicon.ico).*)",
  ],
};
