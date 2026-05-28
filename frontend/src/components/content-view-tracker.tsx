"use client";

import { useEffect, useRef } from "react";

type ContentViewTrackerProps = {
  contentType: "article" | "news" | "video" | "gallery";
  documentId?: string | null;
};

export function ContentViewTracker({ contentType, documentId }: ContentViewTrackerProps) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (!documentId || sentRef.current) {
      return undefined;
    }

    sentRef.current = true;

    void fetch(`/api/views/${contentType}/${encodeURIComponent(documentId)}`, {
      method: "POST",
      cache: "no-store",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
      },
      keepalive: true,
    }).catch(() => null);

    return undefined;
  }, [contentType, documentId]);

  return null;
}
