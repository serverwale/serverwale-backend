/**
 * ============================================================
 *   SERVERWALE — AI BLOG AGENT
 *   Powered by OpenAI GPT-4o
 *   Features:
 *     - Auto-pick best SEO topics for serverwale.com
 *     - Generate full SEO-optimized blog posts
 *     - Rewrite existing blogs with better SEO
 *     - Auto-publish to MySQL database
 *     - Email notification on every publish
 *     - Flexible scheduler (daily / weekly, any time)
 *     - Schedule with your own topics OR let AI decide
 * ============================================================
 */

const OpenAI    = require("openai");
const nodemailer = require("nodemailer");
const cron      = require("node-cron");
const fs        = require("fs");
const path      = require("path");
const db        = require("../db");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* ── Config ─────────────────────────────────────────────────── */
const FROM_EMAIL    = process.env.REPORT_FROM_EMAIL  || "hostserverwale@gmail.com";
const NOTIFY_EMAIL  = process.env.REPORT_TO_EMAIL    || "akankshaa.mee@gmail.com";
const EMAIL_PASS    = process.env.REPORT_EMAIL_PASS  || process.env.EMAIL_PASS;
const SCHEDULES_FILE = path.join(__dirname, "../blog-schedules.json");

const COMPANY_CONTEXT = `
Serverwale is an Indian IT company based in Delhi. Products/Services:
- Refurbished & New Servers (HP ProLiant, Dell PowerEdge, Lenovo ThinkSystem, IBM)
- Workstations & GPU Systems (ProStation)
- Cloud VPS Hosting & Server Rental
- Storage Solutions (NAS, SAN)
- IT Hardware (RAM, HDD, SSD, Networking)
- Enterprise IT Consulting & Support
Website: https://serverwale.com
Target audience: Indian SMBs, startups, IT teams, data centers, e-commerce businesses.
Primary keywords: refurbished server India, buy server online India, VPS hosting India,
  dedicated server Delhi, HP server price India, Dell server refurbished.
`;

/* ── Email transporter ───────────────────────────────────────── */
function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: FROM_EMAIL, pass: EMAIL_PASS },
  });
}

/* ═══════════════════════════════════════════════════════════════
   1. AUTO-PICK BEST SEO TOPICS
   Returns N topic ideas best suited for serverwale.com SEO
═══════════════════════════════════════════════════════════════ */
async function autoPickTopics(count = 5) {
  const prompt = `
You are an SEO strategist for Serverwale, an Indian IT/server company.
Pick ${count} blog topics that:
1. Target high-intent keywords in India (people ready to buy)
2. Have low-to-medium competition
3. Perfectly match Serverwale's products (servers, VPS, workstations, IT hardware)
4. Include local SEO (Delhi, India-focused)
5. Mix of: how-to guides, comparison articles, buying guides, technical explainers

${COMPANY_CONTEXT}

Respond ONLY in JSON:
{
  "topics": [
    {
      "title": "string (compelling, SEO-ready headline)",
      "slug": "string (url-friendly slug)",
      "primaryKeyword": "string",
      "secondaryKeywords": ["string"],
      "searchIntent": "informational|commercial|transactional",
      "estimatedDifficulty": "easy|medium|hard",
      "estimatedVolume": "low|medium|high",
      "whyPick": "string (1 line why this topic will rank)"
    }
  ]
}`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.5,
  });

  return JSON.parse(res.choices[0].message.content).topics;
}

