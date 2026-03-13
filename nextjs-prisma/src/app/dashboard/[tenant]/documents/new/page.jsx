import { notFound } from "next/navigation";
import { getCurrentUser, getUserRoleForTenant } from "@/lib/auth";
import { getTenantBySlug } from "@/lib/tenant";
import { canEdit } from "@/lib/permissions";
import { DocumentForm } from "@/app/dashboard/document-form";

export default async function NewDocumentPage({ params }) {
  const { tenant } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const tenantData = await getTenantBySlug(tenant);
  if (!tenantData) notFound();

  const role = await getUserRoleForTenant(user.id, tenantData.id);
  if (!canEdit(role)) notFound();

  return <DocumentForm tenantSlug={tenant} mode="create" />;
}