import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth(function middleware(req) {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // ── Portal routes are handled independently (cookie-based JWT) ──
  // Let all /portal/** and /api/portal/** pass through — those routes
  // manage their own authentication without NextAuth.
  if (pathname.startsWith("/portal") || pathname.startsWith("/api/portal")) {
    return NextResponse.next();
  }

  const isAuthPage = pathname === "/login";
  // Allow all /api/auth/* routes (NextAuth callbacks, signin, etc.)
  const isAuthApi = pathname.startsWith("/api/auth");
  // API routes handle their own 401 — do NOT redirect to /login
  const isApiRoute = pathname.startsWith("/api/");

  if (isAuthApi) return NextResponse.next();
  if (isApiRoute) return NextResponse.next();

  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
