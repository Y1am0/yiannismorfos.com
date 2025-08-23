"use client";

import type { ConversationMessage } from "@/components/Connect/types";
import { useEffect, useState } from "react";

export function usePersistedConversation() {
  const [hasConversation, setHasConversation] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem("who-conversation-v1");
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      const msgs = parsed?.state?.messages as ConversationMessage[] | undefined;
      return Array.isArray(msgs) && msgs.length > 0;
    } catch {
      return false;
    }
  });

  const [conversation, setConversation] = useState<ConversationMessage[]>(
    () => {
      if (typeof window === "undefined") return [];
      try {
        const raw = localStorage.getItem("who-conversation-v1");
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        const msgs = parsed?.state?.messages as
          | ConversationMessage[]
          | undefined;
        return Array.isArray(msgs) ? msgs : [];
      } catch {
        return [];
      }
    }
  );

  // Optional: keep a light effect in case something updates storage after mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("who-conversation-v1");
      if (!raw) {
        setHasConversation(false);
        setConversation([]);
        return;
      }
      const parsed = JSON.parse(raw);
      const msgs = parsed?.state?.messages as ConversationMessage[] | undefined;
      if (Array.isArray(msgs) && msgs.length > 0) {
        setConversation(msgs);
        setHasConversation(true);
      } else {
        setHasConversation(false);
        setConversation([]);
      }
    } catch {}
  }, []);

  return { hasConversation, conversation } as const;
}

export default usePersistedConversation;
