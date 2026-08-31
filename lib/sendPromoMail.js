import { getTransporters } from "./mailTransporters";

/**
 * Sends promotional emails using multiple Gmail accounts to distribute load and improve speed.
 * Uses GMAIL_USER/GMAIL_APP_PASSWORD and GMAIL_USER2/GMAIL_APP_PASSWORD2 from environment variables.
 */
export async function sendPromoMail({ emails, subject, content, imageUrl }) {
  // Create transporters for all available accounts
  const transportersInfo = getTransporters();

  if (transportersInfo.length === 0) {
    throw new Error("No Gmail accounts configured for sending promotional emails.");
  }

  const results = {
    total: emails.length,
    success: 0,
    failed: 0,
    successEmails: [],
    errors: []
  };

  // Send emails in parallel across all accounts
  const CONCURRENCY = transportersInfo.length; // One worker per account to maintain single connection
  const queue = [...emails];
  
  async function worker(workerId) {
    while (queue.length > 0) {
      const email = queue.shift();
      if (!email) break;

      const tInfo = transportersInfo[workerId % transportersInfo.length];
      const { transporter, account } = tInfo;

      try {
        // More conservative delay to avoid Gmail detection (1s - 2s)
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1000));

        await transporter.sendMail({
          from: `"mlbbtopup.in" <${account.user}>`,
          to: email,
          subject: subject,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; color: #0f172a; margin: 0; padding: 0; background-color: #f8fafc; }
                .container { max-width: 440px; margin: 20px auto; padding: 24px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; }
                .header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
                .logo { height: 28px; width: auto; vertical-align: middle; }
                .brand { font-weight: 800; font-size: 15px; color: #0f172a; letter-spacing: -0.02em; }
                .banner { width: 100%; border-radius: 8px; margin-bottom: 16px; display: block; object-fit: cover; }
                .content { font-size: 13px; color: #334155; white-space: pre-wrap; margin-bottom: 20px; line-height: 1.6; }
                .footer { border-top: 1px solid #f1f5f9; margin-top: 24px; padding-top: 14px; text-align: center; font-size: 11px; color: #94a3b8; }
                .footer a { color: #2563eb; text-decoration: none; font-weight: 600; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <img src="https://mlbbtopup.in/logoBB.png" alt="mlbbtopup.in" class="logo">
                  <span class="brand">mlbbtopup.in</span>
                </div>
                
                ${imageUrl ? `<img src="${imageUrl}" alt="Promotion" class="banner">` : ''}
                
                <div class="content">${content}</div>

                <div class="footer">
                  <p style="margin: 0 0 4px 0;"><a href="https://mlbbtopup.in">mlbbtopup.in</a> • <a href="https://mlbbtopup.in/dashboard/support">Support</a></p>
                  <p style="margin: 0; font-size: 10px; color: #cbd5e1;">© 2026 mlbbtopup.in. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        results.success++;
        results.successEmails.push(email);
      } catch (error) {
        results.failed++;
        results.errors.push({ email, error: error.message });
        console.error(`Failed to send to ${email} via ${account.user}:`, error);
      }
    }
  }

  // Start workers
  const workers = Array.from({ length: CONCURRENCY }, (_, i) => worker(i));
  await Promise.all(workers);

  return results;
}

