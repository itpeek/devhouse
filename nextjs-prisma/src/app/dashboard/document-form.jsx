"use client";

import { useMemo, useState } from "react";

function Field({ label, hint, children }) {
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-sm font-medium text-slate-800">{label}</label>
        {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function DocumentForm({
  tenantSlug,
  mode = "create",
  documentId,
  initialData,
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [contentHtml, setContentHtml] = useState(
    initialData?.contentHtml || "<p>เริ่มเขียนคู่มือได้ที่นี่</p>"
  );
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const endpoint =
    mode === "edit" ? `/api/documents/${documentId}` : "/api/documents";
  const method = mode === "edit" ? "PATCH" : "POST";

  const previewPath = useMemo(() => {
    const value =
      (slug || title || "index")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-/]/g, "")
        .replace(/\/+/g, "/")
        .replace(/^\/|\/$/g, "") || "index";

    return `/${tenantSlug}/${value === "index" ? "" : value}`;
  }, [slug, title, tenantSlug]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantSlug,
        title,
        slug,
        contentHtml,
        status,
      }),
    });

    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Save failed");
      return;
    }

    if (mode === "edit") {
      window.location.href = `/dashboard/${tenantSlug}/documents/${documentId}/edit?saved=1`;
      return;
    }

    window.location.href = `/dashboard/${tenantSlug}/documents/${data.id}/edit`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {mode === "edit" ? "Edit document" : "Create document"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                จัดการ title, slug, content และสถานะการเผยแพร่ในจุดเดียว
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
              <div className="mb-1 font-medium text-slate-800">Preview path</div>
              <code className="break-all">{previewPath}</code>
            </div>
          </div>
        </div>

        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="space-y-6">
            <Field label="Title" hint="ชื่อเอกสารที่จะแสดงบนหน้า docs และใน sidebar">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                placeholder="Getting Started"
              />
            </Field>

            <Field label="Slug" hint="ปล่อยว่างได้ ระบบจะสร้างจาก title ให้อัตโนมัติ">
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                placeholder="getting-started"
              />
            </Field>

            <Field
              label="HTML Content"
              hint="ตอนนี้ยังใช้ textarea ก่อน แล้วค่อยเปลี่ยนเป็น editor ภายหลัง"
            >
              <textarea
                value={contentHtml}
                onChange={(e) => setContentHtml(e.target.value)}
                className="min-h-[420px] w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
              />
            </Field>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 text-sm font-medium text-slate-900">Publishing</div>

              <Field label="Status">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </Field>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-2 text-sm font-medium text-slate-900">Quick tips</div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>ใช้ slug ไม่ซ้ำกันใน tenant เดียวกัน</li>
                <li>หน้าแรกของ tenant ใช้ path index</li>
                <li>ถ้าจะ public page ให้เลือก Published</li>
              </ul>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              disabled={saving}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : mode === "edit" ? "Update document" : "Save document"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}