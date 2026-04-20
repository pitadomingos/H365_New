import 'dotenv/config';

import { initializeDatabase } from '../src/config/database.config.js';

async function createRolesTable() {
  let pool;
  try {
    // Add logging here to check environment variables
    console.log("Attempting to connect with the following details:");
    console.log("DB_HOST:", process.env.DB_HOST);
    console.log("DB_PORT:", process.env.DB_PORT);
    console.log("DB_USER:", process.env.DB_USER);
    console.log("DB_NAME:", process.env.DB_NAME);
    console.log("DB_SSL_CERT_PATH:", process.env.DB_SSL_CERT_PATH);


    pool = await initializeDatabase();

    const createTableQuery = `
      CREATE TABLE roles (
          role_id INT PRIMARY KEY AUTO_INCREMENT,
          role_name VARCHAR(255) UNIQUE NOT NULL,
          description TEXT
      );
    `;

    await pool.query(createTableQuery);
    console.log("Table 'roles' created successfully.");

  } catch (error) {
    console.error("Error creating 'roles' table:", error);
    process.exit(1); // Exit with error
  } finally {
    if (pool) {
      pool.end();
    }
  }
}


createRolesTable();
