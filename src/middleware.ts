import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decode } from "@auth/core/jwt";

const cookieName =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const cookie = request.cookies.get(cookieName);
  const session = cookie?.value
    ? await decode({
        token: cookie.value,
        secret: process.env.NEXTAUTH_SECRET!,
        salt: cookieName,
      }).catch(() => null)
    : null;

  const protectedPaths = ["/boxes", "/profile"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

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
