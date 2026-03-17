import LogoutButton from "@/components/logout-button";
import Link from "next/link";

const demoTenants = [
  {
    name: "ACME Co.",
    slug: "acme",
    description: "คู่มือการใช้งานระบบสำหรับลูกค้าองค์กร",
  },
  {
    name: "Devhouse Demo",
    slug: "devhouse-demo",
    description: "ตัวอย่าง docs portal สำหรับ onboarding และ support",
  },
];

function FeatureCard({ title, description }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <div className="text-lg font-semibold tracking-tight">Devhouse Docs</div>
            <div className="text-xs text-slate-500">Multi-tenant customer documentation</div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/acme"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              Dashboard demo
            </Link>
            <Link
              href="/acme"
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-800"
            >
              Open docs
            </Link>
            <div className="p-4">
              <LogoutButton />
            </div>              
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              Documentation portal for clients
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              สร้างศูนย์รวมคู่มือใช้งานสำหรับลูกค้าแต่ละรายบนโดเมนเดียว
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              ใช้สำหรับ onboarding, how-to, FAQ, troubleshooting และ internal handoff ได้ในระบบเดียว
              โดยแยก tenant เป็น path เช่น /acme หรือ /client-a และมี dashboard สำหรับจัดการเอกสารได้ทันที
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/acme"
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                ดู public docs
              </Link>
              <Link
                href="/dashboard/acme"
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                เข้า dashboard
              </Link>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm text-slate-500">Path-based tenant</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">/acme</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm text-slate-500">Realtime-ready</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">Editable</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm text-slate-500">Permissions</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">RBAC</div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-medium text-slate-900">Quick access</div>
              <p className="mt-2 text-sm text-slate-600">
                เลือก tenant ตัวอย่างเพื่อเข้า docs หรือ dashboard ได้ทันที
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {demoTenants.map((tenant) => (
                <div
                  key={tenant.slug}
                  className="rounded-3xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50/70"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-base font-semibold text-slate-900">{tenant.name}</div>
                      <p className="mt-1 text-sm text-slate-600">{tenant.description}</p>
                      <code className="mt-3 inline-block rounded-xl bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                        /{tenant.slug}
                      </code>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/${tenant.slug}`}
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        Docs
                      </Link>
                      <Link
                        href={`/dashboard/${tenant.slug}`}
                        className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-800"
                      >
                        Dashboard
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">สิ่งที่หน้า home นี้ควรสื่อ</h2>
            <p className="mt-2 text-sm text-slate-600">
              ให้ลูกค้าหรือทีมภายในเห็นภาพรวมของระบบก่อนจะกดเข้า tenant ใด tenant หนึ่ง
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <FeatureCard
              title="แยกเอกสารตามลูกค้า"
              description="ใช้ path-based routing เพื่อให้แต่ละลูกค้ามีพื้นที่ docs ของตัวเองชัดเจน เช่น /acme และ /brand-x"
            />
            <FeatureCard
              title="แก้ไขจากหลังบ้านได้ง่าย"
              description="ทีมงานสามารถสร้าง แก้ไข และเผยแพร่คู่มือจาก dashboard ได้โดยไม่ต้องแตะโค้ดหน้าเว็บโดยตรง"
            />
            <FeatureCard
              title="รองรับการต่อยอด"
              description="ต่อยอดได้ทั้ง editor ขั้นสูง, revision history, search, member roles และ custom domain ในภายหลัง"
            />
          </div>
        </section>
      </main>
    </div>
  );
}