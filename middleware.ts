import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/auth";
import { dashboardByRole, isAllowedForPath, PUBLIC_PATHS } from "@/lib/rbac";

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  });
}

export default auth((req: NextRequest) => {
  const request = req as NextRequest & {
    auth?: { user?: { role?: string; mustChangePassword?: boolean } };
  };
  const pathname = request.nextUrl.pathname;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  if (!request.auth?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (request.auth.user.mustChangePassword && !pathname.startsWith("/dashboard/change-password")) {
    return NextResponse.redirect(new URL("/dashboard/change-password", request.url));
  }

  const role = request.auth.user.role;
  if (!role || !isAllowedForPath(pathname, role)) {
    const fallback = dashboardByRole[role as keyof typeof dashboardByRole] ?? "/";
    return NextResponse.redirect(new URL(fallback, request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/", "/about", "/services", "/testimonials", "/contact"],
};
