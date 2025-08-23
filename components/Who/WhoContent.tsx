"use client";

import { ScrollablePageContainer } from "@/components/ScrollablePageContainer";
import { useRouteTransitionStore } from "@/lib/routeTransitionStore";
import { cancelWhoPrompt, submitWhoPrompt } from "@/lib/who/actions";
import { readStreamableValue } from "@ai-sdk/rsc";
import { AnimatePresence, LayoutGroup } from "motion/react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { WhoInput } from "./WhoInput";
import { WhoIntro } from "./WhoIntro";
import { WhoMessages } from "./WhoMessages";
import {
  selectActiveRequestId,
  selectHasConversation,
  selectMessages,
  useConversationState,
} from "./stores/conversationState";

// Animation config is now encapsulated within subcomponents

export const WhoContent = () => {
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
  const [introExited, setIntroExited] = useState(false);
  const [everHadIntro, setEverHadIntro] = useState(false);

  // Scroll handled by ScrollablePageContainer
  // const scrollRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const initialInputRef = useRef<HTMLInputElement | null>(null);
  const stickyInputRef = useRef<HTMLInputElement | null>(null);
  const [buttonPad, setButtonPad] = useState(92); // dynamic right padding based on button width
  // const [hasScrolled, setHasScrolled] = useState(false);

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

  // Reset intro exit flag when conversation ends (e.g., restart)
  useEffect(() => {
    if (!hasConversation) setIntroExited(false);
  }, [hasConversation]);

  // Track if intro was ever shown in this mount (so we can distinguish persisted-return vs fresh intro)
  useEffect(() => {
    if (!hasConversation) setEverHadIntro(true);
  }, [hasConversation]);

  // If we arrive with a persisted conversation (no intro shown), allow chat to render immediately
  useEffect(() => {
    if (hasConversation && !everHadIntro) setIntroExited(true);
  }, [hasConversation, everHadIntro]);

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

  const sendPrompt = useCallback(
    (promptRaw: string) => {
      const prompt = promptRaw.trim();
      if (!prompt || activeRequestId) return;
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
      activeRequestId,
      addUserMessage,
      appendAssistantDelta,
      finalizeAssistant,
      messages,
      setActiveRequest,
      setLastUserPrompt,
      startAssistantMessage,
      startTransition,
    ]
  );

  const onSubmit = useCallback(
    (e?: React.FormEvent | null) => {
      if (e) e.preventDefault();
      sendPrompt(input);
    },
    [input, sendPrompt]
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

  // Removed custom scroll indicator logic; use ScrollablePageContainer props for masks/indicator

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
      <div className="h-full flex flex-col">
        <div className="w-full max-w-3xl mx-auto h-full flex flex-col items-stretch relative overflow-visible">
          <AnimatePresence onExitComplete={() => setIntroExited(true)}>
            {!hasConversation && (
              <WhoIntro
                isExiting={isExiting}
                input={input}
                onInputChange={setInput}
                onSubmit={onSubmit}
                pending={pending}
                activeRequestId={activeRequestId}
                buttonRef={buttonRef}
                initialInputRef={initialInputRef}
                buttonPad={buttonPad}
                onQuestionClick={sendPrompt}
                cancelActive={cancelActive}
              />
            )}
          </AnimatePresence>

          {/* Chat area in normal flow (no fixed). Split into messages (grow) + input (stick bottom) */}
          {hasConversation && introExited && (
            <ScrollablePageContainer
              showScrollIndicator={true}
              verticalFade={true}
              deferTopFadeUntilScrolled={true}
              fadeSize="10%"
              centerWhenNotScrollable={false}
              addTopPadding={true}
              className="flex-1 min-h-0"
            >
              <div className="w-full max-w-3xl mx-auto h-full flex-1 min-h-0">
                <WhoMessages
                  messages={messages}
                  prefersReduced={false}
                  isExiting={isExiting}
                  error={error}
                  endRef={endRef}
                />
              </div>
            </ScrollablePageContainer>
          )}

          {hasConversation && (
            <WhoInput
              prefersReduced={false}
              isExiting={isExiting}
              onSubmit={onSubmit}
              restartConversation={restartConversation}
              pending={pending}
              activeRequestId={activeRequestId}
              stickyInputRef={stickyInputRef}
              input={input}
              setInput={setInput}
              buttonPad={buttonPad}
              cancelActive={cancelActive}
              buttonRef={buttonRef}
            />
          )}
        </div>
      </div>
    </LayoutGroup>
  );
};
