import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Redirect authenticated users away from landing/auth pages
    const isAuthPage =
      pathname === "/" || pathname === "/sign-up" || pathname === "/login";

    if (isAuthPage && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Only runs the middleware logic if this returns true
      // This ensures we don't redirect people who are already on the sign-up page
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        const isAuthPage =
          pathname === "/" || pathname === "/sign-up" || pathname === "/login";

        // If it's an auth page, we don't require a token to view it
        if (isAuthPage) return true;

        // Otherwise, require a token (protects /dashboard and others)
        return !!token;
      },
    },
    pages: {
      signIn: "/sign-up",
    },
  },
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api/auth (NextAuth endpoints - MUST be excluded)
     * 2. /_next (Static files)
     * 3. /images, /video, favicon.ico (Assets)
     */
    "/((?!api/auth|_next/static|_next/image|images|video|favicon.ico).*)",
  ],
};