/* ═══════════════════════════════════════════════════════════════
   2. GENERATE FULL SEO BLOG FROM TOPIC
═══════════════════════════════════════════════════════════════ */
async function generateBlogFromTopic({ title, primaryKeyword, secondaryKeywords = [], slug = "", targetLength = "medium" }) {
  const lengthMap = { short: "500-700", medium: "900-1200", long: "1400-1800" };
  const wordCount = lengthMap[targetLength] || "900-1200";
  const kwStr = secondaryKeywords.length ? `Secondary keywords: ${secondaryKeywords.join(", ")}` : "";

  const prompt = `
Write a complete, high-quality SEO blog post for Serverwale's website.

Title: "${title}"
Primary Keyword: "${primaryKeyword}"
${kwStr}
Target word count: ${wordCount} words

${COMPANY_CONTEXT}

Requirements:
- Start with a compelling intro that includes the primary keyword naturally
- Use H2 and H3 subheadings (will be rendered as HTML)
- Include bullet points and numbered lists where appropriate
- Naturally weave in primary + secondary keywords (no stuffing)
- Include a comparison table if relevant (use HTML <table> tags)
- End with a strong CTA linking to serverwale.com
- Write for Indian SMB audience — conversational yet professional
- Include specific numbers/stats to add credibility
- Mention Delhi/India context where relevant
- MUST include an FAQ section at the end (3-5 questions)

Respond ONLY in JSON:
{
  "title": "string (final SEO title, 50-60 chars)",
  "slug": "string (URL-friendly)",
  "excerpt": "string (meta description, 140-155 chars, includes primary keyword)",
  "content": "string (full HTML blog content with <h2>, <h3>, <p>, <ul>, <li>, <table>, <strong> tags)",
  "tags": "string (comma-separated: 5-7 relevant tags)",
  "primaryKeyword": "string",
  "estimatedReadTime": "string (e.g. '7 min read')",
  "wordCount": number
}`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.6,
    max_tokens: 4000,
  });

  const blog = JSON.parse(res.choices[0].message.content);
  // Use the provided slug if not generated
  if (!blog.slug && slug) blog.slug = slug;
  return blog;
}

/* ═══════════════════════════════════════════════════════════════
   3. REWRITE EXISTING BLOG WITH BETTER SEO
═══════════════════════════════════════════════════════════════ */
async function rewriteBlog(existingBlog) {
  const prompt = `
You are an SEO expert. Rewrite and significantly improve this existing blog post for Serverwale.

Original Title: ${existingBlog.title}
Original Excerpt: ${existingBlog.excerpt || "none"}
Original Content (first 2000 chars): ${(existingBlog.content || "").slice(0, 2000)}
Original Tags: ${existingBlog.tags || "none"}

${COMPANY_CONTEXT}

Your rewrite must:
1. Keep the same core topic but make it 30-50% longer with more depth
2. Improve SEO: better title (50-60 chars), better meta description (140-155 chars)
3. Add/improve H2, H3 structure
4. Add a comparison table if not present
5. Add an FAQ section at the end
6. Improve internal linking opportunities (mention other Serverwale services)
7. Add a compelling CTA at the end
8. Fix any thin/weak sections

Respond ONLY in JSON:
{
  "title": "string (improved SEO title)",
  "slug": "string",
  "excerpt": "string (improved meta description with keyword)",
  "content": "string (full rewritten HTML content)",
  "tags": "string (improved tags, comma-separated)",
  "improvements": ["string (list of what was improved)"],
  "estimatedReadTime": "string",
  "wordCount": number
}`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.6,
    max_tokens: 4000,
  });

  return JSON.parse(res.choices[0].message.content);
}

/* ═══════════════════════════════════════════════════════════════
   4. PUBLISH BLOG TO DATABASE
═══════════════════════════════════════════════════════════════ */
function publishBlogToDB(blogData) {
  return new Promise((resolve, reject) => {
    const { title, slug, excerpt, content, tags, image = null } = blogData;

    // Make slug unique if needed
    const uniqueSlug = slug + "-" + Date.now();

    db.query(
      `INSERT INTO blogs (title, slug, excerpt, content, tags, image, status)
       VALUES (?, ?, ?, ?, ?, ?, 'published')`,
      [title, uniqueSlug, excerpt || "", content, tags || "", image],
      (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId, slug: uniqueSlug, title });
      }
    );
  });
}

