"use client";

import { RotateCcw, Square } from "lucide-react";
import { motion } from "motion/react";

interface WhoInputProps {
  prefersReduced: boolean;
  isExiting: boolean;
  onSubmit: (e?: React.FormEvent | null) => void;
  restartConversation: () => void;
  pending: boolean;
  activeRequestId: string | null;
  stickyInputRef: React.RefObject<HTMLInputElement | null>;
  input: string;
  setInput: (v: string) => void;
  buttonPad: number;
  cancelActive: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export const WhoInput = ({
  prefersReduced,
  isExiting,
  onSubmit,
  restartConversation,
  pending,
  activeRequestId,
  stickyInputRef,
  input,
  setInput,
  buttonPad,
  cancelActive,
  buttonRef,
}: WhoInputProps) => {
  return (
    <motion.form
      onSubmit={onSubmit}
      layout
      layoutId="who-prompt"
      transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.9 }}
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
      className="w-full max-w-3xl mx-auto pt-3 pb-4"
      style={{ marginTop: "auto" }}
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
  );
};

export default WhoInput;
