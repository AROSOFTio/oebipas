const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'oebipas_user',
  password: process.env.DB_PASSWORD || 'secret',
  database: process.env.DB_NAME || 'oebipas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
