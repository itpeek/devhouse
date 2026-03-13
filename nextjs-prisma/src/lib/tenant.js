import { db } from "@/lib/db";

export async function getTenantBySlug(slug) {
  return db.tenant.findUnique({
    where: { slug },
  });
}