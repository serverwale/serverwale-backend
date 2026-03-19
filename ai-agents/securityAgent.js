/**
 * ============================================================
 *   SERVERWALE — AI SECURITY AGENT
 *   Powered by OpenAI GPT-4o
 *   Features:
 *     - Suspicious activity detection
 *     - Rate-limit abuse analysis
 *     - SQL/XSS injection pattern alerts
 *     - Login anomaly detection
 *     - Automated security reports
 * ============================================================
 */

const OpenAI = require("openai");
const db = require("../db");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── In-memory log store (replace with DB in production) ────
const securityLogs = [];
const suspiciousIPs = new Map(); // ip -> { count, lastSeen, flagged }

// ─── Pattern banks ──────────────────────────────────────────
const SQL_PATTERNS = [
  /(\bSELECT\b|\bINSERT\b|\bDROP\b|\bDELETE\b|\bUPDATE\b|\bUNION\b)/i,
  /--\s*$/,
  /;\s*(DROP|DELETE|INSERT|UPDATE)/i,
  /'\s*OR\s*'1'\s*=\s*'1/i,
];

const XSS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/i,
  /javascript\s*:/i,
  /on\w+\s*=\s*["'][^"']*["']/i,
  /<iframe/i,
];

const PATH_TRAVERSAL = [/\.\.\//g, /%2e%2e%2f/gi, /\.\.\\/, /%252e/gi];

// ─── Utility: log an event ───────────────────────────────────
function logEvent(type, ip, detail, severity = "low") {
  const entry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    type,
    ip,
    detail,
    severity, // low | medium | high | critical
  };
  securityLogs.push(entry);

  // Track suspicious IPs
  if (severity === "high" || severity === "critical") {
    const record = suspiciousIPs.get(ip) || { count: 0, lastSeen: null, flagged: false };
    record.count += 1;
    record.lastSeen = entry.timestamp;
    if (record.count >= 3) record.flagged = true;
    suspiciousIPs.set(ip, record);
  }

  console.log(`[SecurityAgent][${severity.toUpperCase()}] ${type} — ${ip} — ${detail}`);
  return entry;
}

// ─── 1. Request Inspector Middleware ────────────────────────
function inspectRequest(req, res, next) {
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
  const body = JSON.stringify(req.body || {});
  const query = JSON.stringify(req.query || {});
  const url = req.originalUrl || req.url;
  const combined = `${url} ${body} ${query}`;

  // SQL Injection check
  for (const pattern of SQL_PATTERNS) {
    if (pattern.test(combined)) {
      logEvent("SQL_INJECTION_ATTEMPT", ip, `Pattern matched in: ${combined.slice(0, 200)}`, "critical");
      return res.status(403).json({ error: "Forbidden: Malicious input detected." });
    }
  }

  // XSS check
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(combined)) {
      logEvent("XSS_ATTEMPT", ip, `XSS pattern in: ${combined.slice(0, 200)}`, "high");
      return res.status(403).json({ error: "Forbidden: Script injection detected." });
    }
  }

  // Path traversal check
  for (const pattern of PATH_TRAVERSAL) {
    if (pattern.test(url)) {
      logEvent("PATH_TRAVERSAL", ip, `Traversal attempt: ${url}`, "high");
      return res.status(403).json({ error: "Forbidden: Invalid path." });
    }
  }

  // Flag known suspicious IPs
  const ipRecord = suspiciousIPs.get(ip);
  if (ipRecord && ipRecord.flagged) {
    logEvent("FLAGGED_IP_REQUEST", ip, `Flagged IP hit: ${url}`, "medium");
  }

  next();
}

// ─── 2. Login Anomaly Detector ───────────────────────────────
const loginAttempts = new Map(); // ip -> { count, firstAttempt }

