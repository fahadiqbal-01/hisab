import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  // Pass the raw request to let getToken handle the Secure cookie prefix automatically
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production", // This must match your authOptions
  });

  const { pathname } = req.nextUrl;

  const isAuthPage =
    pathname === "/sign-up" || pathname === "/login" || pathname === "/";

  // If user is authenticated and tries to access login/signup, send to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If user is NOT authenticated and tries to access dashboard, send to signup
  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/sign-up", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|images|video|favicon.ico).*)",
  ],
};
