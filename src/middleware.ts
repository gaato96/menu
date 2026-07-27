import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { StaffRole } from "@/types/database";

/**
 * Refreshes the Supabase session on every request and gates the private areas.
 *
 * This is a UX layer, not the security boundary — RLS is. Someone who defeats
 * this still reads nothing, because every policy scopes on the JWT claims.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getClaims() validates the token rather than trusting whatever is in the
  // cookie, and hands back our custom claims in one round trip.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as
    | { sub?: string; user_role?: StaffRole | ""; business_id?: string | null }
    | undefined;

  const { pathname } = request.nextUrl;
  const isSignedIn = Boolean(claims?.sub);
  const role = claims?.user_role || null;

  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    return NextResponse.redirect(url);
  };

  if (pathname.startsWith("/panel")) {
    if (!isSignedIn) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      // Come back to whatever they were reaching for after signing in.
      url.search = `?next=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
    // A superadmin has no business of their own; their home is /admin.
    if (role === "superadmin") return redirectTo("/admin");
    // Signed in but with no role claim: a deactivated employee, or the JWT hook
    // is not enabled on the project.
    if (!role || !claims?.business_id) return redirectTo("/sin-acceso");
  }

  if (pathname.startsWith("/admin")) {
    if (!isSignedIn) return redirectTo("/login");
    if (role !== "superadmin") return redirectTo("/panel");
  }

  if (pathname === "/login" && isSignedIn) {
    return redirectTo(role === "superadmin" ? "/admin" : "/panel");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and the PWA files. The service worker in
     * particular must never be routed through auth, or an expired session turns
     * into a 307 where a JavaScript file was expected and the install breaks.
     */
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icons/|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?)$).*)",
  ],
};
