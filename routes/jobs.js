const express = require("express");
const db = require("../db");
const router = express.Router();

/* ============================
   GET — Public (active only)
============================ */
router.get("/public", (req, res) => {
  const { type } = req.query;
  let sql = "SELECT * FROM jobs WHERE is_active = 1";
  const params = [];
  if (type && type !== "all") {
    sql += " AND job_type = ?";
    params.push(type);
  }
  sql += " ORDER BY created_at DESC";
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Jobs public fetch error:", err);
      return res.status(500).json({ success: false, message: "DB error" });
    }
    res.json({ success: true, data: results });
  });
});

/* ============================
   GET — All (Admin)
============================ */
router.get("/", (req, res) => {
  db.query("SELECT * FROM jobs ORDER BY created_at DESC", (err, results) => {
    if (err) {
      console.error("Jobs admin fetch error:", err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, data: results });
  });
});

/* ============================
   POST — Create Job
============================ */
router.post("/", (req, res) => {
  const {
    title, location, job_type, employment_type,
    description, requirements, department, experience
  } = req.body;

  if (!title) return res.status(400).json({ success: false, message: "Title required" });

  const sql = `
    INSERT INTO jobs 
    (title, location, job_type, employment_type, description, requirements, department, experience, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `;
  db.query(
    sql,
    [title, location, job_type || "jobs", employment_type, description, requirements, department, experience],
    (err, result) => {
      if (err) {
        console.error("Job insert error:", err);
        return res.status(500).json({ success: false, message: err.message });
      }
      res.json({ success: true, id: result.insertId });
    }
  );
});

/* ============================
   PUT — Update Job
============================ */
router.put("/:id", (req, res) => {
  const {
    title, location, job_type, employment_type,
    description, requirements, department, experience
  } = req.body;

  const sql = `
    UPDATE jobs 
    SET title=?, location=?, job_type=?, employment_type=?, description=?, requirements=?, department=?, experience=?
    WHERE id=?
  `;
  db.query(
    sql,
    [title, location, job_type, employment_type, description, requirements, department, experience, req.params.id],
    (err) => {
      if (err) {
        console.error("Job update error:", err);
        return res.status(500).json({ success: false });
      }
      res.json({ success: true });
    }
  );
});

/* ============================
   PATCH — Toggle Active/Inactive
============================ */
router.patch("/:id/toggle", (req, res) => {
  db.query(
    "UPDATE jobs SET is_active = IF(is_active = 1, 0, 1) WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) {
        console.error("Job toggle error:", err);
        return res.status(500).json({ success: false });
      }
      res.json({ success: true });
    }
  );
});

/* ============================
   DELETE — Remove Job
============================ */
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM jobs WHERE id = ?", [req.params.id], (err) => {
    if (err) {
      console.error("Job delete error:", err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
});

module.exports = router;
