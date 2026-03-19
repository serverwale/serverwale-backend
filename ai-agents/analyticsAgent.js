/**
 * ============================================================
 *   SERVERWALE — AI ANALYTICS AGENT
 *   Real-Time Traffic Monitoring
 *   Features:
 *     - Live visitor tracking (who, when, from where)
 *     - Page view analytics
 *     - Device & browser detection
 *     - Geographic location (via ip-api.com)
 *     - Daily traffic summary
 *     - Socket.io real-time push to admin dashboard
 * ============================================================
 */

const axios = require("axios");

// ─── In-memory stores ────────────────────────────────────────
const activeVisitors = new Map();   // sessionId -> visitor data
const pageViewLog = [];             // all page views (last 5000)
const dailyStats = {};              // date -> { visits, uniqueIPs, pageViews }

// ─── Geo cache to avoid hammering ip-api ─────────────────────
const geoCache = new Map();         // ip -> geoData

// ─── Socket.io reference (set from server.js) ────────────────
let _io = null;
function setIO(io) { _io = io; }

// ─── Emit to admin dashboard ─────────────────────────────────
function emitToAdmin(event, data) {
  if (_io) _io.to("admin-room").emit(event, data);
}

// ─── Geo lookup ──────────────────────────────────────────────
async function getGeoData(ip) {
  if (geoCache.has(ip)) return geoCache.get(ip);
  // Skip private / local IPs
  if (!ip || ip === "unknown" || ip.startsWith("127.") || ip.startsWith("::") || ip === "localhost") {
    return { country: "Local", city: "Local", region: "", flag: "🖥️" };
  }
  try {
    const res = await axios.get(`http://ip-api.com/json/${ip}?fields=country,city,regionName,countryCode,status`, { timeout: 3000 });
    if (res.data.status === "success") {
      const geo = {
        country: res.data.country || "Unknown",
        city: res.data.city || "Unknown",
        region: res.data.regionName || "",
        flag: countryFlag(res.data.countryCode || ""),
      };
      geoCache.set(ip, geo);
      return geo;
    }
  } catch { /* silently fail */ }
  return { country: "Unknown", city: "Unknown", region: "", flag: "🌍" };
}

// ─── Country code to flag emoji ──────────────────────────────
function countryFlag(code) {
  if (!code || code.length !== 2) return "🌍";
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 127397 + c.charCodeAt(0)));
}

// ─── Parse User-Agent ────────────────────────────────────────
function parseUA(ua = "") {
  const browser =
    /Edg\//.test(ua) ? "Edge" :
    /OPR\/|Opera/.test(ua) ? "Opera" :
    /Chrome\//.test(ua) ? "Chrome" :
    /Firefox\//.test(ua) ? "Firefox" :
    /Safari\//.test(ua) && !/Chrome/.test(ua) ? "Safari" :
    "Other";

  const device =
    /Mobile|Android|iPhone|iPad/.test(ua) ? "Mobile" :
    /Tablet|iPad/.test(ua) ? "Tablet" : "Desktop";

  const os =
    /Windows/.test(ua) ? "Windows" :
    /Mac OS/.test(ua) ? "macOS" :
    /Android/.test(ua) ? "Android" :
    /iPhone|iPad/.test(ua) ? "iOS" :
    /Linux/.test(ua) ? "Linux" : "Other";

  return { browser, device, os };
}

// ─── Track a page visit ──────────────────────────────────────
async function trackVisit(req) {
  const ip = (req.headers["x-forwarded-for"] || req.ip || "unknown").split(",")[0].trim();
  const ua = req.headers["user-agent"] || "";
  const page = req.originalUrl || req.url || "/";
  const referer = req.headers["referer"] || req.headers["referrer"] || "direct";
  const sessionId = req.headers["x-session-id"] || `${ip}_${ua.slice(0, 20)}`;

  // Skip admin routes, API routes, and static assets
  if (page.startsWith("/api") || page.startsWith("/uploads") || page.includes(".")) return;

  const { browser, device, os } = parseUA(ua);
  const geo = await getGeoData(ip);
  const now = new Date();
  const dateKey = now.toISOString().split("T")[0];

  const visitData = {
    sessionId,
    ip,
    page,
    referer,
    browser,
    device,
    os,
    country: geo.country,
    city: geo.city,
    region: geo.region,
    flag: geo.flag,
    timestamp: now.toISOString(),
    lastSeen: now.toISOString(),
  };

  // Update active visitors
  activeVisitors.set(sessionId, visitData);

  // Page view log (keep last 5000)
  pageViewLog.push({ ...visitData });
  if (pageViewLog.length > 5000) pageViewLog.shift();

  // Daily stats
  if (!dailyStats[dateKey]) dailyStats[dateKey] = { visits: 0, uniqueIPs: new Set(), pageViews: 0, topPages: {} };
  dailyStats[dateKey].visits += 1;
  dailyStats[dateKey].uniqueIPs.add(ip);
  dailyStats[dateKey].pageViews += 1;
  dailyStats[dateKey].topPages[page] = (dailyStats[dateKey].topPages[page] || 0) + 1;

  // Emit real-time update to admin dashboard
  emitToAdmin("visitor-update", {
    activeCount: activeVisitors.size,
    newVisit: visitData,
    activeVisitors: getActiveVisitors(),
  });
}

