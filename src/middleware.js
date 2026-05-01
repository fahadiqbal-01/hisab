import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // If they are logged in and try to go to sign-up/login/root, send them to dashboard
    const isAuthPage =
      pathname === "/" || pathname === "/sign-up" || pathname === "/login";
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      // This logic determines if the middleware should even run
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Allow public access to these paths
        if (
          pathname === "/" ||
          pathname === "/sign-up" ||
          pathname === "/login" ||
          pathname.startsWith("/api/auth")
        ) {
          return true;
        }
        // Require token for everything else (like /dashboard)
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
    // Protect everything except internal Next.js and static assets
    "/((?!api/auth|_next/static|_next/image|images|video|favicon.ico).*)",
  ],
};
