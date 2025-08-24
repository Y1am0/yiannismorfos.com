"use client";

import { submitConnectForm } from "@/lib/connect/actions";
import { connectSchema } from "@/lib/connect/schema";
import { usePersistedConversation } from "@/lib/connect/usePersistedConversation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useTransition } from "react";
import { ScrollablePageContainer } from "../ScrollablePageContainer";
import ConnectForm from "./ConnectForm";
import ConnectHeader from "./ConnectHeader";
import ConnectSuccessView from "./ConnectSuccessView";
import DevTriggerSuccess from "./DevTriggerSuccess";

export default function ConnectContent() {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errorPlaceholder, setErrorPlaceholder] = useState<{
    fullName?: boolean;
    email?: boolean;
    phone?: boolean;
    message?: boolean;
  }>({});
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string[];
    email?: string[];
    phone?: string[];
    message?: string[];
  }>({});
  const { hasConversation, conversation } = usePersistedConversation();
  const [attachConversation, setAttachConversation] = useState(false);

  useEffect(() => {
    if (!success) return;
    // play sent sound
    try {
      const audio = new Audio("/sounds/sent.mp3");
      audio.volume = 0.7;
      audio.play().catch(() => {});
    } catch {}
    // switch to success variant for a few seconds
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    try {
      window.__meshGradientOverride?.set?.("success");
      timeoutId = setTimeout(() => {
        window.__meshGradientOverride?.set?.(null);
      }, 3600);
    } catch {}
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      // ensure we always revert if success ends early
      try {
        window.__meshGradientOverride?.set?.(null);
      } catch {}
    };
  }, [success]);

  function update<K extends keyof typeof values>(key: K, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }));
    if (errorPlaceholder[key]) {
      setErrorPlaceholder((prev) => ({ ...prev, [key]: false }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = connectSchema.safeParse({
      ...values,
      attachConversation,
      conversation: attachConversation ? conversation : undefined,
    });
    if (!parsed.success) {
      const errs = parsed.error.flatten().fieldErrors;
      setFieldErrors(errs);
      setValues((prev) => ({
        fullName: errs.fullName ? "" : prev.fullName,
        email: errs.email ? "" : prev.email,
        phone: errs.phone ? "" : prev.phone,
        message: errs.message ? "" : prev.message,
      }));
      setErrorPlaceholder({
        fullName: !!errs.fullName,
        email: !!errs.email,
        phone: !!errs.phone,
        message: !!errs.message,
      });
      return;
    }

    startTransition(async () => {
      const res = await submitConnectForm(parsed.data);
      if (!res.ok) {
        if (res.formError) setFormError(res.formError);
        if ("fieldErrors" in res && res.fieldErrors) {
          const errs = res.fieldErrors as typeof fieldErrors;
          setFieldErrors(errs);
          setValues((prev) => ({
            fullName: errs.fullName ? "" : prev.fullName,
            email: errs.email ? "" : prev.email,
            phone: errs.phone ? "" : prev.phone,
            message: errs.message ? "" : prev.message,
          }));
          setErrorPlaceholder({
            fullName: !!errs.fullName,
            email: !!errs.email,
            phone: !!errs.phone,
            message: !!errs.message,
          });
        }
        return;
      }
      setSuccess(true);
      setValues({ fullName: "", email: "", phone: "", message: "" });
      setAttachConversation(false);
    });
  }

  return (
    <ScrollablePageContainer>
      <div className="w-full max-w-2xl mx-auto pt-10 pb-16 relative">
        <DevTriggerSuccess
          onTrigger={() => setSuccess(true)}
          className="absolute top-2 right-2 z-50"
        />

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="form-group"
              initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <ConnectHeader />
              <ConnectForm
                values={values}
                errorPlaceholder={errorPlaceholder}
                fieldErrors={fieldErrors}
                hasConversation={hasConversation}
                conversation={conversation}
                attachConversation={attachConversation}
                isPending={isPending}
                onChange={update}
                onAttachChange={setAttachConversation}
                onSubmit={handleSubmit}
                formError={formError}
              />
            </motion.div>
          ) : (
            <ConnectSuccessView
              key="success-group"
              onReset={() => {
                setValues({ fullName: "", email: "", phone: "", message: "" });
                setAttachConversation(false);
                setErrorPlaceholder({});
                setFieldErrors({});
                setFormError(null);
                setSuccess(false);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </ScrollablePageContainer>
  );
}
