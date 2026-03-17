const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db = require("../db");

/* ======================================================
   MULTER CONFIG
====================================================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products");
  },
  filename: (req, file, cb) => {
    const unique =
      Date.now() + "-" + Math.random().toString(36).slice(2);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* ======================================================
   UPLOAD IMAGES (1 MAIN + 3 EXTRA)
====================================================== */
router.post(
  "/:product_id",
  upload.fields([
    { name: "main", maxCount: 1 },
    { name: "extras", maxCount: 3 },
  ]),
  async (req, res) => {
    const productId = Number(req.params.product_id);

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: "Invalid product id",
      });
    }

    try {
      /* MAIN IMAGE */
      if (req.files?.main?.length) {
        const mainImage = req.files.main[0].filename;

        await db.promise().query(
          "UPDATE products SET image = ? WHERE id = ?",
          [mainImage, productId]
        );
      }

      /* EXTRA IMAGES */
      if (req.files?.extras?.length) {
        /* 🧹 REMOVE OLD EXTRA IMAGES */
        await db.promise().query(
          "DELETE FROM product_images WHERE product_id = ?",
          [productId]
        );

        const values = req.files.extras.map(file => [
          productId,
          file.filename,
        ]);

        await db.promise().query(
          "INSERT INTO product_images (product_id, image) VALUES ?",
          [values]
        );
      }

      res.json({ success: true });
    } catch (err) {
      console.error("Image upload error ❌", err);
      res.status(500).json({
        success: false,
        error: "Image upload failed",
      });
    }
  }
);

module.exports = router;
