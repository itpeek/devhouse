import Link from "next/link";

function buildDocHref(tenantSlug, fullPath) {
  return `/${tenantSlug}/${fullPath === "index" ? "" : fullPath}`;
}

function TreeNavItem({ item, tenantSlug, currentPath, depth = 0 }) {
  const href = buildDocHref(tenantSlug, item.fullPath);
  const active = item.fullPath === currentPath;

  return (
    <div>
      <Link
        href={href}
        className={`block rounded-2xl px-3 py-2 text-sm transition ${
          active
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-700 hover:bg-slate-100"
        }`}
        style={{ marginLeft: depth > 0 ? `${depth * 12}px` : 0 }}
      >
        {item.title}
      </Link>

      {item.children?.length > 0 ? (
        <div className="mt-1 space-y-1">
          {item.children.map((child) => (
            <TreeNavItem
              key={child.id}
              item={child}
              tenantSlug={tenantSlug}
              currentPath={currentPath}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function DocsLayout({
  tenant,
  document,
  documentTree = [],
  children,
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <Link
              href={`/${tenant.slug}`}
              className="truncate text-lg font-semibold tracking-tight text-slate-900"
            >
              {tenant.name}
            </Link>
            <p className="mt-0.5 text-sm text-slate-500">Documentation portal</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_240px]">
          <aside className="hidden xl:block">
            <div className="sticky top-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <div className="text-sm font-semibold text-slate-900">Browse docs</div>
                <p className="mt-1 text-sm text-slate-500">
                  เอกสารทั้งหมดใน workspace นี้
                </p>
              </div>

              <div className="space-y-1">
                {documentTree.length > 0 ? (
                  documentTree.map((item) => (
                    <TreeNavItem
                      key={item.id}
                      item={item}
                      tenantSlug={tenant.slug}
                      currentPath={document.fullPath}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl bg-slate-50 px-3 py-3 text-sm text-slate-500">
                    No published documents
                  </div>
                )}
              </div>
            </div>
          </aside>

          <main className="min-w-0">{children}</main>

          <aside className="hidden xl:block">
            <div className="sticky top-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-semibold text-slate-900">Document info</div>

              <div className="space-y-4 text-sm text-slate-600">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-400">Title</div>
                  <div className="mt-1 text-slate-900">{document.title}</div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-400">Path</div>
                  <code className="mt-1 block break-all rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    /{tenant.slug}/{document.fullPath === "index" ? "" : document.fullPath}
                  </code>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-400">Status</div>
                  <div className="mt-1">
                    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      {document.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}