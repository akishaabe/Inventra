// backend/db.js
import mysql from 'mysql2/promise';

const db = await mysql.createPool({
  host: 'localhost',
  user: 'inventra',
  password: '@Inventra123',
  database: 'inventra',   
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('✅ Connected to MySQL database using Promise pool');

export default db;
