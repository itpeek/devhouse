"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function DocAutoRefresher({ documentId, initialUpdatedAt, intervalMs = 5000 }) {
  const router = useRouter();
  const lastUpdatedAtRef = useRef(initialUpdatedAt);

  useEffect(() => {
    if (!documentId || !initialUpdatedAt) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/public-doc/documents/${documentId}/updated-at`, {
          cache: "no-store",
        });
        
        if (!res.ok) return;

        const data = await res.json();
        const serverUpdatedAt = data.updatedAt;

        if (serverUpdatedAt && serverUpdatedAt !== lastUpdatedAtRef.current) {
          lastUpdatedAtRef.current = serverUpdatedAt;
          router.refresh(); // Tells Next.js to re-fetch the server component for this page
        }
      } catch (error) {
        console.error("Failed to check for document updates", error);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [documentId, initialUpdatedAt, intervalMs, router]);

  return null; // This component does not render anything visible
}
