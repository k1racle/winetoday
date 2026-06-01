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

    const requestUrl = `/api/editor/views/${contentType}/${encodeURIComponent(documentId)}`;

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const beaconSent = navigator.sendBeacon(requestUrl, new Blob([""], { type: "application/json" }));

      if (beaconSent) {
        return undefined;
      }
    }

    void fetch(requestUrl, {
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
