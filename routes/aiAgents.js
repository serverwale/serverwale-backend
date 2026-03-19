/**
 * ============================================================
 *   SERVERWALE — AI AGENTS ROUTES
 *   /api/ai/security/*   → Security Agent
 *   /api/ai/marketing/*  → Marketing Agent
 * ============================================================
 */

const express = require("express");
const router = express.Router();
const securityCtrl = require("../controllers/aiAgentsController").security;
const marketingCtrl = require("../controllers/aiAgentsController").marketing;

/* ── SECURITY AGENT ───────────────────────────────────────── */

// GET  /api/ai/security/logs           → recent security logs
router.get("/security/logs", securityCtrl.getLogs);

// GET  /api/ai/security/suspicious-ips → flagged IPs
router.get("/security/suspicious-ips", securityCtrl.getSuspiciousIPs);

// GET  /api/ai/security/report         → AI-generated security report
router.get("/security/report", securityCtrl.getReport);

// POST /api/ai/security/analyze        → analyze a specific log entry
router.post("/security/analyze", securityCtrl.analyzeEvent);

// POST /api/ai/security/chat           → chat with security agent
router.post("/security/chat", securityCtrl.chat);

/* ── MARKETING AGENT ──────────────────────────────────────── */

// POST /api/ai/marketing/score-lead    → score & qualify a lead
router.post("/marketing/score-lead", marketingCtrl.scoreLead);

// POST /api/ai/marketing/email         → generate email campaign
router.post("/marketing/email", marketingCtrl.generateEmail);

// POST /api/ai/marketing/blog          → generate SEO blog post
router.post("/marketing/blog", marketingCtrl.generateBlog);

// POST /api/ai/marketing/social        → generate social media post
router.post("/marketing/social", marketingCtrl.generateSocial);

// POST /api/ai/marketing/segments      → analyze customer segments
router.post("/marketing/segments", marketingCtrl.analyzeSegments);

// POST /api/ai/marketing/upsell        → get upsell recommendations
router.post("/marketing/upsell", marketingCtrl.getUpsell);

// POST /api/ai/marketing/campaign      → plan a marketing campaign
router.post("/marketing/campaign", marketingCtrl.planCampaign);

// POST /api/ai/marketing/competitor    → competitor analysis
router.post("/marketing/competitor", marketingCtrl.analyzeCompetitor);

// POST /api/ai/marketing/chat          → chat with marketing agent
router.post("/marketing/chat", marketingCtrl.chat);

module.exports = router;
