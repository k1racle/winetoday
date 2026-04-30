"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { AuthMode } from "@/lib/auth-shared";

type CommunitySettings = {
  allowGuestComments?: boolean | null;
  commentModerationEnabled?: boolean | null;
  commentBlockedMessage?: string | null;
  commentMaxLength?: number | null;
  shareNetworks?: Array<{
    label: string;
    networkKey: string;
    shareUrlTemplate: string;
    icon?: {
      url: string;
      alternativeText?: string | null;
    } | null;
    enabled?: boolean | null;
  }> | null;
};

type SessionResponse = {
  authenticated: boolean;
  mode?: AuthMode | null;
  user?: {
    id: number;
    memberProfile?: {
      accountType?: "editor" | "author" | "subscriber" | null;
    } | null;
  } | null;
};

type CommunityComment = {
  id: number;
  contentTypeUid: string;
  targetDocumentId: string;
  targetSlug?: string | null;
  body: string;
  status?: "pending" | "approved" | "rejected" | "spam" | null;
  guestName?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  authorUser?: {
    id: number;
    username?: string | null;
  } | null;
};

type ReactionSummary = {
  count: number;
  liked: boolean;
};

function formatCommunityDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

type CommunitySectionProps = {
  contentTypeUid: string;
  targetDocumentId: string;
  targetSlug?: string | null;
  title: string;
  sharePath: string;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

function resolveCommentAuthor(comment: CommunityComment) {
  return comment.authorUser?.username?.trim() || comment.guestName?.trim() || "Гость";
}

function buildShareHref(template: string, values: Record<string, string>) {
  const compiled = template.replace(/\{(url|title)\}/g, (_, key: string) => encodeURIComponent(values[key] ?? ""));

  try {
    return new URL(compiled).toString();
  } catch {
    return null;
  }
}

async function extractErrorMessage(response: Response, fallbackMessage: string) {
  const responseText = await response.text();

  if (!responseText) {
    return fallbackMessage;
  }

  try {
    const parsed = JSON.parse(responseText) as {
      error?: {
        message?: string;
      };
      message?: string;
    };

    return parsed.error?.message?.trim() || parsed.message?.trim() || responseText;
  } catch {
    return responseText;
  }
}

export function CommunitySection({ contentTypeUid, targetDocumentId, targetSlug, title, sharePath }: CommunitySectionProps) {
  const [settings, setSettings] = useState<CommunitySettings | null>(null);
  const [session, setSession] = useState<SessionResponse>({ authenticated: false, user: null });
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [reactions, setReactions] = useState<ReactionSummary>({ count: 0, liked: false });
  const [loadingComments, setLoadingComments] = useState(true);
  const [loadingReactions, setLoadingReactions] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [body, setBody] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [reactionPending, setReactionPending] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window !== "undefined" && window.location.origin) {
      return new URL(sharePath, window.location.origin).toString();
    }

    return sharePath;
  }, [sharePath]);

  const shareLinks = useMemo(
    () =>
      (settings?.shareNetworks ?? [])
        .map((network) => ({
          label: network.label,
          icon: network.icon,
          href: buildShareHref(network.shareUrlTemplate, { url: shareUrl, title }),
        }))
        .filter(
          (
            network,
          ): network is { label: string; href: string; icon: { url: string; alternativeText?: string | null } | null | undefined } =>
            Boolean(network.href),
        ),
    [settings?.shareNetworks, shareUrl, title],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const response = await fetch("/api/community/settings", { cache: "no-store" });
        const data = (await response.json()) as CommunitySettings;

        if (!cancelled) {
          setSettings(data);
        }
      } catch (error) {
        console.error("[community] settings", error);
        if (!cancelled) {
          setSettings({
            allowGuestComments: true,
            commentModerationEnabled: true,
            commentBlockedMessage: null,
            commentMaxLength: 3000,
          });
        }
      }
    }

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = (await response.json()) as SessionResponse;

        if (!cancelled) {
          setSession(data?.authenticated ? data : { authenticated: false, user: null });
        }
      } catch {
        if (!cancelled) {
          setSession({ authenticated: false, user: null });
        }
      }
    }

    async function loadComments() {
      try {
        setLoadingComments(true);
        const query = new URLSearchParams({ contentTypeUid, targetDocumentId });
        const response = await fetch(`/api/community/comments?${query.toString()}`, { cache: "no-store" });
        const data = (await response.json()) as CommunityComment[];

        if (!cancelled) {
          setComments(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("[community] comments", error);
        if (!cancelled) {
          setComments([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingComments(false);
        }
      }
    }

    async function loadReactions() {
      try {
        setLoadingReactions(true);
        const query = new URLSearchParams({ contentTypeUid, targetDocumentId });
        const response = await fetch(`/api/community/reactions?${query.toString()}`, { cache: "no-store" });
        const data = (await response.json()) as ReactionSummary;

        if (!cancelled) {
          setReactions({
            count: typeof data?.count === "number" ? data.count : 0,
            liked: Boolean(data?.liked),
          });
        }
      } catch (error) {
        console.error("[community] reactions", error);
        if (!cancelled) {
          setReactions({ count: 0, liked: false });
        }
      } finally {
        if (!cancelled) {
          setLoadingReactions(false);
        }
      }
    }

    void Promise.all([loadSettings(), loadComments(), loadReactions(), loadSession()]);

    return () => {
      cancelled = true;
    };
  }, [contentTypeUid, targetDocumentId]);

  const maxLength = settings?.commentMaxLength ?? 3000;
  const bodyLength = body.trim().length;
  const canComment =
    session.authenticated &&
    (session.user?.memberProfile?.accountType === "subscriber" ||
      session.user?.memberProfile?.accountType === "author" ||
      session.user?.memberProfile?.accountType === "editor");
  const commentAccessMessage = session.authenticated
    ? "Комментирование доступно только пользователям с ролью subscriber и выше."
    : "Войдите в аккаунт с ролью subscriber или выше, чтобы оставить комментарий.";
  const canSubmit = canComment && bodyLength > 0 && bodyLength <= maxLength && submitState !== "submitting";

  const helperText = useMemo(() => {
    if (bodyLength > maxLength) {
      return `Превышен лимит: ${bodyLength} / ${maxLength}`;
    }

    return `${bodyLength} / ${maxLength}`;
  }, [bodyLength, maxLength]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      if (!canComment) {
        setMessage(commentAccessMessage);
      }
      return;
    }

    setSubmitState("submitting");
    setMessage(null);

    try {
      const response = await fetch("/api/community/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            contentTypeUid,
            targetDocumentId,
            targetSlug,
            guestName: guestName.trim() || undefined,
            guestEmail: guestEmail.trim() || undefined,
            body: body.trim(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(await extractErrorMessage(response, "Не удалось отправить комментарий."));
      }

      const createdComment = (await response.json()) as CommunityComment;

      setBody("");
      setGuestName("");
      setGuestEmail("");
      setSubmitState("success");
      setMessage(settings?.commentModerationEnabled === false ? "Комментарий опубликован." : "Комментарий отправлен на модерацию.");

      if (settings?.commentModerationEnabled === false) {
        const query = new URLSearchParams({ contentTypeUid, targetDocumentId });
        const commentsResponse = await fetch(`/api/community/comments?${query.toString()}`, { cache: "no-store" });
        const nextComments = (await commentsResponse.json()) as CommunityComment[];
        setComments(Array.isArray(nextComments) ? nextComments : []);
      } else {
        setComments((currentComments) => [createdComment, ...currentComments]);
      }
    } catch (error) {
      console.error("[community] submit comment", error);
      setSubmitState("error");
      setMessage(error instanceof Error && error.message ? error.message : "Не удалось отправить комментарий. Попробуйте ещё раз.");
    }
  }

  async function handleToggleReaction() {
    if (reactionPending) {
      return;
    }

    setReactionPending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/community/reactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            contentTypeUid,
            targetDocumentId,
          },
        }),
      });

      if (response.status === 403) {
        setMessage("Лайки будут доступны после подключения кабинета пользователя.");
        return;
      }

      if (!response.ok) {
        throw new Error("Не удалось обновить лайк.");
      }

      const data = (await response.json()) as ReactionSummary;
      setReactions({
        count: typeof data?.count === "number" ? data.count : 0,
        liked: Boolean(data?.liked),
      });
    } catch (error) {
      console.error("[community] toggle reaction", error);
      setMessage("Не удалось обновить лайк.");
    } finally {
      setReactionPending(false);
    }
  }

  return (
    <section className="mt-10 space-y-8 border-t border-black/10 pt-8 dark:border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-5 dark:border-white/10">
        <div className="flex flex-wrap items-center gap-3">
          {shareLinks.length ? <p className="type-caption text-zinc-500 dark:text-zinc-400">Поделиться</p> : null}
          {shareLinks.map((network) => (
            <a
              key={network.label}
              href={network.href}
              target="_blank"
              rel="noreferrer"
              aria-label={network.label}
              title={network.label}
              className="inline-flex h-11 w-11 items-center justify-center border border-black/10 bg-white/80 text-zinc-700 transition-colors hover:border-emerald-700 hover:text-emerald-800 dark:border-white/10 dark:bg-[#0b1710] dark:text-zinc-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
            >
              {network.icon?.url ? (
                <span className="relative block h-5 w-5 overflow-hidden">
                  <Image
                    src={network.icon.url}
                    alt={network.icon.alternativeText ?? network.label}
                    fill
                    sizes="20px"
                    className="object-contain"
                  />
                </span>
              ) : (
                <span className="type-caption">{network.label.slice(0, 2)}</span>
              )}
              <span className="sr-only">{network.label}</span>
            </a>
          ))}
        </div>

        <button
          type="button"
          onClick={() => void handleToggleReaction()}
          disabled={reactionPending}
          className={`type-button inline-flex items-center gap-2 transition-colors ${reactions.liked ? "text-emerald-800 dark:text-emerald-300" : "text-zinc-700 hover:text-emerald-800 dark:text-zinc-200 dark:hover:text-emerald-300"} disabled:cursor-not-allowed disabled:opacity-60`}
          aria-label={loadingReactions ? "Лайки загружаются" : `Лайки: ${reactions.count}`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20.5 4.8 13.6a4.9 4.9 0 0 1 0-7 4.8 4.8 0 0 1 6.9 0L12 7l.3-.4a4.8 4.8 0 0 1 6.9 0 4.9 4.9 0 0 1 0 7Z" fill={reactions.liked ? "currentColor" : "none"} />
          </svg>
          <span>{loadingReactions ? "..." : reactions.count}</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="type-h4">Оставить комментарий</h3>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="type-button text-zinc-700 dark:text-zinc-200">Имя</span>
              <input
                type="text"
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
                className="w-full border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-emerald-700 dark:border-white/10 dark:bg-[#08110b] dark:focus:border-emerald-400"
                placeholder="Как вас представить"
                disabled
              />
            </label>

            <label className="space-y-2">
              <span className="type-button text-zinc-700 dark:text-zinc-200">Email</span>
              <input
                type="email"
                value={guestEmail}
                onChange={(event) => setGuestEmail(event.target.value)}
                className="w-full border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-emerald-700 dark:border-white/10 dark:bg-[#08110b] dark:focus:border-emerald-400"
                placeholder="name@example.com"
                disabled
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="type-button text-zinc-700 dark:text-zinc-200">Комментарий</span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={5}
              className="w-full border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-emerald-700 dark:border-white/10 dark:bg-[#08110b] dark:focus:border-emerald-400"
              placeholder="Поделитесь мнением о материале"
              disabled={!canComment || submitState === "submitting"}
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className={`type-caption ${bodyLength > maxLength ? "text-red-600 dark:text-red-400" : "text-zinc-500 dark:text-zinc-400"}`}>{helperText}</p>
            <button
              type="submit"
              disabled={!canSubmit}
              className="type-button inline-flex items-center justify-center border border-emerald-800 bg-emerald-800 px-5 py-2.5 text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-600 dark:bg-emerald-600 dark:text-[#08110b] dark:hover:bg-emerald-500"
            >
              {submitState === "submitting" ? "Отправка..." : "Отправить комментарий"}
            </button>
          </div>
        </form>

        {!canComment ? <p className="type-small text-zinc-600 dark:text-zinc-300">{commentAccessMessage}</p> : null}
        {message ? <p className="type-small text-zinc-600 dark:text-zinc-300">{message}</p> : null}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="type-h4">Комментарии</h3>
          <span className="type-caption text-zinc-500 dark:text-zinc-400">{comments.length}</span>
        </div>

        {loadingComments ? (
          <p className="type-small text-zinc-500 dark:text-zinc-400">Загружаем комментарии...</p>
        ) : comments.length ? (
          <div className="divide-y divide-black/10 dark:divide-white/10">
            {comments.map((comment) => (
              <article key={comment.id} className="py-5 first:pt-0 last:pb-0">
                <div className="type-caption mb-3 flex flex-wrap items-center gap-3 text-zinc-500 dark:text-zinc-400">
                  <span>{resolveCommentAuthor(comment)}</span>
                  <span>{formatCommunityDate(comment.createdAt) ?? "Только что"}</span>
                </div>
                <p className="type-body whitespace-pre-wrap text-zinc-800 dark:text-zinc-100">{comment.body}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="type-small text-zinc-500 dark:text-zinc-400">Пока комментариев нет. Вы можете стать первым.</p>
        )}
      </div>
    </section>
  );
}
