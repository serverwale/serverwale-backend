const express = require("express");
const router = express.Router();
const db = require("../db");

/* =========================
   GET CATEGORIES
========================= */
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      c.id,
      c.name,
      COUNT(p.id) AS productCount
    FROM categories c
    LEFT JOIN products p 
      ON p.category_id = c.id
    GROUP BY c.id, c.name
    ORDER BY c.name ASC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("Category fetch error ❌", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(
      rows.map(r => ({
        id: Number(r.id),
        name: r.name,
        productCount: Number(r.productCount),
      }))
    );
  });
});

/* =========================
   ADD CATEGORY
========================= */
router.post("/", (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name required" });
  }

  db.query(
    "INSERT INTO categories (name) VALUES (?)",
    [name],
    (err, result) => {
      if (err) {
        console.error("Insert failed ❌", err);
        return res.status(500).json({ error: "Insert failed" });
      }

      res.json({
        id: result.insertId,
        name,
        productCount: 0,
      });
    }
  );
});

/* =========================
   UPDATE CATEGORY
========================= */
router.put("/:id", (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name required" });
  }

  db.query(
    "UPDATE categories SET name=? WHERE id=?",
    [name, req.params.id],
    err => {
      if (err) {
        console.error("Update failed ❌", err);
        return res.status(500).json({ error: "Update failed" });
      }

      res.json({ success: true });
    }
  );
});

/* =========================
   DELETE CATEGORY (SAFE)
========================= */
router.delete("/:id", (req, res) => {
  db.query(
    "SELECT COUNT(*) AS count FROM products WHERE category_id=?",
    [req.params.id],
    (err, rows) => {
      if (err) {
        console.error("Check failed ❌", err);
        return res.status(500).json({ error: "DB error" });
      }

      if (rows[0].count > 0) {
        return res.status(400).json({
          error: "Category has products. Cannot delete.",
        });
      }

      db.query(
        "DELETE FROM categories WHERE id=?",
        [req.params.id],
        err2 => {
          if (err2) {
            console.error("Delete failed ❌", err2);
            return res.status(500).json({ error: "Delete failed" });
          }

          res.json({ success: true });
        }
      );
    }
  );
});
db.query("SELECT DATABASE() as db", (err, result) => {
  if (!err) console.log("API is using DB:", result[0].db);
});


module.exports = router;
