import { env } from "../config/env.js";

export const BRAND = {
  dark: "#000000",
  text: "#333333",
  muted: "#666666",
  light: "#999999",
  border: "#e5e5e5",
  borderSoft: "#f0f0f0",
  bg: "#ffffff",
  bgSoft: "#f5f5f5",
};

const LOGO_URL = `${env.BACKEND_URL}/images/Layer2.png`;

export const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

export const formatTzs = (amount: number): string => {
  return `TZS ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export const emailLayout = (title: string, body: string): string => {
  const year = new Date().getFullYear();

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <title>${escapeHtml(title)}</title>
    </head>
    <body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:'Inter','Plus Jakarta Sans',system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${BRAND.bg};padding:40px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid ${BRAND.border};border-radius:16px;overflow:hidden;">
              <tr>
                <td style="padding:28px 40px 24px;border-bottom:1px solid ${BRAND.borderSoft};">
                  <img src="${LOGO_URL}" alt="Drop Me a Tip" height="36" style="display:block;height:36px;width:auto;border:0;" />
                </td>
              </tr>
              <tr>
                <td style="padding:40px;">
                  ${body}
                </td>
              </tr>
              <tr>
                <td style="padding:28px 40px;border-top:1px solid ${BRAND.border};font-size:12px;line-height:1.8;color:${BRAND.muted};">
                  <p style="margin:0 0 10px;">This is an automated notification from Drop Me a Tip.</p>
                  <p style="margin:0 0 10px;">You are receiving this email because you have a Drop Me a Tip account.</p>
                  <p style="margin:0;">&copy; ${year} Drop Me a Tip. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
};
