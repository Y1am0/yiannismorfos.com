"use client";

import type { Transition } from "motion/react";
import { motion } from "motion/react";
import { AnimatedText } from "./AnimatedText";
import { ThinkingDots } from "./ThinkingDots";

const bubbleSpring: Transition = {
  type: "spring",
  stiffness: 140,
  damping: 20,
  mass: 0.9,
};

interface Message {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

interface WhoMessagesProps {
  messages: Message[];
  prefersReduced: boolean;
  isExiting: boolean;
  error: string | null;
  endRef: React.RefObject<HTMLDivElement | null>;
}

export const WhoMessages = ({
  messages,
  prefersReduced,
  isExiting,
  error,
  endRef,
}: WhoMessagesProps) => {
  return (
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
              <AnimatedText text={m.content} isComplete={!m.isStreaming} />
            )
          ) : (
            <span className="chat-user-content">{m.content}</span>
          )}
        </motion.div>
      ))}
      {error && <p className="text-red-300 text-sm md:text-base">{error}</p>}
      <div ref={endRef} />
    </div>
  );
};

export default WhoMessages;
