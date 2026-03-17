import { NextResponse } from "next/server";

export async function POST(req) {
  const response = NextResponse.redirect(new URL("/login", req.url));

  response.cookies.set("devhouse_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}