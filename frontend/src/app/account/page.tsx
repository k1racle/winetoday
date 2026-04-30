import { AccountEditor } from "@/components/account-editor";

type AccountPageProps = {
  searchParams: Promise<{
    type?: string;
    documentId?: string;
  }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const query = await searchParams;

  return (
    <main className="mx-auto w-full max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 border-b border-black/10 pb-4 dark:border-white/10">
        <p className="type-caption text-zinc-500 dark:text-zinc-400">Личный кабинет</p>
        <h1 className="type-h1 mt-2">Редактор материалов</h1>
        <p className="type-body mt-2 max-w-4xl text-zinc-600 dark:text-zinc-400">Создание и редактирование материалов во фронте без перехода в админку.</p>
      </div>
      <AccountEditor initialQuery={query} />
    </main>
  );
}
