import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyRequest } from "./lib/token.verify";

export async function middleware(request: NextRequest) {
  try {
    const token = await verifyRequest(request);

    if (token) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-access-token", token);
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  } catch (error) {
    console.error("JWT verification failed:", error);
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
}

export const config = {
  matcher: ["/api/todo/:path*", "/api/sprint/:path*", "/api/user/:path*"],
};
