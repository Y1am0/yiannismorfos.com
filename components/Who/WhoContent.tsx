"use client";

import { useRouteTransitionStore } from "@/lib/routeTransitionStore";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { submitWhoPrompt } from "@/lib/who/actions";
import type { Transition } from "motion/react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useEffect, useRef, useState, useTransition } from "react";
import { item, word, wordLine } from "../Hello/variants";

// Animation config (typed so literal union for type is preserved)
const layoutSpring: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 18,
  mass: 0.9,
};
const bubbleSpring: Transition = {
  type: "spring",
  stiffness: 140,
  damping: 20,
  mass: 0.9,
};

export const WhoContent = () => {
  const prefersReduced = usePrefersReducedMotion();
  const isExiting = useRouteTransitionStore((s) => s.isExiting);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const hasConversation = messages.length > 0;

  // Custom scroll indicator state (mirrors ScrollablePageContainer)
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [segment, setSegment] = useState({ left: 0, width: 100 });
  const [isScrolling, setIsScrolling] = useState(false);
  const inactivityTimerRef = useRef<number | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [buttonPad, setButtonPad] = useState(92); // default reserve space

  // Auto-scroll to latest message whenever a new one is added
  useEffect(() => {
    if (!hasConversation) return;
    // Defer until after DOM & potential layout animations start
    const id = requestAnimationFrame(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
    return () => cancelAnimationFrame(id);
  }, [messages.length, hasConversation]);

  useEffect(() => {
    if (!hasConversation) return; // only after first message
    const el = scrollRef.current;
    if (!el) return;
    let frame: number | null = null;

    const hideLater = () => {
      if (inactivityTimerRef.current)
        window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = window.setTimeout(
        () => setIsScrolling(false),
        650
      );
    };

    const update = () => {
      frame = null;
      const { scrollHeight, clientHeight, scrollTop } = el;
      const canScroll = scrollHeight > clientHeight + 1;
      setHasScrolled(scrollTop > 8);
      if (!canScroll) {
        setSegment({ left: 0, width: 100 });
        setIsScrolling(false);
        setHasScrolled(false);
        return;
      }
      const visibleRatio = clientHeight / scrollHeight;
      const topRatio = scrollTop / (scrollHeight - clientHeight);
      setSegment({
        left: topRatio * (100 - visibleRatio * 100),
        width: visibleRatio * 100,
      });
    };

    const onScroll = () => {
      if (!isScrolling) setIsScrolling(true);
      hideLater();
      if (frame != null) return;
      frame = window.requestAnimationFrame(update);
    };
    const onResize = () => {
      if (frame != null) return;
      frame = window.requestAnimationFrame(update);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    update();
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame != null) cancelAnimationFrame(frame);
      if (inactivityTimerRef.current)
        window.clearTimeout(inactivityTimerRef.current);
    };
  }, [hasConversation, isScrolling]);

  useEffect(() => {
    if (hasConversation) {
      window.__meshGradientOverride?.set("ai");
    } else {
      window.__meshGradientOverride?.set(null);
    }
  }, [hasConversation]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || pending) return;
    const prompt = input.trim();
    setError(null);
    // Optimistically add user message
    setMessages((m) => [...m, { role: "user", content: prompt }]);
    setInput("");
    startTransition(async () => {
      try {
        const res = await submitWhoPrompt({ prompt });
        setMessages((m) => [...m, { role: "assistant", content: res }]);
      } catch {
        setError("Something went wrong. Please retry.");
      }
    });
  };

  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const update = () => {
      // button width + gap (16px) to ensure placeholder never reaches button edge
      setButtonPad(btn.offsetWidth + 20);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [pending]);

  return (
    <LayoutGroup>
      <div className="w-full max-w-3xl mx-auto flex flex-col items-stretch px-8 relative overflow-visible">
        <AnimatePresence>
          {!hasConversation && (
            <motion.div
              key="who-intro"
              className="fixed inset-0 flex items-center justify-center pointer-events-none z-20 px-4"
              initial={
                prefersReduced ? false : { opacity: 0, filter: "blur(18px)" }
              }
              animate={
                prefersReduced
                  ? false
                  : isExiting
                  ? { opacity: 0, filter: "blur(10px)" }
                  : { opacity: 1, filter: "blur(0px)" }
              }
              exit={
                prefersReduced
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      filter: "blur(14px)",
                      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                    }
              }
            >
              <div className="w-full max-w-3xl mx-auto pointer-events-none">
                <motion.h1
                  variants={wordLine}
                  initial={prefersReduced ? false : "hidden"}
                  animate={prefersReduced ? false : isExiting ? "exit" : "show"}
                  className="font-semibold tracking-tight text-4xl md:text-5xl lg:text-6xl text-white/95 leading-[0.95] text-center"
                >
                  {(() => {
                    const title = "You've heard enough";
                    const wordsArr = title.split(" ");
                    return (
                      <span className="inline-flex flex-wrap justify-center gap-x-[0.5ch] align-top">
                        {wordsArr.map((w, wi) => (
                          <span key={`who-word-${wi}`} className="inline-block">
                            {w.split("").map((ch, i, arr) => (
                              <motion.span
                                key={`who-letter-${wi}-${i}-${ch}`}
                                variants={word}
                                className={`${
                                  i < arr.length - 1 ? "mr-[0.04ch]" : ""
                                } inline-block`}
                              >
                                {ch}
                              </motion.span>
                            ))}
                          </span>
                        ))}
                      </span>
                    );
                  })()}
                </motion.h1>
                <motion.p
                  variants={item}
                  initial={prefersReduced ? false : "hidden"}
                  animate={prefersReduced ? false : isExiting ? "exit" : "show"}
                  className="mt-5 text-white/60 max-w-xl mx-auto md:text-lg leading-relaxed text-center"
                >
                  about Yiannis Morfos, but{" "}
                  <span className="text-white/90">who</span> exaclty can I be
                  for <span className="text-white/90">your next big idea?</span>
                </motion.p>
                <motion.form
                  onSubmit={onSubmit}
                  layout
                  layoutId="who-prompt"
                  transition={layoutSpring}
                  key="prompt-initial"
                  animate={
                    prefersReduced
                      ? undefined
                      : isExiting
                      ? { scale: 1, filter: "blur(10px)", opacity: 0 }
                      : { scale: 1.04, filter: "blur(0px)", opacity: 1 }
                  }
                  exit={
                    prefersReduced
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 1, filter: "blur(10px)" }
                  }
                  className="mt-14 w-full max-w-3xl px-6 mx-auto pointer-events-auto"
                >
                  <div className="w-full relative">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about skills, fit, previous collaborations, approach..."
                      className={`w-full pl-5 truncate rounded-full bg-white/5 border border-white/15 focus:border-white/35 outline-none text-white/90 placeholder:text-white/35 text-sm md:text-base backdrop-blur-sm transition-[padding,background,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] shadow-[0_0_0_0_rgba(255,255,255,0)] focus:shadow-[0_0_0_1px_rgba(255,255,255,0.4)] py-5 ${
                        pending ? "animate-pulse" : ""
                      }`}
                      style={{ paddingRight: buttonPad }}
                      disabled={pending || isExiting}
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                    <button
                      ref={buttonRef}
                      type="submit"
                      disabled={pending || !input.trim()}
                      className="absolute cursor-pointer right-1.5 top-1/2 -translate-y-1/2 px-5 h-14 rounded-full text-sm md:text-[15px] font-medium bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white transition-colors duration-300"
                    >
                      {pending ? "…" : "Send"}
                    </button>
                  </div>
                </motion.form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages layer fixed to viewport so it doesn't depend on parent height */}
        {/* We center inner column to match prompt width; reserve space at bottom when conversation started */}
        <div
          className={`fixed inset-x-0 top-28 ${
            hasConversation
              ? "z-10 pointer-events-auto"
              : "z-0 pointer-events-none"
          }`}
          style={{ bottom: hasConversation ? "calc(148px + 90px)" : "0px" }}
        >
          {/* Scroll indicator */}
          {hasConversation && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 right-0 max-w-3xl z-20 mx-auto"
              initial={false}
              animate={{ opacity: isScrolling ? 1 : 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="relative w-full h-px">
                <div className="absolute inset-0 bg-white/40" />
                <motion.div
                  className="absolute top-0 h-px bg-white"
                  style={{
                    left: `${segment.left}%`,
                    width: `${segment.width}%`,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 34,
                    mass: 0.4,
                  }}
                />
              </div>
            </motion.div>
          )}
          <div
            ref={scrollRef}
            className={`w-full max-w-3xl mx-auto h-full px-8 overflow-y-auto scrollbar-hide transition-[padding] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${
              hasConversation ? "pt-6" : "pt-[160px]"
            }`}
            style={
              hasConversation
                ? {
                    WebkitMaskImage: hasScrolled
                      ? "linear-gradient(to bottom, rgba(0,0,0,0) 0%, #000 10%, #000 90%, rgba(0,0,0,0) 100%)"
                      : "linear-gradient(to bottom, #000 10%, #000 90%, rgba(0,0,0,0) 100%)",
                    maskImage: hasScrolled
                      ? "linear-gradient(to bottom, rgba(0,0,0,0) 0%, #000 10%, #000 90%, rgba(0,0,0,0) 100%)"
                      : "linear-gradient(to bottom, #000 10%, #000 90%, rgba(0,0,0,0) 100%)",
                  }
                : undefined
            }
          >
            <div className="flex flex-col gap-4 w-full pb-4">
              {messages.map((m, i) => (
                <motion.div
                  key={`msg-${i}-${m.role}`}
                  initial={
                    prefersReduced
                      ? false
                      : { opacity: 0, y: 24, scale: 0.98, filter: "blur(8px)" }
                  }
                  animate={
                    prefersReduced
                      ? false
                      : isExiting
                      ? {
                          opacity: 0,
                          y: 0,
                          scale: 1,
                          filter: "blur(8px)",
                          transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
                        }
                      : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
                  }
                  transition={{
                    ...bubbleSpring,
                    delay: prefersReduced ? 0 : i * 0.045,
                  }}
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm md:text-base leading-relaxed backdrop-blur-sm border whitespace-pre-wrap will-change-transform ${
                    m.role === "user"
                      ? "self-end bg-white/15 border-white/25 text-white/90"
                      : "self-start bg-white/5 border-white/15 text-white/80"
                  }`}
                >
                  {m.content}
                </motion.div>
              ))}
              {pending && (
                <motion.div
                  key="pending"
                  initial={
                    prefersReduced ? false : { opacity: 0, y: 10, scale: 0.97 }
                  }
                  animate={
                    prefersReduced
                      ? false
                      : isExiting
                      ? {
                          opacity: 0,
                          y: 0,
                          scale: 1,
                          transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
                        }
                      : { opacity: 1, y: 0, scale: 1 }
                  }
                  transition={bubbleSpring}
                  className="self-start max-w-[60%] rounded-2xl px-4 py-3 text-sm md:text-base leading-relaxed backdrop-blur-sm border bg-white/5 border-white/15 text-white/55"
                >
                  Thinking…
                </motion.div>
              )}
              {error && (
                <p className="text-red-300 text-sm md:text-base">{error}</p>
              )}
              <div ref={endRef} />
            </div>
          </div>
        </div>

        {hasConversation && (
          <motion.form
            onSubmit={onSubmit}
            layout
            layoutId="who-prompt"
            transition={layoutSpring}
            animate={
              prefersReduced
                ? undefined
                : isExiting
                ? {
                    scale: 1,
                    filter: "blur(10px)",
                    opacity: 0,
                    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
                  }
                : { scale: 1, filter: "blur(0px)", opacity: 1 }
            }
            className="fixed left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 bottom-[168px]"
          >
            <div className="w-full relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a follow-up..."
                className={`w-full pl-5 truncate rounded-full bg-white/5 border border-white/15 focus:border-white/35 outline-none text-white/90 placeholder:text-white/35 text-sm md:text-base backdrop-blur-sm transition-[padding,background,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] shadow-[0_0_0_0_rgba(255,255,255,0)] focus:shadow-[0_0_0_1px_rgba(255,255,255,0.4)] py-3 ${
                  pending ? "animate-pulse" : ""
                }`}
                style={{ paddingRight: buttonPad }}
                disabled={pending || isExiting}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <button
                ref={buttonRef}
                type="submit"
                disabled={pending || !input.trim()}
                className="absolute cursor-pointer right-1.5 top-1/2 -translate-y-1/2 px-5 h-10 rounded-full text-sm md:text-[15px] font-medium bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white transition-colors duration-300"
              >
                {pending ? "…" : "Send"}
              </button>
            </div>
          </motion.form>
        )}

        <style jsx global>{`
          .scrollbar-hide {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            width: 0 !important;
            height: 0 !important;
            display: none !important;
          }
        `}</style>
      </div>
    </LayoutGroup>
  );
};
