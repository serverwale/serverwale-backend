const express = require("express");
const router = express.Router();
const db = require("../db");

/* ================================
   GET ALL WITH PRODUCT COUNT
================================ */
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        sc.id,
        sc.name,
        sc.created_at,
        COUNT(sp.id) AS product_count
      FROM shop_categories sc
      LEFT JOIN shop_products sp
        ON (sp.category = sc.name
          OR sp.category LIKE CONCAT(sc.name, ', %')
          OR sp.category LIKE CONCAT('%, ', sc.name, ', %')
          OR sp.category LIKE CONCAT('%, ', sc.name))
      GROUP BY sc.id, sc.name, sc.created_at
      ORDER BY sc.name ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET SHOP CATEGORIES ❌", err);
    res.status(500).json({ error: "DB error" });
  }
});

/* ================================
   CREATE CATEGORY
================================ */
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Name is required" });

    await db.promise().query(
      "INSERT INTO shop_categories (name) VALUES (?)",
      [name.trim()]
    );
    res.json({ success: true });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Category already exists" });
    }
    console.error("CREATE CATEGORY ❌", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================================
   UPDATE CATEGORY
================================ */
router.put("/:id", async (req, res) => {
  try {
    const { name } = req.body;
    const id = parseInt(req.params.id);
    if (!name?.trim()) return res.status(400).json({ error: "Name is required" });

    // Get old name first
    const [[old]] = await db.promise().query(
      "SELECT name FROM shop_categories WHERE id=?", [id]
    );
    if (!old) return res.status(404).json({ error: "Not found" });

    // Update category name AND products that use it
    await db.promise().query("UPDATE shop_categories SET name=? WHERE id=?", [name.trim(), id]);
    await db.promise().query("UPDATE shop_products SET category=? WHERE category=?", [name.trim(), old.name]);

    res.json({ success: true });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Category already exists" });
    }
    console.error("UPDATE CATEGORY ❌", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================================
   DELETE CATEGORY
================================ */
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const [[cat]] = await db.promise().query(
      "SELECT name FROM shop_categories WHERE id=?", [id]
    );
    if (!cat) return res.status(404).json({ error: "Not found" });

    // Check if products exist
    const [[cnt]] = await db.promise().query(
      "SELECT COUNT(*) AS c FROM shop_products WHERE category=?", [cat.name]
    );
    if (cnt.c > 0) {
      return res.status(409).json({
        error: `Cannot delete — ${cnt.c} product(s) use this category. Reassign or delete them first.`
      });
    }

    await db.promise().query("DELETE FROM shop_categories WHERE id=?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE CATEGORY ❌", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
