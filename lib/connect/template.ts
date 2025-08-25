export function createHtmlEmail({
  fullName,
  email,
  phone,
  message,
  referer,
  attachConversation,
  conversation,
}: {
  fullName: string;
  email: string;
  phone?: string;
  message: string;
  referer?: string;
  attachConversation?: boolean;
  conversation?: {
    role: "user" | "assistant";
    content: string;
    createdAt?: number;
  }[];
}) {
  const safe = (s: string) =>
    s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const convHtml =
    attachConversation && conversation && conversation.length
      ? `
      <tr>
        <td style="padding:22px 28px; border-top:1px solid #f1f5f9">
          <h2 style="margin:0 0 8px;font-size:14px;color:#0f172a">AI Conversation</h2>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 8px">
            ${conversation
              .map((m) => {
                const who = m.role === "user" ? "You" : "Assistant";
                const bg = m.role === "user" ? "#f8fafc" : "#f3f4f6";
                return `<tr><td style="padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;background:${bg}"><strong style="display:inline-block;min-width:80px">${who}:</strong> ${safe(
                  m.content
                )}</td></tr>`;
              })
              .join("")}
          </table>
        </td>
      </tr>
    `
      : "";

  return `
  <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;color:#0a0a0a;background:#f6f7f9;padding:24px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:white;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb">
      <tr>
        <td style="padding:24px 28px;border-bottom:1px solid #f1f5f9;background:linear-gradient(180deg,#000000,#0000ff);color:white">
          <h1 style="margin:0;font-size:18px;letter-spacing:.3px">New Portfolio Message</h1>
          <p style="margin:8px 0 0;color:#cbd5e1;font-size:12px">From ${safe(
            fullName
          )}${phone ? " | " + safe(phone) : ""}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:22px 28px">
          <h2 style="margin:0 0 8px;font-size:14px;color:#0f172a">Message</h2>
          <p style="white-space:pre-wrap;line-height:1.6;margin:0;color:#1f2937">${safe(
            message
          )}</p>
          ${
            referer
              ? `<p style="margin-top:16px;color:#6b7280;font-size:12px">Submitted from: ${safe(
                  referer
                )}</p>`
              : ""
          }
        </td>
      </tr>
      <tr>
        <td style="padding:16px 28px;border-top:1px solid #f1f5f9;color:#6b7280;font-size:12px">
          <p style="margin:0">Reply to: <a href="mailto:${safe(
            email
          )}" style="color:#111827">${safe(email)}</a></p>
        </td>
      </tr>
      ${convHtml}
    </table>
  </div>
  `;
}
