const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const OpenAI = require("openai");
const db = require("../db");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ============================
   In-Memory Conversation Store
============================ */
const memoryStore = {};

/* ============================
   Emma System Prompt
============================ */
const EMMA_PROMPT = `
You are Emma, a female AI assistant for ServerWale (serverwale.com).
You are a friendly, confident technical consultant and sales strategist.
Never say you are OpenAI. Always represent ServerWale.
`;

/* ============================
   GET - List Chat Sessions
============================ */
router.get("/sessions", (req, res) => {
  const sql = `
    SELECT 
      session_id,
      COUNT(*) AS message_count,
      MIN(created_at) AS started_at,
      MAX(created_at) AS last_message_at,
      (SELECT content FROM ai_chat_messages m2 WHERE m2.session_id = m.session_id AND m2.role = 'user' ORDER BY m2.created_at ASC LIMIT 1) AS first_message
    FROM ai_chat_messages m
    GROUP BY session_id
    ORDER BY last_message_at DESC
    LIMIT 50
  `;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error("Chat sessions fetch error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, sessions: rows || [] });
  });
});

/* ============================
   GET - Messages for a Session
============================ */
router.get("/session/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  db.query(
    "SELECT * FROM ai_chat_messages WHERE session_id = ? ORDER BY created_at ASC",
    [sessionId],
    (err, rows) => {
      if (err) {
        console.error("Chat messages fetch error:", err);
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, messages: rows || [] });
    }
  );
});

/* ============================
   GET - All Chat Sessions (paginated)
============================ */
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      session_id,
      COUNT(*) AS message_count,
      MIN(created_at) AS started_at,
      MAX(created_at) AS last_message_at,
      (SELECT content FROM ai_chat_messages m2 WHERE m2.session_id = m.session_id AND m2.role = 'user' ORDER BY m2.created_at ASC LIMIT 1) AS first_message
    FROM ai_chat_messages m
    GROUP BY session_id
    ORDER BY last_message_at DESC
    LIMIT 100
  `;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error("Chat list fetch error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, sessions: rows || [], total: rows ? rows.length : 0 });
  });
});

/* ============================
   CHAT API
============================ */
router.post("/", async (req, res) => {
  console.log("\n🔥 CHAT API HIT");
  console.log("BODY:", req.body);

  try {
    let { message, sessionId, lead } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ success: false, error: "Message required" });
    }

    if (!sessionId) sessionId = uuidv4();

    if (!memoryStore[sessionId]) {
      memoryStore[sessionId] = [{ role: "system", content: EMMA_PROMPT }];
    }

    memoryStore[sessionId].push({ role: "user", content: message });


    /* =======================
       OpenAI
    ======================= */
    let reply = "Thank you for your message. Our team will contact you shortly.";

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: memoryStore[sessionId],
        temperature: 0.4,
        max_tokens: 300,
      });

      reply = completion.choices[0].message.content;
    } catch (aiErr) {
      console.error("⚠️ OpenAI failed:", aiErr.message);
    }

    memoryStore[sessionId].push({ role: "assistant", content: reply });

    /* =======================
       Save Analytics
    ======================= */
    db.query(
      "INSERT INTO ai_analytics (session_id, user_message, ai_reply) VALUES (?, ?, ?)",
      [sessionId, message, reply],
      (err, result) => {
        if (err) {
          console.error("❌ Analytics insert error:", err.sqlMessage);
        } else {
          console.log("✅ Analytics saved, ID:", result.insertId);
        }
      }
    );

    /* =======================
       Save Chat Messages
    ======================= */
    db.query(
      "INSERT INTO ai_chat_messages (session_id, role, content) VALUES (?, ?, ?)",
      [sessionId, "user", message],
      (err) => {
        if (err) console.error("❌ User chat insert error:", err.sqlMessage);
      }
    );

    db.query(
      "INSERT INTO ai_chat_messages (session_id, role, content) VALUES (?, ?, ?)",
      [sessionId, "assistant", reply],
      (err) => {
        if (err) console.error("❌ AI chat insert error:", err.sqlMessage);
      }
    );

    return res.json({
      success: true,
      reply,
      sessionId,
    });

  } catch (err) {
    console.error("❌ CHAT API CRASH:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
