const nodemailer = require('nodemailer');


// Configure Nodemailer Transporter
 
function createTransporter() {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  if (user && pass) {
    // If a custom host is given and it's not default gmail
    if (host && !host.includes('gmail.com')) {
      return nodemailer.createTransport({
        host,
        port: Number(port),
        secure: Number(port) === 465,
        auth: { user, pass }
      });
    }
    // Default: Gmail service with Google App Password
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }

  return null;
}


 //Send OTP Verification Email directly to user's real email inbox

async function sendVerificationOTP(toEmail, userName, otp) {
  const transporter = createTransporter();
  const senderEmail = process.env.EMAIL_USER || process.env.SMTP_USER || 'noreply@scamshield.org';

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #1d4ed8, #2563eb); padding: 28px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
        .header p { margin: 6px 0 0 0; color: #bfdbfe; font-size: 13px; }
        .content { padding: 32px 28px; color: #334155; }
        .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; }
        .otp-box { text-align: center; margin: 30px 0; }
        .otp-code { display: inline-block; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8; background: #f1f5f9; border: 2px dashed #3b82f6; border-radius: 10px; padding: 14px 32px; font-family: monospace; }
        .expiry-note { font-size: 13px; color: #64748b; text-align: center; margin-top: 10px; }
        .warning-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #991b1b; margin-top: 24px; }
        .footer { background: #f8fafc; padding: 18px 28px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ Fake News &amp; Scam Shield</h1>
          <p>Hacktoberfest Hack Day Chandigarh 2026 &bull; Social Implications of Tech</p>
        </div>
        <div class="content">
          <h2 class="greeting">Hello, ${userName || 'Citizen'}!</h2>
          <p>Thank you for registering to protect your community from digital scams, manipulated payments, and forwarded misinformation.</p>
          <p>Please enter the following 6-digit One-Time Password (OTP) to verify your email address:</p>
          
          <div class="otp-box">
            <span class="otp-code">${otp}</span>
            <div class="expiry-note">⏳ Valid for <strong>10 minutes</strong></div>
          </div>

          <div class="warning-box">
            <strong>Security Notice:</strong> Never share this OTP or your bank PIN with anyone over the phone. Official banks and cyber units will never ask for your password or OTP.
          </div>
        </div>
        <div class="footer">
          National Cyber Crime Reporting Helpline: <strong>1930</strong> &bull; <a href="https://cybercrime.gov.in" style="color: #3b82f6;">cybercrime.gov.in</a>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log(`\n============================================================`);
    console.log(` [NODEMAILER - NO SMTP CONFIGURED IN .ENV]`);
    console.log(` Intended Recipient: ${toEmail} (${userName})`);
    console.log(` VERIFICATION OTP: >>> ${otp} <<<`);
    console.log(` To receive actual emails in your inbox, set EMAIL_USER & EMAIL_PASS in .env`);
    console.log(`============================================================\n`);
    return {
      success: false,
      simulated: true,
      otp,
      reason: 'No SMTP credentials provided in .env (add EMAIL_USER and EMAIL_PASS to send real emails).'
    };
  }
  try {
    const info = await transporter.sendMail({
      from: `"Fake News & Scam Shield" <${senderEmail}>`,
      to: toEmail,
      subject: ` Your Verification OTP: ${otp} - Fake News & Scam Shield`,
      html: emailHtml
    });

    console.log(`[Nodemailer] Real email successfully delivered to ${toEmail} (Message ID: ${info.messageId})`);
    return {
      success: true,
      messageId: info.messageId,
      otp
    };
  } catch (err) {
    console.error(` [Nodemailer Error]: Failed to deliver email to ${toEmail}:`, err.message);
    return {
      success: false,
      error: err.message,
      otp,
      reason: err.message
    };
  }
}

module.exports = {
  sendVerificationOTP
};
