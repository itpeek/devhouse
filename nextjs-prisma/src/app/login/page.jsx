import Link from "next/link";

export default async function LoginPage({ searchParams }) {
  const query = await searchParams;
  const tab = query?.tab === "register" ? "register" : "login";
  const error = query?.error || "";

  const errorMessageMap = {
    missing_fields: "กรอกข้อมูลให้ครบก่อน",
    invalid_credentials: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    email_exists: "อีเมลนี้ถูกใช้งานแล้ว",
    password_too_short: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
    server_error: "เกิดข้อผิดพลาดจากระบบ กรุณาลองใหม่",
  };

  const errorMessage = errorMessageMap[error] || "";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center">
        <div className="hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-white to-slate-100 p-8 shadow-sm lg:block">
          <div className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            Devhouse Docs
          </div>

          <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-slate-900">
            One place for client docs, onboarding and support content
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            ระบบเอกสารแบบ multi-tenant สำหรับจัดการคู่มือใช้งานของลูกค้าแต่ละราย
            พร้อม dashboard กลางสำหรับทีมงานและระบบสิทธิ์การเข้าถึง
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Tenant routing</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">/acme</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Access control</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">RBAC</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Editing flow</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">Fast</div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <div className="text-sm font-medium text-slate-500">Account access</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {tab === "register" ? "Create account" : "Sign in"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {tab === "register"
                ? "สร้างบัญชีเพื่อเข้าใช้งาน dashboard และระบบจัดการเอกสาร"
                : "เข้าสู่ระบบเพื่อจัดการ dashboard, เอกสาร และสิทธิ์ของแต่ละ tenant"}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
            <Link
              href="/login"
              className={[
                "rounded-2xl px-4 py-2.5 text-center text-sm font-medium transition",
                tab === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
              ].join(" ")}
            >
              Sign in
            </Link>
            <Link
              href="/login?tab=register"
              className={[
                "rounded-2xl px-4 py-2.5 text-center text-sm font-medium transition",
                tab === "register" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
              ].join(" ")}
            >
              Register
            </Link>
          </div>

          {errorMessage ? (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {tab === "register" ? <RegisterForm /> : <LoginForm />}

          <div className="mt-6 text-sm text-slate-500">
            Demo credentials สำหรับ phase แรก:
            <div className="mt-2 rounded-2xl bg-slate-50 px-4 py-3 text-slate-700">
              <div>Email: owner@devhouse.club</div>
              <div>Password: devhouse123</div>
            </div>
          </div>

          <div className="mt-6 text-sm text-slate-500">
            <Link href="/" className="text-slate-700 underline underline-offset-4">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  return (
    <form action="/api/auth/login" method="POST" className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="login-email" className="block text-sm font-medium text-slate-800">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="owner@devhouse.club"
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="login-password" className="block text-sm font-medium text-slate-800">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Sign in
      </button>
    </form>
  );
}

function RegisterForm() {
  return (
    <form action="/api/auth/register" method="POST" className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="register-name" className="block text-sm font-medium text-slate-800">
          Name
        </label>
        <input
          id="register-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Your name"
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="register-email" className="block text-sm font-medium text-slate-800">
          Email
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="register-password" className="block text-sm font-medium text-slate-800">
          Password
        </label>
        <input
          id="register-password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          placeholder="อย่างน้อย 8 ตัวอักษร"
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Create account
      </button>
    </form>
  );
}