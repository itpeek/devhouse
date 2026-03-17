"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteDocumentButton({ documentId, documentTitle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete document");
      }

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-xl px-3 py-2 text-sm font-medium transition bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300"
      >
        Delete
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-semibold text-slate-900">Delete Document</h3>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              คุณแน่ใจหรือไม่ที่จะลบเอกสาร <span className="font-semibold text-slate-900">&quot;{documentTitle}&quot;</span>?
              <br />การกระทำนี้ไม่สามารถยกเลิกได้ และจะลบประวัติการแก้ไขทั้งหมดด้วย
            </p>

            {errorMsg && (
              <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {errorMsg}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setErrorMsg("");
                }}
                disabled={isDeleting}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-xl px-4 py-2 text-sm font-medium text-white transition bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
