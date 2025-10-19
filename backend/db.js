// backend/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = await mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "inventra",
  password: process.env.DB_PASS || "@Inventra123",
  database: process.env.DB_NAME || "inventra",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log(`✅ Connected to MySQL database at ${process.env.DB_HOST || "localhost"}`);

export default db;
