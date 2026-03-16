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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          {query?.saved === "1" ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
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

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 text-sm font-semibold text-slate-900">Document info</div>
            <div className="space-y-3 text-sm text-slate-600">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Title</div>
                <div className="mt-1 text-slate-900">{document.title}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Current path</div>
                <code className="mt-1 block break-all rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  {pageHref}
                </code>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Status</div>
                <div className="mt-1">
                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {document.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 text-sm font-semibold text-slate-900">Editor notes</div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>เปลี่ยน slug จะทำให้ URL เปลี่ยนตาม</li>
              <li>Published จะมองเห็นจากหน้า public docs</li>
              <li>ทุกครั้งที่ update ระบบจะเก็บ revision ใหม่</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}