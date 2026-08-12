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

  const isAuthPage =
    pathname === "/sign-up" || pathname === "/login" || pathname === "/";

  if (pathname === "/" && !hasToken) {
    return NextResponse.redirect(new URL("/sign-up", req.url));
  }

  if (isAuthPage && hasToken) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

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


