/**
 * ============================================================
 *   SERVERWALE — AI MARKETING AGENT
 *   Powered by OpenAI GPT-4o
 *   Features:
 *     - Lead scoring & qualification
 *     - Personalized email campaign generation
 *     - SEO blog content creation
 *     - Customer segment analysis
 *     - Upsell / cross-sell recommendations
 *     - Social media post generator
 *     - Competitor analysis summaries
 * ============================================================
 */

const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Company context (customize as needed) ──────────────────
const COMPANY_CONTEXT = `
Serverwale is an Indian web hosting and VPS provider offering:
- Shared Hosting, VPS Hosting, Dedicated Servers
- Domain Registration
- SSL Certificates
- Website Migration services
- 24/7 Technical Support
Target audience: Indian SMBs, startups, developers, e-commerce businesses.
USP: Affordable pricing, fast Indian servers, Hindi + English support.
`;

// ─── 1. Lead Scoring ─────────────────────────────────────────
async function scoreLead(leadData) {
  const prompt = `
You are a sales expert for Serverwale (Indian web hosting company).
Score this lead from 0-100 based on purchase likelihood and add a qualification note.

Lead Data:
${JSON.stringify(leadData, null, 2)}

Company Context:
${COMPANY_CONTEXT}

Respond in JSON:
{
  "score": number (0-100),
  "grade": "A" | "B" | "C" | "D",
  "qualification": "hot" | "warm" | "cold",
  "reason": "brief explanation",
  "recommendedAction": "string (e.g. call within 24h, send pricing email, etc.)",
  "suggestedPlan": "string (which hosting plan to pitch)"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  return JSON.parse(response.choices[0].message.content);
}

// ─── 2. Personalized Email Generator ────────────────────────
async function generateEmail(purpose, leadData = {}, customInstructions = "") {
  /**
   * purposes: welcome | followup | promo | winback | upsell | invoice_reminder
   */
  const prompt = `
Write a professional, friendly email for Serverwale (Indian web hosting company).
Purpose: ${purpose}
Lead/Customer info: ${JSON.stringify(leadData)}
Custom instructions: ${customInstructions}

${COMPANY_CONTEXT}

Guidelines:
- Keep it concise (under 200 words)
- Use a warm, helpful tone
- Include a clear CTA
- Mention Serverwale's India-based support if relevant
- Subject line must be catchy

Respond in JSON:
{
  "subject": "string",
  "body": "string (plain text with \\n for line breaks)",
  "ctaText": "string",
  "ctaLink": "string (use placeholder like https://serverwale.com/...)"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  return JSON.parse(response.choices[0].message.content);
}

// ─── 3. SEO Blog Content Generator ──────────────────────────
async function generateBlogPost(topic, keywords = [], targetLength = "medium") {
  const keywordStr = keywords.length ? `Target keywords: ${keywords.join(", ")}` : "";
  const lengthMap = { short: "400-500", medium: "700-900", long: "1200-1500" };
  const wordCount = lengthMap[targetLength] || "700-900";

  const prompt = `
Write an SEO-optimized blog post for Serverwale's website.
Topic: ${topic}
${keywordStr}
Word count: ${wordCount} words
${COMPANY_CONTEXT}

Guidelines:
- Use H2 and H3 headings
- Include an intro, body sections, and conclusion
- Naturally include keywords
- Add a CTA at the end pointing to Serverwale services
- Write for Indian SMB audience
- Tone: helpful, informative, slightly conversational

Respond in JSON:
{
  "title": "string",
  "metaDescription": "string (155 chars max)",
  "slug": "string",
  "content": "string (HTML formatted with <h2>, <h3>, <p>, <ul> tags)",
  "tags": ["string"],
  "estimatedReadTime": "string"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.6,
  });

  return JSON.parse(response.choices[0].message.content);
}

// ─── 4. Social Media Post Generator ─────────────────────────
async function generateSocialPost(platform, topic, tone = "professional") {
  /**
   * platforms: twitter | linkedin | facebook | instagram | whatsapp
   */
  const limits = {
    twitter: 280,
    linkedin: 1300,
    facebook: 500,
    instagram: 300,
    whatsapp: 200,
  };

  const prompt = `
Create a ${platform} post for Serverwale (Indian web hosting company).
Topic: ${topic}
Tone: ${tone}
Character limit: ~${limits[platform] || 300}
${COMPANY_CONTEXT}

Include relevant emojis. For LinkedIn add hashtags. For Instagram add hashtags.
Respond in JSON:
{
  "post": "string",
  "hashtags": ["string"],
  "bestTimeToPost": "string",
  "engagementTip": "string"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  return JSON.parse(response.choices[0].message.content);
}

// ─── 5. Customer Segment Analyzer ───────────────────────────
async function analyzeSegments(customers) {
  /**
   * customers: array of { name, plan, joinDate, revenue, tickets, lastActive }
   */
  const prompt = `
You are a marketing analyst for Serverwale.
Analyze these customers and segment them:

${JSON.stringify(customers.slice(0, 50), null, 2)}

Create segments like: Champions, Loyal, At-Risk, Lost, New, High-Value
For each segment provide: count, characteristics, recommended marketing action.

Respond in JSON:
{
  "segments": [
    {
      "name": "string",
      "count": number,
      "characteristics": "string",
      "action": "string",
      "emailCampaign": "string"
    }
  ],
  "insights": "string",
  "topOpportunity": "string"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.4,
  });

  return JSON.parse(response.choices[0].message.content);
}

// ─── 6. Upsell / Cross-sell Recommender ─────────────────────
async function getUpsellRecommendation(customerData) {
  const prompt = `
You are a sales AI for Serverwale.
Based on this customer's current plan and usage, recommend the best upsell or cross-sell.

Customer: ${JSON.stringify(customerData)}
${COMPANY_CONTEXT}

Respond in JSON:
{
  "currentPlan": "string",
  "recommendedUpgrade": "string",
  "reason": "string",
  "estimatedRevenueLift": "string",
  "pitchMessage": "string (short personalized sales message)",
  "urgency": "low" | "medium" | "high"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.4,
  });

  return JSON.parse(response.choices[0].message.content);
}

// ─── 7. Marketing Campaign Planner ──────────────────────────
async function planCampaign(goal, budget, duration, targetAudience) {
  const prompt = `
Create a detailed digital marketing campaign plan for Serverwale.
Goal: ${goal}
Budget: ₹${budget}
Duration: ${duration}
Target Audience: ${targetAudience}
${COMPANY_CONTEXT}

Include: channels (Google Ads, Facebook, SEO, WhatsApp, Email), messaging, KPIs, timeline.

Respond in JSON:
{
  "campaignName": "string",
  "channels": [
    {
      "name": "string",
      "budget": "string",
      "strategy": "string",
      "expectedResults": "string"
    }
  ],
  "keyMessages": ["string"],
  "kpis": ["string"],
  "timeline": [
    { "week": number, "activities": "string" }
  ],
  "totalExpectedLeads": "string",
  "estimatedROI": "string"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.5,
  });

  return JSON.parse(response.choices[0].message.content);
}

// ─── 8. Chat with Marketing Agent ────────────────────────────
async function chatWithMarketingAgent(userMessage, context = {}) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are Serverwale's AI Marketing Agent. You help the team with:
- Lead generation strategies
- Email campaigns
- SEO content
- Social media
- Customer retention
- Pricing strategies for Indian market
${COMPANY_CONTEXT}
Be concise, data-driven, and focus on practical actions for an Indian hosting business.`,
      },
      { role: "user", content: userMessage },
    ],
    temperature: 0.6,
  });

  return response.choices[0].message.content;
}

// ─── 9. Competitor Analysis ──────────────────────────────────
async function analyzeCompetitor(competitorName) {
  const prompt = `
Analyze ${competitorName} as a competitor to Serverwale (Indian web hosting).
Provide a competitive intelligence report covering:
- Their strengths and weaknesses
- Pricing positioning vs Serverwale
- How Serverwale can win customers from them
- Messaging angles to use

${COMPANY_CONTEXT}

Respond in JSON:
{
  "competitor": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "pricingComparison": "string",
  "winStrategy": "string",
  "messagingAngles": ["string"],
  "serverwaleAdvantage": "string"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.5,
  });

  return JSON.parse(response.choices[0].message.content);
}

module.exports = {
  scoreLead,
  generateEmail,
  generateBlogPost,
  generateSocialPost,
  analyzeSegments,
  getUpsellRecommendation,
  planCampaign,
  chatWithMarketingAgent,
  analyzeCompetitor,
};
