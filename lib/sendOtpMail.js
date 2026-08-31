import { getNextTransporter } from "./mailTransporters";

export async function sendOtpMail(email, otp) {
  const tInfo = getNextTransporter();
  if (!tInfo) {
    throw new Error("No mail transporters available for OTP.");
  }
  
  const { transporter, account } = tInfo;

  await transporter.sendMail({
    from: `"mlbbtopup.in" <${account.user}>`,
    to: email,
    subject: `${otp} is your verification code - mlbbtopup.in`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff; padding: 32px 16px; color: #0f172a;">
        <div style="max-width: 380px; margin: 0 auto; text-align: center;">
          <!-- Logo & Brand -->
          <div style="margin-bottom: 24px;">
            <img src="https://mlbbtopup.in/logoBB.png" alt="mlbbtopup.in" style="height: 32px; width: auto; vertical-align: middle; margin-bottom: 6px;">
            <div style="font-weight: 800; font-size: 16px; color: #0f172a; letter-spacing: -0.02em;">mlbbtopup.in</div>
          </div>

          <p style="font-size: 14px; color: #475569; margin: 0 0 16px 0;">Your verification code is:</p>

          <!-- Large Minimalist OTP Box -->
          <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px 28px; margin: 0 auto 16px auto; display: inline-block; border: 1px solid #e2e8f0;">
            <span style="font-family: ui-monospace, 'Cascadia Code', monospace; font-size: 32px; font-weight: 800; color: #2563eb; letter-spacing: 8px; margin-left: 8px;">${otp}</span>
          </div>

          <p style="font-size: 12px; color: #94a3b8; margin: 0 0 28px 0; line-height: 1.5;">Expires in 10 minutes. If you didn't request this, ignore this email.</p>

          <!-- Footer -->
          <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; font-size: 11px; color: #94a3b8;">
            <a href="https://mlbbtopup.in" style="color: #2563eb; text-decoration: none; font-weight: 600;">mlbbtopup.in</a> • Instant Topup
          </div>
        </div>
      </div>
    `,
  });
}
