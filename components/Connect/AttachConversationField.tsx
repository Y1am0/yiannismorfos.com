"use client";

import { motion } from "motion/react";
import { useState } from "react";
import type { AttachConversationFieldProps } from "./types";

export default function AttachConversationField({
  attachConversation,
  onAttachChange,
  conversation,
}: AttachConversationFieldProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className="border border-white/10 bg-white/5 p-4 transition-colors">
      <div className="flex items-center justify-between gap-6">
        <label
          htmlFor="attach-conv"
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <span className="relative inline-flex items-center justify-center">
            <input
              id="attach-conv"
              type="checkbox"
              checked={attachConversation}
              onChange={(e) => onAttachChange(e.target.checked)}
              className="peer cursor-pointer appearance-none h-5 w-5 rounded-full border border-white/20 bg-white/8 ring-1 ring-inset ring-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 checked:bg-white checked:border-white/60 checked:ring-white/30"
            />
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute h-3.5 w-3.5 text-black opacity-0 transition-opacity peer-checked:opacity-100"
              aria-hidden
            >
              <path
                d="M20 6L9 17l-5-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-sm text-white/80">
            Conversation with AI Assistant detected. Attach to message?
          </span>
        </label>

        <button
          type="button"
          onClick={() => setPreviewOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-white/85 hover:border-white/30 hover:bg-white/12 transition-colors cursor-pointer"
        >
          {previewOpen ? "Hide" : "Preview"}
        </button>
      </div>

      <motion.div
        initial={false}
        animate={{
          height: previewOpen ? "auto" : 0,
          opacity: previewOpen ? 1 : 0,
        }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <div className="mt-4 rounded-lg border border-white/10 bg-white/4 p-3 md:p-4">
          <ul className="space-y-3">
            {conversation.map((m, idx) => (
              <li key={`conv-inline-${idx}`} className="flex">
                <div
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "border-white/15 bg-white/8 text-white/90"
                      : "border-white/10 bg-white/6 text-white/80"
                  }`}
                >
                  <div className="mb-1 text-[11px] uppercase tracking-wide text-white/45">
                    {m.role === "user" ? "You" : "Assistant"}
                  </div>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
