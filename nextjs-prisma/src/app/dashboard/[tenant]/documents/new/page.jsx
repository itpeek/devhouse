import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser, getUserRoleForTenant } from "@/lib/auth";
import { getTenantBySlug } from "@/lib/tenant";
import { canEdit } from "@/lib/permissions";
import { DocumentEditor } from "@/app/dashboard/document-editor";
import { DEFAULT_DOCUMENT_CONTENT } from "@/lib/document-defaults";

export default async function NewDocumentPage({ params }) {
  const { tenant } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tenantData = await getTenantBySlug(tenant);
  if (!tenantData) notFound();

  const role = await getUserRoleForTenant(user.id, tenantData.id);
  if (!canEdit(role)) notFound();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              Dashboard / {tenant}
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Create document</h1>
            <p className="mt-2 text-sm text-slate-600">
              สร้างเอกสารใหม่และกำหนด path, content, และสถานะการเผยแพร่
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/dashboard/${tenant}`}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              Back to overview
            </Link>

            <Link
              href={`/${tenant}`}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              Back to docs
            </Link>
          </div>
        </div>
      </div>

      <DocumentEditor
        tenantSlug={tenant}
        mode="create"
        initialData={{
          title: "",
          slug: "",
          contentValue: DEFAULT_DOCUMENT_CONTENT,
          status: "DRAFT",
        }}
      />
    </div>
  );
}