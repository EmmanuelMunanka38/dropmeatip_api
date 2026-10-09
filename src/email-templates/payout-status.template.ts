import { BRAND, emailLayout, escapeHtml, formatTzs } from "./shared.js";

export interface PayoutStatusTemplateData {
  creatorName: string;
  amountTzs: number;
  phone: string;
  status: string;
}

const statusColor = (status: string): string => {
  const s = status.toLowerCase();
  if (["completed", "successful", "paid", "success", "sent"].includes(s)) {
    return "#16a34a";
  }
  if (["failed", "cancelled", "rejected", "reversed"].includes(s)) {
    return "#dc2626";
  }
  if (["pending", "processing", "initiated"].includes(s)) {
    return "#d97706";
  }
  return BRAND.dark;
};

export const payoutStatusTemplate = (
  data: PayoutStatusTemplateData,
): string => {
  const color = statusColor(data.status);

  const body = `
    <h1 style="font-size:24px;font-weight:700;color:${BRAND.dark};margin:0 0 12px;line-height:1.2;letter-spacing:-0.02em;">Payout ${escapeHtml(data.status)}</h1>
    <p style="font-size:16px;line-height:24px;color:${BRAND.text};margin:0 0 28px;">
      Hi ${escapeHtml(data.creatorName)}, here is the status of your withdrawal request.
    </p>
    <div style="background-color:${BRAND.bgSoft};border-left:4px solid ${color};padding:20px 24px;border-radius:8px;margin:0 0 28px;">
      <p style="margin:0 0 8px;font-size:14px;color:${BRAND.muted};"><strong style="color:${BRAND.dark};">Amount:</strong> ${escapeHtml(formatTzs(data.amountTzs))}</p>
      <p style="margin:0 0 8px;font-size:14px;color:${BRAND.muted};"><strong style="color:${BRAND.dark};">Mobile Money Number:</strong> ${escapeHtml(data.phone)}</p>
      <p style="margin:0;font-size:14px;color:${BRAND.muted};"><strong style="color:${BRAND.dark};">Status:</strong> <span style="color:${color};font-weight:600;">${escapeHtml(data.status)}</span></p>
    </div>
    <p style="font-size:14px;line-height:22px;color:${BRAND.muted};margin:0;">
      Funds are typically received within a few minutes, depending on your mobile network. You can review your full payout history from the Payouts tab in your dashboard.
    </p>`;

  return emailLayout("Payout status update", body);
};
