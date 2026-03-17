"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const cookieStore = await cookies();

  // แก้ชื่อ cookie ให้ตรงกับระบบ auth ของโปรเจกต์คุณ
  cookieStore.delete("session");
  cookieStore.delete("auth_token");
  cookieStore.delete("token");

  redirect("/login");
}