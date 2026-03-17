import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get("devhouse_session")?.value;

  if (!session) {
    return null;
  }

  return db.user.findUnique({
    where: { id: session },
  });
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