import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Protect all routes under /(dashboard) — redirect unauthenticated users to /login.
// The NextAuth session is validated via JWT; no database call is made per request.
//
// Public routes (no auth required):
//   /login         — Azure AD SSO sign-in page
//   /api/auth/**   — NextAuth.js internal routes
//
// All other routes require a valid session.

export default withAuth(
  function middleware(req) {
    // Additional role-based checks can be added here in future sprints.
    // For now, a valid session is sufficient to access the dashboard.
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Protect all routes except:
     *   - /login (sign-in page)
     *   - /api/auth/** (NextAuth.js routes)
     *   - /_next/** (Next.js internals)
     *   - /favicon.ico, /robots.txt (static files)
     */
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico|robots.txt).*)",
  ],
};
