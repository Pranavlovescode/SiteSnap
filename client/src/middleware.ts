import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const publicPath = path === "/api/v1/login" || path === "/api/v1/signup";
  const auth_token = req.cookies.get("auth_token")?.value;
  console.log("The session cookie is ", auth_token);
  console.log("Executing middleware");
  if (publicPath && auth_token) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (!publicPath && !auth_token) {
    return NextResponse.redirect(new URL("/api/v1/login", req.url));
  }
}
// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/api/v1/logout"],
};
