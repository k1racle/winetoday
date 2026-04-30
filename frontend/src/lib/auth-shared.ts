export type AuthMode = "subscriber" | "author" | "editor";

export function resolveAuthMode(input: {
  accountType?: "editor" | "author" | "subscriber" | null;
}) {
  if (input.accountType === "editor") {
    return "editor" satisfies AuthMode;
  }

  if (input.accountType === "author") {
    return "author" satisfies AuthMode;
  }

  return "subscriber" satisfies AuthMode;
}

export function getAuthModeLabel(mode?: AuthMode | null) {
  if (mode === "editor") {
    return "Редактор";
  }

  if (mode === "author") {
    return "Автор";
  }

  return "Подписчик";
}
