"use client";

import { useRouteTransitionStore } from "@/lib/routeTransitionStore";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { cancelWhoPrompt, submitWhoPrompt } from "@/lib/who/actions";
import { readStreamableValue } from "@ai-sdk/rsc";
import { RotateCcw, Square } from "lucide-react";
import type { Transition } from "motion/react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { item, word, wordLine } from "../Hello/variants";
import { AnimatedText } from "./AnimatedText";
import { ThinkingDots } from "./ThinkingDots";
import {
  selectActiveRequestId,
  selectHasConversation,
  selectMessages,
  useConversationState,
} from "./stores/conversationState";

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
  const storeMessages = useConversationState(selectMessages);
  const activeRequestId = useConversationState(selectActiveRequestId);
  const hasConversation = useConversationState(selectHasConversation);
  const addUserMessage = useConversationState((s) => s.addUserMessage);
  const startAssistantMessage = useConversationState(
    (s) => s.startAssistantMessage
  );
  const appendAssistantDelta = useConversationState(
    (s) => s.appendAssistantDelta
  );
  const finalizeAssistant = useConversationState((s) => s.finalizeAssistant);
  const setActiveRequest = useConversationState((s) => s.setActiveRequest);
  const setLastUserPrompt = useConversationState((s) => s.setLastUserPrompt);
  const cancelStreamingInStore = useConversationState((s) => s.cancelStreaming);
  const purgeIfExpired = useConversationState((s) => s.purgeIfExpired);
  const lastUserPrompt = useConversationState((s) => s.lastUserPrompt);
  const resetConversation = useConversationState((s) => s.reset);
  const messages = storeMessages;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Scroll / indicator state
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [segment, setSegment] = useState({ left: 0, width: 100 });
  const [isScrolling, setIsScrolling] = useState(false);
  const inactivityTimerRef = useRef<number | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const initialInputRef = useRef<HTMLInputElement | null>(null);
  const stickyInputRef = useRef<HTMLInputElement | null>(null);
  const [buttonPad, setButtonPad] = useState(92); // dynamic right padding based on button width
  const [hasScrolled, setHasScrolled] = useState(false);

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
    purgeIfExpired();
  }, [purgeIfExpired]);

  // Dynamically adjust input right padding so text never overlaps button (works for Send/Stop width changes)
  useEffect(() => {
    const compute = () => {
      const btn = buttonRef.current;
      if (!btn) return; // keep previous value
      const width = btn.offsetWidth; // includes padding
      // Add a small gap (12px) so caret never touches button
      setButtonPad(width + 12);
    };
    compute();
    // Observe button size changes (label changes between Send/Stop, responsive styles)
    const btn = buttonRef.current;
    let ro: ResizeObserver | null = null;
    if (btn && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => compute());
      ro.observe(btn);
    }
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("resize", compute);
      if (ro) ro.disconnect();
    };
  }, [activeRequestId, pending, hasConversation]);

  const activeStreamIdsRef = useRef<Set<unknown>>(new Set());

  const onSubmit = useCallback(
    (e?: React.FormEvent | null) => {
      if (e) e.preventDefault();
      if (!input.trim() || activeRequestId) return; // prevent new while active
      const prompt = input.trim();
      setError(null);

      addUserMessage(prompt);
      setLastUserPrompt(prompt);
      setInput("");

      startTransition(async () => {
        try {
          const conversationHistory = messages
            .filter((m) => !m.isStreaming)
            .map((m) => ({ role: m.role, content: m.content }));

          const { output, requestId } = await submitWhoPrompt({
            prompt,
            messages: conversationHistory,
          });
          setActiveRequest(requestId || null);

          if (activeStreamIdsRef.current.has(output)) return;
          activeStreamIdsRef.current.add(output);

          const assistantIndex = startAssistantMessage();

          for await (const delta of readStreamableValue(output)) {
            const piece = (delta as string) || "";
            if (!piece) continue;
            appendAssistantDelta(assistantIndex, piece);
          }

          finalizeAssistant(assistantIndex);
          activeStreamIdsRef.current.delete(output);
          setActiveRequest(null);
        } catch {
          setError("Something went wrong. Please retry.");
          setActiveRequest(null);
        }
      });
    },
    [
      input,
      messages,
      startTransition,
      addUserMessage,
      appendAssistantDelta,
      finalizeAssistant,
      setActiveRequest,
      setLastUserPrompt,
      activeRequestId,
      startAssistantMessage,
    ]
  );

  const cancelActive = useCallback(async () => {
    if (!activeRequestId) return;
    try {
      await cancelWhoPrompt(activeRequestId);
    } catch {}
    cancelStreamingInStore();
    setActiveRequest(null);
    if (lastUserPrompt) setInput(lastUserPrompt);
  }, [
    activeRequestId,
    cancelStreamingInStore,
    lastUserPrompt,
    setActiveRequest,
  ]);

  const restartConversation = useCallback(async () => {
    // If something is streaming, cancel it first
    if (activeRequestId) {
      try {
        await cancelWhoPrompt(activeRequestId);
      } catch {}
    }
    resetConversation();
    setActiveRequest(null);
    setInput("");
    // Focus initial input after next paint (it will remount)
    requestAnimationFrame(() => {
      initialInputRef.current?.focus({ preventScroll: true });
    });
  }, [activeRequestId, resetConversation, setActiveRequest]);

  useEffect(() => {
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
      setHasScrolled(scrollTop > 8);
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const currentInput = hasConversation
        ? stickyInputRef.current
        : initialInputRef.current;
      if (!currentInput) return;
      const active = document.activeElement as HTMLElement | null;
      if (active && (active === currentInput || active.isContentEditable))
        return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.isComposing) return;
      if (e.key === "Tab" || e.key === "Escape") return;
      if (e.key.length === 1 && !e.repeat) {
        e.preventDefault();
        currentInput.focus({ preventScroll: true });
        setInput((prev) => prev + e.key);
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        currentInput.focus({ preventScroll: true });
        setInput((prev) => prev.slice(0, -1));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        currentInput.focus({ preventScroll: true });
        if (input.trim()) onSubmit();
      }
    };
    window.addEventListener("keydown", handler, { capture: true });
    return () =>
      window.removeEventListener("keydown", handler, { capture: true });
  }, [input, onSubmit, hasConversation]);

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
                      ref={initialInputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about skills, fit, previous collaborations, approach..."
                      className={`who-prompt w-full pl-5 truncate rounded-full bg-white/5 border border-white/15 focus:border-white/35 outline-none text-white/90 placeholder:text-white/35 text-[16px] md:text-base backdrop-blur-sm transition-[padding,background,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] shadow-[0_0_0_0_rgba(255,255,255,0)] focus:shadow-[0_0_0_1px_rgba(255,255,255,0.4)] py-5 ${
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
                      type={activeRequestId ? "button" : "submit"}
                      onClick={activeRequestId ? cancelActive : undefined}
                      disabled={
                        pending && !activeRequestId ? !input.trim() : false
                      }
                      className="absolute cursor-pointer right-1.5 top-1/2 -translate-y-1/2 px-5 h-14 rounded-full text-sm md:text-[15px] font-medium bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white transition-colors duration-300 flex items-center gap-1"
                    >
                      {activeRequestId ? (
                        <>
                          <Square className="w-4 h-4" />
                          Stop
                        </>
                      ) : pending ? (
                        "…"
                      ) : (
                        "Send"
                      )}
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
              className="pointer-events-none absolute top-0 left-0 right-0 max-w-3xl px-10 z-20 mx-auto"
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
            className={`w-full max-w-3xl mx-auto h-full px-10 overflow-y-auto scrollbar-hide transition-[padding] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${
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
                  {m.role === "assistant" ? (
                    m.content.trim() === "" && m.isStreaming ? (
                      <ThinkingDots />
                    ) : (
                      <AnimatedText
                        text={m.content}
                        isComplete={!m.isStreaming}
                      />
                    )
                  ) : (
                    <span className="chat-user-content">{m.content}</span>
                  )}
                </motion.div>
              ))}
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
              {/* Restart button */}
              <button
                type="button"
                onClick={restartConversation}
                aria-label="Restart conversation"
                className="absolute left-1.5 top-1/2 cursor-pointer -translate-y-1/2 h-10 w-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors duration-300 disabled:opacity-40 z-10"
                disabled={pending && !!activeRequestId}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <input
                ref={stickyInputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a follow-up..."
                className={`who-prompt w-full pl-14 truncate rounded-full bg-white/5 border border-white/15 focus:border-white/35 outline-none text-white/90 placeholder:text-white/35 text-[16px] md:text-base backdrop-blur-sm transition-[padding,background,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] shadow-[0_0_0_0_rgba(255,255,255,0)] focus:shadow-[0_0_0_1px_rgba(255,255,255,0.4)] py-3 ${
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
                type={activeRequestId ? "button" : "submit"}
                onClick={activeRequestId ? cancelActive : undefined}
                disabled={pending && !activeRequestId ? !input.trim() : false}
                className="absolute cursor-pointer right-1.5 top-1/2 -translate-y-1/2 px-5 h-10 rounded-full text-sm md:text-[15px] font-medium bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white transition-colors duration-300 flex items-center gap-1"
              >
                {activeRequestId ? (
                  <>
                    <Square className="w-4 h-4" /> Stop
                  </>
                ) : pending ? (
                  "…"
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </LayoutGroup>
  );
};
