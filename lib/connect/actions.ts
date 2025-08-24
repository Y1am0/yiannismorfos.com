"use server";

import { headers } from "next/headers";
import nodemailer from "nodemailer";
import { checkWhoRateLimit } from "../who/rateLimit";
import { connectSchema, type ConnectFormValues } from "./schema";
import { createHtmlEmail } from "./template";

export async function submitConnectForm(values: ConnectFormValues) {
  const parsed = connectSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false as const,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const rate = await checkWhoRateLimit();
  if (!rate.allowed) {
    return {
      ok: false as const,
      formError:
        rate.reason === "burst"
          ? "Too many requests. Please wait a moment."
          : "Rate limit exceeded. Please try again later.",
      retryAfter: rate.retryAfter,
    };
  }

  const fromUser = process.env.GMAIL_USER;
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  if (!fromUser || !appPassword) {
    console.error("Missing Gmail credentials in environment.");
    return {
      ok: false as const,
      formError:
        "Email service is not configured. Please try again later or reach me on social.",
    };
  }

  try {
    const hdrs = await headers();
    const referer = hdrs.get("referer") || "";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: fromUser,
        pass: appPassword,
      },
    });

    const html = createHtmlEmail({ ...parsed.data, referer });

    await transporter.sendMail({
      from: {
        name: `${parsed.data.fullName}`,
        address: "connect@yiannismorfos.com",
      },
      replyTo: { name: parsed.data.fullName, address: parsed.data.email },
      to: "connect@yiannismorfos.com",
      subject: `New message from ${parsed.data.fullName}`,
      html,
    });

    return { ok: true as const };
  } catch (error) {
    console.error("submitConnectForm error", error);
    return {
      ok: false as const,
      formError: "Something went wrong sending your message. Please try again.",
    };
  }
}
