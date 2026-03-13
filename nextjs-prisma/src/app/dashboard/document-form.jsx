"use client";

import { useState } from "react";

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
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border px-3 py-2"
          placeholder="Getting Started"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Slug</label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full rounded-xl border px-3 py-2"
          placeholder="getting-started"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">HTML Content</label>
        <textarea
          value={contentHtml}
          onChange={(e) => setContentHtml(e.target.value)}
          className="min-h-[300px] w-full rounded-xl border px-3 py-2 font-mono text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border px-3 py-2"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        disabled={saving}
        className="rounded-xl bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
      >
        {saving ? "Saving..." : mode === "edit" ? "Update document" : "Save document"}
      </button>
    </form>
  );
}