const nodemailer = require("nodemailer");

const sendEmail = async (lead) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.hostinger.com",
    port: parseInt(process.env.EMAIL_PORT || "465"),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: { rejectUnauthorized: false }
  });

  const isPricingRequest = lead.message && lead.message.startsWith("Pricing request received for:");
  const subject = isPricingRequest
    ? `💰 Pricing Request: ${lead.service || "Product"}`
    : "New Lead Received 🚀";

  const html = isPricingRequest
    ? `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
        <div style="background:#0055E5;padding:20px 24px;">
          <h2 style="color:#fff;margin:0;font-size:20px;">💰 New Pricing Request</h2>
          <p style="color:#b3d5ff;margin:4px 0 0;font-size:14px;">Serverwale Store</p>
        </div>
        <div style="padding:24px;">
          <table style="width:100%;border-collapse:collapse;font-size:15px;">
            <tr style="background:#f3f8ff;"><td style="padding:10px 14px;font-weight:600;color:#0055E5;width:140px;">Product</td><td style="padding:10px 14px;color:#0f172a;">${lead.service || "Not specified"}</td></tr>
            <tr><td style="padding:10px 14px;font-weight:600;color:#334155;">Name</td><td style="padding:10px 14px;color:#0f172a;">${lead.name}</td></tr>
            <tr style="background:#f8fafc;"><td style="padding:10px 14px;font-weight:600;color:#334155;">Email</td><td style="padding:10px 14px;color:#0f172a;">${lead.email}</td></tr>
            <tr><td style="padding:10px 14px;font-weight:600;color:#334155;">Phone</td><td style="padding:10px 14px;color:#0f172a;">${lead.phone}</td></tr>
          </table>
          <p style="margin:20px 0 0;font-size:13px;color:#64748b;">Received from Serverwale website store. Please follow up promptly.</p>
        </div>
      </div>
    `
    : `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
        <div style="background:#0055E5;padding:20px 24px;">
          <h2 style="color:#fff;margin:0;font-size:20px;">🚀 New Lead</h2>
          <p style="color:#b3d5ff;margin:4px 0 0;font-size:14px;">Serverwale Website</p>
        </div>
        <div style="padding:24px;">
          <table style="width:100%;border-collapse:collapse;font-size:15px;">
            <tr style="background:#f3f8ff;"><td style="padding:10px 14px;font-weight:600;color:#334155;width:120px;">Name</td><td style="padding:10px 14px;color:#0f172a;">${lead.name}</td></tr>
            <tr><td style="padding:10px 14px;font-weight:600;color:#334155;">Company</td><td style="padding:10px 14px;color:#0f172a;">${lead.company || "-"}</td></tr>
            <tr style="background:#f8fafc;"><td style="padding:10px 14px;font-weight:600;color:#334155;">Email</td><td style="padding:10px 14px;color:#0f172a;">${lead.email}</td></tr>
            <tr><td style="padding:10px 14px;font-weight:600;color:#334155;">Phone</td><td style="padding:10px 14px;color:#0f172a;">${lead.phone}</td></tr>
            <tr style="background:#f8fafc;"><td style="padding:10px 14px;font-weight:600;color:#334155;">Service</td><td style="padding:10px 14px;color:#0f172a;">${lead.service || "-"}</td></tr>
            <tr><td style="padding:10px 14px;font-weight:600;color:#334155;">Message</td><td style="padding:10px 14px;color:#0f172a;">${lead.message || "-"}</td></tr>
          </table>
        </div>
      </div>
    `;

  const recipients = "sales@serverwale.com";

  await transporter.sendMail({
    from: `"Serverwale Website" <${process.env.EMAIL_USER}>`,
    to: recipients,
    subject,
    html
  });
};

module.exports = sendEmail;
