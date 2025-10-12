import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "mysql-container",
  user: "inventra",
  password: "@Inventra123",
  database: "inventra",
});

export default db;