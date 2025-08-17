import type { StateCreator } from "zustand";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  createdAt: number; // epoch ms
}

interface ConversationState {
  messages: ConversationMessage[];
  activeRequestId: string | null;
  lastUserPrompt: string | null;
  startedAt: number | null; // timestamp of first message

  // Actions
  addUserMessage: (content: string) => void;
  startAssistantMessage: () => number; // returns index
  appendAssistantDelta: (index: number, delta: string) => void;
  finalizeAssistant: (index: number) => void;
  setActiveRequest: (id: string | null) => void;
  setLastUserPrompt: (p: string | null) => void;
  cancelStreaming: () => void; // remove streaming assistant and preceding user
  reset: () => void;
  purgeIfExpired: () => void;
}

const EXPIRY_MS = 12 * 60 * 60 * 1000; // 12 hours

const baseStore: StateCreator<
  ConversationState,
  [["zustand/devtools", never], ["zustand/persist", unknown]],
  [],
  ConversationState
> = (set, get) => ({
  messages: [],
  activeRequestId: null,
  lastUserPrompt: null,
  startedAt: null,

  addUserMessage: (content) =>
    set(
      (s: ConversationState) => ({
        messages: [
          ...s.messages,
          { role: "user", content, createdAt: Date.now() },
        ],
        startedAt: s.startedAt || Date.now(),
      }),
      false,
      "addUserMessage"
    ),

  startAssistantMessage: () => {
    let index = -1;
    set(
      (s: ConversationState) => {
        index = s.messages.length;
        return {
          messages: [
            ...s.messages,
            {
              role: "assistant",
              content: "",
              isStreaming: true,
              createdAt: Date.now(),
            },
          ],
        } as Partial<ConversationState>;
      },
      false,
      "startAssistantMessage"
    );
    return index;
  },

  appendAssistantDelta: (index, delta) =>
    set(
      (s: ConversationState) => {
        const msgs = [...s.messages];
        const msg = msgs[index];
        if (msg && msg.role === "assistant" && msg.isStreaming && delta) {
          if (delta.startsWith(msg.content)) {
            msg.content = delta; // cumulative
          } else if (!msg.content.startsWith(delta)) {
            msg.content += delta; // delta
          }
        }
        return { messages: msgs };
      },
      false,
      "appendAssistantDelta"
    ),

  finalizeAssistant: (index) =>
    set(
      (s: ConversationState) => {
        const msgs = [...s.messages];
        const msg = msgs[index];
        if (msg && msg.role === "assistant") msg.isStreaming = false;
        return { messages: msgs };
      },
      false,
      "finalizeAssistant"
    ),

  setActiveRequest: (id) =>
    set({ activeRequestId: id }, false, "setActiveRequest"),
  setLastUserPrompt: (p) =>
    set({ lastUserPrompt: p }, false, "setLastUserPrompt"),

  cancelStreaming: () =>
    set(
      (s: ConversationState) => {
        const msgs = [...s.messages];
        if (!msgs.length) return {};
        const last = msgs[msgs.length - 1];
        if (last.role === "assistant" && last.isStreaming) {
          msgs.pop();
          if (msgs.length) {
            const maybeUser = msgs[msgs.length - 1];
            if (
              maybeUser.role === "user" &&
              s.lastUserPrompt &&
              maybeUser.content === s.lastUserPrompt
            ) {
              msgs.pop();
            }
          }
        } else if (last.role === "user") {
          if (s.lastUserPrompt && last.content === s.lastUserPrompt) {
            msgs.pop();
          }
        }
        return { messages: msgs, activeRequestId: null };
      },
      false,
      "cancelStreaming"
    ),

  reset: () =>
    set(
      {
        messages: [],
        activeRequestId: null,
        lastUserPrompt: null,
        startedAt: null,
      },
      false,
      "reset"
    ),

  purgeIfExpired: () => {
    const s = get();
    if (s.startedAt && Date.now() - s.startedAt > EXPIRY_MS) {
      set(
        {
          messages: [],
          activeRequestId: null,
          lastUserPrompt: null,
          startedAt: null,
        },
        false,
        "purgeExpired"
      );
    }
  },
});

export const useConversationState = create<ConversationState>()(
  devtools(
    persist(baseStore, {
      name: "who-conversation-v1",
      version: 1,
      partialize: (s) => ({
        messages: s.messages.filter((m) => !m.isStreaming),
        startedAt: s.startedAt,
      }),
      migrate: (state) => state as ConversationState,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.messages = state.messages.map((m) =>
            m.isStreaming ? { ...m, isStreaming: false } : m
          );
          state.purgeIfExpired();
        }
      },
    })
  )
);

// Selectors
export const selectMessages = (s: ConversationState) => s.messages;
export const selectActiveRequestId = (s: ConversationState) =>
  s.activeRequestId;
export const selectHasConversation = (s: ConversationState) =>
  s.messages.length > 0;
