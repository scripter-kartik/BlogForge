import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/protected/")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.email) {
      console.log("Unauthorized API access attempt:", pathname);
      return NextResponse.json(
        { error: "Unauthorized - Please login to access this resource" },
        { status: 401 }
      );
    }

    const userId = token._id || token.id || token.sub;

    if (!userId) {
      console.error("No user ID in token:", token);
      return NextResponse.json(
        { error: "Invalid session - Please login again" },
        { status: 401 }
      );
    }

    console.log("Authorized API access:", {
      userId,
      email: token.email,
      provider: token.provider,
      path: pathname
    });

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", userId);
    requestHeaders.set("x-user-email", token.email);
    requestHeaders.set("x-username", token.username || "");
    requestHeaders.set("x-user-name", token.name || "");
    requestHeaders.set("x-user-provider", token.provider || "credentials");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (
    pathname.startsWith("/write") ||
    pathname.startsWith("/dashboard") ||
    pathname === "/profile" // Own profile page
  ) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.email) {
      console.log("Unauthorized page access attempt:", pathname);
      const url = new URL("/", request.url);
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }

    console.log("Authorized page access:", {
      email: token.email,
      path: pathname
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/protected/:path*",
    "/write/:path*",
    "/dashboard/:path*",
    "/profile"
  ],
};