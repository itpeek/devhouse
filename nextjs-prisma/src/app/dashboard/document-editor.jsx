"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SlateEditor from "@/components/slate-editor";
import { serializeSlateToHtml } from "@/lib/slate-html";

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

function SaveIndicator({ saveState, lastSavedAt }) {
  const text = useMemo(() => {
    if (saveState === "saving") return "Saving...";
    if (saveState === "dirty") return "Unsaved changes";
    if (saveState === "error") return "Save failed";
    if (saveState === "saved" && lastSavedAt) {
      return `Saved at ${lastSavedAt}`;
    }
    return "Ready";
  }, [saveState, lastSavedAt]);

  const tone =
    saveState === "saving"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : saveState === "dirty"
        ? "border-slate-200 bg-slate-50 text-slate-700"
        : saveState === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <div
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${tone}`}
    >
      {text}
    </div>
  );
}

import { DEFAULT_DOCUMENT_CONTENT } from "@/lib/document-defaults";

export function DocumentEditor({
  tenantSlug,
  mode = "create",
  documentId,
  initialData,
  saved = false,
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [contentValue, setContentValue] = useState(
    initialData?.contentValue || DEFAULT_DOCUMENT_CONTENT
  );
  const [status, setStatus] = useState(initialData?.status || "DRAFT");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState(saved ? "saved" : "idle");
  const [lastSavedAt, setLastSavedAt] = useState(saved ? formatTime(new Date()) : "");

  const debounceRef = useRef(null);
  const isSavingRef = useRef(false);

  const [lastSavedSnapshot, setLastSavedSnapshot] = useState(() =>
    JSON.stringify({
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      contentValue: initialData?.contentValue || DEFAULT_DOCUMENT_CONTENT,
      status: initialData?.status || "DRAFT",
    })
  );

  const endpoint =
    mode === "edit" ? `/api/documents/${documentId}` : "/api/documents";
  const method = mode === "edit" ? "PATCH" : "POST";

  const normalizedPath = useMemo(() => {
    const value =
      (slug || title || "index")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-/]/g, "")
        .replace(/\/+/g, "/")
        .replace(/^\/|\/$/g, "") || "index";

    return value;
  }, [slug, title]);

  const previewPath = `/${tenantSlug}/${normalizedPath === "index" ? "" : normalizedPath}`;
  const statusLabel = status === "PUBLISHED" ? "Published" : "Draft";

  function getSnapshot() {
    return JSON.stringify({ title, slug, contentValue, status });
  }

  async function saveDocument({ isAuto = false } = {}) {
    if (isSavingRef.current) return;

    const currentSnapshot = getSnapshot();
    if (currentSnapshot === lastSavedSnapshot) return;

    const contentHtml = serializeSlateToHtml(contentValue);

    isSavingRef.current = true;
    setSaving(true);
    setError("");
    setSaveState("saving");

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug,
          title,
          slug,
          contentHtml,
          contentJson: contentValue,
          status,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Save failed");
        setSaveState("error");
        return;
      }

      setLastSavedSnapshot(currentSnapshot);
      setSaveState("saved");
      setLastSavedAt(formatTime(new Date()));

      if (!isAuto && mode === "create") {
        window.location.href = `/dashboard/${tenantSlug}/documents/${data.id}/edit`;
        return;
      }

      if (!isAuto && mode === "edit") {
        window.history.replaceState(
          null,
          "",
          `/dashboard/${tenantSlug}/documents/${documentId}/edit?saved=1`
        );
      }
    } catch {
      setError("Something went wrong while saving");
      setSaveState("error");
    } finally {
      setSaving(false);
      isSavingRef.current = false;
    }
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault();

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    await saveDocument({ isAuto: false });
  }

  useEffect(() => {
    if (mode !== "edit") return;
    if (!title.trim()) return;
    if (saving) return;

    const currentSnapshot = getSnapshot();
    if (currentSnapshot === lastSavedSnapshot) return;

    setSaveState("dirty");

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      saveDocument({ isAuto: true });
    }, 2500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [title, slug, contentValue, status, mode, lastSavedSnapshot, saving]);

  useEffect(() => {
    const handler = (e) => {
      if (saveState === "dirty" || saveState === "saving") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saveState]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
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

          <div className="space-y-6 px-6 py-6">
            <div className="sticky top-4 z-20 mb-6 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <SaveIndicator saveState={saveState} lastSavedAt={lastSavedAt} />
                  <span className="text-sm text-slate-500">
                    {mode === "edit" ? "Editing document" : "Creating document"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>

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
              label="Content Editor"
            >
              <SlateEditor value={contentValue} onChange={setContentValue} />
            </Field>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : mode === "edit"
                    ? "Update document"
                    : "Save document"}
              </button>

              <SaveIndicator saveState={saveState} lastSavedAt={lastSavedAt} />
            </div>
          </div>
        </div>

        <aside className="h-fit space-y-4 lg:sticky lg:top-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 text-sm font-semibold text-slate-900">Document info</div>
            <div className="space-y-3 text-sm text-slate-600">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Title</div>
                <div className="mt-1 text-slate-900">{title || "Untitled document"}</div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Current path</div>
                <code className="mt-1 block break-all rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  {previewPath}
                </code>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Status</div>
                <div className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status === "PUBLISHED"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                      }`}
                  >
                    {statusLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 text-sm font-semibold text-slate-900">Publishing</div>

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

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 text-sm font-semibold text-slate-900">Quick tips</div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>ใช้ slug ไม่ซ้ำกันใน tenant เดียวกัน</li>
              <li>หน้าแรกของ tenant ใช้ path index</li>
              <li>ถ้าจะ public page ให้เลือก Published</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 text-sm font-semibold text-slate-900">Editor notes</div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>เปลี่ยน slug จะทำให้ URL เปลี่ยนตาม</li>
              <li>Published จะมองเห็นจากหน้า public docs</li>
              <li>ทุกครั้งที่ update ระบบจะเก็บ revision ใหม่</li>
            </ul>
          </div>
        </aside>
      </div>
    </form>
  );
}

function formatTime(date) {
  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}