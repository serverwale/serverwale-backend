const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/bulk", async (req, res) => {
  const { product_id, faqs } = req.body;

  if (!product_id || !Array.isArray(faqs)) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  try {
    const values = faqs.map((faq) => [
      product_id,
      faq.question,
      faq.answer,
    ]);

    await db.promise().query(
      `
      INSERT INTO product_faqs (product_id, question, answer)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        answer = VALUES(answer)
      `,
      [values]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("FAQ save error ❌", err);
    res.status(500).json({ error: "Failed to save FAQs" });
  }
});

module.exports = router;
