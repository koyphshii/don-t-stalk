import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedPaths = ["/boxes", "/profile"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from auth pages
  const authPaths = ["/login", "/signup"];
  const isAuthPage = authPaths.some((path) => pathname.startsWith(path));

  if (isAuthPage && session?.user) {
    return NextResponse.redirect(new URL("/boxes", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/boxes/:path*", "/profile/:path*", "/login", "/signup"],
};
