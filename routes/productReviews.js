const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/bulk", async (req, res) => {
  const { product_id, reviews } = req.body;

  if (!product_id || !Array.isArray(reviews)) {
    return res.status(400).json({ success: false });
  }

  try {
    await db.promise().query(
      "DELETE FROM product_reviews WHERE product_id=?",
      [product_id]
    );

    if (reviews.length) {
      const values = reviews.map(r => [
        product_id,
        r.company_name,
        r.rating,
        r.review,
      ]);

      await db.promise().query(
        "INSERT INTO product_reviews (product_id, company_name, rating, review) VALUES ?",
        [values]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Review save ❌", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
