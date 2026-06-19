"use client";

import { useEffect } from "react";
import { getViewerId } from "@/lib/viewer-id";

type ViewTrackerProps = {
  contentTypeUid: string;
  documentId: string;
  slug?: string | null;
  enabled?: boolean;
};

export function ViewTracker({ contentTypeUid, documentId, slug, enabled = true }: ViewTrackerProps) {
  useEffect(() => {
    if (!enabled || !documentId || !contentTypeUid || typeof document === "undefined") {
      return;
    }

    const viewerId = getViewerId();
    if (!viewerId) {
      return;
    }

    fetch("/api/views/increment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Viewer-Id": viewerId,
      },
      body: JSON.stringify({
        data: {
          contentTypeUid,
          targetDocumentId: documentId,
          targetSlug: slug ?? "",
        },
      }),
    }).catch(() => {
      // ignore tracking errors
    });
  }, [enabled, contentTypeUid, documentId, slug]);

  return null;
}
