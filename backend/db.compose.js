import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "mysql",
  user: "inventra",
  password: "@Inventra123",
  database: "inventra",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;
