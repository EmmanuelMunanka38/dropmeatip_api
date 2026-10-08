import { emailLayout, escapeHtml } from "./shared.js";

export interface DonationReceivedTemplateData {
  creatorName: string;
  supporterName: string;
  amountTzs: number;
  message?: string;
}

export const donationReceivedTemplate = (
  data: DonationReceivedTemplateData,
): string => {
  const formattedAmount = data.amountTzs.toLocaleString("en-US");
  const message = data.message
    ? `
    <p style="margin:24px 0 0;padding:16px;background-color:#f9fafb;border-left:4px solid #2563eb;font-size:15px;line-height:1.6;color:#374151;">
      "${escapeHtml(data.message)}"
    </p>`
    : "";

  const body = `
    <h1 style="margin:0 0 16px;font-size:24px;color:#111827;">You received a tip!</h1>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#374151;">
      <strong>${escapeHtml(data.supporterName)}</strong> just sent you a tip.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
      <tr>
        <td style="padding:12px 20px;background-color:#2563eb;border-radius:8px;">
          <span style="color:#ffffff;font-size:28px;font-weight:bold;">TZS ${escapeHtml(formattedAmount)}</span>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:14px;color:#71717a;">
      The amount has been credited to your wallet after platform fees.
    </p>
    ${message}`;

  return emailLayout("You received a tip", body);
};
