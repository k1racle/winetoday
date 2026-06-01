type AuthErrorPageProps = {
  searchParams: Promise<{
    provider?: string;
    reason?: string;
    status?: string;
  }>;
};

const REASON_LABELS: Record<string, string> = {
  "missing-token": "Сервис авторизации не вернул токен доступа.",
  "strapi-callback-failed": "Сайт получил токен от провайдера, но Strapi не смог создать пользовательскую сессию.",
  "empty-jwt": "Strapi ответил без JWT-токена пользователя.",
};

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const query = await searchParams;
  const reason = query.reason?.trim() || "unknown";
  const provider = query.provider?.trim();
  const status = query.status?.trim();

  return (
    <main className="mx-auto grid min-h-[60vh] w-full max-w-3xl place-items-center px-4 py-12 sm:px-6 lg:px-8">
      <section className="w-full border border-black/10 bg-white p-6 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-[#12202d]">
        <p className="type-caption text-zinc-500 dark:text-zinc-400">Ошибка входа</p>
        <h1 className="type-h2 mt-2">Не удалось завершить вход</h1>
        <p className="type-body mt-4 text-zinc-600 dark:text-zinc-300">
          {REASON_LABELS[reason] ?? "Авторизация завершилась с неизвестной ошибкой."}
        </p>
        <dl className="mt-6 grid gap-3 text-sm text-zinc-600 dark:text-zinc-300">
          {provider ? (
            <div>
              <dt className="font-semibold text-zinc-900 dark:text-white">Провайдер</dt>
              <dd>{provider}</dd>
            </div>
          ) : null}
          <div>
            <dt className="font-semibold text-zinc-900 dark:text-white">Причина</dt>
            <dd>{reason}</dd>
          </div>
          {status ? (
            <div>
              <dt className="font-semibold text-zinc-900 dark:text-white">Статус Strapi</dt>
              <dd>{status}</dd>
            </div>
          ) : null}
        </dl>
      </section>
    </main>
  );
}
