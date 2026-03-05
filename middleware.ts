import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register", "/about", "/services", "/contact", "/testimonials"];
const INVITE_PATH_PREFIX = "/invite/";
const API_AUTH_PREFIX = "/api/auth";

function isPublicPath(pathname: string) {
  if (pathname.startsWith(API_AUTH_PREFIX)) return true;
  if (pathname.startsWith(INVITE_PATH_PREFIX)) return true;
  return PUBLIC_PATHS.some((path) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  });
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (isPublicPath(pathname)) return NextResponse.next();

  const isWorkspaceRoute = pathname.startsWith("/workspace");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (!isWorkspaceRoute && !isDashboardRoute) return NextResponse.next();

  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const isSecure = req.nextUrl.protocol === "https:";
  const cookieName = isSecure ? "__Secure-authjs.session-token" : "authjs.session-token";

  const token = await getToken({ req, secret, cookieName });

  if (!token?.sub) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect old /dashboard to workspace selector
  if (isDashboardRoute) {
    return NextResponse.redirect(new URL("/workspace", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/workspace/:path*", "/dashboard/:path*"],
};
