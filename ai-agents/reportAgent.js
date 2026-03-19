/**
 * ============================================================
 *   SERVERWALE — AI REPORT AGENT
 *   Automated Email Reports
 *   Features:
 *     - Daily security report → akankshaa.mee@gmail.com
 *     - Daily traffic summary report
 *     - Weekly marketing + SEO report
 *     - Real-time critical alert emails
 *     - Beautiful HTML email templates
 *   Schedule:
 *     - Daily report: Every day at 8:00 AM IST
 *     - Weekly report: Every Monday at 9:00 AM IST
 * ============================================================
 */

const nodemailer = require("nodemailer");
const cron = require("node-cron");

const securityAgent = require("./securityAgent");
const analyticsAgent = require("./analyticsAgent");

// ─── Email Config ─────────────────────────────────────────────
const FROM_EMAIL = process.env.REPORT_FROM_EMAIL || "hostserverwale@gmail.com";
const TO_EMAIL   = process.env.REPORT_TO_EMAIL   || "akankshaa.mee@gmail.com";
const CC_EMAIL   = process.env.REPORT_CC_EMAIL   || "";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: FROM_EMAIL,
      pass: process.env.REPORT_EMAIL_PASS || process.env.EMAIL_PASS,
    },
  });
  return transporter;
}

