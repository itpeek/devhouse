import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req) {
  const baseUrl = process.env.APP_URL || req.nextUrl.origin;

  try {
    const contentType = req.headers.get("content-type") || "";

    let email = "";
    let password = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      email = String(body.email || "").trim().toLowerCase();
      password = String(body.password || "");
    } else {
      const formData = await req.formData();
      email = String(formData.get("email") || "").trim().toLowerCase();
      password = String(formData.get("password") || "");
    }

    if (!email || !password) {
      return NextResponse.redirect(new URL("/login?error=missing_fields", baseUrl));
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.redirect(new URL("/login?error=invalid_credentials", baseUrl));
    }

    if (password !== "devhouse123") {
      return NextResponse.redirect(new URL("/login?error=invalid_credentials", baseUrl));
    }

    const response = NextResponse.redirect(new URL("/dashboard/acme", baseUrl));

    response.cookies.set("devhouse_session", user.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.redirect(new URL("/login?error=server_error", baseUrl));
  }
}