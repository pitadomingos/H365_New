import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

let pool;

const initializeDatabase = async () => {
  if (pool) {
    return pool;
  }

  const caCert = process.env.DB_SSL_CERT_PATH ? fs.readFileSync(path.resolve(process.env.DB_SSL_CERT_PATH), 'utf8') : null;

  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    ssl: caCert ? { ca: caCert } : null,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  return pool;
};

export { initializeDatabase };
