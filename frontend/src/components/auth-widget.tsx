"use client";

import { type CSSProperties, type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthMode } from "@/lib/auth-shared";
import { getAuthModeLabel } from "@/lib/auth-shared";
import { buildSocialAuthUrl } from "@/lib/social-auth";

type AuthWidgetProps = {
  label?: string | null;
  compact?: boolean;
  className?: string;
  buttonClassName?: string;
  buttonStyle?: CSSProperties;
  panelClassName?: string;
};

type SessionResponse = {
  authenticated: boolean;
  mode?: AuthMode | null;
  user?: {
    id: number;
    username: string;
    email?: string | null;
    memberProfile?: {
      id: number;
      displayName?: string | null;
      accountType?: "editor" | "author" | "subscriber" | null;
      isApprovedAuthor?: boolean | null;
    } | null;
  } | null;
};

type AuthProvider = {
  id: "google" | "vk" | "yandex";
  label: string;
  enabled: boolean;
};

async function readJsonSafely<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function AuthWidget({ label, compact = false, className, buttonClassName, buttonStyle, panelClassName }: AuthWidgetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerDisplayName, setRegisterDisplayName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionResponse>({ authenticated: false, user: null });
  const [providers, setProviders] = useState<AuthProvider[]>([]);
  const [providersLoaded, setProvidersLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        setLoading(true);
        const sessionResponse = await fetch("/api/auth/me", { cache: "no-store" });

        const data = (await sessionResponse.json()) as SessionResponse;

        if (!cancelled) {
          setSession(data);
        }
      } catch {
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProviders() {
      if (!open || providersLoaded || session.authenticated) {
        return;
      }

      try {
        const providersResponse = await fetch("/api/auth/providers", { cache: "no-store" });
        const providersPayload = await readJsonSafely<{ providers?: AuthProvider[] }>(providersResponse);

        if (!cancelled) {
          setProviders(Array.isArray(providersPayload?.providers) ? providersPayload.providers : []);
        }
      } catch {
        if (!cancelled) {
          setProviders([]);
        }
      } finally {
        if (!cancelled) {
          setProvidersLoaded(true);
        }
      }
    }

    void loadProviders();

    return () => {
      cancelled = true;
    };
  }, [open, providersLoaded, session.authenticated]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!identifier.trim() || !password) {
      setError("Укажите логин и пароль.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      const data = await readJsonSafely<{ ok?: boolean; error?: string; user?: SessionResponse["user"] }>(response);

      if (!response.ok || !data?.ok) {
        const fallbackMessage = response.status === 405
          ? "Маршрут входа вызван неверным методом."
          : "Не удалось войти.";

        throw new Error(data?.error || fallbackMessage);
      }

      setSession({ authenticated: true, user: data.user ?? null });
      setPassword("");
      setOpen(false);
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Не удалось войти.");
    } finally {
      setPending(false);
    }
  }

  async function handleLogout() {
    setPending(true);
    setError(null);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setSession({ authenticated: false, user: null });
      setOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!registerUsername.trim() || !registerEmail.trim() || !registerPassword) {
      setError("Укажите логин, email и пароль.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: registerUsername.trim(),
          email: registerEmail.trim(),
          password: registerPassword,
          accountType: "subscriber",
          displayName: registerDisplayName.trim() || registerUsername.trim(),
        }),
      });

      const data = await readJsonSafely<{ ok?: boolean; error?: string; user?: SessionResponse["user"]; mode?: AuthMode | null }>(response);

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Не удалось зарегистрироваться.");
      }

      setSession({ authenticated: true, user: data.user ?? null, mode: data.mode ?? "subscriber" });
      setRegisterPassword("");
      setOpen(false);
      router.refresh();
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Не удалось зарегистрироваться.");
    } finally {
      setPending(false);
    }
  }

  const enabledProviders = useMemo(() => providers.filter((provider) => provider.enabled), [providers]);
  const socialLinks = enabledProviders.map((provider) => ({
    ...provider,
    href: buildSocialAuthUrl(provider.id, "subscriber"),
  }));

  const triggerLabel = session.authenticated ? (session.user?.username || label || "Кабинет") : (label || "Войти");
  const usesDrawer = !panelClassName;

  return (
    <div className={className ? `relative ${className}` : "relative"}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={buttonClassName ?? (compact
          ? "inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-zinc-700 transition-colors hover:border-emerald-700 hover:text-emerald-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-100 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
          : "type-button inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-zinc-700 transition-colors hover:border-emerald-700 hover:text-emerald-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-100 dark:hover:border-emerald-400 dark:hover:text-emerald-300")}
        style={buttonStyle}
        aria-expanded={open}
        aria-label={triggerLabel}
      >
        {compact ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 21a8 8 0 0 0-16 0" />
            <circle cx="12" cy="8" r="4" />
          </svg>
        ) : (
          <span>{loading ? "..." : triggerLabel}</span>
        )}
      </button>

      {open ? (
        <>
          {usesDrawer ? (
            <button
              type="button"
              aria-label="Закрыть панель входа"
              className="fixed inset-0 z-[139] bg-black/35 backdrop-blur-[1px]"
              onClick={() => setOpen(false)}
            />
          ) : null}
          <div className={panelClassName ?? "fixed right-0 top-0 z-[140] flex h-dvh w-full max-w-[30rem] flex-col border-l border-black/10 bg-white p-6 text-zinc-900 shadow-[-24px_0_80px_rgba(8,17,11,0.18)] dark:border-white/10 dark:bg-[#08110b] dark:text-zinc-100"}>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="type-caption text-zinc-500 dark:text-zinc-400">Аккаунт</p>
              <h3 className="type-h4 mt-2">Личный кабинет</h3>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center border border-black/10 text-zinc-500 transition-colors hover:border-black hover:text-black dark:border-white/10 dark:text-zinc-300 dark:hover:border-white dark:hover:text-white"
              aria-label="Закрыть"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
              </svg>
            </button>
          </div>
          {session.authenticated ? (
            <div className="space-y-4">
              <div>
                <p className="type-caption text-zinc-500 dark:text-zinc-400">Аккаунт</p>
                <p className="type-h4 mt-2">{session.user?.username}</p>
                {session.user?.email ? <p className="type-small mt-1 text-zinc-500 dark:text-zinc-400">{session.user.email}</p> : null}
                <p className="type-small mt-1 text-zinc-500 dark:text-zinc-400">Роль: {getAuthModeLabel(session.mode ?? null)}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/account"
                  className="type-button inline-flex items-center justify-center border border-black/10 px-4 py-2 text-zinc-700 transition-colors hover:border-emerald-700 hover:text-emerald-900 dark:border-white/10 dark:text-zinc-100 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
                >
                  Кабинет
                </a>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  disabled={pending}
                  className="type-button inline-flex items-center justify-center bg-emerald-800 px-4 py-2 text-white transition-colors hover:bg-emerald-700 disabled:opacity-60 dark:bg-emerald-600 dark:text-[#08110b] dark:hover:bg-emerald-500"
                >
                  Выйти
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5 overflow-y-auto pr-1">
              <div className="inline-flex border border-black/10 p-1 dark:border-white/10">
                {([
                  { id: "login", label: "Вход" },
                  { id: "register", label: "Регистрация" },
                ] as const).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setAuthView(item.id);
                      setError(null);
                    }}
                    className={`type-button px-4 py-2 transition-colors ${authView === item.id ? "bg-emerald-800 text-white dark:bg-emerald-500 dark:text-[#08110b]" : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {enabledProviders.length ? (
                <div className="space-y-3">
                  <p className="type-caption text-zinc-500 dark:text-zinc-400">Соцсети</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {socialLinks.map((provider) => (
                      <a
                        key={provider.id}
                        href={provider.href}
                        className="type-button inline-flex items-center justify-center border border-black/10 px-4 py-3 text-zinc-700 transition-colors hover:border-emerald-700 hover:text-emerald-900 dark:border-white/10 dark:text-zinc-100 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
                      >
                        {provider.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              {authView === "login" ? (
                <form className="space-y-4" onSubmit={handleLogin}>
                  <label className="block space-y-2">
                    <span className="type-button">Email или логин</span>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      className="w-full border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-emerald-700 dark:border-white/10 dark:bg-[#08110b] dark:focus:border-emerald-400"
                      placeholder="you@example.com"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="type-button">Пароль</span>
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-emerald-700 dark:border-white/10 dark:bg-[#08110b] dark:focus:border-emerald-400"
                      placeholder="••••••••"
                    />
                  </label>
                  {error ? <p className="type-small text-red-600 dark:text-red-400">{error}</p> : null}
                  <button
                    type="submit"
                    disabled={pending}
                    className="type-button inline-flex items-center justify-center bg-emerald-800 px-5 py-2.5 text-white transition-colors hover:bg-emerald-700 disabled:opacity-60 dark:bg-emerald-600 dark:text-[#08110b] dark:hover:bg-emerald-500"
                  >
                    {pending ? "Входим..." : "Войти"}
                  </button>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={handleRegister}>
                  <label className="block space-y-2">
                    <span className="type-button">Логин</span>
                    <input
                      type="text"
                      value={registerUsername}
                      onChange={(event) => setRegisterUsername(event.target.value)}
                      className="w-full border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-emerald-700 dark:border-white/10 dark:bg-[#08110b] dark:focus:border-emerald-400"
                      placeholder="username"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="type-button">Отображаемое имя</span>
                    <input
                      type="text"
                      value={registerDisplayName}
                      onChange={(event) => setRegisterDisplayName(event.target.value)}
                      className="w-full border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-emerald-700 dark:border-white/10 dark:bg-[#08110b] dark:focus:border-emerald-400"
                      placeholder="Как вас показывать на сайте"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="type-button">Email</span>
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(event) => setRegisterEmail(event.target.value)}
                      className="w-full border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-emerald-700 dark:border-white/10 dark:bg-[#08110b] dark:focus:border-emerald-400"
                      placeholder="you@example.com"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="type-button">Пароль</span>
                    <input
                      type="password"
                      value={registerPassword}
                      onChange={(event) => setRegisterPassword(event.target.value)}
                      className="w-full border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-emerald-700 dark:border-white/10 dark:bg-[#08110b] dark:focus:border-emerald-400"
                      placeholder="Минимум 6 символов"
                    />
                  </label>
                  {error ? <p className="type-small text-red-600 dark:text-red-400">{error}</p> : null}
                  <button
                    type="submit"
                    disabled={pending}
                    className="type-button inline-flex items-center justify-center bg-emerald-800 px-5 py-2.5 text-white transition-colors hover:bg-emerald-700 disabled:opacity-60 dark:bg-emerald-600 dark:text-[#08110b] dark:hover:bg-emerald-500"
                  >
                    {pending ? "Создаём аккаунт..." : "Зарегистрироваться"}
                  </button>
                </form>
              )}
            </div>
          )}
          </div>
        </>
      ) : null}
    </div>
  );
}
