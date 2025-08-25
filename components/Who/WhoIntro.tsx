"use client";

import { Square } from "lucide-react";
import { motion } from "motion/react";
import { item, word, wordLine } from "../Hello/variants";
import { QuestionBadges } from "./QuestionBadges";

interface WhoIntroProps {
  isExiting: boolean;
  input: string;
  onInputChange: (v: string) => void;
  onSubmit: (e?: React.FormEvent | null) => void;
  pending: boolean;
  activeRequestId: string | null;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  initialInputRef: React.RefObject<HTMLInputElement | null>;
  buttonPad: number;
  onQuestionClick: (q: string) => void;
  cancelActive: () => void;
}

export const WhoIntro = ({
  isExiting,
  input,
  onInputChange,
  onSubmit,
  pending,
  activeRequestId,
  buttonRef,
  initialInputRef,
  buttonPad,
  onQuestionClick,
  cancelActive,
}: WhoIntroProps) => {
  return (
    <motion.div
      key="who-intro"
      className="h-full w-full flex items-center justify-center pointer-events-none overflow-x-hidden"
      initial={{ opacity: 0, filter: "blur(18px)" }}
      animate={
        isExiting
          ? { opacity: 0, filter: "blur(10px)" }
          : { opacity: 1, filter: "blur(0px)" }
      }
      exit={{
        opacity: 0,
        filter: "blur(14px)",
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      <div className="w-full max-w-3xl mx-auto sm:px-6 pointer-events-none">
        <motion.h1
          variants={wordLine}
          initial="hidden"
          animate={isExiting ? "exit" : "show"}
          className="font-semibold tracking-tight text-4xl md:text-5xl lg:text-6xl text-white/95 leading-[0.95] text-center"
        >
          {(() => {
            const title = "You've heard enough";
            const wordsArr = title.split(" ");
            return (
              <span className="inline-flex select-none flex-wrap justify-center gap-x-[0.5ch] align-top">
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
          initial="hidden"
          animate={isExiting ? "exit" : "show"}
          className="mt-5 text-white/60 max-w-xl mx-auto md:text-lg leading-relaxed text-center"
        >
          about Yiannis Morfos, but <span className="text-white/90">who</span>{" "}
          exactly can I be in{" "}
          <span className="text-white/90">your next big idea?</span>
        </motion.p>

        <motion.form
          onSubmit={onSubmit}
          layout
          layoutId="who-prompt"
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 18,
            mass: 0.9,
          }}
          key="prompt-initial"
          animate={
            isExiting
              ? { scale: 1, filter: "blur(10px)", opacity: 0 }
              : { scale: 1.04, filter: "blur(0px)", opacity: 1 }
          }
          exit={{ opacity: 0, scale: 1, filter: "blur(10px)" }}
          className="mt-14 w-full max-w-3xl px-3 sm:px-6 mx-auto pointer-events-auto"
        >
          <div className="w-full relative">
            <input
              ref={initialInputRef}
              name="input"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
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
              className="absolute cursor-pointer right-1.5 top-1/2 -translate-y-1/2 px-5 h-14 rounded-full text-sm md:text-[15px] font-medium bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white transition-colors duration-300 flex items-center gap-1"
              disabled={pending && !activeRequestId ? !input.trim() : false}
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

        {/* Question suggestions - positioned below input with high z-index */}
        <div className="w-full max-w-3xl px-3 sm:px-6 mx-auto pointer-events-auto relative z-30">
          <QuestionBadges
            variants={item}
            className="mt-3"
            onQuestionClick={(q) => onQuestionClick(q)}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default WhoIntro;
