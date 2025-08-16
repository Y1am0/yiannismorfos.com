"use server";

// Placeholder server action; integrate Vercel AI SDK when added
// We keep system prompt here (authoritative); frontend has a duplicate for clarity only.

const SYSTEM_PROMPT = `You are the AI assistant for Yiannis Morfos (Yiannis). Purpose: help visitors understand his capabilities and assess fit for their project.
Boundaries:
- Only discuss Yiannis' skills: TypeScript, React, Next.js, Motion (Framer Motion/Motion One), Three.js, Node, Go, Python, SQL, creative tooling (Figma, Illustrator, Premiere, After Effects) and his philosophy: meraki (craft, polish, endurance), animation & interaction engineering, content/education reach (~100k audience).
- Decline and redirect unrelated topics (general trivia, politics, personal private life, unrelated math). Gently refocus.
- Encourage concise, specific project scoping questions (goals, timeline, stack, performance or interaction priorities).
Style: concise, professional, warm, not hypey. Avoid overclaiming.`;

interface SubmitWhoPromptArgs {
  prompt: string;
}

export async function submitWhoPrompt({
  prompt,
}: SubmitWhoPromptArgs): Promise<string> {
  // Using SYSTEM_PROMPT implicitly as authoritative context (logged in dev only)
  if (process.env.NODE_ENV === "development") {
    console.log(
      "[WhoAI] System prompt active (truncated):",
      SYSTEM_PROMPT.slice(0, 120) + "..."
    );
  }
  // TODO: Replace with Vercel AI SDK call once dependency added.
  // For now echo a guarded mock response.
  const lower = prompt.toLowerCase();
  const offTopicKeywords = [
    "weather",
    "politics",
    "president",
    "capital",
    "trivia",
    "biology",
    "math",
  ];
  if (offTopicKeywords.some((k) => lower.includes(k))) {
    return "I can help you assess how Yiannis might contribute to your project—feel free to ask about his experience, stack choices, animation & interaction capabilities, or collaboration fit.";
  }
  return `Mock: (Real model coming) Based on your question, Yiannis can likely help if it involves modern web engineering, advanced animation, or product polish. Please share project goals, timeline, and tech stack for a more tailored perspective.`;
}
