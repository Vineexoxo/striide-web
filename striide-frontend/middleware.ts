import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
export function middleware(request: NextRequest) {

    console.log("Middleware executed for URL:", request.url);

  const authCookie = request.cookies.get("auth_cookie")?.value;

  if (!authCookie) {
    console.log("No auth cookie found, redirecting to /login");

    return NextResponse.redirect(new URL("user/login", request.url));
  }
  console.log("Auth cookie found, proceeding to the requested page");


  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"], // Define where the middleware applies
};
