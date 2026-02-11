import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { fetchUserProfile } from "@/lib/auth/profile";
import { getRoleHome } from "@/lib/auth/roles";

const PROTECTED_SEGMENTS = new Set(["admin", "staff", "driver"]);

function getRequiredRole(pathname: string): "admin" | "staff" | "driver" | null {
  const [, firstSegment] = pathname.split("/");
  if (!firstSegment) return null;
  if (PROTECTED_SEGMENTS.has(firstSegment)) {
    return firstSegment as "admin" | "staff" | "driver";
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const pathname = request.nextUrl.pathname;
  const requiredRole = getRequiredRole(pathname);
  const isSignInPage = pathname === "/sign-in";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && requiredRole) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (!user) {
    return response;
  }

  const profile = await fetchUserProfile(supabase, user.id);
  const role = profile?.role ?? null;
  const roleHome = getRoleHome(role);

  if (isSignInPage && roleHome) {
    const url = request.nextUrl.clone();
    url.pathname = roleHome;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (requiredRole && role !== requiredRole) {
    const url = request.nextUrl.clone();
    url.pathname = roleHome ?? "/sign-in";
    url.search = roleHome ? "" : "?error=missing_role";
    return NextResponse.redirect(url);
  }

  if (requiredRole === "staff" && !profile?.branchId) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.search = "?error=missing_branch";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