function trackLogin(ip, success) {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, firstAttempt: now };

  if (now - record.firstAttempt > 10 * 60 * 1000) {
    // Reset window after 10 minutes
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return;
  }

  if (!success) {
    record.count += 1;
    loginAttempts.set(ip, record);

    if (record.count >= 5) {
      logEvent(
        "BRUTE_FORCE_DETECTED",
        ip,
        `${record.count} failed login attempts within 10 minutes`,
        "critical"
      );
    } else if (record.count >= 3) {
      logEvent("MULTIPLE_FAILED_LOGINS", ip, `${record.count} failed attempts`, "high");
    }
  } else {
    loginAttempts.delete(ip); // clear on success
  }
}

// ─── 3. AI-Powered Threat Analysis ──────────────────────────
async function analyzeThreat(logEntry) {
  try {
    const prompt = `
You are a cybersecurity expert AI for Serverwale, a web hosting company.
Analyze this security event and provide:
1. Threat assessment (1-10 severity)
2. What the attacker likely intended
3. Recommended action (block IP, notify admin, monitor, etc.)
4. Prevention tip

Event:
Type: ${logEntry.type}
IP: ${logEntry.ip}
Detail: ${logEntry.detail}
Severity: ${logEntry.severity}
Time: ${logEntry.timestamp}

Respond in JSON format:
{
  "threatScore": number,
  "intent": "string",
  "action": "string",
  "prevention": "string",
  "summary": "string"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.error("[SecurityAgent] AI analysis failed:", err.message);
    return null;
  }
}

// ─── 4. Daily Security Report Generator ─────────────────────
async function generateSecurityReport() {
  const recent = securityLogs.slice(-50); // last 50 events
  if (recent.length === 0) return { message: "No security events to report." };

  const summary = recent.map((e) => `[${e.severity}] ${e.type} from ${e.ip} at ${e.timestamp}`).join("\n");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a security analyst for Serverwale (web hosting company). Generate a clear, actionable security report.",
        },
        {
          role: "user",
          content: `Generate a security report for these recent events:\n\n${summary}\n\nInclude: overall risk level, top threats, recommended actions, and a summary for the business owner.`,
        },
      ],
      temperature: 0.4,
    });

    return {
      report: response.choices[0].message.content,
      eventCount: recent.length,
      suspiciousIPs: Array.from(suspiciousIPs.entries())
        .filter(([, v]) => v.flagged)
        .map(([ip, data]) => ({ ip, ...data })),
      generatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("[SecurityAgent] Report generation failed:", err.message);
    return { error: "Failed to generate report." };
  }
}

// ─── 5. Get Recent Logs ──────────────────────────────────────
function getRecentLogs(limit = 100, severityFilter = null) {
  let logs = securityLogs.slice(-limit);
  if (severityFilter) {
    logs = logs.filter((l) => l.severity === severityFilter);
  }
  return logs;
}

// ─── 6. Get Suspicious IPs ───────────────────────────────────
function getSuspiciousIPs() {
  return Array.from(suspiciousIPs.entries()).map(([ip, data]) => ({ ip, ...data }));
}

// ─── 7. Chat with Security Agent ─────────────────────────────
async function chatWithSecurityAgent(userMessage) {
  const recentEvents = securityLogs.slice(-20).map(
    (e) => `[${e.severity}] ${e.type}: ${e.detail} (${e.ip})`
  ).join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are Serverwale's AI Security Agent. You monitor security events, detect threats, and advise the team.
Current security context:
${recentEvents || "No recent events."}

Suspicious IPs: ${suspiciousIPs.size} tracked.
You help the admin understand threats and take action.`,
      },
      { role: "user", content: userMessage },
    ],
    temperature: 0.5,
  });

  return response.choices[0].message.content;
}

module.exports = {
  inspectRequest,
  trackLogin,
  analyzeThreat,
  generateSecurityReport,
  getRecentLogs,
  getSuspiciousIPs,
  chatWithSecurityAgent,
  logEvent,
};
