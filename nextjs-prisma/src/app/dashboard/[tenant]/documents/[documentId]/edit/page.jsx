import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser, getUserRoleForTenant } from "@/lib/auth";
import { getTenantBySlug } from "@/lib/tenant";
import { getDocumentById } from "@/lib/documents";
import { canEdit } from "@/lib/permissions";
import { DocumentEditor } from "@/app/dashboard/document-editor";
import { DEFAULT_DOCUMENT_CONTENT } from "@/lib/document-defaults";

export default async function EditDocumentPage({ params, searchParams }) {
  const { tenant, documentId } = await params;
  const query = await searchParams;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tenantData = await getTenantBySlug(tenant);
  if (!tenantData) notFound();

  const role = await getUserRoleForTenant(user.id, tenantData.id);
  if (!canEdit(role)) notFound();

  const document = await getDocumentById(documentId);
  if (!document || document.tenantId !== tenantData.id) notFound();

  const pageHref = `/${tenant}/${document.fullPath === "index" ? "" : document.fullPath}`;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              Dashboard / {tenant}
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Edit document</h1>
            <p className="mt-2 text-sm text-slate-600">
              ปรับเนื้อหาและสถานะการเผยแพร่ได้จากหน้าเดียว
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

              <Link
                href={pageHref}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-800"
              >
                View page
              </Link>
            </div>
        </div>
      </div>

      <DocumentEditor
        tenantSlug={tenant}
        mode="edit"
        documentId={document.id}
        saved={query?.saved === "1"}
        initialData={{
          title: document.title,
          slug: document.slug,
          contentValue: document.contentJson || DEFAULT_DOCUMENT_CONTENT,
          status: document.status,
        }}
      />
    </div>
  );
}