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

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 px-6 py-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Create document</h1>
        <p className="mt-2 text-sm text-slate-600">
          สร้างคู่มือใหม่สำหรับ tenant นี้ได้จากหน้าเดียว
        </p>
      </div>

      <DocumentForm tenantSlug={tenant} mode="create" />
    </div>
  );
}