import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, getUserRoleForTenant } from "@/lib/auth";
import { getTenantBySlug } from "@/lib/tenant";
import { getDocumentById } from "@/lib/documents";
import { canEdit } from "@/lib/permissions";
import { DocumentForm } from "@/components/dashboard/document-form";

export default async function EditDocumentPage({ params, searchParams }) {
  const { tenant, documentId } = await params;
  const query = await searchParams;

  const user = await getCurrentUser();
  if (!user) notFound();

  const tenantData = await getTenantBySlug(tenant);
  if (!tenantData) notFound();

  const role = await getUserRoleForTenant(user.id, tenantData.id);
  if (!canEdit(role)) notFound();

  const document = await getDocumentById(documentId);
  if (!document || document.tenantId !== tenantData.id) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Edit document</h1>
          <p className="text-sm text-slate-600">
            Path: /{tenant}/{document.fullPath === "index" ? "" : document.fullPath}
          </p>
        </div>

        <Link
          href={`/${tenant}/${document.fullPath === "index" ? "" : document.fullPath}`}
          className="rounded-xl border px-4 py-2"
        >
          View page
        </Link>
      </div>

      {query?.saved === "1" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Document updated successfully
        </div>
      ) : null}

      <DocumentForm
        tenantSlug={tenant}
        mode="edit"
        documentId={document.id}
        initialData={{
          title: document.title,
          slug: document.slug,
          contentHtml: document.contentHtml || "",
          status: document.status,
        }}
      />
    </div>
  );
}