import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const publicPath = path === "/" || path === "/signup";
  const auth_token = req.cookies.get("auth_token")?.value;
  const session_cookie = req.cookies.get("connect.sid")?.value;
  console.log("The auth cookie is ", auth_token);
  console.log("Session cookie is ", session_cookie);
  console.log("Executing middleware");

  if (publicPath && (auth_token || session_cookie)) {
    return NextResponse.redirect(new URL("/protected", req.url));
  }
  if (!publicPath && !(auth_token || session_cookie)) {
    return NextResponse.redirect(new URL("/", req.url));
  }
}
// Routes that need to be protected
export const config = {
  matcher: ['/protected'],
};
