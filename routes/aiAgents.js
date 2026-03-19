/**
 * ============================================================
 *   SERVERWALE — AI AGENTS ROUTES
 *   /api/ai/security/*   → Security Agent
 *   /api/ai/marketing/*  → Marketing Agent
 *   /api/ai/analytics/*  → Analytics Agent (Real-Time Traffic)
 *   /api/ai/seo/*        → SEO Agent
 *   /api/ai/reports/*    → Report Agent
 * ============================================================
 */

const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/aiAgentsController");

/* ── SECURITY AGENT ───────────────────────────────────────── */
router.get("/security/logs",           ctrl.security.getLogs);
router.get("/security/suspicious-ips", ctrl.security.getSuspiciousIPs);
router.get("/security/report",         ctrl.security.getReport);
router.post("/security/analyze",       ctrl.security.analyzeEvent);
router.post("/security/chat",          ctrl.security.chat);

/* ── MARKETING AGENT ──────────────────────────────────────── */
router.post("/marketing/score-lead",   ctrl.marketing.scoreLead);
router.post("/marketing/email",        ctrl.marketing.generateEmail);
router.post("/marketing/blog",         ctrl.marketing.generateBlog);
router.post("/marketing/social",       ctrl.marketing.generateSocial);
router.post("/marketing/segments",     ctrl.marketing.analyzeSegments);
router.post("/marketing/upsell",       ctrl.marketing.getUpsell);
router.post("/marketing/campaign",     ctrl.marketing.planCampaign);
router.post("/marketing/competitor",   ctrl.marketing.analyzeCompetitor);
router.post("/marketing/chat",         ctrl.marketing.chat);

/* ── ANALYTICS AGENT (Real-Time Traffic) ─────────────────── */
router.get("/analytics/live",          ctrl.analytics.getLiveVisitors);
router.get("/analytics/pageviews",     ctrl.analytics.getPageViews);
router.get("/analytics/daily",         ctrl.analytics.getDailyStats);
router.get("/analytics/top-pages",     ctrl.analytics.getTopPages);
router.get("/analytics/countries",     ctrl.analytics.getTopCountries);
router.get("/analytics/devices",       ctrl.analytics.getDeviceStats);
router.get("/analytics/summary",       ctrl.analytics.getSummary);

/* ── SEO AGENT ────────────────────────────────────────────── */
router.post("/seo/audit",              ctrl.seo.auditPage);
router.post("/seo/keywords",           ctrl.seo.researchKeywords);
router.post("/seo/check",              ctrl.seo.quickCheck);
router.get("/seo/report",              ctrl.seo.getReport);
router.post("/seo/chat",               ctrl.seo.chat);

/* ── REPORT AGENT ─────────────────────────────────────────── */
router.post("/reports/security",       ctrl.reports.sendSecurityReport);
router.post("/reports/traffic",        ctrl.reports.sendTrafficReport);
router.post("/reports/marketing",      ctrl.reports.sendMarketingReport);
router.post("/reports/test",           ctrl.reports.sendTest);

/* ── AGENT STATUS DASHBOARD ───────────────────────────────── */
router.get("/status",                  ctrl.getAgentStatus);

module.exports = router;
