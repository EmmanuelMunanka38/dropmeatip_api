import { BRAND, emailLayout, escapeHtml, formatTzs } from "./shared.js";

export interface DonationReceivedTemplateData {
  creatorName: string;
  supporterName: string;
  amountTzs: number;
  message?: string;
}

export const donationReceivedTemplate = (
  data: DonationReceivedTemplateData,
): string => {
  const message = data.message
    ? `
    <div style="background-color:${BRAND.bgSoft};padding:18px 22px;border-left:4px solid ${BRAND.dark};border-radius:8px;margin:0 0 28px;">
      <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${BRAND.muted};margin-bottom:8px;">Message from supporter</div>
      <p style="margin:0;font-size:15px;line-height:24px;color:${BRAND.text};">"${escapeHtml(data.message)}"</p>
    </div>`
    : "";

  const body = `
    <h1 style="font-size:24px;font-weight:700;color:${BRAND.dark};margin:0 0 12px;line-height:1.2;letter-spacing:-0.02em;">You received a tip!</h1>
    <p style="font-size:16px;line-height:24px;color:${BRAND.text};margin:0 0 28px;">
      <strong style="color:${BRAND.dark};">${escapeHtml(data.supporterName)}</strong> just sent you a tip.
    </p>
    <div style="background-color:${BRAND.dark};padding:24px 28px;border-radius:12px;margin:0 0 28px;">
      <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#e5e5e5;margin-bottom:8px;">Tip Amount</div>
      <div style="font-size:32px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;line-height:1;">${escapeHtml(formatTzs(data.amountTzs))}</div>
    </div>
    ${message}
    <p style="font-size:14px;line-height:22px;color:${BRAND.muted};margin:0;">
      The amount has been credited to your wallet after platform fees. You can track it and cash out anytime from your dashboard.
    </p>`;

  return emailLayout("You received a tip", body);
};
