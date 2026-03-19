/**
 * add_images.js
 * Assigns category-specific Unsplash images to every shop product.
 * Run: node add_images.js
 */

const db = require("./db");

// ─── Category image pools (main + extras) ───────────────────────────────────
// Format: [mainImg, extra1, extra2, extra3, extra4]
// All are reliable images.unsplash.com CDN URLs (permanent photo IDs).

const IMG = {
  "servers": [
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80",
    "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&q=80",
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    "https://images.unsplash.com/photo-1600267185393-e158a98703de?w=600&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
    "https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=600&q=80",
    "https://images.unsplash.com/photo-1548092372-0d1bd40894a3?w=600&q=80",
  ],
  "workstations": [
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80",
    "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&q=80",
    "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=600&q=80",
    "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&q=80",
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80",
    "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&q=80",
  ],
  "laptops": [
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80",
    "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&q=80",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80",
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80",
  ],
  "storage": [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    "https://images.unsplash.com/photo-1597733336794-12d05021d510?w=600&q=80",
    "https://images.unsplash.com/photo-1540829917886-91ab031b1764?w=600&q=80",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80",
  ],
  "networking": [
    "https://images.unsplash.com/photo-1586772002130-7a5f8979ade4?w=600&q=80",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80",
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
    "https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=600&q=80",
    "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&q=80",
  ],
  "components": [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=600&q=80",
    "https://images.unsplash.com/photo-1562976540-1502c2145185?w=600&q=80",
    "https://images.unsplash.com/photo-1555617766-c94804975da0?w=600&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&q=80",
  ],
  "ups": [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80",
    "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&q=80",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80",
    "https://images.unsplash.com/photo-1600267185393-e158a98703de?w=600&q=80",
  ],
  "software": [
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80",
    "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80",
  ],
  "accessories": [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80",
    "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=600&q=80",
    "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&q=80",
  ],
  "default": [
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80",
    "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&q=80",
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    "https://images.unsplash.com/photo-1600267185393-e158a98703de?w=600&q=80",
  ],
};

// ─── Map product category to image pool key ──────────────────────────────────
function poolKey(category = "") {
  const c = category.toLowerCase();
  if (c.startsWith("servers")) return "servers";
  if (c.startsWith("workstations")) return "workstations";
  if (c.startsWith("laptops")) return "laptops";
  if (c.startsWith("storage")) return "storage";
  if (c.startsWith("networking")) return "networking";
  if (c.startsWith("components") || c.startsWith("parts")) return "components";
  if (c.startsWith("ups") || c.startsWith("power")) return "ups";
  if (c.startsWith("software") || c.startsWith("licenses")) return "software";
  if (c.startsWith("accessories") || c.startsWith("peripherals")) return "accessories";
  return "default";
}

// ─── Deterministic pick from a pool using product id ────────────────────────
function pick(pool, id, offset = 0) {
  // Knuth multiplicative hash for even distribution
  const h = Math.abs((id * 2654435761 + offset * 1000003) >>> 0);
  return pool[h % pool.length];
}

// ─── Build images JSON array (4 extras) ─────────────────────────────────────
function buildExtras(pool, id) {
  const used = new Set();
  const extras = [];
  for (let offset = 1; extras.length < 4; offset++) {
    const url = pick(pool, id, offset);
    if (!used.has(url)) {
      used.add(url);
      extras.push(url);
    }
    if (offset > 50) break; // safety
  }
  return JSON.stringify(extras);
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function run() {
  const dbp = db.promise();

  const [products] = await dbp.query(
    "SELECT id, name, category, image, images FROM shop_products ORDER BY id"
  );
  console.log(`Total products: ${products.length}`);

  let updatedMain = 0;
  let updatedExtras = 0;
  let skipped = 0;

  for (const p of products) {
    const pool = IMG[poolKey(p.category)];

    let newMain = p.image;
    let newImages = p.images;

    // Assign main image if missing, local path, or hotlink-blocked domain
    const needsMain =
      !p.image ||
      p.image.trim() === "" ||
      p.image.includes("serverwale.com") ||
      !p.image.startsWith("http");

    if (needsMain) {
      newMain = pick(pool, p.id, 0);
      updatedMain++;
    }

    // Always assign extras (overwrite if empty or only 1-2 entries)
    let extrasArr = [];
    try {
      extrasArr = JSON.parse(p.images || "[]");
    } catch (_) {}

    const needsExtras =
      !Array.isArray(extrasArr) ||
      extrasArr.length < 4 ||
      extrasArr.some((u) => typeof u !== "string" || u.trim() === "");

    if (needsExtras) {
      // Build 4 extras different from main
      const usedMain = newMain;
      const usedSet = new Set([usedMain]);
      const extras = [];
      for (let offset = 1; extras.length < 4; offset++) {
        const url = pick(pool, p.id, offset);
        if (!usedSet.has(url)) {
          usedSet.add(url);
          extras.push(url);
        }
        if (offset > 80) break;
      }
      newImages = JSON.stringify(extras);
      updatedExtras++;
    }

    if (newMain !== p.image || newImages !== p.images) {
      await dbp.query(
        "UPDATE shop_products SET image=?, images=? WHERE id=?",
        [newMain, newImages, p.id]
      );
    } else {
      skipped++;
    }
  }

  console.log(`\n✅ Done:`);
  console.log(`   Main image updated : ${updatedMain}`);
  console.log(`   Extras updated     : ${updatedExtras}`);
  console.log(`   Already fine       : ${skipped}`);
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
