import { env } from "../config/env.js";
import { emailLayout, escapeHtml } from "./shared.js";

export interface WelcomeTemplateData {
  fullName: string;
  username: string;
}

export const welcomeTemplate = (data: WelcomeTemplateData): string => {
  const profileUrl = `${env.FRONTEND_URL}/@${encodeURIComponent(data.username)}`;

  const body = `
    <h1 style="margin:0 0 16px;font-size:24px;color:#111827;">Welcome, ${escapeHtml(data.fullName)}!</h1>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#374151;">
      Your creator account is ready. Share your unique handle link with your
      supporters to start receiving tips and memberships.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <a href="${profileUrl}"
             style="display:inline-block;background-color:#2563eb;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:16px;font-weight:bold;">
            View My Page
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:24px 0 0;font-size:14px;color:#71717a;word-break:break-all;">
      Your link: ${profileUrl}
    </p>`;

  return emailLayout("Welcome to Drop Me a Tip", body);
};
