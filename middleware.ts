import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

import { dashboardByRole, isAllowedForPath, PUBLIC_PATHS } from "@/lib/rbac/paths";

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  });
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (isPublicPath(pathname)) return NextResponse.next();
  if (!pathname.startsWith("/dashboard")) return NextResponse.next();

  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  // next-auth v5 renamed the cookie: __Secure- prefix on HTTPS, plain on HTTP
  const isSecure = req.nextUrl.protocol === "https:";
  const cookieName = isSecure
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

  const token = await getToken({ req, secret, cookieName });

  if (!token?.sub) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token.mustChangePassword && !pathname.startsWith("/dashboard/change-password")) {
    return NextResponse.redirect(new URL("/dashboard/change-password", req.url));
  }

  const role = token.role as string | undefined;
  if (!role || !isAllowedForPath(pathname, role)) {
    const fallback = dashboardByRole[role as keyof typeof dashboardByRole] ?? "/";
    return NextResponse.redirect(new URL(fallback, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
