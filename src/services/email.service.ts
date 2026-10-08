import { Resend } from "resend";
import { env } from "../config/env.js";
import { donationReceivedTemplate } from "../email-templates/donation-received.template.js";
import { otpTemplate } from "../email-templates/otp.template.js";
import { payoutStatusTemplate } from "../email-templates/payout-status.template.js";
import { welcomeTemplate } from "../email-templates/welcome.template.js";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

const send = async (to: string, subject: string, html: string): Promise<void> => {
  if (!resend) {
    console.warn(
      "RESEND_API_KEY is not configured. Skipping email delivery.",
    );
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend failed to send email:", error);
    }
  } catch (err) {
    console.error("Unexpected email delivery error:", err);
  }
};

export const sendWelcomeEmail = async (
  to: string,
  data: { fullName: string; username: string },
): Promise<void> => {
  await send(to, "Welcome to Drop Me a Tip", welcomeTemplate(data));
};

export const sendOtpEmail = async (
  to: string,
  data: {
    fullName: string;
    code: string;
    expiresInMinutes: number;
  },
): Promise<void> => {
  await send(to, "Your verification code", otpTemplate(data));
};

export const sendDonationReceivedEmail = async (
  to: string,
  data: {
    creatorName: string;
    supporterName: string;
    amountTzs: number;
    message?: string;
  },
): Promise<void> => {
  await send(
    to,
    "You received a tip",
    donationReceivedTemplate(data),
  );
};

export const sendPayoutStatusEmail = async (
  to: string,
  data: {
    creatorName: string;
    amountTzs: number;
    phone: string;
    status: string;
  },
): Promise<void> => {
  await send(
    to,
    `Payout ${data.status}`,
    payoutStatusTemplate(data),
  );
};
