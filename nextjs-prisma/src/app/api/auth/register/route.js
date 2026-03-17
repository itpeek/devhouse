import { NextResponse } from "next/server";
import { TenantRole } from "@prisma/client";
import { db } from "@/lib/db";

function createTenantSlugFromEmail(email) {
  const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "workspace";
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function POST(req) {
  try {
    const formData = await req.formData();

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");

    if (!name || !email || !password) {
      return NextResponse.redirect(new URL("/login?tab=register&error=missing_fields", req.url));
    }

    if (password.length < 8) {
      return NextResponse.redirect(new URL("/login?tab=register&error=password_too_short", req.url));
    }

    const exists = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (exists) {
      return NextResponse.redirect(new URL("/login?tab=register&error=email_exists", req.url));
    }

    const tenantSlug = createTenantSlugFromEmail(email);

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash: password,
        },
      });

      const tenant = await tx.tenant.create({
        data: {
          name: `${name}'s Workspace`,
          slug: tenantSlug,
        },
      });

      await tx.tenantUser.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          role: TenantRole.OWNER,
        },
      });

      await tx.document.create({
        data: {
          tenantId: tenant.id,
          title: "Getting Started",
          slug: "index",
          fullPath: "index",
          contentHtml: `<p>Welcome ${name}, this is your first documentation page.</p>`,
          status: "PUBLISHED",
          updatedById: user.id,
        },
      });

      return { user, tenant };
    });

    const response = NextResponse.redirect(new URL(`/dashboard/${result.tenant.slug}`, req.url));

    response.cookies.set("devhouse_session", result.user.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Register failed:", error);
    return NextResponse.redirect(new URL("/login?tab=register&error=server_error", req.url));
  }
}