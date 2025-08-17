"use server";

import { openai } from "@ai-sdk/openai";
import { createStreamableValue } from "@ai-sdk/rsc";
import { ModelMessage, streamText } from "ai";
import { checkWhoRateLimit } from "./rateLimit";

const SYSTEM_PROMPT = `You are AI Yiannis, the personal AI assistant for Yiannis Morfos. You advocate for him (never impersonate him) using a tone that is warm, professional, confident, and genuinely enthusiastic about collaborating.

Primary Objective:
In every answer, help the visitor feel that Yiannis is a strong, trustworthy fit, and (when intent is shown) smoothly guide them toward initiating contact for next steps.

Audience Identification & Adaptation:
First, infer who you are speaking with from their wording. Calibrate emphasis accordingly:
- Potential Clients ("project", "website", "app", "build"): Emphasize polished product execution, full‑stack engineering depth, and refined interaction/animation craft.
- Brands / Sponsors ("partnership", "sponsor", "content", "collab"): Highlight his authentic reach (~100k tech audience) and ability to produce high‑quality educational / technical content that aligns with brand positioning.
- Recruiters ("role", "opportunity", "experience", "background"): Focus on breadth of real project delivery, reliability, and relevant technical stack.
If the user’s intent is broad (e.g. "tell me about him" / "what can you do"), ask a brief clarifying question before diving into detail. Once clarified, answer directly and succinctly.

Core Knowledge Base:
Skills: TypeScript, React, Next.js, Motion, Three.js, Node, Go, Python, SQL, plus design & creative tooling (Figma, Illustrator, Premiere, After Effects).
Philosophy: He brings deep care, craftsmanship, and attention to detail—translating ideas into polished, high‑impact interactive experiences. (Only use the word "meraki" itself if the user specifically asks about philosophy, culture, or what drives his approach; otherwise describe it in plain English.)
Project Experience: Delivered work across Hotels, Agriculture, E‑commerce, and emerging AI Education products.
Content & Brand Collaborations: Has produced educational / launch / awareness content with Plaisio, Kotsovolos, Samsung, Panik Entertainment Group, NordVPN, Nothing, Kingston and others. Mention at most 2–3 brand names that best align with the user’s context (do not list the entire set unless explicitly asked for all collaborators).
Personal: Based in Athens, Greece. Interests include computers, fitness, occasional gaming, music, and travel.

Rules of Engagement:
1. Clarify Before Listing: When asked something broad ("what can you do", "tell me about his work"), respond with a concise clarifying question offering 2–3 focus paths (e.g. project collaboration, brand/content partnership, or professional experience) unless the user already made the context explicit.
2. Be Concise & Structured: Use short paragraphs and markdown (unordered / ordered lists, *italic*, **bold**) only when it improves scannability.
3. Explain the Why Briefly: When referencing a technology, you may add a short purpose / benefit if it adds relevance.
4. Language: Always answer in English, even if the user writes in another language (acknowledge their input but reply in English).
5. Contact Call‑to‑Action: When the user shows intent to reach out (mentions contacting, availability, pricing, next steps, hiring, rates, how to reach), include exactly one sentence that contains the phrase "contact page" immediately followed by the FULL raw URL (${process.env.BASE_URL}/connect) in the SAME sentence (e.g. "You can reach him through his contact page ${process.env.BASE_URL}/connect.").
   - Do NOT wrap the URL in markdown.
   - Do NOT add a second line or repeat the URL.
   - Do NOT say "here" yourself; the frontend will transform that raw URL into a visual link.
   - Include it only once per response.
6. Tone: Confident, friendly, helpful. Never over‑promise or sound salesy.
7. Use of "meraki": At most once, only if the user inquires about ethos / philosophy / cultural background. Otherwise rely on plain descriptors (craft, care, polish, intentional detail).

Strict Boundaries — Do NOT:
- Provide cost or timeline estimates (instead: invite them to discuss specifics directly).
- Comment on technologies outside his stated stack.
- Compare Yiannis to other individuals.
- Drift into politics or unrelated sensitive topics.
- Entertain harmful, inappropriate, or irrelevant requests; instead redirect to professional areas.

Redirection Example (if off‑topic): "I can’t address that, but I can outline how he approaches interactive web animation if that’s useful."

Execution Priorities:
1. Detect intent category or ask a clarifier.
2. Provide tailored, concise value.
3. Surface differentiators (polish, animation/interaction engineering, reliability) without hype.
4. Insert contact sentence when intent to engage is explicit.
5. Keep responses lean—avoid repeating the same philosophical term.

Respond now following these constraints.`;

interface SubmitWhoPromptArgs {
  prompt: string;
  messages?: { role: "user" | "assistant"; content: string }[];
}

// Active request registry for cancellation
const activeWhoRequests = new Map<string, { abort: () => void }>();

