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

export async function PATCH(req, context) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const document = await db.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const tenant = await db.tenant.findUnique({
      where: { slug: body.tenantSlug },
    });

    if (!tenant || tenant.id !== document.tenantId) {
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
        NOT: { id: document.id },
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Document path "${slug}" already exists` },
        { status: 409 }
      );
    }

    const contentHtml = typeof body.contentHtml === "string" ? body.contentHtml : "";
    const contentJson = body.contentJson ?? null;

    const updated = await db.document.update({
      where: { id: document.id },
      data: {
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

    return NextResponse.json({ id: updated.id });
  } catch (error) {
    console.error("Update document failed:", error);

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

export async function DELETE(req, context) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const document = await db.document.findUnique({
      where: { id },
      include: { tenant: true },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const role = await getUserRoleForTenant(user.id, document.tenantId);

    if (!canEdit(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.document.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete document failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}