import { AccountEditor } from "@/components/account-editor";
import { fetchCurrentUser } from "@/lib/auth";
import { getAuthModeLabel } from "@/lib/auth-shared";

type AccountPageProps = {
  searchParams: Promise<{
    type?: string;
    documentId?: string;
  }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const query = await searchParams;
  const user = await fetchCurrentUser();
  const accountMode = user?.mode ?? "subscriber";
  const isEditorAccount = accountMode === "editor" || accountMode === "author";

  if (!isEditorAccount) {
    const displayName = user?.memberProfile?.displayName?.trim() || user?.username?.trim() || "Подписчик";

    return (
      <main className="mx-auto w-full max-w-5xl py-6 sm:px-6 lg:px-8">
        <div className="mb-6 border-b border-black/10 pb-4 dark:border-white/10">
          <p className="type-caption text-zinc-500 dark:text-zinc-400">Личный кабинет</p>
          <h1 className="type-h1 mt-2">{displayName}</h1>
          <p className="type-body mt-2 max-w-4xl text-zinc-600 dark:text-zinc-400">
            Статус аккаунта: {getAuthModeLabel(accountMode)}.
          </p>
        </div>
        <section className="border border-black/10 bg-white p-6 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-[#12202d]">
          <p className="type-caption text-zinc-500 dark:text-zinc-400">Раздел подписчика</p>
          <h2 className="type-h2 mt-2">Личный кабинет в разработке</h2>
          <p className="type-body mt-4 max-w-3xl text-zinc-600 dark:text-zinc-300">
            Мы уже подключили вход и готовим отдельный кабинет для подписчиков. Здесь появятся настройки профиля и пользовательские функции.
          </p>
        </section>
      </main>
    );
  }

  return <AccountEditor initialQuery={query} />;
}
