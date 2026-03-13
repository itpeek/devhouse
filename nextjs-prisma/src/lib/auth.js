import { db } from "@/lib/db";

export async function getCurrentUser() {
  const email = "owner@devhouse.club";
  return db.user.findUnique({ where: { email } });
}

export async function getUserRoleForTenant(userId, tenantId) {
  const membership = await db.tenantUser.findUnique({
    where: {
      tenantId_userId: {
        tenantId,
        userId,
      },
    },
  });

  return membership?.role ?? null;
}