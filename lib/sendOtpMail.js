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
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 24px 12px;">
        <div style="max-width: 400px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <!-- Header -->
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
            <img src="https://mlbbtopup.in/logoBB.png" alt="mlbbtopup.in" style="height: 28px; width: auto; vertical-align: middle;">
            <span style="font-weight: 800; font-size: 14px; color: #0f172a; letter-spacing: -0.02em;">mlbbtopup.in</span>
          </div>

          <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">Verification Code</h2>
          <p style="font-size: 13px; color: #64748b; margin: 0 0 16px 0; line-height: 1.4;">Use this one-time code to verify your login.</p>

          <!-- Compact Code Box -->
          <div style="background: #f1f5f9; border-radius: 8px; padding: 14px; text-align: center; margin-bottom: 14px; border: 1px solid #e2e8f0;">
            <span style="font-family: ui-monospace, 'Cascadia Code', monospace; font-size: 28px; font-weight: 800; color: #2563eb; letter-spacing: 6px;">${otp}</span>
          </div>

          <p style="font-size: 11px; color: #94a3b8; margin: 0 0 20px 0; line-height: 1.4;">Valid for 10 minutes. If you did not request this, please ignore.</p>

          <!-- Footer -->
          <div style="border-top: 1px solid #f1f5f9; padding-top: 14px; font-size: 11px; color: #94a3b8; text-align: center;">
            <a href="https://mlbbtopup.in" style="color: #2563eb; text-decoration: none; font-weight: 600;">mlbbtopup.in</a> • Instant Gaming Topup
          </div>
        </div>
      </div>
    `,
  });
}
