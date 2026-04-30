"use client";

import { useEffect, useRef } from "react";

type EmbedHtmlProps = {
  html?: string | null;
  className?: string;
};

const ALLOWED_TAGS = new Set(["a", "blockquote", "div", "iframe", "ins", "p", "script", "span"]);
const ALLOWED_IFRAME_ATTRS = new Set([
  "allow",
  "allowfullscreen",
  "frameborder",
  "height",
  "loading",
  "name",
  "referrerpolicy",
  "sandbox",
  "scrolling",
  "src",
  "title",
  "width",
]);
const ALLOWED_SCRIPT_ATTRS = new Set(["async", "charset", "crossorigin", "defer", "referrerpolicy", "src", "type"]);
const ALLOWED_LINK_ATTRS = new Set(["href", "rel", "target", "title"]);
const ALLOWED_GENERIC_ATTRS = new Set(["class", "id", "role", "style", "title"]);

function isAllowedDataAttribute(name: string) {
  return name.startsWith("data-") || name.startsWith("aria-");
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed, window.location.origin);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function copyAllowedAttributes(source: Element, target: Element) {
  for (const attribute of Array.from(source.attributes)) {
    const name = attribute.name.toLowerCase();
    const value = attribute.value;

    if (isAllowedDataAttribute(name)) {
      target.setAttribute(attribute.name, value);
      continue;
    }

    if (ALLOWED_GENERIC_ATTRS.has(name)) {
      target.setAttribute(attribute.name, value);
      continue;
    }

    if (target.tagName === "IFRAME" && ALLOWED_IFRAME_ATTRS.has(name)) {
      if (name === "src") {
        const normalized = normalizeUrl(value);

        if (normalized) {
          target.setAttribute("src", normalized);
        }

        continue;
      }

      target.setAttribute(attribute.name, value);
      continue;
    }

    if (target.tagName === "SCRIPT" && ALLOWED_SCRIPT_ATTRS.has(name)) {
      if (name === "src") {
        const normalized = normalizeUrl(value);

        if (normalized) {
          target.setAttribute("src", normalized);
        }

        continue;
      }

      target.setAttribute(attribute.name, value);
      continue;
    }

    if (target.tagName === "A" && ALLOWED_LINK_ATTRS.has(name)) {
      if (name === "href") {
        const normalized = normalizeUrl(value);

        if (normalized) {
          target.setAttribute("href", normalized);
        }

        continue;
      }

      target.setAttribute(attribute.name, value);
    }
  }
}

function sanitizeNode(node: Node): Node | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(node.textContent ?? "");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const source = node as Element;
  const tagName = source.tagName.toLowerCase();

  if (!ALLOWED_TAGS.has(tagName)) {
    return null;
  }

  const element = document.createElement(tagName);
  copyAllowedAttributes(source, element);

  if (tagName === "script") {
    if (source.textContent?.trim()) {
      element.textContent = source.textContent;
    }

    return element;
  }

  for (const child of Array.from(source.childNodes)) {
    const sanitizedChild = sanitizeNode(child);

    if (sanitizedChild) {
      element.appendChild(sanitizedChild);
    }
  }

  return element;
}

export function EmbedHtml({ html, className }: EmbedHtmlProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    container.replaceChildren();

    if (!html?.trim()) {
      return;
    }

    const parsed = new DOMParser().parseFromString(html, "text/html");
    const fragment = document.createDocumentFragment();

    for (const node of Array.from(parsed.body.childNodes)) {
      const sanitizedNode = sanitizeNode(node);

      if (sanitizedNode) {
        fragment.appendChild(sanitizedNode);
      }
    }

    container.appendChild(fragment);
  }, [html]);

  return <div ref={containerRef} className={className} />;
}
