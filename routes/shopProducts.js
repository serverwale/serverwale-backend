const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ================================
   ENSURE UPLOAD DIR EXISTS
================================ */
const uploadDir = path.join(__dirname, "..", "uploads", "shop");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

/* ================================
   MULTER CONFIG
================================ */
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const name = Date.now() + "-" + Math.random().toString(36).slice(2);
    cb(null, name + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Multi-field upload: main image + up to 5 extra images
const uploadFields = multer({ storage }).fields([
  { name: "image",  maxCount: 1 },
  { name: "images", maxCount: 5 },
]);

/* ================================
   HELPERS
================================ */
const parseJSON = (val) => {
  if (!val) return [];
  if (typeof val === "object") return val;
  try { return JSON.parse(val); } catch { return []; }
};

const parseProduct = (p) => ({
  ...p,
  tags: parseJSON(p.tags),
  features: parseJSON(p.features),
  specifications: parseJSON(p.specifications),
  images: parseJSON(p.images),
  faqs: parseJSON(p.faqs),
  video_url: p.video_url || null,
});

/* ================================
   GET CATEGORIES
================================ */
router.get("/categories", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT DISTINCT category FROM shop_products ORDER BY category ASC"
    );
    res.json(rows.map(r => r.category));
  } catch (err) {
    console.error("GET CATEGORIES ❌", err);
    res.status(500).json({ error: "DB error" });
  }
});

/* ================================
   GET ALL PRODUCTS
================================ */
router.get("/", async (req, res) => {
  try {
    const { category, featured, search } = req.query;
    let sql = "SELECT * FROM shop_products WHERE 1=1";
    const params = [];

    if (category && category !== "All") {
      // Escape for safe SQL string interpolation
      const safe = category.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/%/g, "\\%").replace(/_/g, "\\_");
      sql += ` AND (category = '${safe}' OR category LIKE '${safe}, %' OR category LIKE '%, ${safe}, %' OR category LIKE '%, ${safe}')`;
    }
    if (featured === "1") {
      sql += " AND is_featured = 1";
    }
    if (search) {
      sql += " AND (name LIKE ? OR short_description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += " ORDER BY is_featured DESC, created_at DESC";

    const [rows] = await db.promise().query(sql, params);
    res.json(rows.map(parseProduct));
  } catch (err) {
    console.error("GET SHOP PRODUCTS ❌", err);
    res.status(500).json({ error: "DB error" });
  }
});

/* ================================
   GET SINGLE PRODUCT
================================ */
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [[product]] = await db.promise().query(
      "SELECT * FROM shop_products WHERE id = ?", [id]
    );
    if (!product) return res.status(404).json({ error: "Not found" });

    const [reviews] = await db.promise().query(
      "SELECT * FROM shop_product_reviews WHERE product_id = ? ORDER BY created_at DESC",
      [id]
    );

    // Related products — match on first/primary category tag
    const primaryCat = (product.category || "").split(",")[0].trim();
    const safeCat = primaryCat.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/%/g, "\\%").replace(/_/g, "\\_");
    const [related] = await db.promise().query(
      `SELECT * FROM shop_products
       WHERE (category = '${safeCat}' OR category LIKE '${safeCat}, %'
              OR category LIKE '%, ${safeCat}, %' OR category LIKE '%, ${safeCat}')
       AND id != ? LIMIT 6`,
      [id]
    );

    res.json({
      product: parseProduct(product),
      reviews,
      related: related.map(parseProduct),
    });
  } catch (err) {
    console.error("GET SINGLE SHOP PRODUCT ❌", err);
    res.status(500).json({ error: "DB error" });
  }
});

