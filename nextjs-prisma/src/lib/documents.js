import { DocumentStatus } from "@prisma/client";
import { db } from "@/lib/db";

export async function getPublishedDocumentByPath(tenantSlug, pathParts) {
  const tenant = await db.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return null;

  const fullPath = pathParts.length ? pathParts.join("/") : "index";

  return db.document.findFirst({
    where: {
      tenantId: tenant.id,
      fullPath,
      status: DocumentStatus.PUBLISHED,
    },
  });
}

export async function getTenantDocumentTree(tenantId) {
  const docs = await db.document.findMany({
    where: { tenantId, status: DocumentStatus.PUBLISHED },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      fullPath: true,
      sortOrder: true,
      parentId: true,
    },
  });

  const map = new Map();
  const roots = [];

  for (const doc of docs) {
    map.set(doc.id, { ...doc, children: [] });
  }

  for (const doc of docs) {
    const node = map.get(doc.id);
    if (doc.parentId && map.has(doc.parentId)) {
      map.get(doc.parentId).children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function getDocumentById(documentId) {
  return db.document.findUnique({
    where: { id: documentId },
  });
}