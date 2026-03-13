import { notFound } from "next/navigation";
import { getPublishedDocumentByPath } from "@/lib/documents";
 import { getTenantBySlug } from "@/lib/tenant";
import { DocsLayout } from "@/components/doc/doc-layouts";

export default async function PublicDocPage({ params }) {
  const { tenant, slug = [] } = await params;

  const tenantData = await getTenantBySlug(tenant);
  if (!tenantData) notFound();

  const document = await getPublishedDocumentByPath(tenant, slug);
  if (!document) notFound();

  return (
    <DocsLayout tenant={tenantData} document={document}>
      <article className="prose max-w-none">
        <h1>{document.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: document.contentHtml || "" }} />
      </article>
    </DocsLayout>
  );
}