// ─── Send Email ───────────────────────────────────────────────
async function sendEmail({ subject, html, to = TO_EMAIL, cc = CC_EMAIL }) {
  try {
    const mail = { from: `"Serverwale AI Agent" <${FROM_EMAIL}>`, to, subject, html };
    if (cc) mail.cc = cc;
    const info = await getTransporter().sendMail(mail);
    console.log(`[ReportAgent] Email sent: ${subject} → ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("[ReportAgent] Email failed:", err.message);
    return { success: false, error: err.message };
  }
}

// ─── HTML Template ────────────────────────────────────────────
function htmlWrap(title, color, body) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body{font-family:Arial,sans-serif;background:#0f172a;margin:0;padding:0}
  .wrap{max-width:680px;margin:0 auto;background:#1e293b;border-radius:12px;overflow:hidden}
  .header{background:${color};padding:24px 32px;color:#fff}
  .header h1{margin:0;font-size:22px;font-weight:700}
  .header p{margin:4px 0 0;opacity:.85;font-size:13px}
  .body{padding:28px 32px}
  .card{background:#0f172a;border-radius:8px;padding:16px 20px;margin:12px 0;border-left:4px solid ${color}}
  .stat{display:inline-block;background:#1e40af22;border-radius:6px;padding:8px 16px;margin:4px;text-align:center}
  .stat .val{font-size:28px;font-weight:700;color:${color}}
  .stat .label{font-size:11px;color:#94a3b8;text-transform:uppercase}
  h2{color:#e2e8f0;font-size:16px;margin-top:20px}
  p,li{color:#cbd5e1;font-size:14px;line-height:1.6}
  ul{padding-left:18px}
  .badge-critical{background:#ef4444;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px}
  .badge-high{background:#f97316;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px}
  .badge-medium{background:#eab308;color:#000;padding:2px 8px;border-radius:4px;font-size:11px}
  .badge-low{background:#22c55e;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px}
  .footer{background:#0f172a;padding:16px 32px;text-align:center;font-size:12px;color:#475569}
  table{width:100%;border-collapse:collapse}
  td,th{padding:8px 12px;text-align:left;border-bottom:1px solid #1e293b;color:#cbd5e1;font-size:13px}
  th{color:#94a3b8;font-weight:600;text-transform:uppercase;font-size:11px}
</style></head>
<body><div class="wrap">
  <div class="header">
    <h1>🤖 ${title}</h1>
    <p>Serverwale AI Agent Report — ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
  </div>
  <div class="body">${body}</div>
  <div class="footer">This is an automated report from Serverwale AI Agents.<br>Do not reply to this email.</div>
</div></body></html>`;
}

// ─── 1. Daily Security Report Email ──────────────────────────
async function sendDailySecurityReport() {
  const logs = securityAgent.getRecentLogs(50);
  const suspIPs = securityAgent.getSuspiciousIPs();

  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  logs.forEach(l => { counts[l.severity] = (counts[l.severity] || 0) + 1; });

  const riskLevel = counts.critical > 0 ? "CRITICAL" : counts.high > 2 ? "HIGH" : counts.medium > 5 ? "MEDIUM" : "LOW";
  const riskColor = riskLevel === "CRITICAL" ? "#ef4444" : riskLevel === "HIGH" ? "#f97316" : riskLevel === "MEDIUM" ? "#eab308" : "#22c55e";

  const recentRows = logs.slice(-10).reverse().map(l =>
    `<tr><td><span class="badge-${l.severity}">${l.severity.toUpperCase()}</span></td><td>${l.type}</td><td>${l.ip}</td><td>${new Date(l.timestamp).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })}</td></tr>`
  ).join("");

  const suspIPRows = suspIPs.slice(0, 5).map(({ ip, count, lastSeen }) =>
    `<tr><td>${ip}</td><td>${count} attacks</td><td>${new Date(lastSeen).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td></tr>`
  ).join("") || "<tr><td colspan='3' style='color:#22c55e'>No suspicious IPs detected ✅</td></tr>";

  const body = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
      <div class="stat"><div class="val" style="color:#ef4444">${counts.critical}</div><div class="label">Critical</div></div>
      <div class="stat"><div class="val" style="color:#f97316">${counts.high}</div><div class="label">High</div></div>
      <div class="stat"><div class="val" style="color:#eab308">${counts.medium}</div><div class="label">Medium</div></div>
      <div class="stat"><div class="val" style="color:#22c55e">${counts.low}</div><div class="label">Low</div></div>
      <div class="stat"><div class="val">${suspIPs.length}</div><div class="label">Flagged IPs</div></div>
    </div>
    <div class="card">
      <p style="margin:0">Overall Risk Level: <strong style="color:${riskColor}">${riskLevel}</strong></p>
    </div>
    <h2>Recent Security Events</h2>
    <table><thead><tr><th>Severity</th><th>Type</th><th>IP</th><th>Time (IST)</th></tr></thead><tbody>${recentRows || "<tr><td colspan='4' style='color:#22c55e'>No events — all clear! ✅</td></tr>"}</tbody></table>
    <h2>Suspicious IPs</h2>
    <table><thead><tr><th>IP Address</th><th>Attacks</th><th>Last Seen</th></tr></thead><tbody>${suspIPRows}</tbody></table>
    <div class="card" style="margin-top:20px">
      <p style="margin:0"><strong>Action Required:</strong> ${counts.critical > 0 ? "⚠️ Critical threats detected — review and block flagged IPs immediately." : "✅ No immediate action required. Continue monitoring."}</p>
    </div>`;

  return sendEmail({
    subject: `🛡️ Serverwale Security Report — ${riskLevel} Risk — ${new Date().toLocaleDateString("en-IN")}`,
    html: htmlWrap("Daily Security Report", "#6366f1", body),
  });
}

// ─── 2. Daily Traffic Report Email ───────────────────────────
async function sendDailyTrafficReport() {
  const summary = analyticsAgent.getTrafficSummary();
  const topPages = summary.topPages.map((p, i) =>
    `<tr><td>#${i + 1}</td><td>${p.page}</td><td><strong>${p.views}</strong></td></tr>`
  ).join("") || "<tr><td colspan='3'>No data yet</td></tr>";

  const topCountries = summary.topCountries.map((c, i) =>
    `<tr><td>#${i + 1}</td><td>${c.country}</td><td><strong>${c.visits}</strong></td></tr>`
  ).join("") || "<tr><td colspan='3'>No data yet</td></tr>";

  const deviceRows = Object.entries(summary.deviceStats).map(([d, c]) =>
    `<tr><td>${d}</td><td><strong>${c}</strong></td></tr>`
  ).join("");

  const body = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
      <div class="stat"><div class="val" style="color:#06b6d4">${summary.activeNow}</div><div class="label">Active Now</div></div>
      <div class="stat"><div class="val" style="color:#10b981">${summary.todayVisits}</div><div class="label">Today Visits</div></div>
      <div class="stat"><div class="val" style="color:#8b5cf6">${summary.todayUnique}</div><div class="label">Unique Today</div></div>
      <div class="stat"><div class="val" style="color:#f59e0b">${summary.totalPageViews}</div><div class="label">Total Page Views</div></div>
    </div>
    <h2>Top Pages</h2>
    <table><thead><tr><th>#</th><th>Page</th><th>Views</th></tr></thead><tbody>${topPages}</tbody></table>
    <h2>Top Countries</h2>
    <table><thead><tr><th>#</th><th>Country</th><th>Visits</th></tr></thead><tbody>${topCountries}</tbody></table>
    <h2>Devices</h2>
    <table><thead><tr><th>Device</th><th>Count</th></tr></thead><tbody>${deviceRows}</tbody></table>`;

  return sendEmail({
    subject: `📊 Serverwale Traffic Report — ${new Date().toLocaleDateString("en-IN")}`,
    html: htmlWrap("Daily Traffic Report", "#0ea5e9", body),
  });
}

// ─── 3. Critical Security Alert (instant) ────────────────────
async function sendCriticalAlert(logEntry) {
  const body = `
    <div class="card" style="border-color:#ef4444">
      <p style="margin:0;color:#ef4444;font-size:16px;font-weight:700">⚠️ CRITICAL SECURITY ALERT</p>
    </div>
    <div style="margin:16px 0">
      <p><strong>Event Type:</strong> ${logEntry.type}</p>
      <p><strong>IP Address:</strong> ${logEntry.ip}</p>
      <p><strong>Severity:</strong> <span class="badge-critical">CRITICAL</span></p>
      <p><strong>Detail:</strong> ${logEntry.detail}</p>
      <p><strong>Time:</strong> ${new Date(logEntry.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
    </div>
    <div class="card">
      <p style="margin:0"><strong>Recommended Action:</strong> Review the IP immediately. Consider blocking ${logEntry.ip} via your server firewall or Nginx config.</p>
    </div>`;

  return sendEmail({
    subject: `🚨 CRITICAL ALERT: ${logEntry.type} — ${logEntry.ip}`,
    html: htmlWrap("Critical Security Alert", "#ef4444", body),
  });
}

// ─── 4. Weekly Marketing Report ───────────────────────────────
async function sendWeeklyMarketingReport(stats = {}) {
  const body = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
      <div class="stat"><div class="val" style="color:#10b981">${stats.newLeads || 0}</div><div class="label">New Leads</div></div>
      <div class="stat"><div class="val" style="color:#f59e0b">${stats.hotLeads || 0}</div><div class="label">Hot Leads</div></div>
      <div class="stat"><div class="val" style="color:#8b5cf6">${stats.consultations || 0}</div><div class="label">Consultations</div></div>
      <div class="stat"><div class="val" style="color:#06b6d4">${stats.inquiries || 0}</div><div class="label">Inquiries</div></div>
    </div>
    <div class="card">
      <h2 style="margin-top:0">Marketing Recommendations</h2>
      <ul>
        <li>Follow up on all hot leads within 24 hours</li>
        <li>Send re-engagement email to cold leads</li>
        <li>Publish 2 SEO blog posts this week targeting Indian server keywords</li>
        <li>Post on LinkedIn about Serverwale's latest offers</li>
        <li>Review Google Ads performance and optimize bidding</li>
      </ul>
    </div>
    <div class="card">
      <h2 style="margin-top:0">This Week's SEO Focus Keywords</h2>
      <ul>
        <li>refurbished server Delhi</li>
        <li>VPS hosting India low cost</li>
        <li>dedicated server rental India</li>
        <li>HP ProLiant server price India</li>
        <li>cloud server India small business</li>
      </ul>
    </div>`;

  return sendEmail({
    subject: `📈 Serverwale Weekly Marketing Report — Week of ${new Date().toLocaleDateString("en-IN")}`,
    html: htmlWrap("Weekly Marketing Report", "#10b981", body),
  });
}

// ─── 5. Schedule All Reports ───────────────────────────────────
function startReportScheduler() {
  // Daily reports at 8:00 AM IST (2:30 AM UTC)
  cron.schedule("30 2 * * *", async () => {
    console.log("[ReportAgent] Sending daily reports...");
    await sendDailySecurityReport();
    await sendDailyTrafficReport();
  }, { timezone: "Asia/Kolkata" });

  // Weekly marketing report every Monday at 9:00 AM IST
  cron.schedule("0 9 * * 1", async () => {
    console.log("[ReportAgent] Sending weekly marketing report...");
    await sendWeeklyMarketingReport();
  }, { timezone: "Asia/Kolkata" });

  console.log("[ReportAgent] ✅ Report scheduler started — daily at 8AM IST, weekly on Monday 9AM IST");
}

// ─── 6. Manual trigger (for admin dashboard) ─────────────────
async function sendTestReport() {
  return sendDailySecurityReport();
}

module.exports = {
  sendDailySecurityReport,
  sendDailyTrafficReport,
  sendCriticalAlert,
  sendWeeklyMarketingReport,
  sendTestReport,
  startReportScheduler,
};
