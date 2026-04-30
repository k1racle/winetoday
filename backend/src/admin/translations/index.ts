import enTranslations from './en.json';
import ruTranslations from './ru.json';

type TranslationDictionary = Record<string, string>;

const rawTranslations: Record<string, TranslationDictionary> = {
  en: enTranslations,
  ru: ruTranslations,
};

const allTranslationKeys = Array.from(
  new Set(Object.values(rawTranslations).flatMap((messages) => Object.keys(messages))),
).sort();

function getFallbackMessage(locale: string, key: string) {
  return (
    rawTranslations[locale]?.[key]
    ?? rawTranslations.en?.[key]
    ?? Object.values(rawTranslations).find((messages) => key in messages)?.[key]
    ?? key
  );
}

function normalizeTranslations(translations: Record<string, TranslationDictionary>) {
  return Object.fromEntries(
    Object.entries(translations).map(([locale, messages]) => [
      locale,
      Object.fromEntries(
        allTranslationKeys.map((key) => [key, messages[key] ?? getFallbackMessage(locale, key)]),
      ),
    ]),
  ) as Record<string, TranslationDictionary>;
}

export const ADMIN_LOCALES = Object.keys(rawTranslations);

// Keeps every configured locale structurally complete and avoids missing-translation warnings
// when new custom admin keys are added incrementally during localization rollout.
export const ADMIN_TRANSLATIONS = normalizeTranslations(rawTranslations);

