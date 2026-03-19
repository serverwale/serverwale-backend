/**
 * scrape_images.js
 * – Scrapes real product images from serverwale.com
 * – Downloads & saves them to C:/Users/Kiara/Serverwale/Backend/uploads/shop/
 * – Updates DB with local paths so the running backend serves them
 *
 * Run: node scrape_images.js
 */

const axios  = require("axios");
const fs     = require("fs");
const path   = require("path");
const db     = require("./db");

// Where the RUNNING backend serves uploads from
const UPLOAD_DIR = path.resolve("C:/Users/Kiara/Serverwale/Backend/uploads/shop");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const CONCURRENCY = 4;
const DELAY_MS    = 250;

/** Extract all gallery image URLs from WooCommerce HTML */
function extractImages(html) {
  const all = [];
  // data-src="..." on gallery images (full-size originals)
  const re = /class="woocommerce-product-gallery__image[^>]*>[\s\S]*?data-src="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (!all.includes(m[1])) all.push(m[1]);
  }
  // fallback: data-large_image
  if (!all.length) {
    const re2 = /data-large_image="([^"]+)"/g;
    while ((m = re2.exec(html)) !== null) {
      if (!all.includes(m[1])) all.push(m[1]);
    }
  }
  return all; // [main, extra1, extra2, ...]
}

/** Download one image URL → local file, return relative path or null */
async function downloadImage(url, filename) {
  const dest = path.join(UPLOAD_DIR, filename);
  // Skip if already downloaded
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    return `uploads/shop/${filename}`;
  }
  try {
    const res = await axios.get(url, {
      responseType: "arraybuffer",
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      timeout: 12000,
    });
    fs.writeFileSync(dest, Buffer.from(res.data));
    return `uploads/shop/${filename}`;
  } catch {
    return null;
  }
}

async function processProduct(p, dbp) {
  // 1. Fetch product page
  let html = "";
  try {
    const res = await axios.get(`https://serverwale.com/product/${p.slug}/`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      timeout: 10000,
      maxRedirects: 5,
    });
    html = res.data;
  } catch {
    return false;
  }

  const imgUrls = extractImages(html);
  if (!imgUrls.length) return false;

  // 2. Download main + up to 4 extras
  const toDownload = imgUrls.slice(0, 5);
  const slugBase   = p.slug.slice(0, 50); // max filename length

  const downloaded = [];
  for (let i = 0; i < toDownload.length; i++) {
    const ext  = toDownload[i].split(".").pop().split("?")[0] || "webp";
    const name = `${slugBase}-${i}.${ext}`;
    const local = await downloadImage(toDownload[i], name);
    if (local) downloaded.push(local);
  }

  if (!downloaded.length) return false;

  const mainImg    = downloaded[0];
  const extrasArr  = downloaded.slice(1, 5);
  // Pad extras to 4 using main if needed
  while (extrasArr.length < 4) extrasArr.push(mainImg);

  await dbp.query(
    "UPDATE shop_products SET image=?, images=? WHERE id=?",
    [mainImg, JSON.stringify(extrasArr), p.id]
  );
  return true;
}

async function run() {
  const dbp = db.promise();
  const [products] = await dbp.query("SELECT id, slug FROM shop_products ORDER BY id");
  console.log(`Total: ${products.length} products`);
  console.log(`Saving images to: ${UPLOAD_DIR}\n`);

  let ok = 0, fail = 0;

  for (let i = 0; i < products.length; i += CONCURRENCY) {
    const batch = products.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(p => processProduct(p, dbp)));
    results.forEach(r => r ? ok++ : fail++);
    process.stdout.write(`  ${Math.min(i + CONCURRENCY, products.length)}/${products.length}  ✅ ${ok}  ❌ ${fail}\r`);
    if (i + CONCURRENCY < products.length) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  console.log(`\n\n✅ Done — downloaded: ${ok}, not found: ${fail}`);
  process.exit(0);
}

run().catch(err => { console.error("❌", err.message); process.exit(1); });
