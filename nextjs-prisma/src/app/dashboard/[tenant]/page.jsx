import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, getUserRoleForTenant } from "@/lib/auth";
import { getTenantBySlug } from "@/lib/tenant";
import { canView } from "@/lib/permissions";

export default async function TenantDashboardPage({ params }) {
  const { tenant } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const tenantData = await getTenantBySlug(tenant);
  if (!tenantData) notFound();

  const role = await getUserRoleForTenant(user.id, tenantData.id);
  if (!canView(role)) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{tenantData.name}</h1>
        <p className="text-sm text-slate-600">Role: {role}</p>
      </div>

      <div className="flex gap-3">
        <Link href={`/dashboard/${tenant}/documents/new`} className="rounded-xl bg-slate-900 px-4 py-2 text-white">
          New document
        </Link>
        <Link href={`/${tenant}`} className="rounded-xl border px-4 py-2">
          View docs
        </Link>
      </div>
    </div>
  );
}