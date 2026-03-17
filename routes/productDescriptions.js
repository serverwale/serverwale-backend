const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", async (req, res) => {
  const {
    product_id,
    short_description,
    long_description_1,
    long_description_2,
    long_description_3,
  } = req.body;

  try {
    await db.promise().query(
      `
      INSERT INTO product_descriptions
      (product_id, short_description, long_description_1, long_description_2, long_description_3)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        short_description = VALUES(short_description),
        long_description_1 = VALUES(long_description_1),
        long_description_2 = VALUES(long_description_2),
        long_description_3 = VALUES(long_description_3)
      `,
      [
        product_id,
        short_description,
        long_description_1,
        long_description_2,
        long_description_3,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Description save error ❌", err);
    res.status(500).json({ error: "Failed to save description" });
  }
});

module.exports = router;
