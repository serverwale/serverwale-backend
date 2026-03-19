const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",       // apna password
  database: "serverwale",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL Pool connection error:", err);
  } else {
    console.log("✅ MySQL Pool connected");
    connection.release();
  }
});

module.exports = db;
