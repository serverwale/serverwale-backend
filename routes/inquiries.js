const express = require("express");
const db = require("../db");

const router = express.Router();

/* =========================
   POST - Create Inquiry (Contact Form)
========================= */
router.post("/", (req, res) => {
  const { name, email, company, phone, requirement, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO contact_inquiries (full_name, email, phone, company, requirement, details, status)
    VALUES (?, ?, ?, ?, ?, ?, 'new')
  `;

  db.query(sql, [name, email, phone || "", company || "", requirement || "", message], (err, result) => {
    if (err) {
      console.error("INQUIRY INSERT ERROR ❌", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    console.log("✅ Inquiry saved, ID:", result.insertId);
    res.json({ success: true, id: result.insertId });
  });
});

/* =========================
   GET inquiries counts
========================= */
router.get("/counts", (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) AS total,
      SUM(CASE WHEN COALESCE(status, 'new') = 'new' THEN 1 ELSE 0 END) AS new,
      SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) AS contacted,
      SUM(CASE WHEN status = 'not_contacted' THEN 1 ELSE 0 END) AS not_contacted,
      SUM(CASE WHEN status = 'interested' THEN 1 ELSE 0 END) AS interested,
      SUM(CASE WHEN status = 'not_interested' THEN 1 ELSE 0 END) AS not_interested,
      SUM(CASE WHEN status = 'old' THEN 1 ELSE 0 END) AS old
    FROM contact_inquiries
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Count error:", err);
      return res.status(500).json({ success: false });
    }

    res.json({ success: true, counts: results[0] });
  });
});

/* =========================
   GET inquiries (SAFE STATUS)
========================= */
router.get("/", (req, res) => {
  const { status = "all" } = req.query;

  let sql = `
    SELECT 
      id,
      full_name,
      email,
      company,
      requirement,
      details,
      created_at,
      COALESCE(status, 'new') AS status
    FROM contact_inquiries
    WHERE 1=1
  `;

  const params = [];

  if (status !== "all") {
    sql += " AND status = ?";
    params.push(status);
  }

  sql += " ORDER BY created_at DESC";

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("INQUIRY FETCH ERROR ❌", err);
      return res.status(500).json([]);
    }
    res.json(rows);
  });
});

/* =========================
   UPDATE inquiry status (SAFE)
========================= */
router.put("/:id/status", (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  const allowed = ["new", "contacted", "not_contacted", "interested", "not_interested", "old"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  db.query(
    "UPDATE contact_inquiries SET status=? WHERE id=?",
    [status, id],
    (err, result) => {
      if (err) {
        console.error("UPDATE ERROR ❌", err);
        return res.status(500).json({ success: false });
      }

      res.json({ success: true });
    }
  );
});

router.get("/counts", (req, res) => {
  db.query(
    `SELECT COUNT(*) AS total, SUM(status = 'new') AS newCount FROM contact_inquiries`,
    (err, results) => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true, counts: results[0] });
    }
  );
});


module.exports = router;
