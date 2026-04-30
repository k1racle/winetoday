"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type MaterialEditButtonProps = {
  type: "article" | "news" | "video";
  documentId: string;
  authorSlug?: string | null;
};

type SessionResponse = {
  authenticated: boolean;
  user?: {
    memberProfile?: {
      accountType?: "editor" | "author" | "subscriber" | null;
      isApprovedAuthor?: boolean | null;
      author?: {
        slug?: string | null;
      } | null;
    } | null;
  } | null;
};

export function MaterialEditButton({ type, documentId, authorSlug }: MaterialEditButtonProps) {
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = (await response.json().catch(() => null)) as SessionResponse | null;

        if (cancelled || !response.ok || !data?.authenticated) {
          return;
        }

        const profile = data.user?.memberProfile;
        const accountType = profile?.accountType ?? null;
        const currentAuthorSlug = profile?.author?.slug?.trim() ?? null;
        const materialAuthorSlug = authorSlug?.trim() ?? null;

        const nextCanEdit = accountType === "editor"
          || (
            accountType === "author"
            && profile?.isApprovedAuthor === true
            && type !== "video"
            && Boolean(currentAuthorSlug)
            && currentAuthorSlug === materialAuthorSlug
          );

        if (!cancelled) {
          setCanEdit(nextCanEdit);
        }
      } catch {
        if (!cancelled) {
          setCanEdit(false);
        }
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, [authorSlug, type]);

  if (!canEdit) {
    return null;
  }

  return (
    <Link
      href={`/account?type=${encodeURIComponent(type)}&documentId=${encodeURIComponent(documentId)}`}
      className="inline-flex w-fit items-center justify-center border border-black px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-[#08110b]"
    >
      Редактировать
    </Link>
  );
}
