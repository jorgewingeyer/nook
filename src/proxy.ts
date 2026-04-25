import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESSION } from "./lib/constants";
import { decrypt } from "./lib/session";

const AUTH_ROUTES = ["/login"];
const PUBLIC_ROUTES = ["/login"];
const ADMIN_ROUTE_PREFIXES = ["/admin"];
const CHANGE_PASSWORD_ROUTE = "/change-password";
const STRICT_ADMIN_ROUTES = ["/admin/users", "/admin/settings"];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isAdminRoute = ADMIN_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || !isAdminRoute;
  const isStrictAdminRoute = STRICT_ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  const session = request.cookies.get(COOKIE_SESSION)?.value;
  const payload = session ? await decrypt(session) : null;

  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (!session && isAdminRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && payload?.mustChangePassword) {
    if (pathname !== CHANGE_PASSWORD_ROUTE) {
      return NextResponse.redirect(
        new URL(CHANGE_PASSWORD_ROUTE, request.url),
      );
    }
    return NextResponse.next();
  }

  if (
    pathname === CHANGE_PASSWORD_ROUTE &&
    session &&
    !payload?.mustChangePassword
  ) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (session && isStrictAdminRoute && payload?.role !== "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|avif|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
