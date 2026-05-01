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
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, video (your public assets)
     */
    "/((?!api|_next/static|_next/image|images|video|favicon.ico).*)",
  ],
};
