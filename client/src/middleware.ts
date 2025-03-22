import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the path the user is trying to access
  const path = request.nextUrl.pathname;

  // Check if the path is a protected route
  const isPublicRoute =
    path === "/" || path === "/signup" || path.startsWith("/api/auth");

  // Get auth cookie
  const authCookie =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  // If trying to access protected route but no auth cookie exists
  if (!isPublicRoute && !authCookie) {
    // Redirect to login page
    const url = new URL("/", request.url);
    // You can also add a callback parameter to redirect back after login
    // url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }
  if (isPublicRoute && authCookie) {
    console.log("Redirecting to dashboard...");
    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url).toString());
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Routes that need to be protected
export const config = {
  matcher: ["/", "/signup", "/dashboard", "/dashboard/:path*"],
};
