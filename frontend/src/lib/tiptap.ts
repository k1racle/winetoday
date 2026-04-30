import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";

export const tiptapExtensions = [
  StarterKit.configure({
    link: false,
    underline: false,
  }),
  Underline,
  LinkExtension.configure({ openOnClick: false }),
  ImageExtension,
  Subscript,
  Superscript,
  Color,
  Highlight,
  Table.configure({ resizable: false }),
  TableRow,
  TableHeader,
  TableCell,
  TextAlign.configure({
    types: ["heading", "paragraph"],
    alignments: ["left", "center", "right", "justify"],
  }),
];

export function parseTiptapDocument(content?: Record<string, unknown> | string | null) {
  if (!content) {
    return null;
  }

  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content) as unknown;
      return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }

  if (typeof content !== "object") {
    return null;
  }

  return content;
}

function plainTextToTiptapDocument(content: string) {
  const parts = content
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return createEmptyTiptapDocument();
  }

  return {
    type: "doc",
    content: parts.map((part) => ({
      type: "paragraph",
      content: [{ type: "text", text: part }],
    })),
  } satisfies Record<string, unknown>;
}

export function serializeTiptapDocument(content?: Record<string, unknown> | string | null) {
  if (!content) {
    return JSON.stringify(createEmptyTiptapDocument());
  }

  if (typeof content === "string") {
    const trimmed = content.trim();

    if (!trimmed) {
      return JSON.stringify(createEmptyTiptapDocument());
    }

    const parsed = parseTiptapDocument(trimmed);

    if (parsed) {
      return JSON.stringify(parsed);
    }

    return JSON.stringify(plainTextToTiptapDocument(trimmed));
  }

  return JSON.stringify(content);
}

export function createEmptyTiptapDocument() {
  return {
    type: "doc",
    content: [{ type: "paragraph" }],
  } satisfies Record<string, unknown>;
}
