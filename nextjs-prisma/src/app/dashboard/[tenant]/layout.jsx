import { notFound } from "next/navigation";
import { getCurrentUser, getUserRoleForTenant } from "@/lib/auth";
import { getTenantBySlug } from "@/lib/tenant";
import { canView, canManageMembers } from "@/lib/permissions";
import { DashboardSidebar } from "@/components/sidebar";

export default async function TenantDashboardLayout({ children, params }) {
  const { tenant } = await params;

  const user = await getCurrentUser();
  if (!user) notFound();

  const tenantData = await getTenantBySlug(tenant);
  if (!tenantData) notFound();

  const role = await getUserRoleForTenant(user.id, tenantData.id);
  if (!canView(role)) notFound();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8 lg:py-8">
        <DashboardSidebar
          tenant={tenant}
          tenantName={tenantData.name}
          role={role}
          canManageMembers={canManageMembers(role)}
        />

        <main>{children}</main>
      </div>
    </div>
  );
}