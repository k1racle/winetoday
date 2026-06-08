"use client";

import { useEffect } from "react";

const DEBUG_RESOURCE_PATTERNS = ["/_next/static/chunks/", "/uploads/"];

function shouldTrackResource(url: string) {
  return DEBUG_RESOURCE_PATTERNS.some((pattern) => url.includes(pattern));
}

export function BrowserResourceDebug() {
  useEffect(() => {
    const reported = new Set<string>();

    // #region agent log
    function agentDebugLog(hypothesisId: string, location: string, message: string, data: Record<string, unknown>) {
      fetch("http://127.0.0.1:7308/ingest/e5b160b2-f1d0-4782-b6e4-70859f118b60", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "38d826" },
        body: JSON.stringify({ sessionId: "38d826", runId: "browser-resource", hypothesisId, location, message, data, timestamp: Date.now() }),
      }).catch(() => {});
    }
    // #endregion

    function reportOnce(key: string, hypothesisId: string, message: string, data: Record<string, unknown>) {
      if (reported.has(key)) {
        return;
      }

      reported.add(key);
      agentDebugLog(hypothesisId, "frontend/src/components/browser-resource-debug.tsx", message, {
        ...data,
        pageUrl: window.location.href,
        userAgent: window.navigator.userAgent,
        online: window.navigator.onLine,
      });
    }

    function handleResourceError(event: Event) {
      const target = event.target;
      if (!(target instanceof HTMLScriptElement || target instanceof HTMLLinkElement || target instanceof HTMLImageElement)) {
        return;
      }

      const url = target instanceof HTMLLinkElement ? target.href : target.src;
      if (!url || !shouldTrackResource(url)) {
        return;
      }

      reportOnce(`resource:${url}`, "H2,H3,H6", "Browser resource failed to load", {
        url,
        tagName: target.tagName,
        resourceType: target instanceof HTMLScriptElement ? "script" : target instanceof HTMLLinkElement ? "link" : "image",
      });
    }

    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      const reason = event.reason instanceof Error ? event.reason.message : String(event.reason ?? "");
      if (!/chunk|loading|network|timeout|failed/i.test(reason)) {
        return;
      }

      reportOnce(`rejection:${reason}`, "H2,H3,H6", "Browser chunk-related promise rejection", {
        reason,
      });
    }

    window.addEventListener("error", handleResourceError, true);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleResourceError, true);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
