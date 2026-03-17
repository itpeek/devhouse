import { notFound, redirect } from "next/navigation";
import { getCurrentUser, getUserRoleForTenant } from "@/lib/auth";
import { getTenantBySlug } from "@/lib/tenant";
import { canManageMembers } from "@/lib/permissions";

export default async function MembersPage({ params }) {
  const { tenant } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tenantData = await getTenantBySlug(tenant);
  if (!tenantData) notFound();

  const role = await getUserRoleForTenant(user.id, tenantData.id);
  if (!canManageMembers(role)) notFound();

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 px-6 py-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Members</h1>
        <p className="mt-2 text-sm text-slate-600">
          จัดการสมาชิกและสิทธิ์การเข้าถึงของ tenant นี้
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Coming soon</h2>
        <p className="mt-2 text-sm text-slate-600">
          หน้านี้จะใช้สำหรับ invite user, เปลี่ยน role และดูรายการสมาชิกทั้งหมด
        </p>
      </div>
    </div>
  );
}