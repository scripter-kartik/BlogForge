// src/middleware.js - AUTHENTICATION MIDDLEWARE
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  // Protect API routes that need authentication
  if (request.nextUrl.pathname.startsWith("/api/protected/")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - Please login to access this resource" },
        { status: 401 }
      );
    }

    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("user-id", token._id || token.sub || "");
    requestHeaders.set("user-email", token.email || "");
    requestHeaders.set("username", token.username || "");
    requestHeaders.set("user-name", token.name || "");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Protect client-side routes
  if (
    request.nextUrl.pathname.startsWith("/write") ||
    request.nextUrl.pathname.startsWith("/profile")
  ) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/protected/:path*", "/write/:path*", "/profile/:path*"],
};
