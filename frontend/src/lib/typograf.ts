import Typograf from "typograf";

const typograf = new Typograf({ locale: ["ru", "en-US"] });

const CODE_BLOCK_PATTERN = /<(pre|code|textarea|script|style)\b[\s\S]*?<\/\1>/gi;

function isJsonLike(value: string) {
  const trimmed = value.trim();

  if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("["))) {
    return false;
  }

  try {
    JSON.parse(trimmed);
    return true;
  } catch {
    return false;
  }
}

export function typografText(value: string) {
  if (!value || isJsonLike(value)) {
    return value;
  }

  const protectedBlocks: string[] = [];
  const protectedValue = value.replace(CODE_BLOCK_PATTERN, (block) => {
    const token = `__TYPOGRAF_PROTECTED_BLOCK_${protectedBlocks.length}__`;
    protectedBlocks.push(block);
    return token;
  });

  const typedValue = typograf.execute(protectedValue);

  return protectedBlocks.reduce(
    (result, block, index) => result.replace(`__TYPOGRAF_PROTECTED_BLOCK_${index}__`, block),
    typedValue,
  );
}
