"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardSidebar({
  tenant,
  tenantName,
  role,
  canManageMembers,
}) {
  const pathname = usePathname();

  const navItems = [
    { href: `/dashboard/${tenant}`, label: "Overview" },
    { href: `/dashboard/${tenant}/documents/new`, label: "New document" },
    { href: `/${tenant}`, label: "Public docs" },
    ...(canManageMembers
      ? [{ href: `/dashboard/${tenant}/members`, label: "Members" }]
      : []),
    { href: `/dashboard/${tenant}/settings`, label: "Settings" },
  ];

  return (
    <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6">
      <div className="border-b border-slate-200 px-2 pb-4">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          Devhouse Docs
        </div>
        <div className="mt-2 text-lg font-semibold text-slate-900">
          {tenantName}
        </div>
        <div className="mt-1 text-sm text-slate-500">Role: {role}</div>
      </div>

      <nav className="mt-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center rounded-2xl px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm font-medium text-slate-900">Quick actions</div>
        <div className="mt-3 grid gap-2">
          <Link
            href={`/dashboard/${tenant}/documents/new`}
            className="rounded-2xl bg-slate-900 px-3 py-2 text-center text-sm text-white transition hover:bg-slate-800"
          >
            Create document
          </Link>
          <Link
            href={`/${tenant}`}
            className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-center text-sm text-slate-700 transition hover:bg-slate-50"
          >
            Open public docs
          </Link>
        </div>
      </div>
    </aside>
  );
}