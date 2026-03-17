import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser, getUserRoleForTenant } from "@/lib/auth";
import { canEdit } from "@/lib/permissions";

function normalizePath(value) {
  return (
    (value || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-/]/g, "")
      .replace(/\/+/g, "/")
      .replace(/^\/|\/$/g, "") || "index"
  );
}

export async function POST(req) {
  try {
    const body = await req.json();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenant = await db.tenant.findUnique({
      where: { slug: body.tenantSlug },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const role = await getUserRoleForTenant(user.id, tenant.id);

    if (!canEdit(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!body.title || !String(body.title).trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const slug = normalizePath(body.slug || body.title);

    const existing = await db.document.findFirst({
      where: {
        tenantId: tenant.id,
        fullPath: slug,
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Document path "${slug}" already exists` },
        { status: 409 }
      );
    }

    const contentHtml =
      typeof body.contentHtml === "string" ? body.contentHtml : "";
    const contentJson = body.contentJson ?? null;

    const document = await db.document.create({
      data: {
        tenantId: tenant.id,
        title: String(body.title).trim(),
        slug,
        fullPath: slug,
        contentHtml,
        contentJson,
        status: body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        updatedById: user.id,
        revisions: {
          create: {
            contentHtml,
            contentJson,
            createdById: user.id,
          },
        },
      },
    });

    return NextResponse.json({ id: document.id });
  } catch (error) {
    console.error("Create document failed:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "This slug already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}