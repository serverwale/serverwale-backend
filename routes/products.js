const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ── Auto-add video_url column if missing ── */
db.promise().query(
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url VARCHAR(1000) DEFAULT NULL`
).catch(() => {});


/* ===============================
   MULTER CONFIG
================================ */
const storage = multer.diskStorage({
  destination: (_, file, cb) => {
    const dir = file.mimetype.startsWith("video/") ? "uploads/products/videos" : "uploads/products";
    fs.mkdirSync(path.join(__dirname, "..", dir), { recursive: true });
    cb(null, dir);
  },
  filename: (_, file, cb) => {
    const name = Date.now() + "-" + Math.random().toString(36).slice(2);
    cb(null, name + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } });

/* ===============================
   GET PRODUCTS (BY CATEGORY)
================================ */
router.get("/", async (req, res) => {
  const rawCat    = req.query.category_id;
  const categoryId = rawCat !== undefined ? parseInt(rawCat, 10) : null;

  // If category_id was provided but invalid → 400
  if (rawCat !== undefined && isNaN(categoryId)) {
    return res.status(400).json({ error: "Invalid category_id" });
  }

  try {
    const [rows] = await db.promise().query(
      categoryId === null
        ? `SELECT id, title, description, image, tag, features, category_id, created_at
           FROM products ORDER BY created_at DESC`
        : `SELECT id, title, description, image, tag, features, category_id, created_at
           FROM products WHERE category_id = ? ORDER BY created_at DESC`,
      categoryId === null ? [] : [categoryId]
    );

    res.json(
      rows.map(p => ({
        ...p,
        features: (() => {
          if (!p.features) return [];
          try {
            return JSON.parse(p.features);
          } catch {
            return [p.features];
          }
        })(),
      }))
    );
  } catch (err) {
    console.error("Fetch products ❌", err);
    res.status(500).json({ error: "DB error" });
  }
});


/* ===============================
   ADD PRODUCT ✅
================================ */
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "extras", maxCount: 4 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, description, tag, features, category_id, video_url } = req.body;
      const catId = Number(category_id);
      if (!title || !catId || Number.isNaN(catId)) {
        return res.status(400).json({ error: "title and category_id required" });
      }

      const mainFile  = req.files?.image?.[0];
      const videoFile = req.files?.video?.[0];
      const imagePath = mainFile ? `uploads/products/${mainFile.filename}` : null;
      const videoPath = videoFile
        ? `uploads/products/videos/${videoFile.filename}`
        : (video_url || null);

      const [result] = await db.promise().query(
        `INSERT INTO products (title, description, image, tag, features, category_id, video_url)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          description || "",
          imagePath,
          tag || null,
          JSON.stringify(features ? features.split(",").map(f => f.trim()).filter(Boolean) : []),
          catId,
          videoPath,
        ]
      );

      const newId = result.insertId;

      /* extra images */
      if (req.files?.extras?.length) {
        const vals = req.files.extras.map(f => [newId, `uploads/products/${f.filename}`]);
        await db.promise().query("INSERT INTO product_images (product_id, image) VALUES ?", [vals]);
      }

      res.json({ success: true, id: newId });
    } catch (err) {
      console.error("Add product ❌", err);
      res.status(500).json({ error: err.message });
    }
  }
);

/* ===============================
   UPDATE PRODUCT ✅
================================ */
router.put(
  "/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "extras", maxCount: 4 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, description, tag, features, video_url } = req.body;
      if (!title) return res.status(400).json({ error: "title required" });

      const mainFile  = req.files?.image?.[0];
      const videoFile = req.files?.video?.[0];
      const videoPath = videoFile ? `uploads/products/videos/${videoFile.filename}` : (video_url ?? undefined);

      const sets   = ["title=?", "tag=?"];
      const params = [title, tag || null];

      /* Only update description if explicitly provided */
      if (description !== undefined) {
        sets.push("description=?");
        params.push(description || "");
      }

      /* Handle features as string OR array (JSON body sends array, FormData sends string) */
      if (features !== undefined) {
        let featuresArr = [];
        if (Array.isArray(features)) {
          featuresArr = features.map(f => String(f).trim()).filter(Boolean);
        } else if (typeof features === "string" && features.trim()) {
          featuresArr = features.split(",").map(f => f.trim()).filter(Boolean);
        }
        sets.push("features=?");
        params.push(JSON.stringify(featuresArr));
      }

      if (mainFile) { sets.push("image=?"); params.push(`uploads/products/${mainFile.filename}`); }
      if (videoPath !== undefined) { sets.push("video_url=?"); params.push(videoPath || null); }

      params.push(Number(req.params.id));
      await db.promise().query(`UPDATE products SET ${sets.join(",")} WHERE id=?`, params);

      /* extra images */
      if (req.files?.extras?.length) {
        await db.promise().query("DELETE FROM product_images WHERE product_id=?", [Number(req.params.id)]);
        const vals = req.files.extras.map(f => [Number(req.params.id), `uploads/products/${f.filename}`]);
        await db.promise().query("INSERT INTO product_images (product_id, image) VALUES ?", [vals]);
      }

      res.json({ success: true });
    } catch (err) {
      console.error("Update ❌", err);
      res.status(500).json({ error: err.message });
    }
  }
);



