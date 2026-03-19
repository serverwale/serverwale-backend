/**
 * ============================================================
 *   SERVERWALE — AI SEO AGENT
 *   Powered by OpenAI GPT-4o
 *   Features:
 *     - Page SEO audit (meta, headings, keywords)
 *     - Keyword research & suggestions
 *     - Sitemap.xml generator
 *     - robots.txt generator
 *     - On-page SEO score (0-100)
 *     - Competitor keyword gap analysis
 *     - SEO improvement recommendations
 * ============================================================
 */

const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const COMPANY_CONTEXT = `
Serverwale is an Indian IT company offering:
- Refurbished & New Servers, Workstations, Storage
- VPS Hosting, Cloud Rental
- IT Hardware (Dell, HP, Lenovo, IBM)
- Enterprise IT solutions
- 24/7 Technical Support
Website: https://serverwale.com
Target audience: Indian businesses, SMBs, data centers, startups, IT teams.
Primary location: Delhi, India.
`;

// ─── 1. Full SEO Audit ────────────────────────────────────────
async function auditPage(pageData) {
  /**
   * pageData: {
   *   url: string,
   *   title: string,
   *   metaDescription: string,
   *   h1: string,
   *   h2s: [string],
   *   content: string (first 1000 chars),
   *   keywords: [string],
   *   imageAlts: [string],
   *   internalLinks: number,
   *   externalLinks: number,
   *   wordCount: number
   * }
   */
  const prompt = `
You are an SEO expert. Audit this webpage for Serverwale (Indian IT company).

Page Data:
${JSON.stringify(pageData, null, 2)}

${COMPANY_CONTEXT}

Provide a comprehensive SEO audit. Respond in JSON:
{
  "score": number (0-100),
  "grade": "A" | "B" | "C" | "D" | "F",
  "titleAnalysis": { "status": "good|warning|error", "issue": "string", "suggestion": "string" },
  "metaDescAnalysis": { "status": "good|warning|error", "issue": "string", "suggestion": "string" },
  "headingAnalysis": { "status": "good|warning|error", "issue": "string", "suggestion": "string" },
  "keywordAnalysis": { "status": "good|warning|error", "density": "string", "suggestion": "string" },
  "contentAnalysis": { "status": "good|warning|error", "issue": "string", "suggestion": "string" },
  "imageAnalysis": { "status": "good|warning|error", "issue": "string", "suggestion": "string" },
  "topIssues": ["string"],
  "quickWins": ["string"],
  "recommendedKeywords": ["string"],
  "improvedTitle": "string",
  "improvedMetaDesc": "string"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  return JSON.parse(response.choices[0].message.content);
}

// ─── 2. Keyword Research ──────────────────────────────────────
async function researchKeywords(topic, location = "India") {
  const prompt = `
You are an SEO keyword researcher for Serverwale (Indian IT/server company).
Research keywords for the topic: "${topic}" targeting ${location}.

${COMPANY_CONTEXT}

Find high-value, achievable keywords. Respond in JSON:
{
  "primaryKeyword": "string",
  "keywords": [
    {
      "keyword": "string",
      "intent": "informational|commercial|transactional|navigational",
      "difficulty": "easy|medium|hard",
      "volume": "low (<100)|medium (100-1k)|high (1k-10k)|very high (>10k)",
      "relevance": "high|medium|low",
      "type": "short-tail|long-tail|question|local"
    }
  ],
  "longTailOpportunities": ["string"],
  "localKeywords": ["string"],
  "contentIdeas": ["string"],
  "contentGap": "string"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.4,
  });

  return JSON.parse(response.choices[0].message.content);
}

