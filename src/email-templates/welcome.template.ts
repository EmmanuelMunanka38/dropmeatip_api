import { env } from "../config/env.js";
import { BRAND, emailLayout, escapeHtml } from "./shared.js";

export interface WelcomeTemplateData {
  fullName: string;
  username: string;
}

export const welcomeTemplate = (data: WelcomeTemplateData): string => {
  const profileUrl = `${env.FRONTEND_URL}/@${encodeURIComponent(data.username)}`;

  const body = `
    <h1 style="font-size:24px;font-weight:700;color:${BRAND.dark};margin:0 0 12px;line-height:1.2;letter-spacing:-0.02em;">Welcome, ${escapeHtml(data.fullName)}!</h1>
    <p style="font-size:16px;line-height:24px;color:${BRAND.text};margin:0 0 28px;">
      Your creator account is ready. Share your unique handle with your supporters to start receiving tips, memberships, event tickets, and shop sales — all from one link.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 28px;">
      <tr>
        <td align="center">
          <a href="${profileUrl}" style="display:inline-block;background-color:${BRAND.dark};color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:15px;font-weight:600;">View my page</a>
        </td>
      </tr>
    </table>
    <div style="background-color:${BRAND.bgSoft};padding:18px 22px;border-left:4px solid ${BRAND.dark};border-radius:8px;margin:0 0 28px;">
      <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${BRAND.muted};margin-bottom:8px;">Your link</div>
      <a href="${profileUrl}" style="font-size:14px;font-weight:600;color:${BRAND.dark};text-decoration:none;word-break:break-all;">${profileUrl}</a>
    </div>
    <p style="font-size:14px;line-height:22px;color:${BRAND.muted};margin:0;">
      From your dashboard you can customize your tip page, set up membership tiers, sell event tickets, list products, and cash out to mobile money or crypto whenever you like.
    </p>`;

  return emailLayout("Welcome to Drop Me a Tip", body);
};
