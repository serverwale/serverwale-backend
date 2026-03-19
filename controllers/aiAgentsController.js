/**
 * ============================================================
 *   SERVERWALE — AI AGENTS CONTROLLER
 *   Security | Marketing | Analytics | SEO | Reports
 * ============================================================
 */

const securityAgent  = require("../ai-agents/securityAgent");
const marketingAgent = require("../ai-agents/marketingAgent");
const analyticsAgent = require("../ai-agents/analyticsAgent");
const seoAgent       = require("../ai-agents/seoAgent");
const reportAgent    = require("../ai-agents/reportAgent");

/* ══════════════════════════════════════════════════════════
   SECURITY AGENT
══════════════════════════════════════════════════════════ */
const security = {
  getLogs: (req, res) => {
    try {
      const { limit = 100, severity } = req.query;
      const logs = securityAgent.getRecentLogs(parseInt(limit), severity || null);
      res.json({ success: true, count: logs.length, logs });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getSuspiciousIPs: (req, res) => {
    try {
      const ips = securityAgent.getSuspiciousIPs();
      res.json({ success: true, count: ips.length, suspiciousIPs: ips });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getReport: async (req, res) => {
    try {
      const report = await securityAgent.generateSecurityReport();
      res.json({ success: true, ...report });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  analyzeEvent: async (req, res) => {
    try {
      const { logEntry } = req.body;
      if (!logEntry) return res.status(400).json({ error: "logEntry is required" });
      const analysis = await securityAgent.analyzeThreat(logEntry);
      res.json({ success: true, analysis });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  chat: async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) return res.status(400).json({ error: "message is required" });
      const reply = await securityAgent.chatWithSecurityAgent(message);
      res.json({ success: true, reply });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};

/* ══════════════════════════════════════════════════════════
   MARKETING AGENT
══════════════════════════════════════════════════════════ */
const marketing = {
  scoreLead: async (req, res) => {
    try {
      const leadData = req.body;
      if (!leadData || Object.keys(leadData).length === 0)
        return res.status(400).json({ error: "Lead data is required" });
      const result = await marketingAgent.scoreLead(leadData);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  generateEmail: async (req, res) => {
    try {
      const { purpose, leadData = {}, customInstructions = "" } = req.body;
      if (!purpose) return res.status(400).json({ error: "purpose is required" });
      const email = await marketingAgent.generateEmail(purpose, leadData, customInstructions);
      res.json({ success: true, email });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  generateBlog: async (req, res) => {
    try {
      const { topic, keywords = [], targetLength = "medium" } = req.body;
      if (!topic) return res.status(400).json({ error: "topic is required" });
      const blog = await marketingAgent.generateBlogPost(topic, keywords, targetLength);
      res.json({ success: true, blog });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  generateSocial: async (req, res) => {
    try {
      const { platform, topic, tone = "professional" } = req.body;
      if (!platform || !topic)
        return res.status(400).json({ error: "platform and topic are required" });
      const post = await marketingAgent.generateSocialPost(platform, topic, tone);
      res.json({ success: true, post });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  analyzeSegments: async (req, res) => {
    try {
      const { customers } = req.body;
      if (!customers || !Array.isArray(customers))
        return res.status(400).json({ error: "customers array is required" });
      const result = await marketingAgent.analyzeSegments(customers);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getUpsell: async (req, res) => {
    try {
      const { customerData } = req.body;
      if (!customerData) return res.status(400).json({ error: "customerData is required" });
      const recommendation = await marketingAgent.getUpsellRecommendation(customerData);
      res.json({ success: true, recommendation });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  planCampaign: async (req, res) => {
    try {
      const { goal, budget, duration, targetAudience } = req.body;
      if (!goal || !budget || !duration || !targetAudience)
        return res.status(400).json({ error: "goal, budget, duration, targetAudience required" });
      const plan = await marketingAgent.planCampaign(goal, budget, duration, targetAudience);
      res.json({ success: true, plan });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  analyzeCompetitor: async (req, res) => {
    try {
      const { competitorName } = req.body;
      if (!competitorName) return res.status(400).json({ error: "competitorName is required" });
      const analysis = await marketingAgent.analyzeCompetitor(competitorName);
      res.json({ success: true, analysis });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  chat: async (req, res) => {
    try {
      const { message, context = {} } = req.body;
      if (!message) return res.status(400).json({ error: "message is required" });
      const reply = await marketingAgent.chatWithMarketingAgent(message, context);
      res.json({ success: true, reply });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};

/* ══════════════════════════════════════════════════════════
   ANALYTICS AGENT
══════════════════════════════════════════════════════════ */
const analytics = {
  getLiveVisitors: (req, res) => {
    try {
      const visitors = analyticsAgent.getActiveVisitors();
      res.json({ success: true, count: visitors.length, visitors });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getPageViews: (req, res) => {
    try {
      const { limit = 200 } = req.query;
      const views = analyticsAgent.getRecentPageViews(parseInt(limit));
      res.json({ success: true, count: views.length, views });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getDailyStats: (req, res) => {
    try {
      const { days = 7 } = req.query;
      const stats = analyticsAgent.getDailyStats(parseInt(days));
      res.json({ success: true, stats });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getTopPages: (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const pages = analyticsAgent.getTopPages(parseInt(limit));
      res.json({ success: true, pages });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getTopCountries: (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const countries = analyticsAgent.getTopCountries(parseInt(limit));
      res.json({ success: true, countries });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getDeviceStats: (req, res) => {
    try {
      const devices = analyticsAgent.getDeviceStats();
      const browsers = analyticsAgent.getBrowserStats();
      res.json({ success: true, devices, browsers });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getSummary: (req, res) => {
    try {
      const summary = analyticsAgent.getTrafficSummary();
      res.json({ success: true, ...summary });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};

/* ══════════════════════════════════════════════════════════
   SEO AGENT
══════════════════════════════════════════════════════════ */
const seo = {
  auditPage: async (req, res) => {
    try {
      const pageData = req.body;
      if (!pageData || !pageData.url)
        return res.status(400).json({ error: "pageData with url is required" });
      const audit = await seoAgent.auditPage(pageData);
      res.json({ success: true, audit });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  researchKeywords: async (req, res) => {
    try {
      const { topic, location = "India" } = req.body;
      if (!topic) return res.status(400).json({ error: "topic is required" });
      const result = await seoAgent.researchKeywords(topic, location);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  quickCheck: (req, res) => {
    try {
      const data = req.body;
      const result = seoAgent.checkOnPageSEO(data);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getReport: async (req, res) => {
    try {
      // Generate a default site report for serverwale.com main pages
      const pages = [
        { url: "/", title: "Serverwale - IT Hardware & Hosting Solutions India", metaDescription: "Serverwale offers refurbished servers, VPS hosting, and IT hardware in India.", h1: "India's Leading IT Infrastructure Partner", wordCount: 800 },
        { url: "/product", title: "IT Products - Servers & Workstations", metaDescription: "Buy refurbished servers, workstations in India at best price.", h1: "Our Products", wordCount: 500 },
        { url: "/services", title: "IT Services - VPS, Cloud, Hosting", metaDescription: "VPS hosting, cloud rental, and managed IT services in India.", h1: "Our Services", wordCount: 600 },
      ];
      const report = await seoAgent.generateSEOReport(pages);
      res.json({ success: true, ...report });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  chat: async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) return res.status(400).json({ error: "message is required" });
      const reply = await seoAgent.chatWithSEOAgent(message);
      res.json({ success: true, reply });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};

/* ══════════════════════════════════════════════════════════
   REPORT AGENT
══════════════════════════════════════════════════════════ */
const reports = {
  sendSecurityReport: async (req, res) => {
    try {
      const result = await reportAgent.sendDailySecurityReport();
      res.json({ success: result.success, message: result.success ? "Security report sent ✅" : result.error });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  sendTrafficReport: async (req, res) => {
    try {
      const result = await reportAgent.sendDailyTrafficReport();
      res.json({ success: result.success, message: result.success ? "Traffic report sent ✅" : result.error });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  sendMarketingReport: async (req, res) => {
    try {
      const { stats = {} } = req.body;
      const result = await reportAgent.sendWeeklyMarketingReport(stats);
      res.json({ success: result.success, message: result.success ? "Marketing report sent ✅" : result.error });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  sendTest: async (req, res) => {
    try {
      const result = await reportAgent.sendTestReport();
      res.json({ success: result.success, message: result.success ? "Test report sent to akankshaa.mee@gmail.com ✅" : result.error });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};

/* ══════════════════════════════════════════════════════════
   OVERALL AGENT STATUS
══════════════════════════════════════════════════════════ */
const getAgentStatus = (req, res) => {
  try {
    const secLogs = securityAgent.getRecentLogs(1);
    const traffic = analyticsAgent.getTrafficSummary();

    res.json({
      success: true,
      agents: [
        {
          name: "Security Agent",
          status: "active",
          icon: "🛡️",
          description: "Monitors SQL injection, XSS, brute-force attacks",
          stats: {
            logsToday: securityAgent.getRecentLogs(1000).filter(l => l.timestamp.startsWith(new Date().toISOString().split("T")[0])).length,
            suspiciousIPs: securityAgent.getSuspiciousIPs().length,
            lastEvent: secLogs[0]?.timestamp || null,
          },
          reportSchedule: "Daily 8:00 AM IST → akankshaa.mee@gmail.com",
        },
        {
          name: "Analytics Agent",
          status: "active",
          icon: "📊",
          description: "Real-time visitor tracking with geo location",
          stats: {
            activeNow: traffic.activeNow,
            todayVisits: traffic.todayVisits,
            totalPageViews: traffic.totalPageViews,
          },
          reportSchedule: "Daily 8:00 AM IST → akankshaa.mee@gmail.com",
        },
        {
          name: "Marketing Agent",
          status: "active",
          icon: "📈",
          description: "Lead scoring, email campaigns, SEO blog generation",
          stats: { functions: 9 },
          reportSchedule: "Weekly Monday 9:00 AM IST → akankshaa.mee@gmail.com",
        },
        {
          name: "SEO Agent",
          status: "active",
          icon: "🔍",
          description: "Page audits, keyword research, sitemap generation",
          stats: { functions: 7 },
          reportSchedule: "On-demand via admin dashboard",
        },
        {
          name: "Report Agent",
          status: "active",
          icon: "📧",
          description: "Automated HTML email reports",
          stats: {
            from: process.env.REPORT_FROM_EMAIL || "hostserverwale@gmail.com",
            to: process.env.REPORT_TO_EMAIL || "akankshaa.mee@gmail.com",
          },
          reportSchedule: "Daily + Weekly scheduled",
        },
      ],
      uptime: Math.floor(process.uptime()) + "s",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { security, marketing, analytics, seo, reports, getAgentStatus };
