import { z } from "zod";

export const connectSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  phone: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() === "" ? undefined : v?.trim()))
    .refine((v) => (v == null ? true : /^[+()\-.\s\d]+$/.test(v)), {
      message: "Only digits, spaces, +, -, (, ), and . are allowed",
    })
    .refine(
      (v) =>
        v == null
          ? true
          : (() => {
              const digits = v.replace(/\D/g, "");
              return digits.length >= 7 && digits.length <= 15;
            })(),
      { message: "Enter a valid phone number" }
    ),
  attachConversation: z.boolean().optional(),
  conversation: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
        createdAt: z.number().optional(),
      })
    )
    .optional(),
});

export type ConnectFormValues = z.infer<typeof connectSchema>;
