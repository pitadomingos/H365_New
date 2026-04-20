import 'dotenv/config';
import { initializeDatabase } from '../src/config/database.config.js';

async function createPatientsTable() {
  let pool;
  try {
    pool = await initializeDatabase();

    const createTableQuery = `
      CREATE TABLE patients (
          patient_id INT PRIMARY KEY AUTO_INCREMENT,
          national_id VARCHAR(255) UNIQUE,
          full_name VARCHAR(255) NOT NULL,
          age INT,
          gender VARCHAR(50),
          address TEXT,
          country VARCHAR(255),
          home_clinic_id INT NULL,
          photo_url VARCHAR(255),
          allergies TEXT,
          chronic_conditions TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (home_clinic_id) REFERENCES facilities(facility_id)
      );
    `;

    await pool.query(createTableQuery);
    console.log("Table 'patients' created successfully.");

  } catch (error) {
    console.error("Error creating 'patients' table:", error);
    process.exit(1); // Exit with error
  } finally {
    if (pool) {
      pool.end();
    }
  }
}

createPatientsTable();