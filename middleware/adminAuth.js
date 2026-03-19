/**
 * ============================================================
 *   SERVERWALE — Admin JWT Authentication Middleware
 *   Protects all /api/admin/* routes
 *   Only ServerWale team with valid token can access
 * ============================================================
 */

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "serverwale_super_secret_2024_change_in_prod";

/**
 * verifyAdmin — attach to any route that needs admin protection
 * Usage: router.get("/route", verifyAdmin, handler)
 */
const verifyAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded; // attach admin info to request
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Session expired. Please login again." });
    }
    return res.status(401).json({ success: false, message: "Invalid token. Access denied." });
  }
};

/**
 * generateToken — creates JWT token for admin on login
 */
const generateToken = (adminData) => {
  return jwt.sign(
    {
      id: adminData.id,
      username: adminData.username,
      role: "admin",
    },
    JWT_SECRET,
    { expiresIn: "8h" } // 8 hour session
  );
};

module.exports = { verifyAdmin, generateToken };
