// routes/productWarranty.js
const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", async (req, res) => {
  const { product_id, warranty_text } = req.body;

  try {
    await db.promise().query(
      `
      INSERT INTO product_warranty (product_id, warranty_text)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        warranty_text = VALUES(warranty_text)
      `,
      [product_id, warranty_text]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Warranty save error ❌", err);
    res.status(500).json({ error: "Warranty save failed" });
  }
});

module.exports = router;