// ─── Remove visitor on disconnect / timeout ───────────────────
function removeVisitor(sessionId) {
  activeVisitors.delete(sessionId);
  emitToAdmin("visitor-left", { sessionId, activeCount: activeVisitors.size });
}

// ─── Cleanup inactive visitors (>10 min idle) ─────────────────
setInterval(() => {
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  for (const [sid, v] of activeVisitors.entries()) {
    if (v.lastSeen < tenMinAgo) activeVisitors.delete(sid);
  }
  emitToAdmin("visitor-update", { activeCount: activeVisitors.size, activeVisitors: getActiveVisitors() });
}, 60 * 1000); // run every minute

// ─── Getters ─────────────────────────────────────────────────
function getActiveVisitors() {
  return Array.from(activeVisitors.values());
}

function getRecentPageViews(limit = 200) {
  return pageViewLog.slice(-limit).reverse();
}

function getDailyStats(days = 7) {
  const result = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const s = dailyStats[key];
    result.push({
      date: key,
      visits: s ? s.visits : 0,
      uniqueVisitors: s ? s.uniqueIPs.size : 0,
      pageViews: s ? s.pageViews : 0,
      topPages: s ? Object.entries(s.topPages).sort((a, b) => b[1] - a[1]).slice(0, 5) : [],
    });
  }
  return result;
}

function getTopPages(limit = 10) {
  const pageCounts = {};
  pageViewLog.forEach(v => { pageCounts[v.page] = (pageCounts[v.page] || 0) + 1; });
  return Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([page, views]) => ({ page, views }));
}

function getTopCountries(limit = 10) {
  const countryCounts = {};
  pageViewLog.forEach(v => {
    const key = `${v.flag} ${v.country}`;
    countryCounts[key] = (countryCounts[key] || 0) + 1;
  });
  return Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([country, visits]) => ({ country, visits }));
}

function getDeviceStats() {
  const stats = { Desktop: 0, Mobile: 0, Tablet: 0 };
  pageViewLog.forEach(v => { stats[v.device] = (stats[v.device] || 0) + 1; });
  return stats;
}

function getBrowserStats() {
  const stats = {};
  pageViewLog.forEach(v => { stats[v.browser] = (stats[v.browser] || 0) + 1; });
  return stats;
}

function getTrafficSummary() {
  const today = new Date().toISOString().split("T")[0];
  const todayStats = dailyStats[today] || { visits: 0, uniqueIPs: new Set(), topPages: {} };
  return {
    activeNow: activeVisitors.size,
    todayVisits: todayStats.visits,
    todayUnique: todayStats.uniqueIPs.size || 0,
    totalPageViews: pageViewLog.length,
    topPages: getTopPages(5),
    topCountries: getTopCountries(5),
    deviceStats: getDeviceStats(),
    browserStats: getBrowserStats(),
    last7Days: getDailyStats(7),
  };
}

// ─── Express middleware ───────────────────────────────────────
function analyticsMiddleware(req, res, next) {
  trackVisit(req).catch(() => {}); // non-blocking, never fail
  next();
}

module.exports = {
  setIO,
  analyticsMiddleware,
  trackVisit,
  removeVisitor,
  getActiveVisitors,
  getRecentPageViews,
  getDailyStats,
  getTopPages,
  getTopCountries,
  getDeviceStats,
  getBrowserStats,
  getTrafficSummary,
};
