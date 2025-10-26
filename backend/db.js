import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  // Default host to the Docker Compose service name so containers work without extra env
  host: process.env.DB_HOST || "mysql",
  user: process.env.DB_USER || "inventra",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "inventra",
});

export default db;
