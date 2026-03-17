import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, getUserRoleForTenant } from "@/lib/auth";
import { getTenantBySlug } from "@/lib/tenant";
import { canView, canEdit } from "@/lib/permissions";
import { getTenantDocuments } from "@/lib/documents";
import { redirect } from "next/navigation";

function formatDate(date) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function StatusBadge({ status }) {
  const isPublished = status === "PUBLISHED";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        isPublished
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
          : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
      }`}
    >
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}

export default async function TenantDashboardPage({ params }) {
  const { tenant } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tenantData = await getTenantBySlug(tenant);
  if (!tenantData) notFound();

  const role = await getUserRoleForTenant(user.id, tenantData.id);
  if (!canView(role)) notFound();

  const documents = await getTenantDocuments(tenantData.id);

  const totalDocs = documents.length;
  const publishedCount = documents.filter((doc) => doc.status === "PUBLISHED").length;
  const draftCount = documents.filter((doc) => doc.status === "DRAFT").length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              Dashboard / {tenantData.name}
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Documents dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">
              จัดการเอกสารทั้งหมดของ tenant นี้ในหน้าเดียว
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${tenant}`}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              View docs
            </Link>

            {canEdit(role) ? (
              <Link
                href={`/dashboard/${tenant}/documents/new`}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-800"
              >
                New document
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Total documents</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{totalDocs}</div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Published</div>
          <div className="mt-2 text-3xl font-semibold text-emerald-700">{publishedCount}</div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Draft</div>
          <div className="mt-2 text-3xl font-semibold text-amber-700">{draftCount}</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">All documents</h2>
          <p className="mt-1 text-sm text-slate-500">
            กดเข้าไปแก้ไขหรือดูหน้า public ได้ทันที
          </p>
        </div>

        {documents.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto max-w-md">
              <h3 className="text-lg font-semibold text-slate-900">ยังไม่มีเอกสาร</h3>
              <p className="mt-2 text-sm text-slate-500">
                เริ่มสร้างคู่มือหน้าแรกสำหรับลูกค้าของคุณได้เลย
              </p>

              {canEdit(role) ? (
                <div className="mt-6">
                  <Link
                    href={`/dashboard/${tenant}/documents/new`}
                    className="inline-flex rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-800"
                  >
                    Create first document
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 text-sm text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Path</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Updated</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {documents.map((doc) => {
                  const publicHref = `/${tenant}/${doc.fullPath === "index" ? "" : doc.fullPath}`;

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{doc.title}</div>
                        <div className="mt-1 text-xs text-slate-500">Slug: {doc.slug}</div>
                      </td>

                      <td className="px-6 py-4">
                        <code className="rounded-xl bg-slate-50 px-3 py-1.5 text-xs text-slate-700">
                          {publicHref}
                        </code>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={doc.status} />
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(doc.updatedAt)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={publicHref}
                            className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                          >
                            View
                          </Link>

                          {canEdit(role) ? (
                            <Link
                              href={`/dashboard/${tenant}/documents/${doc.id}/edit`}
                              className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white transition hover:bg-slate-800"
                            >
                              Edit
                            </Link>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}