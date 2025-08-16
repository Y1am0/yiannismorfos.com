"use client";

import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { motion } from "motion/react";
import { word } from "../Hello/variants";

const LINK_CLASS =
  "text-white border-b border-white/40 hover:border-white transition-colors";

function isInternalConnectLink(url?: string) {
  if (!url) return false;
  // Treat relative '/connect' or any absolute ending with '/connect' as internal
  if (url === "/connect") return true;
  try {
    const u = new URL(url, "http://dummy.local");
    return u.pathname === "/connect";
  } catch {
    return false;
  }
}
function linkAttrs(url?: string) {
  return isInternalConnectLink(url)
    ? {}
    : { target: "_blank", rel: "noopener noreferrer" };
}

interface AnimatedTextProps {
  text: string;
  isComplete?: boolean;
  className?: string;
}

// Normalize raw contact link to markdown [here](url)
function normalizeContactLinks(input: string): string {
  const CONTACT_PATH = "/connect";
  // First, convert any raw contact URL to [here](/connect)
  let out = input.replace(/https?:\/\/[^\s)]+\/connect\b/g, (url) => {
    if (
      input.includes(`[here](${url})`) ||
      input.includes(`[here](${CONTACT_PATH})`)
    )
      return url; // already handled
    return `[here](${CONTACT_PATH})`;
  });

  // Remove lines like 'Link: here' / 'Link: https://.../connect' / 'Link: [here](...)'
  const lines = out.split(/\n/);
  let removedLinkLine = false;
  const filtered: string[] = [];
  const linkLineRegex =
    /^Link:\s*(?:here|\[here\]\([^)]*\)|https?:\/\/[^\s)]+\/connect\b)\.?$/i;
  for (const line of lines) {
    if (linkLineRegex.test(line.trim())) {
      removedLinkLine = true;
      continue;
    }
    filtered.push(line);
  }
  out = filtered.join("\n");

  // If we removed a link line and there is not yet an inline [here](/connect), convert the last plain 'here'
  if (removedLinkLine && !/\[here\]\([^)]*\)/i.test(out)) {
    const matches = [...out.matchAll(/\bhere\b/gi)];
    if (matches.length) {
      const last = matches[matches.length - 1];
      const idx = last.index ?? -1;
      if (idx >= 0) {
        out =
          out.slice(0, idx) +
          `[here](${CONTACT_PATH})` +
          out.slice(idx + last[0].length);
      }
    }
  }

  return out;
}

// Inline token type
interface InlineToken {
  type: "text" | "bold" | "italic" | "link";
  content: string;
  url?: string;
}

// Split inline content into tokens (order matters: bold before italic)
function parseInline(content: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const pattern = /(\[[^\]]+\]\([^\)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
  const parts = content.split(pattern);
  parts.forEach((part) => {
    if (!part) return;
    if (/^\[[^\]]+\]\([^\)]+\)$/.test(part)) {
      const m = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
      if (m) tokens.push({ type: "link", content: m[1], url: m[2] });
    } else if (/^\*\*[^*]+\*\*$/.test(part)) {
      tokens.push({ type: "bold", content: part.slice(2, -2) });
    } else if (/^\*[^*]+\*$/.test(part)) {
      tokens.push({ type: "italic", content: part.slice(1, -1) });
    } else if (/^_[^_]+_$/.test(part)) {
      tokens.push({ type: "italic", content: part.slice(1, -1) });
    } else {
      tokens.push({ type: "text", content: part });
    }
  });
  return tokens;
}

// Block element type
interface BlockElementBase {
  type: string;
}
interface BreakEl extends BlockElementBase {
  type: "break";
}
interface ULItem extends BlockElementBase {
  type: "ul";
  content: string;
  indent: number;
}
interface OLItem extends BlockElementBase {
  type: "ol";
  content: string;
  indent: number;
  order: number;
}
interface InlineEl extends BlockElementBase {
  type: "text" | "bold" | "italic" | "link";
  content: string;
  url?: string;
}

type Element = BreakEl | ULItem | OLItem | InlineEl;

