const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/bulk", async (req, res) => {
  const { product_id, specifications } = req.body;

  if (!product_id || !Array.isArray(specifications)) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const clean = specifications.filter(
    s => s.spec_key && s.spec_value
  );

  if (!clean.length) {
    return res.json({ success: true });
  }

  const values = clean.map(s => [
    product_id,
    s.spec_key.trim(),
    s.spec_value.trim(),
  ]);

  try {
    await db.promise().query(
      `
      INSERT INTO product_specifications (product_id, spec_key, spec_value)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        spec_value = VALUES(spec_value)
      `,
      [values]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("SPEC SAVE ERROR ❌", err);
    res.status(500).json({ error: "Spec save failed" });
  }
});

module.exports = router;