/* ===============================
   ENSURE UPLOAD DIR
================================ */
const uploadDir = path.join(__dirname, "..", "uploads", "products");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ===============================
   DELETE PRODUCT (FULL CLEANUP)
=============================== */
/* ===============================
   DELETE PRODUCT (FULL CLEANUP)
=============================== */
router.delete("/:id", async (req, res) => {
  const productId = parseInt(req.params.id, 10);

  if (isNaN(productId)) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  try {
    // 🔥 START TRANSACTION
    await db.promise().query("START TRANSACTION");

    // 1️⃣ CHECK PRODUCT
    const [[product]] = await db.promise().query(
      "SELECT image FROM products WHERE id = ?",
      [productId]
    );

    if (!product) {
      await db.promise().query("ROLLBACK");
      return res.status(404).json({ error: "Product not found" });
    }

    // 2️⃣ DELETE CHILD TABLE DATA
    await db.promise().query("DELETE FROM product_images WHERE product_id=?", [productId]);
    await db.promise().query("DELETE FROM product_reviews WHERE product_id=?", [productId]);
    await db.promise().query("DELETE FROM product_faqs WHERE product_id=?", [productId]);
    await db.promise().query("DELETE FROM product_specifications WHERE product_id=?", [productId]);
    await db.promise().query("DELETE FROM product_descriptions WHERE product_id=?", [productId]);
    await db.promise().query("DELETE FROM product_warranty WHERE product_id=?", [productId]);

    // 3️⃣ DELETE PRODUCT
    await db.promise().query(
      "DELETE FROM products WHERE id = ?",
      [productId]
    );

    // 4️⃣ DELETE IMAGE FILE (SAFE)
    if (product.image) {
      const imgPath = path.join(__dirname, "..", product.image);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    // 🔥 COMMIT
    await db.promise().query("COMMIT");

    res.json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (err) {
    // 🔥 ROLLBACK ON ERROR
    await db.promise().query("ROLLBACK");

    console.error("DELETE PRODUCT ERROR ❌", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete product",
    });
  }
});





/* ===============================
   GET SINGLE PRODUCT (ADMIN DETAIL)
================================ */
router.get("/:id", async (req, res) => {
  try {
    const productId = Number(req.params.id);
    if (!productId) {
      return res.status(400).json({ error: "Invalid product id" });
    }

    /* PRODUCT */
    const [[product]] = await db
      .promise()
      .query("SELECT * FROM products WHERE id=?", [productId]);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    /* DESCRIPTION */
    const [[description]] = await db
      .promise()
      .query(
        "SELECT short_description,long_description_1,long_description_2,long_description_3 FROM product_descriptions WHERE product_id=?",
        [productId]
      );

    /* SPECIFICATIONS */
    const [specifications] = await db
      .promise()
      .query(
        "SELECT spec_key, spec_value FROM product_specifications WHERE product_id=?",
        [productId]
      );

    /* WARRANTY */
    const [[warranty]] = await db
      .promise()
      .query(
        "SELECT warranty_text FROM product_warranty WHERE product_id=?",
        [productId]
      );

    /* REVIEWS */
    const [reviews] = await db
      .promise()
      .query(
        "SELECT company_name, rating, review FROM product_reviews WHERE product_id=?",
        [productId]
      );

    /* FAQ */
    const [faqs] = await db
      .promise()
      .query(
        "SELECT question, answer FROM product_faqs WHERE product_id=?",
        [productId]
      );

    /* EXTRA IMAGES */
    const [images] = await db
      .promise()
      .query(
        "SELECT image FROM product_images WHERE product_id=? ORDER BY id ASC",
        [productId]
      );

    res.json({
      product,
      description: description || {
        short_description: "",
        long_description_1: "",
        long_description_2: "",
        long_description_3: "",
      },
      specifications: specifications || [],
      warranty: warranty?.warranty_text || "",
      reviews: reviews || [],
      faqs: faqs || [],
      images: images || [],
    });
  } catch (err) {
    console.error("GET PRODUCT ERROR ❌", err);
    res.status(500).json({ error: "Failed to load product" });
  }
});

/* ===============================
   IMAGE UPLOAD
================================ */
router.post(
  "/:product_id/images",
  upload.fields([
    { name: "main", maxCount: 1 },
    { name: "extras", maxCount: 4 },
  ]),
  async (req, res) => {
    try {
      const productId = Number(req.params.product_id);
      if (!productId) {
        return res.status(400).json({ success: false });
      }

      if (req.files?.main?.length) {
        await db.promise().query(
          "UPDATE products SET image=? WHERE id=?",
          [`uploads/products/${req.files.main[0].filename}`, productId]
        );
      }

      if (req.files?.extras?.length) {
        await db.promise().query(
          "DELETE FROM product_images WHERE product_id=?",
          [productId]
        );

        const values = req.files.extras.map(f => [
          productId,
          `uploads/products/${f.filename}`,
        ]);

        await db
          .promise()
          .query(
            "INSERT INTO product_images (product_id,image) VALUES ?",
            [values]
          );
      }

      res.json({ success: true });
    } catch (err) {
      console.error("IMAGE UPLOAD ERROR ❌", err);
      res.status(500).json({ success: false });
    }
  }
);

module.exports = router;
