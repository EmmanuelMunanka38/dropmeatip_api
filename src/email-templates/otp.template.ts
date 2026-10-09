import { BRAND, emailLayout, escapeHtml } from "./shared.js";

export interface OtpTemplateData {
  fullName: string;
  code: string;
  expiresInMinutes: number;
}

export const otpTemplate = (data: OtpTemplateData): string => {
  const body = `
    <h1 style="font-size:24px;font-weight:700;color:${BRAND.dark};margin:0 0 12px;line-height:1.2;letter-spacing:-0.02em;">Your verification code</h1>
    <p style="font-size:16px;line-height:24px;color:${BRAND.text};margin:0 0 28px;">
      Hi ${escapeHtml(data.fullName)}, use the code below to verify your email and sign in to your account.
    </p>
    <div style="background-color:${BRAND.bgSoft};padding:24px 28px;border-left:4px solid ${BRAND.dark};border-radius:8px;margin:0 0 28px;">
      <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${BRAND.muted};margin-bottom:10px;">Verification Code</div>
      <div style="font-size:38px;font-weight:700;color:${BRAND.dark};letter-spacing:8px;line-height:1;">${escapeHtml(data.code)}</div>
    </div>
    <p style="font-size:14px;line-height:22px;color:${BRAND.muted};margin:0;">
      This code expires in <strong style="color:${BRAND.dark};">${escapeHtml(String(data.expiresInMinutes))} minutes</strong>. For your security, never share this code with anyone. If you did not request this code, you can safely ignore this email.
    </p>`;

  return emailLayout("Your verification code", body);
};
