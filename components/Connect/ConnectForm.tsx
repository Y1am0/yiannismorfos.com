"use client";

import { motion } from "motion/react";
import AttachConversationField from "./AttachConversationField";
import FormField from "./FormField";
import type { ConversationMessage } from "./types";

interface ConnectFormProps {
  values: { fullName: string; email: string; phone: string; message: string };
  errorPlaceholder: Partial<Record<keyof ConnectFormProps["values"], boolean>>;
  fieldErrors: Partial<Record<keyof ConnectFormProps["values"], string[]>>;
  hasConversation: boolean;
  conversation: ConversationMessage[];
  attachConversation: boolean;
  isPending: boolean;
  onChange: (key: keyof ConnectFormProps["values"], value: string) => void;
  onAttachChange: (checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  formError?: string | null;
}

export default function ConnectForm({
  values,
  errorPlaceholder,
  fieldErrors,
  hasConversation,
  conversation,
  attachConversation,
  isPending,
  onChange,
  onAttachChange,
  onSubmit,
  formError,
}: ConnectFormProps) {
  return (
    <motion.form
      onSubmit={onSubmit}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.08, delayChildren: 0.12 },
        },
      }}
      className="mt-10 space-y-6"
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 8 },
          show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
          },
        }}
      >
        <FormField
          label="Full Name"
          required
          value={values.fullName}
          onChange={(v) => onChange("fullName", v)}
          placeholder={
            errorPlaceholder.fullName
              ? fieldErrors.fullName?.[0] || ""
              : "Ada Lovelace"
          }
          errorActive={!!errorPlaceholder.fullName}
          disabled={isPending}
        />
      </motion.div>

      <motion.div
        variants={{
          hidden: { opacity: 0, y: 8 },
          show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
          },
        }}
      >
        <FormField
          label="Email"
          required
          type="email"
          value={values.email}
          onChange={(v) => onChange("email", v)}
          placeholder={
            errorPlaceholder.email
              ? fieldErrors.email?.[0] || ""
              : "ada@example.com"
          }
          errorActive={!!errorPlaceholder.email}
          disabled={isPending}
        />
      </motion.div>

      <motion.div
        variants={{
          hidden: { opacity: 0, y: 8 },
          show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
          },
        }}
      >
        <FormField
          label="Phone"
          type="tel"
          value={values.phone}
          onChange={(v) => onChange("phone", v)}
          placeholder={
            errorPlaceholder.phone
              ? fieldErrors.phone?.[0] || ""
              : "+1 415 555 0132"
          }
          errorActive={!!errorPlaceholder.phone}
          disabled={isPending}
        />
      </motion.div>

      <motion.div
        variants={{
          hidden: { opacity: 0, y: 8 },
          show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
          },
        }}
      >
        <FormField
          label="Message"
          required
          textarea
          rows={6}
          value={values.message}
          onChange={(v) => onChange("message", v)}
          placeholder={
            errorPlaceholder.message
              ? fieldErrors.message?.[0] || ""
              : "What are we building together?"
          }
          errorActive={!!errorPlaceholder.message}
          disabled={isPending}
        />
      </motion.div>

      {hasConversation && (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          <AttachConversationField
            attachConversation={attachConversation}
            onAttachChange={onAttachChange}
            conversation={conversation}
          />
        </motion.div>
      )}

      <motion.div
        variants={{
          hidden: { opacity: 0, y: 8 },
          show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
          },
        }}
        className="pt-2"
      >
        <button
          type="submit"
          disabled={isPending}
          className="w-full inline-flex cursor-pointer items-center justify-center px-5 py-3 rounded-full border border-white/20 bg-white/8 backdrop-blur-sm text-white/90 hover:text-white hover:border-white/40 hover:bg-white/12 transition-all duration-300 disabled:opacity-60"
        >
          {isPending ? "Sending..." : "Send Message"}
        </button>
      </motion.div>

      {formError && (
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { duration: 0.3 } },
          }}
          className="text-sm text-red-300/90"
        >
          {formError}
        </motion.div>
      )}
    </motion.form>
  );
}
