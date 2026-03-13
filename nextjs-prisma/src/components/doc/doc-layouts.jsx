import { getTenantDocumentTree } from "@/lib/documents";
import Link from "next/link";

export async function DocsLayout({ tenant, children }) {
  const tree = await getTenantDocumentTree(tenant.id);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-2xl border p-4">
          <div className="mb-4 text-lg font-semibold">{tenant.name}</div>
          <nav className="space-y-2 text-sm">
            {tree.map((item) => (
              <div key={item.id}>
                <Link
                  className="block rounded-lg px-3 py-2 hover:bg-slate-100"
                  href={`/${tenant.slug}/${item.fullPath === "index" ? "" : item.fullPath}`}
                >
                  {item.title}
                </Link>

                {item.children?.length > 0 && (
                  <div className="ml-3 border-l pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        className="block rounded-lg px-3 py-2 hover:bg-slate-100"
                        href={`/${tenant.slug}/${child.fullPath}`}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        <main className="rounded-2xl border p-6">{children}</main>
      </div>
    </div>
  );
}