import 'dotenv/config';
import { initializeDatabase } from '../src/config/database.config.js';

async function createFacilitiesTable() {
  let pool;
  try {
    pool = await initializeDatabase();

    const createTableQuery = `
      CREATE TABLE facilities (
          facility_id INT PRIMARY KEY AUTO_INCREMENT,
          facility_name VARCHAR(255) NOT NULL,
          facility_type VARCHAR(255),
          parent_facility_id INT NULL,
          country VARCHAR(255),
          province VARCHAR(255),
          district VARCHAR(255),
          address TEXT,
          FOREIGN KEY (parent_facility_id) REFERENCES facilities(facility_id)
      );
    `;

    await pool.query(createTableQuery);
    console.log("Table 'facilities' created successfully.");

  } catch (error) {
    console.error("Error creating 'facilities' table:", error);
    process.exit(1); // Exit with error
  } finally {
    if (pool) {
      pool.end();
    }
  }
}

createFacilitiesTable();