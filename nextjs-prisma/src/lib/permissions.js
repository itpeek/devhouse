import { TenantRole } from "@prisma/client";

export function canView(role) {
  return [TenantRole.SUPER_ADMIN, TenantRole.OWNER, TenantRole.EDITOR, TenantRole.VIEWER].includes(role);
}

export function canEdit(role) {
  return [TenantRole.SUPER_ADMIN, TenantRole.OWNER, TenantRole.EDITOR].includes(role);
}

export function canManageMembers(role) {
  return [TenantRole.SUPER_ADMIN, TenantRole.OWNER].includes(role);
}