// ─── 3. Sitemap Generator ─────────────────────────────────────
function generateSitemap(routes = []) {
  const defaultRoutes = [
    { url: "/", priority: "1.0", changefreq: "weekly" },
    { url: "/services", priority: "0.9", changefreq: "weekly" },
    { url: "/product", priority: "0.9", changefreq: "daily" },
    { url: "/shop/now", priority: "0.9", changefreq: "daily" },
    { url: "/shop/cloud", priority: "0.8", changefreq: "weekly" },
    { url: "/about", priority: "0.7", changefreq: "monthly" },
    { url: "/blog", priority: "0.8", changefreq: "weekly" },
    { url: "/contact", priority: "0.7", changefreq: "monthly" },
    { url: "/enterprise-solution", priority: "0.8", changefreq: "monthly" },
    { url: "/joinus", priority: "0.5", changefreq: "monthly" },
    { url: "/policy", priority: "0.3", changefreq: "yearly" },
    ...routes,
  ];

  const baseUrl = "https://serverwale.com";
  const today = new Date().toISOString().split("T")[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${defaultRoutes
    .map(
      (r) => `  <url>
    <loc>${baseUrl}${r.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
    )
    .join("\n")}
</urlset>`;

  return xml;
}

// ─── 4. Robots.txt Generator ──────────────────────────────────
function generateRobotsTxt() {
  return `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /uploads/

# Sitemaps
Sitemap: https://serverwale.com/sitemap.xml

# Good bots
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 2

# Block bad bots
User-agent: SemrushBot
Disallow: /

User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /
`;
}

// ─── 5. On-Page SEO Checker ───────────────────────────────────
function checkOnPageSEO(data) {
  const issues = [];
  const passed = [];
  let score = 100;

  // Title checks
  if (!data.title) { issues.push("❌ Missing title tag"); score -= 20; }
  else if (data.title.length < 30) { issues.push("⚠️ Title too short (< 30 chars)"); score -= 10; }
  else if (data.title.length > 60) { issues.push("⚠️ Title too long (> 60 chars)"); score -= 5; }
  else passed.push("✅ Title length is optimal");

  // Meta description
  if (!data.metaDescription) { issues.push("❌ Missing meta description"); score -= 15; }
  else if (data.metaDescription.length < 120) { issues.push("⚠️ Meta description too short"); score -= 7; }
  else if (data.metaDescription.length > 160) { issues.push("⚠️ Meta description too long"); score -= 5; }
  else passed.push("✅ Meta description length is optimal");

  // H1
  if (!data.h1) { issues.push("❌ Missing H1 tag"); score -= 15; }
  else passed.push("✅ H1 tag present");

  // Word count
  if (data.wordCount && data.wordCount < 300) { issues.push("⚠️ Content too thin (< 300 words)"); score -= 10; }
  else if (data.wordCount >= 700) passed.push("✅ Good content length");

  // Images
  if (data.imageAlts && data.imageAlts.some(alt => !alt)) { issues.push("⚠️ Some images missing alt text"); score -= 5; }
  else passed.push("✅ All images have alt text");

  return {
    score: Math.max(0, score),
    grade: score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F",
    issues,
    passed,
  };
}

// ─── 6. SEO Report Generator ─────────────────────────────────
async function generateSEOReport(pages = []) {
  if (!pages.length) return { message: "No pages provided for SEO audit." };

  const summary = pages.map(p =>
    `Page: ${p.url} | Title: ${p.title || "MISSING"} | Meta: ${p.metaDescription ? "OK" : "MISSING"} | H1: ${p.h1 || "MISSING"} | Words: ${p.wordCount || 0}`
  ).join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an SEO consultant for Serverwale (Indian IT company). Generate actionable SEO reports.",
      },
      {
        role: "user",
        content: `Generate an SEO report for these pages:\n\n${summary}\n\n${COMPANY_CONTEXT}\n\nProvide: overall SEO health score (0-100), top 5 critical issues, top 5 quick wins, content recommendations, and a 30-day action plan.`,
      },
    ],
    temperature: 0.4,
  });

  return {
    report: response.choices[0].message.content,
    pageCount: pages.length,
    generatedAt: new Date().toISOString(),
  };
}

// ─── 7. Chat with SEO Agent ───────────────────────────────────
async function chatWithSEOAgent(userMessage) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are Serverwale's AI SEO Agent. You help with:
- On-page SEO optimization
- Keyword strategy for Indian IT/hosting market
- Content planning
- Technical SEO fixes
- Link building strategies
${COMPANY_CONTEXT}
Be specific, practical, and focus on India's market.`,
      },
      { role: "user", content: userMessage },
    ],
    temperature: 0.5,
  });

  return response.choices[0].message.content;
}

module.exports = {
  auditPage,
  researchKeywords,
  generateSitemap,
  generateRobotsTxt,
  checkOnPageSEO,
  generateSEOReport,
  chatWithSEOAgent,
};