export async function submitWhoPrompt({
  prompt,
  messages = [],
}: SubmitWhoPromptArgs) {
  // Rate limit check (server side only)
  const rl = await checkWhoRateLimit();
  if (!rl.allowed) {
    const stream = createStreamableValue("");
    const requestId = crypto.randomUUID();
    (async () => {
      let msg = "";
      if (rl.reason === "daily") {
        msg =
          "Daily limit reached. Feel free to use the contact page " +
          (process.env.BASE_URL || "") +
          "/connect for anything important.";
      } else if (rl.reason === "window") {
        msg = `Too many messages in a short window. Try again in ~${
          rl.retryAfter ?? 30
        }s.`;
      } else if (rl.reason === "burst") {
        msg = `You’re sending messages too quickly—wait ~${
          rl.retryAfter ?? 5
        }s.`;
      } else {
        msg = "Rate limit hit. Please try again shortly.";
      }
      stream.update(msg);
      stream.done();
    })();
    return { output: stream.value, requestId };
  }
  // Convert conversation history to ModelMessage format
  const conversationHistory: ModelMessage[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // Add the new user message
  const allMessages: ModelMessage[] = [
    ...conversationHistory,
    { role: "user", content: prompt },
  ];

  if (process.env.NODE_ENV === "development") {
    console.log(
      "[WhoAI] System prompt active (truncated):",
      SYSTEM_PROMPT.slice(0, 120) + "..."
    );
    console.log("[WhoAI] Conversation history length:", messages.length);
  }

  // Create a streamable value
  const stream = createStreamableValue("");
  const requestId = crypto.randomUUID();

  // Start the streaming process
  (async () => {
    const isDev = process.env.NODE_ENV === "development";
    if (isDev) {
      let aborted = false;
      const abort = () => {
        aborted = true;
      };
      activeWhoRequests.set(requestId, { abort });
      try {
        // Simulate model thinking delay (3s) while supporting early cancellation
        for (let i = 0; i < 30; i++) {
          if (aborted) break;
          // 30 * 100ms = 3000ms
          await new Promise((r) => setTimeout(r, 100));
        }
        if (aborted) {
          stream.done();
          return;
        }
        const base = process.env.BASE_URL || "http://localhost:3000";
        const wantsContact =
          /contact|reach|available|availability|hire|pricing|price|rates|next steps|connect/i.test(
            prompt
          );
        let mock = "(dev mode) ";
        if (/project|website|app|build|stack/i.test(prompt)) {
          mock +=
            "Yiannis pairs strong full‑stack TypeScript & Next.js engineering with animation craft for polished, high‑impact product interfaces.";
        } else if (/sponsor|brand|partnership|collab|content/i.test(prompt)) {
          mock +=
            "He also produces refined educational tech content with authentic reach, helpful for brand positioning.";
        } else if (/role|experience|resume|cv|background/i.test(prompt)) {
          mock +=
            "His track record spans hotels, agriculture, e‑commerce and emerging AI education initiatives—always guided by meraki (care & craft).";
        } else if (
          /who|what can you do|what do you do|skills|stack/i.test(prompt)
        ) {
          mock +=
            "Happy to focus—are you evaluating him for a project, a brand collaboration, or a professional role?";
        } else {
          mock +=
            "Ask about projects, collaborations, or experience and I’ll tailor specifics (no API tokens consumed right now).";
        }
        if (wantsContact) {
          mock += ` You can reach him through his contact page ${base}/connect.`;
        }
        for (const token of mock.split(/(\s+)/)) {
          if (aborted) break;
          if (!token) continue;
          stream.update(token);
          await new Promise((r) => setTimeout(r, 14));
        }
        stream.done();
      } catch (err) {
        if (!aborted) {
          console.error("[WhoAI][DEV MOCK] Error:", err);
          stream.error(err);
        }
      } finally {
        activeWhoRequests.delete(requestId);
      }
      return;
    }

    const controller = new AbortController();
    let aborted = false;
    const abort = () => {
      aborted = true;
      controller.abort();
    };
    activeWhoRequests.set(requestId, { abort });

    try {
      const { textStream } = streamText({
        model: openai("gpt-5-nano"),
        system: SYSTEM_PROMPT,
        messages: allMessages,
        temperature: 0.7,
        abortSignal: controller.signal,
      });

      for await (const delta of textStream) {
        if (aborted) break;
        stream.update(delta);
      }
      stream.done();
    } catch (error: unknown) {
      if (aborted) {
        // Silently finish on abort
        try {
          stream.done();
        } catch {}
      } else {
        console.error("[WhoAI] Error:", error);
        stream.error(error);
      }
    } finally {
      activeWhoRequests.delete(requestId);
    }
  })();

  return { output: stream.value, requestId };
}

export async function cancelWhoPrompt(requestId: string) {
  const entry = activeWhoRequests.get(requestId);
  if (entry) {
    entry.abort();
    activeWhoRequests.delete(requestId);
    return { canceled: true };
  }
  return { canceled: false };
}
