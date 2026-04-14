import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "dirmanKurangGizi2025";

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const path = req.nextUrl.pathname;
  const publicPaths = ["/auth/login", "/auth/register"];

  if (!token) {
    if (!publicPaths.includes(path)) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token,
      new TextEncoder().encode(JWT_SECRET_STRING)
    );

    if (publicPaths.includes(path)) return NextResponse.next();

    if (path.startsWith("/admin") && payload.role !== "ADMIN") return NextResponse.redirect(new URL("/forbidden", req.url));
    if (path.startsWith("/employee") && payload.role !== "EMPLOYEE") return NextResponse.redirect(new URL("/forbidden", req.url));
    if (path.startsWith("/user") && payload.role !== "USER") return NextResponse.redirect(new URL("/forbidden", req.url));


    return NextResponse.next();
  } catch (err) {
    console.error("Invalid token:", err);
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/employee/:path*", "/user/:path*"],
};
