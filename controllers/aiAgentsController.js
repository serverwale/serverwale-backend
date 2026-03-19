/**
 * ============================================================
 *   SERVERWALE — AI AGENTS CONTROLLER
 * ============================================================
 */

const securityAgent = require("../ai-agents/securityAgent");
const marketingAgent = require("../ai-agents/marketingAgent");

/* ══════════════════════════════════════════════════════════
   SECURITY AGENT CONTROLLERS
══════════════════════════════════════════════════════════ */

const security = {
  // GET /api/ai/security/logs
  getLogs: (req, res) => {
    try {
      const { limit = 100, severity } = req.query;
      const logs = securityAgent.getRecentLogs(parseInt(limit), severity || null);
      res.json({ success: true, count: logs.length, logs });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // GET /api/ai/security/suspicious-ips
  getSuspiciousIPs: (req, res) => {
    try {
      const ips = securityAgent.getSuspiciousIPs();
      res.json({ success: true, count: ips.length, suspiciousIPs: ips });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // GET /api/ai/security/report
  getReport: async (req, res) => {
    try {
      const report = await securityAgent.generateSecurityReport();
      res.json({ success: true, ...report });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // POST /api/ai/security/analyze  { logEntry: {...} }
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

  // POST /api/ai/security/chat  { message: "..." }
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
   MARKETING AGENT CONTROLLERS
══════════════════════════════════════════════════════════ */

const marketing = {
  // POST /api/ai/marketing/score-lead  { name, email, company, plan, source, message }
  scoreLead: async (req, res) => {
    try {
      const leadData = req.body;
      if (!leadData || Object.keys(leadData).length === 0) {
        return res.status(400).json({ error: "Lead data is required" });
      }
      const result = await marketingAgent.scoreLead(leadData);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // POST /api/ai/marketing/email  { purpose, leadData, customInstructions }
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

  // POST /api/ai/marketing/blog  { topic, keywords, targetLength }
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

  // POST /api/ai/marketing/social  { platform, topic, tone }
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

  // POST /api/ai/marketing/segments  { customers: [...] }
  analyzeSegments: async (req, res) => {
    try {
      const { customers } = req.body;
      if (!customers || !Array.isArray(customers)) {
        return res.status(400).json({ error: "customers array is required" });
      }
      const result = await marketingAgent.analyzeSegments(customers);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // POST /api/ai/marketing/upsell  { customerData: {...} }
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

  // POST /api/ai/marketing/campaign  { goal, budget, duration, targetAudience }
  planCampaign: async (req, res) => {
    try {
      const { goal, budget, duration, targetAudience } = req.body;
      if (!goal || !budget || !duration || !targetAudience) {
        return res.status(400).json({ error: "goal, budget, duration, targetAudience required" });
      }
      const plan = await marketingAgent.planCampaign(goal, budget, duration, targetAudience);
      res.json({ success: true, plan });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // POST /api/ai/marketing/competitor  { competitorName }
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

  // POST /api/ai/marketing/chat  { message, context }
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

module.exports = { security, marketing };
