import { notFound } from "next/navigation";
import {
  getPublishedDocumentByPath,
  getTenantDocumentTree,
} from "@/lib/documents";
import { getTenantBySlug } from "@/lib/tenant";
import { DocsLayout } from "@/components/doc/doc-layouts";
import { DocAutoRefresher } from "@/components/doc/doc-auto-refresher";

function getDocPath(tenant, fullPath) {
  return `/${tenant}/${fullPath === "index" ? "" : fullPath}`;
}

export default async function PublicDocPage({ params }) {
  const { tenant, slug = [] } = await params;

  const tenantData = await getTenantBySlug(tenant);
  if (!tenantData) notFound();

  const document = await getPublishedDocumentByPath(tenant, slug);
  if (!document) notFound();

  const documentTree = await getTenantDocumentTree(tenantData.id);
  const pagePath = getDocPath(tenant, document.fullPath);

  return (
    <DocsLayout
      tenant={tenantData}
      document={document}
      documentTree={documentTree}
    >
      <DocAutoRefresher 
        documentId={document.id} 
        initialUpdatedAt={document.updatedAt?.toISOString() || null} 
        intervalMs={5000} 
      />
      <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 bg-gradient-to-br from-white to-slate-50 px-6 py-8 sm:px-8 lg:px-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              Documentation
            </span>

            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {document.status}
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {document.title}
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            เอกสารสำหรับ {tenantData.name} พร้อมโครงสร้างเนื้อหาที่อ่านง่าย รองรับการใช้งานทั้งบนเดสก์ท็อปและมือถือ
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
              Path: {pagePath}
            </span>

            {document.updatedAt ? (
              <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                Updated:{" "}
                {new Intl.DateTimeFormat("th-TH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(document.updatedAt))}
              </span>
            ) : null}
          </div>
        </header>

        <div className="px-6 py-8 sm:px-8 lg:px-10">
          <div
            className="
              prose prose-slate max-w-none
              prose-headings:scroll-mt-24
              prose-headings:font-semibold
              prose-h1:text-3xl
              prose-h2:mt-10 prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-3
              prose-h3:mt-8
              prose-hr:my-4 prose-hr:border-slate-200
              prose-p:text-slate-700 prose-p:leading-7
              prose-li:text-slate-700
              prose-a:text-slate-900 prose-a:underline prose-a:decoration-slate-300
              prose-strong:text-slate-900
              prose-code:rounded prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-slate-900 prose-code:before:content-none prose-code:after:content-none
              prose-pre:rounded-2xl prose-pre:border prose-pre:border-slate-200 prose-pre:bg-slate-950
              prose-blockquote:border-slate-300 prose-blockquote:text-slate-700
              prose-img:rounded-2xl prose-img:border prose-img:border-slate-200
              prose-table:block prose-table:w-full prose-table:overflow-x-auto
            "
            dangerouslySetInnerHTML={{ __html: document.contentHtml || "" }}
          />
        </div>
      </article>
    </DocsLayout>
  );
}