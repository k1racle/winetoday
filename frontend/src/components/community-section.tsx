"use client";

import Image from "next/image";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
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
  parentComment?: {
    id: number;
    guestName?: string | null;
    authorUser?: {
      id: number;
      username?: string | null;
    } | null;
  } | null;
};

type CommunityCommentThread = CommunityComment & {
  replies: CommunityCommentThread[];
};

type ReactionSummary = {
  count: number;
  liked: boolean;
  disliked?: boolean;
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
  afterShareContent?: ReactNode;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

function resolveCommentAuthor(comment: CommunityComment) {
  return comment.authorUser?.username?.trim() || comment.guestName?.trim() || "Гость";
}

function resolveCommentParentAuthor(comment: CommunityComment) {
  return comment.parentComment?.authorUser?.username?.trim() || comment.parentComment?.guestName?.trim() || "Гость";
}

function buildCommentThreads(comments: CommunityComment[]) {
  const nodes = new Map<number, CommunityCommentThread>();
  const roots: CommunityCommentThread[] = [];

  for (const comment of comments) {
    nodes.set(comment.id, {
      ...comment,
      replies: [],
    });
  }

  for (const comment of comments) {
    const node = nodes.get(comment.id);

    if (!node) {
      continue;
    }

    const parentId = comment.parentComment?.id;
    const parent = parentId ? nodes.get(parentId) : null;

    if (parent) {
      parent.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
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

function openAuthWidget(view: "login" | "register" = "login") {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent("open-auth-widget", { detail: { view } }));
}

export function CommunitySection({ contentTypeUid, targetDocumentId, targetSlug, title, sharePath, afterShareContent }: CommunitySectionProps) {
  const [settings, setSettings] = useState<CommunitySettings | null>(null);
  const [session, setSession] = useState<SessionResponse>({ authenticated: false, user: null });
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [reactions, setReactions] = useState<ReactionSummary>({ count: 0, liked: false, disliked: false });
  const [loadingComments, setLoadingComments] = useState(true);
  const [loadingReactions, setLoadingReactions] = useState(true);
  const [body, setBody] = useState("");
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [reactionPending, setReactionPending] = useState(false);
  const [sharePanelOpen, setSharePanelOpen] = useState(false);

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
            disliked: Boolean(data?.disliked),
          });
        }
      } catch (error) {
        console.error("[community] reactions", error);
        if (!cancelled) {
          setReactions({ count: 0, liked: false, disliked: false });
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
  const canSubmit = canComment && bodyLength > 0 && bodyLength <= maxLength && submitState !== "submitting";
  const replyTarget = useMemo(() => comments.find((comment) => comment.id === replyingToId) ?? null, [comments, replyingToId]);
  const commentThreads = useMemo(() => buildCommentThreads(comments), [comments]);
  const commentsCount = comments.length;

  const helperText = useMemo(() => {
    if (bodyLength > maxLength) {
      return `Превышен лимит: ${bodyLength} / ${maxLength}`;
    }

    return `${bodyLength} / ${maxLength}`;
  }, [bodyLength, maxLength]);

  function resizeCommentTextarea(element: HTMLTextAreaElement) {
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      if (!canComment) {
        openAuthWidget("login");
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
            body: body.trim(),
            parentCommentId: replyingToId,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(await extractErrorMessage(response, "Не удалось отправить комментарий."));
      }

      const createdComment = (await response.json()) as CommunityComment;

      setBody("");
      setReplyingToId(null);
      setSubmitState("success");
      setMessage(createdComment.parentComment ? "Ответ опубликован." : "Комментарий опубликован.");
      setComments((currentComments) => [createdComment, ...currentComments]);
    } catch (error) {
      console.error("[community] submit comment", error);
      setSubmitState("error");
      setMessage(error instanceof Error && error.message ? error.message : "Не удалось отправить комментарий. Попробуйте ещё раз.");
    }
  }

  async function handleToggleReaction(type: "like" | "dislike") {
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
            type,
          },
        }),
      });

      if (response.status === 403) {
        setMessage("Лайки будут доступны после подключения кабинета пользователя.");
        return;
      }

      if (!response.ok) {
        throw new Error("Не удалось обновить реакцию.");
      }

      const data = (await response.json()) as ReactionSummary;
      setReactions({
        count: typeof data?.count === "number" ? data.count : 0,
        liked: Boolean(data?.liked),
        disliked: Boolean(data?.disliked),
      });
    } catch (error) {
      console.error("[community] toggle reaction", error);
      setMessage("Не удалось обновить реакцию.");
    } finally {
      setReactionPending(false);
    }
  }

  function handleReply(comment: CommunityCommentThread) {
    setReplyingToId(comment.id);
    setSubmitState("idle");
    setMessage(null);
  }

  function handleCancelReply() {
    setReplyingToId(null);
    setSubmitState("idle");
    setMessage(null);
  }

  function scrollToComments() {
    document.getElementById("community-comments")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderCommentThread(comment: CommunityCommentThread, depth = 0): ReactNode {
    const isReply = depth > 0;

    return (
      <article key={comment.id} className={`${depth ? "ml-6 border-l border-black/10 pl-4 dark:border-white/10" : ""} py-5 first:pt-0 last:pb-0`}>
        <div className="type-caption mb-3 flex flex-wrap items-center gap-3 text-zinc-500 dark:text-zinc-400">
          {isReply ? <span>Ответ на {resolveCommentParentAuthor(comment)}</span> : null}
          <span>{resolveCommentAuthor(comment)}</span>
          <span>{formatCommunityDate(comment.createdAt) ?? "Только что"}</span>
        </div>
        <p className="type-body whitespace-pre-wrap text-zinc-800 dark:text-zinc-100">{comment.body}</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            className="type-small text-emerald-700 transition-colors hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-200"
            onClick={() => handleReply(comment)}
          >
            Ответить
          </button>
        </div>
        {comment.replies.length ? <div className="mt-2 space-y-0">{comment.replies.map((reply) => renderCommentThread(reply, depth + 1))}</div> : null}
      </article>
    );
  }

  return (
    <section className="mt-10 space-y-8 border-t border-black/10 pt-8 dark:border-white/10">
      <div className="relative flex items-center justify-between gap-4 border-b border-black/10 pb-5 dark:border-white/10">
        <div className="flex items-center gap-5 text-zinc-600 dark:text-zinc-300">
          <button
            type="button"
            onClick={() => void handleToggleReaction("like")}
            disabled={reactionPending}
            className={`inline-flex items-center gap-2 transition-colors ${reactions.liked ? "text-emerald-800 dark:text-emerald-300" : "hover:text-emerald-800 dark:hover:text-emerald-300"} disabled:cursor-not-allowed disabled:opacity-60`}
            aria-label={loadingReactions ? "Лайки загружаются" : `Лайки: ${reactions.count}`}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7.5 21H4.8a1.6 1.6 0 0 1-1.6-1.6v-7.1a1.6 1.6 0 0 1 1.6-1.6h2.7V21Z" fill={reactions.liked ? "currentColor" : "none"} />
              <path d="M7.5 10.7 11.2 3a2.2 2.2 0 0 1 2.2 2.6l-.6 3h5.3a2.2 2.2 0 0 1 2.1 2.8l-1.7 6.2A3.2 3.2 0 0 1 15.4 20H7.5" />
            </svg>
            {!loadingReactions && reactions.count > 0 ? <span>{reactions.count}</span> : null}
          </button>

          <button type="button" className="inline-flex items-center gap-2 transition-colors hover:text-emerald-800 dark:hover:text-emerald-300" aria-label="Комментарии" onClick={scrollToComments}>
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 5.5h14a2 2 0 0 1 2 2v7.8a2 2 0 0 1-2 2H9.2L4 21v-3.7H5a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Z" />
              <path d="M8 10h8M8 13.5h5" />
            </svg>
            {commentsCount > 0 ? <span>{commentsCount}</span> : null}
          </button>
        </div>

        <div className="flex items-center gap-5 text-zinc-600 dark:text-zinc-300">
          <button
            type="button"
            className={`inline-flex items-center transition-colors ${reactions.disliked ? "text-emerald-800 dark:text-emerald-300" : "hover:text-zinc-900 dark:hover:text-white"} disabled:cursor-not-allowed disabled:opacity-60`}
            aria-label="Дизлайк"
            disabled={reactionPending}
            onClick={() => void handleToggleReaction("dislike")}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16.5 3h2.7a1.6 1.6 0 0 1 1.6 1.6v7.1a1.6 1.6 0 0 1-1.6 1.6h-2.7V3Z" fill={reactions.disliked ? "currentColor" : "none"} />
              <path d="M16.5 13.3 12.8 21a2.2 2.2 0 0 1-2.2-2.6l.6-3H5.9a2.2 2.2 0 0 1-2.1-2.8l1.7-6.2A3.2 3.2 0 0 1 8.6 4h7.9" />
            </svg>
          </button>

          <button type="button" className="inline-flex items-center transition-colors hover:text-emerald-800 dark:hover:text-emerald-300" aria-label="Поделиться" aria-expanded={sharePanelOpen} onClick={() => setSharePanelOpen((isOpen) => !isOpen)}>
            <Image src="/share-forward.svg" alt="" width={24} height={24} className="h-6 w-6 dark:invert" aria-hidden="true" />
          </button>
        </div>

        {sharePanelOpen ? (
          <div className="fixed inset-0 z-50 flex items-end bg-black/45 sm:absolute sm:inset-auto sm:right-0 sm:top-10 sm:block sm:bg-transparent" onClick={() => setSharePanelOpen(false)}>
            <div className="w-full rounded-t-[28px] bg-white p-5 text-[#171717] shadow-2xl dark:bg-[#111914] dark:text-white sm:w-80 sm:rounded-2xl sm:border sm:border-black/10 sm:p-4 dark:sm:border-white/10" onClick={(event) => event.stopPropagation()}>
              <div className="mb-5 flex items-center justify-between sm:mb-4">
                <button type="button" className="inline-flex h-9 w-9 items-center justify-center" aria-label="Закрыть" onClick={() => setSharePanelOpen(false)}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <h3 className="type-h4">Поделиться</h3>
                <span className="h-9 w-9" aria-hidden="true" />
              </div>

              <div className="flex gap-5 overflow-x-auto pb-1 sm:flex-col sm:gap-1 sm:overflow-visible sm:pb-0">
                <button type="button" className="flex w-24 shrink-0 flex-col items-center gap-2 rounded-xl p-2 text-center transition-colors hover:bg-black/5 dark:hover:bg-white/10 sm:w-auto sm:min-w-0 sm:flex-row sm:justify-start sm:gap-3 sm:text-left" onClick={() => void navigator.clipboard?.writeText(shareUrl)}>
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/10 sm:h-9 sm:w-9">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current sm:h-5 sm:w-5" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
                      <path d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1" />
                    </svg>
                  </span>
                  <span className="type-small whitespace-normal leading-tight">Скопировать ссылку</span>
                </button>

                {shareLinks.map((network) => (
                  <a key={network.label} href={network.href} target="_blank" rel="noreferrer" className="flex w-24 shrink-0 flex-col items-center gap-2 rounded-xl p-2 text-center transition-colors hover:bg-black/5 dark:hover:bg-white/10 sm:w-auto sm:min-w-0 sm:flex-row sm:justify-start sm:gap-3 sm:text-left" onClick={() => setSharePanelOpen(false)}>
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/10 sm:h-9 sm:w-9">
                      {network.icon?.url ? (
                        <span className="relative block h-7 w-7 overflow-hidden sm:h-5 sm:w-5">
                          <Image src={network.icon.url} alt={network.icon.alternativeText ?? network.label} fill sizes="28px" className="object-contain" />
                        </span>
                      ) : (
                        <span className="type-caption">{network.label.slice(0, 2)}</span>
                      )}
                    </span>
                    <span className="type-small">{network.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {afterShareContent ? <div>{afterShareContent}</div> : null}

      <div id="community-comments" className="scroll-mt-24 space-y-4">
        <div className="space-y-1">
          <h3 className="type-h4">Комментарии</h3>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          {replyTarget ? (
            <div className="flex items-center justify-between gap-3 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/20 dark:text-emerald-100">
              <span>Ответ на {resolveCommentAuthor(replyTarget)}</span>
              <button type="button" className="type-button text-emerald-700 dark:text-emerald-300" onClick={handleCancelReply}>
                Отменить
              </button>
            </div>
          ) : null}
          <label className="relative block overflow-hidden">
            <textarea
              value={body}
              onChange={(event) => {
                setBody(event.target.value);
                resizeCommentTextarea(event.currentTarget);
              }}
              rows={1}
              className="w-full min-h-[64px] resize-none overflow-hidden border border-black/10 bg-white px-4 py-3 pr-16 outline-none transition-colors focus:border-emerald-700 dark:border-white/10 dark:bg-[#08110b] dark:focus:border-emerald-400"
              placeholder="Поделитесь мнением о материале"
              disabled={submitState === "submitting"}
            />
            <button
              type="submit"
              disabled={bodyLength === 0 || bodyLength > maxLength || submitState === "submitting"}
              className="absolute bottom-px right-px grid h-10 w-10 place-items-center rounded-md border border-emerald-800 bg-emerald-800 p-0 text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-600 dark:bg-emerald-600 dark:text-[#08110b] dark:hover:bg-emerald-500"
              aria-label={submitState === "submitting" ? "Отправка комментария" : "Отправить комментарий"}
            >
              <Image src="/comment-send.svg" alt="" width={22} height={22} className="block h-5 w-5 brightness-0 invert dark:invert-0" aria-hidden="true" />
            </button>
          </label>

          <div className="flex items-center justify-between gap-3">
            <p className={`type-caption ${bodyLength > maxLength ? "text-red-600 dark:text-red-400" : "text-zinc-500 dark:text-zinc-400"}`}>{helperText}</p>
          </div>
        </form>

        {canComment && message ? <p className="type-small text-zinc-600 dark:text-zinc-300">{message}</p> : null}
      </div>

      <div className="space-y-4">
        {loadingComments ? (
          <p className="type-small text-zinc-500 dark:text-zinc-400">Загружаем комментарии...</p>
        ) : commentThreads.length ? (
          <div className="divide-y divide-black/10 dark:divide-white/10">
            {commentThreads.map((comment) => renderCommentThread(comment))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