/* ═══════════════════════════════════════════════════════════════
   5. UPDATE EXISTING BLOG IN DB (for rewrites)
═══════════════════════════════════════════════════════════════ */
function updateBlogInDB(id, blogData) {
  return new Promise((resolve, reject) => {
    const { title, slug, excerpt, content, tags } = blogData;
    db.query(
      `UPDATE blogs SET title=?, slug=?, excerpt=?, content=?, tags=?, status='published' WHERE id=?`,
      [title, slug, excerpt || "", content, tags || "", id],
      (err) => {
        if (err) return reject(err);
        resolve({ id, title });
      }
    );
  });
}

/* ═══════════════════════════════════════════════════════════════
   6. SEND PUBLISH NOTIFICATION EMAIL
═══════════════════════════════════════════════════════════════ */
async function sendPublishEmail(blog, isRewrite = false) {
  const subject = isRewrite
    ? `✍️ Blog Rewritten & Published: "${blog.title}"`
    : `📝 New Blog Published: "${blog.title}"`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
  body{font-family:Arial,sans-serif;background:#0f172a;margin:0;padding:20px}
  .wrap{max-width:620px;margin:0 auto;background:#1e293b;border-radius:12px;overflow:hidden}
  .header{background:${isRewrite ? "#7c3aed" : "#0ea5e9"};padding:24px 32px;color:#fff}
  .header h1{margin:0;font-size:20px}
  .header p{margin:6px 0 0;opacity:.85;font-size:13px}
  .body{padding:28px 32px}
  .card{background:#0f172a;border-radius:8px;padding:16px 20px;margin:12px 0}
  p,li{color:#cbd5e1;font-size:14px;line-height:1.6;margin:4px 0}
  .label{color:#94a3b8;font-size:11px;text-transform:uppercase;font-weight:600}
  .value{color:#f1f5f9;font-size:14px;font-weight:500}
  .btn{display:inline-block;background:#0ea5e9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:16px}
  .tag{display:inline-block;background:#1e3a5f;color:#7dd3fc;padding:3px 10px;border-radius:4px;font-size:11px;margin:2px}
  .footer{background:#0f172a;padding:14px 32px;text-align:center;font-size:11px;color:#475569}
  ul{padding-left:18px}
</style></head>
<body><div class="wrap">
  <div class="header">
    <h1>${isRewrite ? "✍️ Blog Rewritten & Published!" : "📝 New Blog Published!"}</h1>
    <p>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST — Serverwale AI Blog Agent</p>
  </div>
  <div class="body">
    <div class="card">
      <div class="label">Blog Title</div>
      <div class="value" style="font-size:16px;color:#f8fafc;font-weight:700;margin-top:4px">${blog.title}</div>
    </div>
    <div class="card">
      <div class="label">Meta Description</div>
      <p style="margin-top:6px">${blog.excerpt || "—"}</p>
    </div>
    <div class="card" style="display:flex;gap:24px;flex-wrap:wrap">
      <div><div class="label">Read Time</div><div class="value">${blog.estimatedReadTime || "—"}</div></div>
      <div><div class="label">Word Count</div><div class="value">${blog.wordCount || "—"}</div></div>
      <div><div class="label">Status</div><div class="value" style="color:#22c55e">Published ✅</div></div>
    </div>
    ${blog.tags ? `<div style="margin-top:12px"><div class="label" style="margin-bottom:6px">Tags</div>${blog.tags.split(",").map(t => `<span class="tag">${t.trim()}</span>`).join("")}</div>` : ""}
    ${isRewrite && blog.improvements ? `
    <div class="card" style="margin-top:16px">
      <div class="label">What Was Improved</div>
      <ul style="margin-top:8px">${blog.improvements.map(i => `<li>${i}</li>`).join("")}</ul>
    </div>` : ""}
    <div style="text-align:center;margin-top:20px">
      <a href="https://serverwale.com/#/blog" class="btn">View on Website →</a>
    </div>
  </div>
  <div class="footer">Auto-published by Serverwale AI Blog Agent. Do not reply.</div>
</div></body></html>`;

  try {
    await getTransporter().sendMail({
      from: `"Serverwale Blog Agent" <${FROM_EMAIL}>`,
      to: NOTIFY_EMAIL,
      subject,
      html,
    });
    console.log(`[BlogAgent] 📧 Email sent: ${subject}`);
  } catch (err) {
    console.error("[BlogAgent] Email failed:", err.message);
  }
}

/* ═══════════════════════════════════════════════════════════════
   7. SCHEDULE MANAGEMENT (persisted to JSON file)
═══════════════════════════════════════════════════════════════ */
function loadSchedules() {
  try {
    if (fs.existsSync(SCHEDULES_FILE)) {
      return JSON.parse(fs.readFileSync(SCHEDULES_FILE, "utf8"));
    }
  } catch { /* ignore */ }
  return [];
}

function saveSchedules(schedules) {
  fs.writeFileSync(SCHEDULES_FILE, JSON.stringify(schedules, null, 2));
}

function getSchedules() {
  return loadSchedules();
}

function createSchedule(config) {
  const schedules = loadSchedules();
  const newSchedule = {
    id: Date.now().toString(),
    name: config.name || "Blog Schedule",
    frequency: config.frequency || "weekly",   // daily | weekly
    dayOfWeek: config.dayOfWeek ?? 1,          // 0=Sun, 1=Mon...6=Sat (for weekly)
    time: config.time || "09:00",              // HH:MM 24h
    blogsPerRun: config.blogsPerRun || 1,      // how many blogs per scheduled run
    autoPickTopics: config.autoPickTopics !== false, // true = AI picks
    topics: config.topics || [],               // user-provided topics array
    targetLength: config.targetLength || "medium",
    active: true,
    createdAt: new Date().toISOString(),
    lastRun: null,
    totalPublished: 0,
  };
  schedules.push(newSchedule);
  saveSchedules(schedules);
  return newSchedule;
}

function updateSchedule(id, changes) {
  const schedules = loadSchedules();
  const idx = schedules.findIndex(s => s.id === id);
  if (idx === -1) return null;
  schedules[idx] = { ...schedules[idx], ...changes };
  saveSchedules(schedules);
  return schedules[idx];
}

function deleteSchedule(id) {
  const schedules = loadSchedules().filter(s => s.id !== id);
  saveSchedules(schedules);
}

/* ═══════════════════════════════════════════════════════════════
   8. RUN A SCHEDULED PUBLISH (called by cron)
═══════════════════════════════════════════════════════════════ */
async function runScheduledPublish(schedule) {
  console.log(`[BlogAgent] ⏰ Running schedule: "${schedule.name}" — ${schedule.blogsPerRun} blog(s)`);

  const topicsToUse = [];

  if (schedule.autoPickTopics || !schedule.topics.length) {
    // AI picks topics
    const picked = await autoPickTopics(schedule.blogsPerRun);
    topicsToUse.push(...picked);
  } else {
    // Use user-provided topics (cycle through them)
    for (let i = 0; i < schedule.blogsPerRun; i++) {
      const topic = schedule.topics[i % schedule.topics.length];
      topicsToUse.push({
        title: topic,
        primaryKeyword: topic,
        secondaryKeywords: [],
        slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      });
    }
  }

  const published = [];
  for (const topic of topicsToUse) {
    try {
      console.log(`[BlogAgent] Generating: "${topic.title}"`);
      const blogData = await generateBlogFromTopic({
        title: topic.title,
        primaryKeyword: topic.primaryKeyword || topic.title,
        secondaryKeywords: topic.secondaryKeywords || [],
        slug: topic.slug || "",
        targetLength: schedule.targetLength || "medium",
      });

      const saved = await publishBlogToDB(blogData);
      await sendPublishEmail({ ...blogData, ...saved });
      published.push({ ...saved, estimatedReadTime: blogData.estimatedReadTime });
      console.log(`[BlogAgent] ✅ Published: "${blogData.title}" (ID: ${saved.id})`);
    } catch (err) {
      console.error(`[BlogAgent] ❌ Failed to publish "${topic.title}":`, err.message);
    }
  }

  // Update schedule metadata
  updateSchedule(schedule.id, {
    lastRun: new Date().toISOString(),
    totalPublished: (schedule.totalPublished || 0) + published.length,
  });

  return published;
}

/* ═══════════════════════════════════════════════════════════════
   9. GENERATE CRON EXPRESSION FROM SCHEDULE
═══════════════════════════════════════════════════════════════ */
function buildCronExpr(schedule) {
  const [hour, minute] = schedule.time.split(":").map(Number);
  if (schedule.frequency === "daily") {
    return `${minute} ${hour} * * *`;
  }
  if (schedule.frequency === "weekly") {
    return `${minute} ${hour} * * ${schedule.dayOfWeek}`;
  }
  // custom frequencies
  if (schedule.frequency === "twice-weekly") {
    const day2 = (schedule.dayOfWeek + 3) % 7;
    return `${minute} ${hour} * * ${schedule.dayOfWeek},${day2}`;
  }
  return `${minute} ${hour} * * 1`; // fallback: Monday
}

/* ═══════════════════════════════════════════════════════════════
   10. START ALL ACTIVE SCHEDULES
═══════════════════════════════════════════════════════════════ */
const activeCronJobs = new Map(); // scheduleId -> cron task

function startAllSchedules() {
  const schedules = loadSchedules();
  schedules.filter(s => s.active).forEach(schedule => {
    startCronForSchedule(schedule);
  });
  console.log(`[BlogAgent] ✅ ${schedules.filter(s => s.active).length} blog schedule(s) activated`);
}

function startCronForSchedule(schedule) {
  // Stop existing cron if any
  if (activeCronJobs.has(schedule.id)) {
    activeCronJobs.get(schedule.id).stop();
  }

  const expr = buildCronExpr(schedule);
  const task = cron.schedule(expr, async () => {
    try {
      await runScheduledPublish(schedule);
    } catch (err) {
      console.error("[BlogAgent] Schedule error:", err.message);
    }
  }, { timezone: "Asia/Kolkata" });

  activeCronJobs.set(schedule.id, task);
  console.log(`[BlogAgent] ⏰ Schedule "${schedule.name}" → cron: ${expr}`);
}

function stopCronForSchedule(id) {
  if (activeCronJobs.has(id)) {
    activeCronJobs.get(id).stop();
    activeCronJobs.delete(id);
  }
}

/* ═══════════════════════════════════════════════════════════════
   11. MANUAL: GENERATE & PUBLISH NOW (on-demand)
═══════════════════════════════════════════════════════════════ */
async function generateAndPublishNow({ topic, primaryKeyword, secondaryKeywords = [], targetLength = "medium" }) {
  const blogData = await generateBlogFromTopic({
    title: topic,
    primaryKeyword: primaryKeyword || topic,
    secondaryKeywords,
    targetLength,
  });
  const saved = await publishBlogToDB(blogData);
  await sendPublishEmail({ ...blogData, ...saved });
  return { ...blogData, ...saved };
}

/* ═══════════════════════════════════════════════════════════════
   12. MANUAL: REWRITE EXISTING BLOG
═══════════════════════════════════════════════════════════════ */
async function rewriteAndPublish(blogId) {
  // Fetch existing blog from DB
  const existing = await new Promise((resolve, reject) => {
    db.query("SELECT * FROM blogs WHERE id=? LIMIT 1", [blogId], (err, rows) => {
      if (err || !rows.length) return reject(new Error("Blog not found"));
      resolve(rows[0]);
    });
  });

  const rewritten = await rewriteBlog(existing);
  await updateBlogInDB(blogId, rewritten);
  await sendPublishEmail({ ...rewritten, id: blogId }, true);
  return { ...rewritten, id: blogId };
}

module.exports = {
  autoPickTopics,
  generateBlogFromTopic,
  rewriteBlog,
  publishBlogToDB,
  updateBlogInDB,
  sendPublishEmail,
  generateAndPublishNow,
  rewriteAndPublish,
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  startAllSchedules,
  startCronForSchedule,
  stopCronForSchedule,
  runScheduledPublish,
};
