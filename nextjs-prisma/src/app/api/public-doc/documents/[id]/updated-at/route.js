import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DocumentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const document = await db.document.findUnique({
      where: { id },
      select: {
        id: true,
        updatedAt: true,
        status: true,
      },
    });

    if (!document || document.status !== DocumentStatus.PUBLISHED) {
      return NextResponse.json(
        { error: "Document not found or not published" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: document.id,
      updatedAt: document.updatedAt,
    });
  } catch (error) {
    console.error("Failed to check document status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
