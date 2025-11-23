import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const GATEWAY_COOKIE = "gateway_auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that don't require any authentication
  const publicPaths = ["/api/gateway", "/api/auth/register"];
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check gateway authentication for non-root paths
  if (pathname !== "/") {
    const gatewayAuth = request.cookies.get(GATEWAY_COOKIE);

    if (!gatewayAuth) {
      // Redirect to gateway (root page)
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Auth pages - redirect to dashboard if already logged in
  if (pathname.startsWith("/auth/")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Protected routes - require NextAuth session
  const protectedPaths = ["/dashboard", "/projects"];
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