/* ================================
   CREATE PRODUCT
================================ */
router.post("/", uploadFields, async (req, res) => {
  try {
    const {
      name, slug, short_description, full_description,
      price, original_price, discount_percent, category,
      tags, features, specifications, warranty,
      stock_status, is_featured, badge, video_url
    } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });

    const mainImg  = req.files?.image?.[0]  ? `uploads/shop/${req.files.image[0].filename}`  : null;
    const extraImgs = (req.files?.images || []).map(f => `uploads/shop/${f.filename}`);
    const genSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const tagsArr = typeof tags === "string" ? tags.split(",").map(t => t.trim()).filter(Boolean) : [];
    const featuresArr = typeof features === "string" ? features.split(",").map(f => f.trim()).filter(Boolean) : [];
    let specsObj = {};
    if (specifications) {
      try { specsObj = JSON.parse(specifications); } catch { specsObj = {}; }
    }

    await db.promise().query(
      `INSERT INTO shop_products
       (name, slug, short_description, full_description, price, original_price, discount_percent,
        category, tags, features, specifications, warranty, stock_status, image, images,
        is_featured, badge, video_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, genSlug, short_description || null, full_description || null,
        price || null, original_price || null, parseInt(discount_percent) || 0,
        category || null,
        JSON.stringify(tagsArr), JSON.stringify(featuresArr), JSON.stringify(specsObj),
        warranty || null, stock_status || "in_stock",
        mainImg, JSON.stringify(extraImgs),
        is_featured === "1" ? 1 : 0, badge || null, video_url || null,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("CREATE SHOP PRODUCT ❌", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================================
   UPDATE PRODUCT
================================ */
router.put("/:id", uploadFields, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      name, slug, short_description, full_description,
      price, original_price, discount_percent, category,
      tags, features, specifications, warranty,
      stock_status, is_featured, badge, video_url
    } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });

    const tagsArr = typeof tags === "string" ? tags.split(",").map(t => t.trim()).filter(Boolean) : [];
    const featuresArr = typeof features === "string" ? features.split(",").map(f => f.trim()).filter(Boolean) : [];
    let specsObj = {};
    if (specifications) {
      try { specsObj = JSON.parse(specifications); } catch { specsObj = {}; }
    }

    const genSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    let sql = `UPDATE shop_products SET
      name=?, slug=?, short_description=?, full_description=?,
      price=?, original_price=?, discount_percent=?,
      category=?, tags=?, features=?, specifications=?,
      warranty=?, stock_status=?, is_featured=?, badge=?, video_url=?`;
    const params = [
      name, genSlug, short_description || null, full_description || null,
      price || null, original_price || null, parseInt(discount_percent) || 0,
      category || null,
      JSON.stringify(tagsArr), JSON.stringify(featuresArr), JSON.stringify(specsObj),
      warranty || null, stock_status || "in_stock", is_featured === "1" ? 1 : 0,
      badge || null, video_url || null,
    ];

    // New main image
    if (req.files?.image?.[0]) {
      sql += ", image=?";
      params.push(`uploads/shop/${req.files.image[0].filename}`);
    }

    // New extra images (replace existing if uploaded)
    if (req.files?.images?.length) {
      const extraImgs = req.files.images.map(f => `uploads/shop/${f.filename}`);
      sql += ", images=?";
      params.push(JSON.stringify(extraImgs));
    }

    sql += " WHERE id=?";
    params.push(id);

    await db.promise().query(sql, params);
    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE SHOP PRODUCT ❌", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================================
   DELETE PRODUCT
================================ */
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [[product]] = await db.promise().query(
      "SELECT image FROM shop_products WHERE id=?", [id]
    );
    if (!product) return res.status(404).json({ error: "Not found" });

    await db.promise().query("DELETE FROM shop_product_reviews WHERE product_id=?", [id]);
    await db.promise().query("DELETE FROM shop_products WHERE id=?", [id]);

    if (product.image) {
      const imgPath = path.join(__dirname, "..", product.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE SHOP PRODUCT ❌", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================================
   ADD REVIEW
================================ */
router.post("/:id/reviews", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { reviewer_name, company, rating, review } = req.body;

    await db.promise().query(
      "INSERT INTO shop_product_reviews (product_id, reviewer_name, company, rating, review) VALUES (?, ?, ?, ?, ?)",
      [id, reviewer_name || "Anonymous", company || null, parseInt(rating) || 5, review || ""]
    );

    // Update aggregate rating
    const [[agg]] = await db.promise().query(
      "SELECT AVG(rating) as avg_rating, COUNT(*) as cnt FROM shop_product_reviews WHERE product_id=?",
      [id]
    );
    await db.promise().query(
      "UPDATE shop_products SET rating=?, review_count=? WHERE id=?",
      [parseFloat(agg.avg_rating).toFixed(1), agg.cnt, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("ADD REVIEW ❌", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