// Parse markdown into a sequence of block & inline elements. List items become container elements.
function parseMarkdown(raw: string): Element[] {
  const text = normalizeContactLinks(raw);
  const lines = text.split("\n");
  const elements: Element[] = [];

  lines.forEach((line, idx) => {
    if (idx > 0) elements.push({ type: "break" });
    if (line.trim() === "") {
      elements.push({ type: "break" });
      return;
    }

    // Ordered list: 1. Item text
    const ol = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (ol) {
      const indent = Math.floor(ol[1].length / 2);
      const order = parseInt(ol[2], 10);
      const content = ol[3];
      elements.push({ type: "ol", content, indent, order });
      return;
    }

    // Unordered list: - item
    const ul = line.match(/^(\s*)-\s+(.*)$/);
    if (ul) {
      const indent = Math.floor(ul[1].length / 2);
      const content = ul[2];
      elements.push({ type: "ul", content, indent });
      return;
    }

    // Regular line inline parsing appended directly
    parseInline(line).forEach((tok) => elements.push(tok));
  });

  return elements;
}

// Word tokenizer preserving whitespace (for natural wrapping)
function tokenizeWords(content: string) {
  return content.split(/(\s+)/);
}

// Animated inline word renderer
function AnimatedInline({
  content,
  charIndexRef,
  variantKey,
}: {
  content: string;
  charIndexRef: { current: number };
  variantKey: string;
}) {
  const tokens = tokenizeWords(content);
  return (
    <>
      {tokens.map((tok, i) => {
        if (/^\s+$/.test(tok))
          return <span key={`${variantKey}-ws-${i}`}>{tok}</span>;
        const letters = [...tok];
        const start = charIndexRef.current;
        charIndexRef.current += letters.length;
        return (
          <span
            key={`${variantKey}-w-${i}`}
            className="inline-block align-baseline"
          >
            {letters.map((ch, j) => (
              <motion.span
                key={`${variantKey}-ch-${i}-${j}`}
                variants={word}
                initial="hidden"
                animate="show"
                transition={{
                  delay: (start + j) * 0.02,
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="inline-block"
              >
                {ch}
              </motion.span>
            ))}
          </span>
        );
      })}
    </>
  );
}

// Render collection of inline tokens (for list item content) with animation continuity
function RenderInlineTokens({
  tokens,
  charIndexRef,
  baseKey,
}: {
  tokens: InlineToken[];
  charIndexRef: { current: number };
  baseKey: string;
}) {
  return (
    <>
      {tokens.map((tok, i) => {
        const key = `${baseKey}-${tok.type}-${i}`;
        switch (tok.type) {
          case "bold":
            return (
              <strong key={key} className="font-semibold text-white/95">
                <AnimatedInline
                  content={tok.content}
                  charIndexRef={charIndexRef}
                  variantKey={`${baseKey}-bold-${i}`}
                />
              </strong>
            );
          case "italic":
            return (
              <em key={key} className="italic text-white/90">
                <AnimatedInline
                  content={tok.content}
                  charIndexRef={charIndexRef}
                  variantKey={`${baseKey}-italic-${i}`}
                />
              </em>
            );
          case "link":
            return (
              <a
                key={key}
                href={tok.url}
                {...linkAttrs(tok.url)}
                className={LINK_CLASS}
              >
                <AnimatedInline
                  content={tok.content}
                  charIndexRef={charIndexRef}
                  variantKey={`${baseKey}-link-${i}`}
                />
              </a>
            );
          default:
            return (
              <AnimatedInline
                key={key}
                content={tok.content}
                charIndexRef={charIndexRef}
                variantKey={`${baseKey}-text-${i}`}
              />
            );
        }
      })}
    </>
  );
}

export const AnimatedText = ({
  text,
  isComplete = true,
  className = "",
}: AnimatedTextProps) => {
  const prefersReduced = usePrefersReducedMotion();
  const elements = parseMarkdown(text);

  if (prefersReduced) {
    return (
      <div className={className}>
        {elements.map((el, i) => {
          switch (el.type) {
            case "break":
              return <br key={i} />;
            case "ul":
              return (
                <div
                  key={i}
                  className="flex items-baseline gap-2"
                  style={{ marginLeft: `${el.indent * 16}px` }}
                >
                  <span className="text-white/60 flex-shrink-0 select-none">
                    •
                  </span>
                  <span>
                    {parseInline(el.content).map((tok, j) => {
                      if (tok.type === "bold")
                        return (
                          <strong
                            key={j}
                            className="font-semibold text-white/95"
                          >
                            {tok.content}
                          </strong>
                        );
                      if (tok.type === "italic")
                        return (
                          <em key={j} className="italic text-white/90">
                            {tok.content}
                          </em>
                        );
                      if (tok.type === "link")
                        return (
                          <a
                            key={j}
                            href={tok.url}
                            {...linkAttrs(tok.url)}
                            className={LINK_CLASS}
                          >
                            {tok.content}
                          </a>
                        );
                      return <span key={j}>{tok.content}</span>;
                    })}
                  </span>
                </div>
              );
            case "ol":
              return (
                <div
                  key={i}
                  className="flex items-baseline gap-2"
                  style={{ marginLeft: `${el.indent * 16}px` }}
                >
                  <span className="text-white/60 flex-shrink-0 select-none">
                    {el.order}.
                  </span>
                  <span>
                    {parseInline(el.content).map((tok, j) => {
                      if (tok.type === "bold")
                        return (
                          <strong
                            key={j}
                            className="font-semibold text-white/95"
                          >
                            {tok.content}
                          </strong>
                        );
                      if (tok.type === "italic")
                        return (
                          <em key={j} className="italic text-white/90">
                            {tok.content}
                          </em>
                        );
                      if (tok.type === "link")
                        return (
                          <a
                            key={j}
                            href={tok.url}
                            {...linkAttrs(tok.url)}
                            className={LINK_CLASS}
                          >
                            {tok.content}
                          </a>
                        );
                      return <span key={j}>{tok.content}</span>;
                    })}
                  </span>
                </div>
              );
            case "bold":
              return (
                <strong key={i} className="font-semibold text-white/95">
                  {el.content}
                </strong>
              );
            case "italic":
              return (
                <em key={i} className="italic text-white/90">
                  {el.content}
                </em>
              );
            case "link":
              return (
                <a
                  key={i}
                  href={el.url}
                  {...linkAttrs(el.url)}
                  className={LINK_CLASS}
                >
                  {el.content}
                </a>
              );
            default: {
              const inline = el as InlineEl; // safe: remaining inline variant
              return <span key={i}>{inline.content}</span>;
            }
          }
        })}
        {!isComplete && (
          <span className="inline-block ml-1 animate-pulse">|</span>
        )}
      </div>
    );
  }

  const charIndexRef = { current: 0 };

  return (
    <div className={className}>
      {elements.map((el, i) => {
        switch (el.type) {
          case "break":
            return <br key={i} />;
          case "ul": {
            const inline = parseInline(el.content);
            const startDelayIndex = charIndexRef.current; // bullet appears at start index
            return (
              <div
                key={i}
                className="flex items-baseline gap-2"
                style={{ marginLeft: `${el.indent * 16}px` }}
              >
                <motion.span
                  variants={word}
                  initial="hidden"
                  animate="show"
                  transition={{
                    delay: startDelayIndex * 0.02,
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="text-white/60 flex-shrink-0 select-none"
                >
                  •
                </motion.span>
                <span>
                  <RenderInlineTokens
                    tokens={inline}
                    charIndexRef={charIndexRef}
                    baseKey={`ul-${i}`}
                  />
                </span>
              </div>
            );
          }
          case "ol": {
            const inline = parseInline(el.content);
            const startDelayIndex = charIndexRef.current;
            return (
              <div
                key={i}
                className="flex items-baseline gap-2"
                style={{ marginLeft: `${el.indent * 16}px` }}
              >
                <motion.span
                  variants={word}
                  initial="hidden"
                  animate="show"
                  transition={{
                    delay: startDelayIndex * 0.02,
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="text-white/60 flex-shrink-0 select-none"
                >
                  {el.order}.
                </motion.span>
                <span>
                  <RenderInlineTokens
                    tokens={inline}
                    charIndexRef={charIndexRef}
                    baseKey={`ol-${i}`}
                  />
                </span>
              </div>
            );
          }
          case "bold":
            return (
              <strong key={i} className="font-semibold text-white/95">
                <AnimatedInline
                  content={el.content}
                  charIndexRef={charIndexRef}
                  variantKey={`bold-${i}`}
                />
              </strong>
            );
          case "italic":
            return (
              <em key={i} className="italic text-white/90">
                <AnimatedInline
                  content={el.content}
                  charIndexRef={charIndexRef}
                  variantKey={`italic-${i}`}
                />
              </em>
            );
          case "link":
            return (
              <a
                key={i}
                href={el.url}
                {...linkAttrs(el.url)}
                className={LINK_CLASS}
              >
                <AnimatedInline
                  content={el.content}
                  charIndexRef={charIndexRef}
                  variantKey={`link-${i}`}
                />
              </a>
            );
          case "text":
            return (
              <span key={i}>
                <AnimatedInline
                  content={el.content}
                  charIndexRef={charIndexRef}
                  variantKey={`text-${i}`}
                />
              </span>
            );
          default:
            return null;
        }
      })}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="inline-block ml-1"
        >
          |
        </motion.span>
      )}
    </div>
  );
};
