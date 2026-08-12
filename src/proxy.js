import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function proxy(req) {
  let token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: "__Secure-next-auth.session-token",
    });
  }

  if (!token) {
    token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: "next-auth.session-token",
    });
  }

  const { pathname } = req.nextUrl;
  const hasToken = !!token?.id && !token?.error;

  // Root landing page "/" redirects based on authentication state
  if (pathname === "/") {
    if (hasToken) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/sign-up", req.url));
  }

  // Protected dashboard routes require authentication
  if (pathname.startsWith("/dashboard") && !hasToken) {
    return NextResponse.redirect(new URL("/sign-up", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|images|video|favicon.ico).*)",
  ],
};


