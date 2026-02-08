import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const protectedPaths = ["/chat", "/dashboard", "/settings", "/interactables"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requiresAuth = protectedPaths.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!requiresAuth) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    const signUpUrl = new URL("/auth/sign-up", request.url);
    signUpUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signUpUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/chat",
    "/chat/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/settings",
    "/settings/:path*",
    "/interactables",
    "/interactables/:path*",
  ],
};
