import { emailLayout, escapeHtml } from "./shared.js";

export interface PayoutStatusTemplateData {
  creatorName: string;
  amountTzs: number;
  phone: string;
  status: string;
}

export const payoutStatusTemplate = (
  data: PayoutStatusTemplateData,
): string => {
  const formattedAmount = data.amountTzs.toLocaleString("en-US");

  const body = `
    <h1 style="margin:0 0 16px;font-size:24px;color:#111827;">Payout ${escapeHtml(data.status)}</h1>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#374151;">
      Hi ${escapeHtml(data.creatorName)}, here is the status of your withdrawal request.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
      <tr>
        <td style="padding:12px 16px;border:1px solid #e4e4e7;border-radius:8px;">
          <p style="margin:0 0 8px;font-size:14px;color:#71717a;">Amount</p>
          <p style="margin:0;font-size:18px;font-weight:bold;color:#111827;">TZS ${escapeHtml(formattedAmount)}</p>
        </td>
      </tr>
      <tr><td style="height:12px;"></td></tr>
      <tr>
        <td style="padding:12px 16px;border:1px solid #e4e4e7;border-radius:8px;">
          <p style="margin:0 0 8px;font-size:14px;color:#71717a;">Mobile Money Number</p>
          <p style="margin:0;font-size:18px;font-weight:bold;color:#111827;">${escapeHtml(data.phone)}</p>
        </td>
      </tr>
      <tr><td style="height:12px;"></td></tr>
      <tr>
        <td style="padding:12px 16px;border:1px solid #e4e4e7;border-radius:8px;">
          <p style="margin:0 0 8px;font-size:14px;color:#71717a;">Status</p>
          <p style="margin:0;font-size:18px;font-weight:bold;color:#2563eb;">${escapeHtml(data.status)}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:14px;color:#71717a;">
      Funds are typically received within a few minutes, depending on your mobile network.
    </p>`;

  return emailLayout("Payout status update", body);
};
