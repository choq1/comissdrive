import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

interface SessionPayload {
  sub: string;
  role: "admin" | "manager";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  let payload: SessionPayload | null = null;
  if (token) {
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET ?? "changeme") as SessionPayload;
    } catch {
      payload = null;
    }
  }

  if (!payload) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  if (pathname.startsWith("/settings") && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|_next|favicon.ico|brand|icon.svg|apple-icon.png).*)"],
};
