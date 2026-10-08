import { emailLayout, escapeHtml } from "./shared.js";

export interface OtpTemplateData {
  fullName: string;
  code: string;
  expiresInMinutes: number;
}

export const otpTemplate = (data: OtpTemplateData): string => {
  const body = `
    <h1 style="margin:0 0 16px;font-size:24px;color:#111827;">Your verification code</h1>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#374151;">
      Hi ${escapeHtml(data.fullName)}, use the code below to verify your email
      and sign in to your account.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
      <tr>
        <td style="padding:16px 32px;background-color:#f9fafb;border:1px dashed #cbd5e1;border-radius:8px;">
          <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#2563eb;">${escapeHtml(data.code)}</span>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#71717a;">
      This code expires in <strong>${escapeHtml(String(data.expiresInMinutes))} minutes</strong>.
      If you did not request this code, you can safely ignore this email.
    </p>`;

  return emailLayout("Your verification code", body);
};
