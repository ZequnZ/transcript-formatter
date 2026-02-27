import type { Cheerio, CheerioAPI, Element } from "cheerio";
import type { TranscriptLine } from "../src/types/transcript.js";

export function isItalic($: CheerioAPI, el: Cheerio<Element>): boolean {
  const html = el.html() ?? "";
  const text = el.text().trim();
  if (!text) return false;

  const firstChild = el.children().first();
  if (firstChild.length === 0) return false;

  const tag = firstChild.prop("tagName")?.toLowerCase();
  if (tag === "em" || tag === "i") {
    return firstChild.text().trim() === text;
  }

  const span = firstChild.is("span") ? firstChild : null;
  if (span) {
    const innerFirst = span.children().first();
    const innerTag = innerFirst.prop("tagName")?.toLowerCase();
    if (innerTag === "em" || innerTag === "i") {
      return innerFirst.text().trim() === text;
    }
    const deepFirst = innerFirst.children().first();
    const deepTag = deepFirst.prop("tagName")?.toLowerCase();
    if (deepTag === "em" || deepTag === "i") {
      return deepFirst.text().trim() === text;
    }
  }

  const stripped = html
    .replace(/<\/?(?:span|font)[^>]*>/gi, "")
    .trim();
  const italicMatch = stripped.match(
    /^<(?:em|i)[^>]*>([\s\S]*)<\/(?:em|i)>$/i
  );
  if (italicMatch) {
    return true;
  }

  return false;
}

export function shouldDiscard($: CheerioAPI, el: Cheerio<Element>): boolean {
  const text = el.text().trim();
  if (!text || text === "\u00a0" || text === "&nbsp;") return true;

  if (isItalic($, el)) {
    const lower = text.toLowerCase();
    if (lower.includes("credit")) return true;
    if (lower.startsWith("following a")) return true;
    if (lower.startsWith("previously on")) return true;
  }

  return false;
}

export function normalizeText(text: string): string {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractInlineDirection(
  $: CheerioAPI,
  el: Cheerio<Element>
): { beforeColon: string | null; characterRaw: string; dialogRaw: string } | null {
  const html = el.html();
  if (!html) return null;

  const emMatches = html.match(
    /^([^<]+?)\s*<(?:em|i)[^>]*>\(([^)]+)\)<\/(?:em|i)>\s*:\s*([\s\S]*)$/i
  );
  if (emMatches) {
    return {
      characterRaw: emMatches[1].trim(),
      beforeColon: `(${emMatches[2].trim()})`,
      dialogRaw: emMatches[3].trim(),
    };
  }

  return null;
}

export function classifyParagraph(
  $: CheerioAPI,
  el: Cheerio<Element>
): TranscriptLine | null {
  if (shouldDiscard($, el)) return null;

  const text = normalizeText(el.text());

  if (isItalic($, el)) {
    if (text.toLowerCase().startsWith("scene:")) {
      return {
        type: "scene",
        text: normalizeText(text.replace(/^scene:\s*/i, "")),
      };
    }
    return {
      type: "direction",
      text,
    };
  }

  const inlineDir = extractInlineDirection($, el);
  if (inlineDir) {
    return {
      type: "dialog",
      character: normalizeText(inlineDir.characterRaw),
      direction: inlineDir.beforeColon ?? undefined,
      text: normalizeText(stripInlineTags(inlineDir.dialogRaw)),
    };
  }

  const colonIndex = text.indexOf(":");
  if (colonIndex > 0 && colonIndex < 40) {
    const possibleName = text.slice(0, colonIndex).trim();
    if (/^[A-Za-z][\w\s'.()-]*$/.test(possibleName) && !possibleName.includes("  ")) {
      const dialogText = text.slice(colonIndex + 1).trim();
      return {
        type: "dialog",
        character: possibleName,
        text: dialogText,
      };
    }
  }

  return {
    type: "direction",
    text,
  };
}

function stripInlineTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}
